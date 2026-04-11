import os
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER

from test_suite.test_config import TestConfig, RESULTS_DIR

def generate_pdf_report():
    TestConfig.print_header("Generating Final Benchmark Report")
    report_path = os.path.join(RESULTS_DIR, "Nyaya_AI_Benchmark_Report.pdf")
    
    doc = SimpleDocTemplate(
        report_path,
        pagesize=A4,
        rightMargin=50,
        leftMargin=50,
        topMargin=50,
        bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=TA_CENTER)
    normal_style = styles["Normal"]
    
    story = []
    
    story.append(Paragraph("Nyaya AI - Comprehensive Benchmark Report", title_style))
    story.append(Spacer(1, 20))
    
    # Check for hw info
    env_path = os.path.join(RESULTS_DIR, "bench_env_result.json")
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            hw_info = json.load(f)
        story.append(Paragraph("1. Hardware Environment", styles['Heading2']))
        data = [
            ["Metric", "Value"],
            ["OS", hw_info.get("os", "N/A")],
            ["CPU Cores", str(hw_info.get("cpu_cores", "N/A"))],
            ["RAM (Free/Total GB)", f"{hw_info.get('ram_available_gb')} / {hw_info.get('ram_total_gb')}"],
            ["GPU Model", hw_info.get("gpu_model", "N/A")],
            ["VRAM (Free/Total MB)", f"{hw_info.get('vram_free_mb')} / {hw_info.get('vram_total_mb')}"]
        ]
        t = Table(data, colWidths=[200, 250])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (1,0), colors.HexColor("#2f5597")),
            ('TEXTCOLOR', (0,0), (1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black)
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
        
    doc.build(story)
    TestConfig.print_success(f"Final Report Generated: {report_path}")

if __name__ == '__main__':
    generate_pdf_report()
