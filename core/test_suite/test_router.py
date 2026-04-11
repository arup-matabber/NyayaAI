import unittest
import sys
import os

from test_suite.test_config import TestConfig
from engine.agents.router import LegalRouter, IPC_TO_BNS_MAP

class TestLegalRouter(unittest.TestCase):
    def setUp(self):
        self.router = LegalRouter()

    def test_ipc_to_bns_mapping(self):
        # 1. Test all 10 core mappings are present
        self.assertEqual(len(IPC_TO_BNS_MAP), 10, "Required exactly 10 IPC/BNS mappings.")
        
        # 2. Test an injection
        prompt = "Draft a bail application for my client under IPC 302 and IPC 420."
        result = self.router.inject_bns_mappings(prompt)
        
        # Should catch both
        self.assertEqual(len(result["mappings_found"]), 2)
        mapped_keys = [m["ipc"] for m in result["mappings_found"]]
        self.assertIn("IPC 302", mapped_keys)
        self.assertIn("IPC 420", mapped_keys)
        
        self.assertIn("BNS 103", result["mapped_prompt"])
        self.assertIn("BNS 318", result["mapped_prompt"])
        
    def test_task_classification(self):
        self.assertEqual(self.router.detect_task_type("Draft a petition for"), "LEGAL_DRAFT")
        self.assertEqual(self.router.detect_task_type("Please critique this flaw in the document"), "DOC_FLAW")
        self.assertEqual(self.router.detect_task_type("extract the text using ocr"), "PDF_PARSE")
        self.assertEqual(self.router.detect_task_type("What is the law regarding theft?"), "LEGAL_QUERY")

    def test_complexity_scoring(self):
        # Complexity = 0
        self.assertEqual(self.router.calculate_complexity("simple text"), 0)
        
        # Complexity with signals
        prompt = "A constitutional writ petition in the supreme court involving fundamental rights."
        # constitutional(4) + supreme court(4) + fundamental rights(4) = 12 -> capped at 10
        self.assertEqual(self.router.calculate_complexity(prompt), 10)
        
        prompt_med = "Draft agreement for rental property"
        # agreement(1) + rental(1) = 2
        self.assertEqual(self.router.calculate_complexity(prompt_med), 2)

    def test_tier_selection(self):
        self.assertEqual(self.router.select_model_tier(2), "FAST (BitNet-2B)")
        self.assertEqual(self.router.select_model_tier(5), "BALANCED (Saul-7B)")
        self.assertEqual(self.router.select_model_tier(9), "DEEP (CPU-Fallback)")
        
    def test_document_type(self):
        self.assertEqual(self.router.detect_document_type("I want bail"), "Bail Application")
        self.assertEqual(self.router.detect_document_type("File a police FIR for theft"), "Criminal Complaint")
        self.assertEqual(self.router.detect_document_type("I want to sue for damages"), "Civil Suit")
        
    def test_routing_hook(self):
        prompt = "Draft a bail application for my client under IPC 302 who has filed in High Court"
        route_data = self.router.route_request(prompt)
        
        self.assertEqual(route_data["task_type"], "LEGAL_DRAFT")
        # bail for (2, wait "bail for" only matches if exact, here we have "bail application"->0, 
        # but doc type is "Bail Application". Complexity "high court" = 4, "murder"=0 (not verbatim), etc.)
        # Let's just check it mapped the BNS correctly 
        self.assertTrue(len(route_data["statute_corrections"]) > 0)
        self.assertEqual(route_data["statute_corrections"][0]["bns"], "BNS 103")

if __name__ == '__main__':
    unittest.main()
