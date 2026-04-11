import unittest
import json
import os
import sys

from test_suite.test_config import TestConfig
from engine.agents.flaw_detector import FlawDetector

class TestFlawDetector(unittest.TestCase):
    def setUp(self):
        self.detector = FlawDetector()

    def test_jurisdiction_flaw(self):
        # Missing jurisdiction, but contains "court"
        draft_text = "In the Hon'ble Court. The accused has committed a crime and should go to jail."
        result_json = self.detector.analyze_document(draft_text, "Some source context")
        result = json.loads(result_json)
        
        # Check if missing jurisdiction flaw is flagged
        jurisdiction_flaws = [f for f in result["flaws"] if f["type"] == "Missing Jurisdiction Clause"]
        self.assertTrue(len(jurisdiction_flaws) > 0, "Failed to detect missing jurisdiction clause")
        self.assertEqual(jurisdiction_flaws[0]["severity"], "HIGH")

    def test_outdated_statute_flaw(self):
        # Contains IPC, but not BNS
        draft_text = "The accused is charged under Section 302 of the IPC."
        result_json = self.detector.analyze_document(draft_text, "Some source context")
        result = json.loads(result_json)
        
        # Check if outdated statute flaw is flagged
        statute_flaws = [f for f in result["flaws"] if f["type"] == "Outdated Statute"]
        self.assertTrue(len(statute_flaws) > 0, "Failed to detect outdated IPC statute")
        self.assertEqual(statute_flaws[0]["severity"], "CRITICAL")
        self.assertFalse(result["is_valid_for_production"])

    def test_valid_document(self):
        # Perfect document
        draft_text = "In the Hon'ble Court. The jurisdiction of this court is invoked. Charged under BNS 2023."
        # Using a context that matches to avoid hallucination flag from base_critique
        result_json = self.detector.analyze_document(draft_text, draft_text)
        result = json.loads(result_json)
        
        # Flaws could still include Hallucinated Statute if base critique fails, but let's assume it passes
        # At minimum, jurisdiction and outdated statute should not be there.
        flaw_types = [f["type"] for f in result["flaws"]]
        self.assertNotIn("Missing Jurisdiction Clause", flaw_types)
        self.assertNotIn("Outdated Statute", flaw_types)

    def test_hallucination_interception(self):
        # Section 11 hallucination in Bail
        draft_text = "The applicant prays for bail under Section 11(1) of the BNS 2023."
        result_json = self.detector.analyze_document(draft_text, "context", "Bail Application")
        result = json.loads(result_json)
        
        hallucination_flaws = [f for f in result["flaws"] if f["type"] == "Hallucinated Statute"]
        self.assertTrue(len(hallucination_flaws) > 0, "Failed to intercept Section 11 hallucination in Bail Application")
        self.assertFalse(result["is_valid_for_production"])

    def test_repetition_interception(self):
        # Repetitive footer simulation
        footer = "\nDEPONENT / APPLICANT\nDate: 01.01.2026\n"
        draft_text = "Valid body of the law document. " + "X" * 400 + footer * 5
        result_json = self.detector.analyze_document(draft_text, "context", "Bail Application")
        result = json.loads(result_json)
        
        repetition_flaws = [f for f in result["flaws"] if f["type"] == "Repetitive Content"]
        self.assertTrue(len(repetition_flaws) > 0, "Failed to intercept repetitive content")

if __name__ == '__main__':
    unittest.main()
