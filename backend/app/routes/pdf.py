"""
PDF Route  –  /api/pdf
-----------------------
GET /api/pdf/<resume_id>  → Returns full HTML for the resume (print to PDF in browser)

We use browser-native printing (window.print()) rather than a server-side PDF library,
which removes heavy C-extension dependencies like reportlab/weasyprint on Windows.
"""

from flask import Blueprint, Response
from app import db
from app.models.resume import ResumeModel
from app.utils.jwt_helper import jwt_required_custom, get_current_user_id

pdf_bp = Blueprint("pdf", __name__)


def build_resume_html(resume: dict) -> str:
    """Generate a print-ready, ATS-clean HTML string for the resume."""
    pi = resume.get("personal_info", {})
    skills = resume.get("skills", {})
    tech = ", ".join(skills.get("technical", []))
    soft = ", ".join(skills.get("soft", []))

    # ── Experience blocks ────────────────────────────────────────────────────
    exp_html = ""
    for e in resume.get("experience", []):
        end = e.get("end_date") or "Present"
        desc_lines = "\n".join(
            f"<li>{line.lstrip('•-').strip()}</li>"
            for line in (e.get("description") or "").splitlines()
            if line.strip()
        )
        exp_html += f"""
        <div class="entry">
          <div class="entry-head">
            <strong>{e.get("position","")}</strong>
            <span class="date">{e.get("start_date","")} – {end}</span>
          </div>
          <div class="company">{e.get("company","")}</div>
          <ul>{desc_lines}</ul>
        </div>"""

    # ── Education blocks ─────────────────────────────────────────────────────
    edu_html = ""
    for e in resume.get("education", []):
        grade = f" &nbsp;·&nbsp; {e.get('grade')}" if e.get("grade") else ""
        edu_html += f"""
        <div class="entry">
          <div class="entry-head">
            <strong>{e.get("institution","")}</strong>
            <span class="date">{e.get("start_date","")} – {e.get("end_date","")}</span>
          </div>
          <div class="company">{e.get("degree","")} in {e.get("field_of_study","")}{grade}</div>
        </div>"""

    # ── Projects blocks ──────────────────────────────────────────────────────
    proj_html = ""
    for p in resume.get("projects", []):
        techs = ", ".join(p.get("technologies", []))
        proj_html += f"""
        <div class="entry">
          <div class="entry-head"><strong>{p.get("name","")}</strong></div>
          <p>{p.get("description","")}</p>
          {f'<p class="tech-line">Technologies: {techs}</p>' if techs else ''}
        </div>"""

    # ── Section helper ───────────────────────────────────────────────────────
    def section(title, content):
        if not content.strip():
            return ""
        return f'<section><h2>{title}</h2>{content}</section>'

    contact_parts = filter(None, [
        pi.get("email"), pi.get("phone"), pi.get("location"),
        pi.get("linkedin"), pi.get("github"), pi.get("portfolio"),
    ])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>{pi.get("full_name","Resume")} – Resume</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Georgia', serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
    padding: 36px 48px;
    max-width: 780px;
    margin: 0 auto;
  }}
  h1 {{ font-size: 22pt; letter-spacing: -0.5px; margin-bottom: 4px; }}
  .contact {{
    font-size: 9.5pt;
    color: #555;
    display: flex; flex-wrap: wrap; gap: 12px;
    margin-bottom: 20px;
    border-bottom: 2px solid #6d28d9;
    padding-bottom: 10px;
  }}
  section {{ margin-bottom: 18px; }}
  h2 {{
    font-size: 10pt;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6d28d9;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
    margin-bottom: 10px;
  }}
  .entry {{ margin-bottom: 12px; }}
  .entry-head {{
    display: flex;
    justify-content: space-between;
    font-size: 11pt;
    margin-bottom: 2px;
  }}
  .date {{ color: #666; font-size: 10pt; }}
  .company {{ color: #444; font-size: 10pt; margin-bottom: 4px; }}
  ul {{ padding-left: 16px; }}
  li {{ margin-bottom: 2px; font-size: 10.5pt; }}
  p {{ font-size: 10.5pt; line-height: 1.6; color: #222; }}
  .skills-row {{ font-size: 10.5pt; line-height: 1.8; }}
  .tech-line {{ font-size: 9.5pt; color: #555; margin-top: 2px; }}
  @media print {{
    body {{ padding: 0; }}
    @page {{ margin: 1.5cm; size: A4; }}
  }}
</style>
</head>
<body>
  <h1>{pi.get("full_name","Your Name")}</h1>
  <div class="contact">
    {"&nbsp;|&nbsp;".join(contact_parts)}
  </div>

  {section("Professional Summary", f'<p>{pi.get("summary","")}</p>') if pi.get("summary") else ""}
  {section("Work Experience", exp_html)}
  {section("Education", edu_html)}
  {section("Projects", proj_html) if proj_html else ""}
  {section("Skills", f'<div class="skills-row">'
      + (f'<strong>Technical:</strong> {tech}<br/>' if tech else '')
      + (f'<strong>Soft Skills:</strong> {soft}' if soft else '')
      + '</div>')}
</body>
</html>"""


@pdf_bp.route("/<resume_id>", methods=["GET"])
@jwt_required_custom
def export_pdf(resume_id):
    """Return a print-ready HTML page for the resume."""
    user_id = get_current_user_id()
    resume  = ResumeModel.find_by_id(db, resume_id)

    if not resume:
        return {"error": "Resume not found"}, 404
    if resume.get("user_id") != user_id:
        return {"error": "Access denied"}, 403

    html = build_resume_html(ResumeModel.serialize(resume))
    return Response(html, mimetype="text/html",
                    headers={"Content-Disposition": "inline"})
