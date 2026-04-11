import os
from engine.ocr_pipeline import LayoutAwareOCR

RESULTS_DIR = os.path.join(os.path.dirname(__file__), 'results')

def run_real_world_ocr():
    ocr = LayoutAwareOCR()
    
    # Path to the real test PDF
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "Authentic_Bail_Draft_6616.pdf"))
    if not os.path.exists(pdf_path):
        alt_path = pdf_path.replace("core\\data", "core\\output")
        if os.path.exists(alt_path):
            pdf_path = alt_path
            
    if not os.path.exists(pdf_path):
        print(f"FAILED: Cannot find the authentic bail draft PDF at {pdf_path}")
        return
        
    print(f"Processing real document: {os.path.basename(pdf_path)}...")
    result = ocr.process_pdf(pdf_path)
    
    # Dump the exact literal output to a markdown file
    output_md = os.path.join(RESULTS_DIR, "ocr_demo_run.md")
    
    md_content = f"# Real-World OCR Demonstration\n\n"
    md_content += f"**Input File:** `{os.path.basename(pdf_path)}`\n"
    md_content += f"**Confidence Score:** `{result['confidence_score']}`\n"
    md_content += f"**Metrics:** `{result['metrics']}`\n"
    md_content += f"**Needs Human Review:** `{result['needs_human_review']}`\n\n"
    
    md_content += f"## Extracted Text (Literal output)\n\n"
    md_content += f"```text\n{result['parsed_text']}\n```\n"
    
    with open(output_md, 'w', encoding='utf-8') as f:
        f.write(md_content)
        
    print(f"DONE. Absolute OCR literal output saved to: {output_md}")

if __name__ == '__main__':
    run_real_world_ocr()
