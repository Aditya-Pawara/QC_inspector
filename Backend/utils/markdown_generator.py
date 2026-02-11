import json
from datetime import datetime

def generate_markdown_report(inspection):
    """
    Generates a Markdown report for a given inspection.
    
    Args:
        inspection: The inspection object (SQLAlchemy model instance)
        
    Returns:
        str: formatted markdown string
    """
    analysis = inspection.analysis_result
    if isinstance(analysis, str):
        try:
            analysis = json.loads(analysis)
        except json.JSONDecodeError:
            analysis = {}
            
    header = f"""# Quality Control Inspection Report
**Inspection ID:** {inspection.id}
**Date:** {inspection.created_at.strftime('%Y-%m-%d %H:%M:%S')}
**Image:** {inspection.image_path}

---

## 1. Inspection Overview
**Overall Status:** {inspection.status}
**Overall Severity:** {analysis.get('overall_severity', 'N/A')}
**Summary:**
{analysis.get('summary', 'No summary provided.')}
{f"**⚠️ ERROR:** {analysis.get('error')}" if analysis.get('error') else ""}

---
"""

    # Severity Breakdown
    # Assuming analysis has defects list with severity
    defects = analysis.get('defects', [])
    severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    
    for defect in defects:
        sev_raw = defect.get('severity', 'Low')
        sev = sev_raw.capitalize() if sev_raw else 'Low'
        if sev in severity_counts:
            severity_counts[sev] += 1
        else:
            # Fallback for unknown severities
            pass

    severity_section = f"""## 2. Severity Breakdown

| Severity Level | Count |
| :--- | :--- |
| 🔴 Critical | {severity_counts.get('Critical', 0)} |
| 🟠 High | {severity_counts.get('High', 0)} |
| 🟡 Medium | {severity_counts.get('Medium', 0)} |
| 🟢 Low | {severity_counts.get('Low', 0)} |

---
"""

    # Defects List
    defects_section = "## 3. Detected Defects\n\n"
    if defects:
        defects_section += "| Name | Description | Severity | Confidence |\n"
        defects_section += "| :--- | :--- | :--- | :--- |\n"
        for defect in defects:
            name = defect.get('name', 'Unknown')
            desc = defect.get('description', 'No description')
            sev = defect.get('severity', 'Low')
            conf = defect.get('confidence', 'N/A')
            # Escape pipes in content to avoid breaking tables
            name = str(name).replace('|', '\\|')
            desc = str(desc).replace('|', '\\|')
            defects_section += f"| {name} | {desc} | {sev} | {conf} |\n"
    else:
        defects_section += "No defects detected.\n"
    
    defects_section += "\n---\n"

    # Quality Issues
    quality_issues = analysis.get('quality_issues', [])
    quality_section = "## 4. Quality Issues\n\n"
    if quality_issues:
        for issue in quality_issues:
            if isinstance(issue, dict):
                 issue_text = f"**{issue.get('issue', 'Issue')}**: {issue.get('description', '')}"
            else:
                issue_text = str(issue)
            quality_section += f"- {issue_text}\n"
    else:
        quality_section += "No specific quality issues noted.\n"
    
    quality_section += "\n---\n"

    # Recommendations
    recommendations = analysis.get('recommendations', [])
    rec_section = "## 5. Recommendations\n\n"
    if recommendations:
        for i, rec in enumerate(recommendations, 1):
            if isinstance(rec, dict):
                rec_text = f"**{rec.get('title', '')}**: {rec.get('action', '')}"
            else:
                rec_text = str(rec)
            rec_section += f"{i}. {rec_text}\n"
    else:
        rec_section += "No recommendations provided.\n"

    return header + severity_section + defects_section + quality_section + rec_section
