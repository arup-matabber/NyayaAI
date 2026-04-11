import unittest
import os
from engine.agents.pdf_writer import PDFWriter

class TestPDFWriter(unittest.TestCase):
    def setUp(self):
        self.writer = PDFWriter()

    def test_create_a4_pdf(self):
        test_content = (
            "IN THE HON'BLE SUPREME COURT OF INDIA\n\n"
            "This is a test document.\n\n"
            "Signature: _________"
        )
        
        pdf_path = self.writer.generate_court_pdf(test_content, "test_doc_A4.pdf")
        
        self.assertTrue(os.path.exists(pdf_path))
        self.assertTrue(os.path.getsize(pdf_path) > 0)
        
        # Cleanup
        os.remove(pdf_path)

if __name__ == '__main__':
    unittest.main()
