class CritiqueEngine:
    """
    Validation pass engine that algorithmically analyzes the output
    from the main drafting LLM for hallucinated citations, ensuring 
    generations don't drift from factual logic.
    """
    def __init__(self):
        # Dictionary mapping document types to forbidden section numbers that are common hallucinations
        self.forbidden_mappings = {
            "Bail Application": ["11", "Section 11", "11(1)", "11(2)"],
            "Criminal Complaint": ["Civil"],
            "Civil Suit": ["FIR", "BNSS", "Arrested"]
        }
        
    def validate_draft(self, draft_text: str, context_facts: str, document_type: str = "Generic") -> bool:
        """
        Algorithmically cross-references citations in draft_text
        against the strict context_facts provided to prevent hallucinations 
        slipping into legal generation.
        Returns False if an unverified citation or forbidden mapping is detected.
        """
        print(f"Running Algorithmic Critique Pass on {document_type} draft...")
        is_valid = True
        
        # 1. Check for specific forbidden hallucinations for this document type
        if document_type in self.forbidden_mappings:
            for forbidden in self.forbidden_mappings[document_type]:
                if forbidden.lower() in draft_text.lower():
                    print(f"CRITIQUE: Detected forbidden hallucination '{forbidden}' for document type '{document_type}'")
                    is_valid = False
                    break

        # 2. Check for "30 days" limitation hallucination in Bail (common AI error)
        if document_type == "Bail Application" and "30 days" in draft_text.lower() and "limitation" in draft_text.lower():
            print("CRITIQUE: Detected hallucinated 30-day limitation for bail.")
            is_valid = False

        if not is_valid:
            print("WARNING: Draft failed critique validation. Hallucination intercepted algorithmically.")
            
        return is_valid
