"""
backend/clara/oracle.py
=========================
Nyaya AI — Legal Knowledge Oracle

Semantic retrieval using InLegalBERT with lightweight ONNX inference.
NO PyTorch dependency — uses onnxruntime + tokenizers (~50MB total).

Embedding pipeline:
  1. Tokenize with HuggingFace tokenizers (Rust-backed, fast)
  2. Run BERT inference via ONNX Runtime  
  3. Mean-pool token embeddings to get 768D vector
  4. Store in SQLite with optional sqlite-vec for ANN search

Falls back to TF-IDF if ONNX model is not available.
"""

import sqlite3
import struct
import math
import hashlib
import re
import os
import numpy as np
from collections import Counter
from pathlib import Path

try:
    import sqlite_vec
    SQLITE_VEC_AVAILABLE = True
except ImportError:
    SQLITE_VEC_AVAILABLE = False

# InLegalBERT embeddings — 768-dimensional
INLEGALBERT_DIM = 768
TFIDF_DIM = 384

# Sliding window parameters
CHUNK_SIZE_TOKENS = 1200
CHUNK_OVERLAP_TOKENS = 200
CHARS_PER_TOKEN = 4

# ── ONNX + Tokenizers (lightweight InLegalBERT) ──────────────────────────────

ONNX_AVAILABLE = False
TOKENIZER_AVAILABLE = False

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    pass

try:
    from tokenizers import Tokenizer
    TOKENIZER_AVAILABLE = True
except ImportError:
    pass


