import unittest
import os
import struct
from test_suite.test_config import TestConfig
from engine.clara.oracle import ClaraOracle

class TestClaraOracle(unittest.TestCase):
    def setUp(self):
        # We will use an in-memory DB or a specific test DB so we don't pollute the actual DB
        self.test_db_path = "test_oracle.db"
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)
            
        self.oracle = ClaraOracle(db_path=self.test_db_path)

        # The user requested no fallback for missing headnotes. We must dynamically
        # create realistic, government-formatted legal headnotes into the DB for testing.
        self._inject_mock_headnote()

    def _inject_mock_headnote(self):
        """Injects a real-looking court headnote into the SQLite DB for testing."""
        headnote_text = (
            "SUBJECT: BAIL APPLICATION UNDER BNS\n\n"
            "The Supreme Court of India in State v. Sharma observed that for offenses "
            "punishable under Section 103 of the BNS (previously IPC 302), bail should only be "
            "granted in exceptional circumstances where the accused's rights are violated."
        )
        embedding = self.oracle._encode(headnote_text)
        blob = struct.pack(f'{len(embedding)}f', *embedding)
        
        self.oracle.conn.execute(
            '''INSERT INTO headnotes (case_name, citation, court, year, headnote, embedding) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            ("State v. Sharma", "2024 SCC 123", "Supreme Court of India", 2024, headnote_text, blob)
        )
        self.oracle.conn.commit()

    def tearDown(self):
        self.oracle.conn.close()
        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)

    def test_headnote_retrieval(self):
        prompt = "Draft a bail application for murder under BNS 103."
        # This should retrieve our manually injected headnote
        context = self.oracle.get_context_for_prompt(prompt, top_k=1)
        
        # It must contain the subject we injected
        self.assertIn("State v. Sharma", context)
        self.assertIn("BAIL APPLICATION UNDER BNS", context)

    def test_indexing_document(self):
        test_doc_text = "This is a test legal document outlining a property dispute in civil court."
        self.oracle.index_file("test_path_1.txt", test_doc_text)
        
        count = self.oracle._count_docs()
        self.assertEqual(count, 1)
        
        # Try retrieving it
        context = self.oracle.get_context_for_prompt("tell me about the property dispute", top_k=1)
        self.assertIn("property dispute", context)

if __name__ == '__main__':
    unittest.main()
