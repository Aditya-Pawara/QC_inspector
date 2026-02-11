from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.units import inch
from datetime import datetime
import io
import os

def generate_pdf_report(inspection):
    """
    Generates a PDF report for a given inspection using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    Story = []
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Justify', alignment=1, spaceAfter=12))
    
    # Title
    title = f"Inspection Report #{inspection.id}"
    Story.append(Paragraph(title, styles["Title"]))
    Story.append(Spacer(1, 12))
    
    # Inspection Details
    created_at = inspection.created_at.strftime("%Y-%m-%d %H:%M:%S") if inspection.created_at else "N/A"
    Story.append(Paragraph(f"<b>Date:</b> {created_at}", styles["Normal"]))
    Story.append(Paragraph(f"<b>Status:</b> {inspection.status}", styles["Normal"]))
    Story.append(Spacer(1, 12))
    
    # Image
    if inspection.image_path:
        # Assuming images are stored in a folder named 'uploads' relative to the backend root
        image_full_path = os.path.join("uploads", inspection.image_path)
        if os.path.exists(image_full_path):
            try:
                # Resize image to fit page width roughly
                im = Image(image_full_path, width=4*inch, height=3*inch) 
                # Keep aspect ratio? ReportLab Image allows strict sizing. 
                # For better aspect ratio handling, one might need PIL to get size first.
                # For now, forcing 4x3 inch box.
                Story.append(im)
                Story.append(Spacer(1, 12))
            except Exception as e:
                Story.append(Paragraph(f"<i>Error loading image: {e}</i>", styles["Normal"]))
        else:
            Story.append(Paragraph(f"<i>Image file not found: {inspection.image_path}</i>", styles["Normal"]))
    
    analysis = inspection.analysis_result
    if not analysis:
         Story.append(Paragraph("No analysis data available.", styles["Normal"]))
         doc.build(Story)
         buffer.seek(0)
         return buffer.getvalue()

    # Overall Assessment
    Story.append(Paragraph("<b>Overall Assessment:</b>", styles["Heading2"]))
    severity = analysis.get("overall_severity", "Unknown")
    Story.append(Paragraph(f"Severity: {severity}", styles["Normal"]))
    Story.append(Spacer(1, 12))
    
    # Defects
    Story.append(Paragraph("<b>Detected Defects:</b>", styles["Heading2"]))
    defects = analysis.get("defects", [])
    if defects:
        defect_data = [["Type", "Confidence", "Location", "Severity"]]
        for d in defects:
            loc = d.get("location", {})
            if isinstance(loc, dict):
                loc_str = f"({loc.get('x_min', 0)}, {loc.get('y_min', 0)})"
            else:
                loc_str = str(loc)
            defect_data.append([
                d.get("type", "Unknown"),
                f"{d.get('confidence', 0):.2f}",
                loc_str,
                d.get("severity", "Unknown")
            ])
        
        t = Table(defect_data, colWidths=[1.5*inch, 1*inch, 1.5*inch, 1*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        Story.append(t)
    else:
        Story.append(Paragraph("No defects detected.", styles["Normal"]))
    Story.append(Spacer(1, 12))

    # Quality Issues
    quality_issues = analysis.get("quality_issues", [])
    if quality_issues:
        Story.append(Paragraph("<b>Quality Observations:</b>", styles["Heading2"]))
        for issue in quality_issues:
            text = issue if isinstance(issue, str) else issue.get("description", str(issue))
            Story.append(Paragraph(f"• {text}", styles["Normal"]))
        Story.append(Spacer(1, 12))

    # Recommendations
    recommendations = analysis.get("recommendations", [])
    if recommendations:
        Story.append(Paragraph("<b>Recommendations:</b>", styles["Heading2"]))
        for rec in recommendations:
             Story.append(Paragraph(f"• {rec}", styles["Normal"]))

    doc.build(Story)
    buffer.seek(0)
    return buffer.getvalue()
