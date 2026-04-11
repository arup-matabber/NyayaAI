import unittest
import os
import sys

from test_suite.test_config import TestConfig
from engine.ocr_pipeline import LayoutAwareOCR

class TestOCRPipeline(unittest.TestCase):
    def setUp(self):
        self.ocr = LayoutAwareOCR()

    def test_pdf_parsing(self):
        # We will use one of the test data pdfs
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "Authentic_Bail_Draft_6616.pdf"))
        
        # In case test data isn't there, look in output 
        if not os.path.exists(pdf_path):
            alt_path = pdf_path.replace("core\\data", "core\\output")
            if os.path.exists(alt_path):
                pdf_path = alt_path
        
        if not os.path.exists(pdf_path):
            self.skipTest("No test PDF found to run OCR against.")
        
        result = self.ocr.process_pdf(pdf_path)
        
        self.assertIn("confidence_score", result)
        self.assertIn("parsed_text", result)
        self.assertIn("metrics", result)
        
        # Valid text must be extracted
        self.assertTrue(len(result["parsed_text"]) > 100)
        
        # Authentic digital PDFs usually have 1.0 logic from PyMuPDF
        self.assertTrue(result["confidence_score"] > 0.8)

if __name__ == '__main__':
    unittest.main()
