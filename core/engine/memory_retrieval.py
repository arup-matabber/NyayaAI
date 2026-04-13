from typing import List, Dict, Any
from core.engine.db.database import SessionLocal
from core.engine.db.models import CaseLog, PDFArtifact, Case

class MemoryManager:
    """
    Algorithmic memory curation for LLM Context explicitly, 
    bypassing continuous KV cache reliance. LLMs only used for generation.
    """
    def __init__(self):
        self.db = SessionLocal()
        
    def retrieve_long_term_memory(self, case_id: int, query: str = None) -> str:
        """
        Retrieves all valid prior logs and PDF extractions for the case, 
        and structures them into a strict text context prompt block 
        that is passed along into the draft generation node.
        """
        logs_query = self.db.query(CaseLog).filter(CaseLog.case_id == case_id).order_by(CaseLog.created_at.desc()).limit(10).all()
        pdfs_query = self.db.query(PDFArtifact).filter(PDFArtifact.case_id == case_id).all()
        
        context_parts = []
        context_parts.append(f"--- ALGORITHMIC RETRIEVED LOGS ---")
        for log in reversed(logs_query):
            context_parts.append(f"[{log.created_at}] - {log.interaction_log}")
            
        context_parts.append(f"--- EXTRACTED FACTS & ARTIFACTS ---")
        for pdf in pdfs_query:
            if pdf.ocr_confidence_score and pdf.ocr_confidence_score < 0.8:
                context_parts.append(f"[WARNING: Low OCR Confidence {pdf.ocr_confidence_score}] Document: {pdf.file_path}")
            if pdf.parsed_text:
                context_parts.append(f"Source Document '{pdf.file_path}':\n{pdf.parsed_text[:2000]}...") # Truncated for token limit
        
        return "\n\n".join(context_parts)

    def append_interaction(self, case_id: int, interaction_summary: str):
        """
        Algorithm logs the interaction, removing the need for a continuously extending chat context.
        """
        new_log = CaseLog(
            case_id=case_id,
            interaction_log=interaction_summary
        )
        self.db.add(new_log)
        self.db.commit()