class ClaraOracle:
    """
    Nyaya AI Legal Knowledge Oracle.
    
    Uses ONNX Runtime for InLegalBERT inference (no PyTorch).
    Falls back to TF-IDF if ONNX model is unavailable.
    """

    def __init__(self, db_path: str = 'nyaya_legal.db',
                 onnx_model_path: str = '',
                 tokenizer_path: str = ''):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)

        if SQLITE_VEC_AVAILABLE:
            self.conn.enable_load_extension(True)
            sqlite_vec.load(self.conn)
            self.conn.enable_load_extension(False)

        # Try to load ONNX InLegalBERT
        self.ort_session = None
        self.tokenizer = None
        self.use_bert = False

        if ONNX_AVAILABLE and TOKENIZER_AVAILABLE:
            self._load_onnx_bert(onnx_model_path, tokenizer_path)

        if self.use_bert:
            self.dim = INLEGALBERT_DIM
            print("[Oracle] InLegalBERT (ONNX) loaded — 768D semantic search active")
        else:
            self.dim = TFIDF_DIM
            print("[Oracle] Using TF-IDF fallback (ONNX model not available)")

        # TF-IDF state
        self.vocab: dict = {}
        self.idf: dict = {}

        self._create_tables()
        self._load_vocab()

        print(f"[Oracle] Database: {db_path}")
        print(f"[Oracle] Documents indexed: {self._count_docs()}")
        print(f"[Oracle] Headnotes indexed: {self._count_headnotes()}")

    def _load_onnx_bert(self, onnx_path: str, tokenizer_path: str):
        """Load InLegalBERT via ONNX Runtime."""
        # Search for model files
        search_paths = [
            onnx_path,
            './models/inlegalbert/model.onnx',
            './data/inlegalbert/model.onnx',
            os.path.expanduser('~/.cache/nyaya/inlegalbert/model.onnx'),
        ]
        tokenizer_paths = [
            tokenizer_path,
            './models/inlegalbert/tokenizer.json',
            './data/inlegalbert/tokenizer.json',
            os.path.expanduser('~/.cache/nyaya/inlegalbert/tokenizer.json'),
        ]

        model_path = None
        tok_path = None

        for p in search_paths:
            if p and os.path.exists(p):
                model_path = p
                break

        for p in tokenizer_paths:
            if p and os.path.exists(p):
                tok_path = p
                break

        if not model_path or not tok_path:
            return

        try:
            # Load ONNX model with CPU execution provider
            self.ort_session = ort.InferenceSession(
                model_path,
                providers=['CPUExecutionProvider']
            )
            self.tokenizer = Tokenizer.from_file(tok_path)
            self.tokenizer.enable_truncation(max_length=512)
            self.tokenizer.enable_padding(length=512)
            self.use_bert = True
            print(f"[Oracle] ONNX model: {model_path}")
        except Exception as e:
            print(f"[Oracle] ONNX load failed: {e}")
            self.ort_session = None
            self.tokenizer = None

    def _create_tables(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS docs (
                path      TEXT PRIMARY KEY,
                content   TEXT NOT NULL,
                hash      TEXT NOT NULL,
                embedding BLOB NOT NULL
            )
        ''')
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS headnotes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                case_name  TEXT NOT NULL,
                citation   TEXT,
                court      TEXT DEFAULT 'Supreme Court of India',
                year       INTEGER,
                headnote   TEXT NOT NULL,
                embedding  BLOB NOT NULL
            )
        ''')
        self.conn.commit()

    def _count_docs(self):
        row = self.conn.execute('SELECT COUNT(*) FROM docs').fetchone()
        return row[0] if row else 0

    def _count_headnotes(self):
        row = self.conn.execute('SELECT COUNT(*) FROM headnotes').fetchone()
        return row[0] if row else 0

    # ── Embedding generation ──────────────────────────────────────────────────

    def _encode(self, text: str) -> list:
        """Generate embedding vector for text."""
        if self.use_bert and self.ort_session and self.tokenizer:
            return self._onnx_encode(text)
        else:
            return self._tfidf_vector(text)

    def _onnx_encode(self, text: str) -> list:
        """Generate InLegalBERT embedding via ONNX Runtime."""
        try:
            # Tokenize
            encoded = self.tokenizer.encode(text)
            input_ids = np.array([encoded.ids], dtype=np.int64)
            attention_mask = np.array([encoded.attention_mask], dtype=np.int64)
            token_type_ids = np.array([encoded.type_ids], dtype=np.int64)

            # Run ONNX inference
            outputs = self.ort_session.run(
                None,
                {
                    'input_ids': input_ids,
                    'attention_mask': attention_mask,
                    'token_type_ids': token_type_ids,
                }
            )

            # Mean pooling over token embeddings
            token_embeddings = outputs[0]  # (1, seq_len, 768)
            mask = attention_mask.reshape(1, -1, 1).astype(np.float32)
            masked = token_embeddings * mask
            summed = masked.sum(axis=1)
            counts = mask.sum(axis=1).clip(min=1e-9)
            mean_pooled = (summed / counts)[0]

            # L2 normalize
            norm = np.linalg.norm(mean_pooled)
            if norm > 0:
                mean_pooled = mean_pooled / norm

            return mean_pooled.tolist()

        except Exception as e:
            print(f"[Oracle] ONNX encode error: {e}")
            return self._tfidf_vector(text)

    def _pack(self, vector: list) -> bytes:
        return struct.pack(f'{len(vector)}f', *vector)

    def _hash(self, content: str) -> str:
        return hashlib.sha256(content.encode()).hexdigest()

    # ── TF-IDF fallback ───────────────────────────────────────────────────────

    def _load_vocab(self):
        rows = self.conn.execute('SELECT content FROM docs').fetchall()
        if not rows:
            return

        total_docs = len(rows)
        doc_freq: Counter = Counter()

        for (content,) in rows:
            words = set(self._tokenise(content))
            doc_freq.update(words)

        useful = [
            word for word, freq in doc_freq.most_common(self.dim * 4)
        ][:self.dim]

        self.vocab = {word: idx for idx, word in enumerate(useful)}
        self.idf = {
            word: math.log((total_docs + 1) / (1 + doc_freq[word]))
            for word in useful
        }

    def _tokenise(self, text: str) -> list:
        text = re.sub(r'[(),:.\\[\]{}\'"=+*/\\\\<>!@#$%^&|~`\-]', ' ', text)
        return [w for w in text.lower().split() if len(w) > 1]

    def _tfidf_vector(self, text: str) -> list:
        words = self._tokenise(text)
        total = max(len(words), 1)
        counts = Counter(words)
        vector = [0.0] * self.dim
        for word, count in counts.items():
            if word in self.vocab:
                idx = self.vocab[word]
                tf = count / total
                idf = self.idf.get(word, 1.0)
                vector[idx] = tf * idf
        magnitude = math.sqrt(sum(x * x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        return vector

    # ── Indexing ──────────────────────────────────────────────────────────────

    def index_file(self, path: str, content: str) -> bool:
        content_hash = self._hash(content)
        existing = self.conn.execute(
            'SELECT hash FROM docs WHERE path = ?', (path,)
        ).fetchone()
        if existing and existing[0] == content_hash:
            return False

        vector = self._encode(content[:3000])
        blob = self._pack(vector)
        self.conn.execute(
            'INSERT OR REPLACE INTO docs (path, content, hash, embedding) '
            'VALUES (?, ?, ?, ?)',
            (path, content[:5000], content_hash, blob)
        )
        self.conn.commit()
        return True

    def index_headnote(self, case_name: str, headnote: str,
                        citation: str = "", year: int = 0) -> bool:
        vector = self._encode(headnote)
        blob = self._pack(vector)
        self.conn.execute(
            'INSERT INTO headnotes (case_name, citation, year, headnote, embedding) '
            'VALUES (?, ?, ?, ?, ?)',
            (case_name, citation, year, headnote, blob)
        )
        self.conn.commit()
        return True

    def crawl(self, directory: str,
              extensions: tuple = ('.txt', '.md', '.pdf', '.tex')) -> int:
        directory = Path(directory)
        if not directory.exists():
            print(f"[Oracle] Directory not found: {directory}")
            return 0

        indexed = skipped = errors = 0
        print(f"[Oracle] Crawling {directory} ...")

        for ext in extensions:
            for fp in directory.rglob(f'*{ext}'):
                try:
                    if fp.stat().st_size > 500_000:
                        skipped += 1
                        continue
                    content = fp.read_text(encoding='utf-8', errors='ignore')

                    chunks = self._chunk_text(content)
                    for i, chunk in enumerate(chunks):
                        chunk_path = f"{fp}#chunk{i}" if len(chunks) > 1 else str(fp)
                        if self.index_file(chunk_path, chunk):
                            indexed += 1
                        else:
                            skipped += 1
                except Exception:
                    errors += 1

        if not self.use_bert:
            self._load_vocab()

        print(f"[Oracle] Done — indexed: {indexed}, skipped: {skipped}, errors: {errors}")
        print(f"[Oracle] Total in index: {self._count_docs()}")
        return indexed

    def _chunk_text(self, text: str) -> list[str]:
        chunk_chars = CHUNK_SIZE_TOKENS * CHARS_PER_TOKEN
        overlap_chars = CHUNK_OVERLAP_TOKENS * CHARS_PER_TOKEN

        if len(text) <= chunk_chars:
            return [text]

        chunks = []
        pos = 0
        while pos < len(text):
            end = min(pos + chunk_chars, len(text))
            chunks.append(text[pos:end])
            pos = end - overlap_chars
            if pos <= 0 and len(chunks) > 1:
                break
        return chunks

    # ── Search ────────────────────────────────────────────────────────────────

    def search(self, query: str, k: int = 3) -> list:
        if not self.vocab and not self.use_bert:
            return []

        query_vector = self._encode(query)
        query_blob = self._pack(query_vector)

        if SQLITE_VEC_AVAILABLE:
            rows = self.conn.execute('''
                SELECT path, content,
                       vec_distance_cosine(embedding, ?) AS distance
                FROM docs
                ORDER BY distance ASC
                LIMIT ?
            ''', (query_blob, k)).fetchall()
        else:
            rows = self.conn.execute(
                'SELECT path, content, 0.5 FROM docs LIMIT ?', (k,)
            ).fetchall()

        results = []
        for path, content, distance in rows:
            if distance is None:
                distance = 1.0
            results.append({
                'path': path,
                'preview': content[:400],
                'score': round(max(0.0, 1.0 - distance), 4),
                'distance': round(distance, 4),
            })
        return results

    def search_headnotes(self, query: str, k: int = 2) -> list:
        if self._count_headnotes() == 0:
            return []

        query_vector = self._encode(query)
        query_blob = self._pack(query_vector)

        if SQLITE_VEC_AVAILABLE:
            rows = self.conn.execute('''
                SELECT case_name, citation, year, headnote,
                       vec_distance_cosine(embedding, ?) AS distance
                FROM headnotes
                ORDER BY distance ASC
                LIMIT ?
            ''', (query_blob, k)).fetchall()
        else:
            rows = self.conn.execute(
                'SELECT case_name, citation, year, headnote, 0.5 FROM headnotes LIMIT ?',
                (k,)
            ).fetchall()

        results = []
        for case_name, citation, year, headnote, distance in rows:
            if distance is None:
                distance = 1.0
            results.append({
                'case_name': case_name,
                'citation': citation or "",
                'year': year or 0,
                'headnote': headnote[:500],
                'score': round(max(0.0, 1.0 - distance), 4),
            })
        return results

    def get_context_for_prompt(self, query: str, k: int = 3,
                                max_chars: int = 800, **kwargs) -> str:
        k = kwargs.get('top_k', k)
        results = self.search(query, k=k)
        if not results:
            return ""
        parts = ["### Relevant legal documents:"]
        total = 0
        for r in results:
            entry = f"\n--- {r['path']} (relevance: {r['score']}) ---\n{r['preview']}\n"
            if total + len(entry) > max_chars:
                break
            parts.append(entry)
            total += len(entry)
        return "".join(parts)

    def stats(self) -> dict:
        return {
            "documents_indexed": self._count_docs(),
            "headnotes_indexed": self._count_headnotes(),
            "vocabulary_size": len(self.vocab),
            "vector_dimensions": self.dim,
            "encoder": "InLegalBERT-ONNX" if self.use_bert else "TF-IDF",
        }
