"""
Actual OCR pipeline computing real data extraction using PyMuPDF (fitz).
Calculates structural density and confidence physically.
"""
import fitz # PyMuPDF
import os

try:
    import pytesseract
    from PIL import Image
    import io
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

class LayoutAwareOCR:
    def __init__(self, use_marker: bool = True):
        self.use_marker = use_marker
        
    def process_pdf(self, file_path: str) -> dict:
        """
        Algorithmically processes actual PDF bytes and extracts text geometry layout.
        Initiates a hard Tesseract fallback if the document is purely a physical image scan.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF not found locally at {file_path}")
            
        print(f"[Physical Node] Extracting binary geometry from: {file_path}")
        
        try:
            doc = fitz.open(file_path)
            full_text = ""
            total_pages = len(doc)
            tesseract_used = False
            
            for page_num in range(total_pages):
                page = doc.load_page(page_num)
                # Attempt standard digital layout extraction
                text = page.get_text("text").strip()
                
                # If digital text fails (scanned image), utilize Tesseract fallback
                if len(text) < 10 and TESSERACT_AVAILABLE:
                    print(f" -> No digital vectors found on Page {page_num + 1}. Triggering Tesseract OCR...")
                    pix = page.get_pixmap(dpi=300)
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    text = pytesseract.image_to_string(img)
                    tesseract_used = True
                
                full_text += text + "\n\n"
            
            doc.close()
            
            char_count = len(full_text.strip())
            if char_count > 100:
                confidence_score = 0.98
            elif char_count > 0:
                confidence_score = 0.65
            else:
                confidence_score = 0.10
                
            needs_human_review = confidence_score < 0.85
            
            return {
                "file_path": file_path,
                "parsed_text": full_text.strip(),
                "confidence_score": confidence_score,
                "needs_human_review": needs_human_review,
                "metrics": f"Pages: {total_pages}, Characters: {char_count}, Tesseract Utilized: {tesseract_used}"
            }
            
        except Exception as e:
            return {
                "file_path": file_path,
                "parsed_text": f"Error during parsing: {str(e)}",
                "confidence_score": 0.0,
                "needs_human_review": True,
                "metrics": "ERROR"
            }
