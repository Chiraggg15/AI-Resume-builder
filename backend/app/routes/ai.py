"""
AI Routes  –  /api/ai
----------------------
POST /api/ai/generate          → Generate full resume content using GPT
POST /api/ai/analyze           → Analyze resume vs job description (NLP)
POST /api/ai/cover-letter      → Generate a tailored cover letter
POST /api/ai/improve-summary   → Rewrite/improve a professional summary
"""

from flask import Blueprint, request, jsonify
from app.services.ai_service import AIService
from app.services.nlp_service import NLPService
from app.utils.jwt_helper import jwt_required_custom

ai_bp = Blueprint("ai", __name__)


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/generate
# Body: { "job_title": str, "skills": [str], "experience_years": int,
#         "industry": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/generate", methods=["POST"])
@jwt_required_custom
def generate_resume():
    """
    Generate AI-powered resume content based on the user's inputs.
    Returns structured resume data ready to be saved.
    """
    data = request.get_json() or {}

    if not data.get("job_title"):
        return jsonify({"error": "job_title is required"}), 400

    try:
        result = AIService.generate_resume_content(
            job_title=data.get("job_title", ""),
            skills=data.get("skills", []),
            experience_years=data.get("experience_years", 0),
            industry=data.get("industry", "Technology"),
            extra_info=data.get("extra_info", ""),
        )
        return jsonify({"generated": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/analyze
# Body: { "resume_text": str, "job_description": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/analyze", methods=["POST"])
@jwt_required_custom
def analyze_resume():
    """
    Extract keywords from job description, compare with resume,
    and return ATS score + missing skills + suggestions.
    """
    data = request.get_json() or {}

    if not data.get("resume_text") or not data.get("job_description"):
        return jsonify({"error": "resume_text and job_description are required"}), 400

    try:
        analysis = NLPService.analyze_resume(
            resume_text=data["resume_text"],
            job_description=data["job_description"],
        )
        return jsonify({"analysis": analysis}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/cover-letter
# Body: { "resume_summary": str, "job_description": str,
#         "company_name": str, "applicant_name": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/cover-letter", methods=["POST"])
@jwt_required_custom
def generate_cover_letter():
    """Generate a personalized cover letter using GPT."""
    data = request.get_json() or {}

    required = ["resume_summary", "job_description", "company_name", "applicant_name"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    try:
        letter = AIService.generate_cover_letter(
            resume_summary=data["resume_summary"],
            job_description=data["job_description"],
            company_name=data["company_name"],
            applicant_name=data["applicant_name"],
        )
        return jsonify({"cover_letter": letter}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ────────────────────────────────────────────────────────────────────────────
# POST /api/ai/improve-summary
# Body: { "summary": str, "job_title": str }
# ────────────────────────────────────────────────────────────────────────────
@ai_bp.route("/improve-summary", methods=["POST"])
@jwt_required_custom
def improve_summary():
    """Rewrite a professional summary to be more impactful and ATS-friendly."""
    data = request.get_json() or {}

    if not data.get("summary"):
        return jsonify({"error": "summary is required"}), 400

    try:
        improved = AIService.improve_summary(
            summary=data["summary"],
            job_title=data.get("job_title", ""),
        )
        return jsonify({"improved_summary": improved}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
