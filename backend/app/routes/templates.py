from flask import Blueprint, jsonify, request
from datetime import datetime, timezone
from app.utils.jwt_helper import jwt_required_custom, get_current_user_id
from app.models.resume import ResumeModel
from app.models.user import UserModel
from app import db

templates_bp = Blueprint('templates', __name__)

TEMPLATES = [
    {
        "id": "classic-professional",
        "name": "Classic Professional",
        "description": "Clean, ATS-optimized single-column layout. Works for all industries.",
        "tier": "free",
        "category": ["all", "corporate", "finance", "healthcare"],
        "atsScore": 98,
        "layout": "single-column",
        "accentColorDefault": "#2563EB",
        "supportedSections": ["summary", "experience", "education", "skills", "certifications"],
        "thumbnail": "/assets/templates/classic-professional-thumb.png"
    },
    {
        "id": "modern-two-column",
        "name": "Modern Two-Column",
        "description": "30/70 left-sidebar layout: skills, contact, education in sidebar; experience in main column.",
        "tier": "free",
        "category": ["all", "marketing", "sales"],
        "atsScore": 72,
        "layout": "two-column",
        "accentColorDefault": "#7C3AED",
        "supportedSections": ["summary", "experience", "education", "skills", "certifications", "projects"],
        "thumbnail": "/assets/templates/modern-two-column-thumb.png"
    },
    {
        "id": "executive-timeline",
        "name": "Executive Timeline",
        "description": "Single column with left-border timeline for experience entries.",
        "tier": "free",
        "category": ["senior", "corporate", "consulting"],
        "atsScore": 90,
        "layout": "single-column-timeline",
        "accentColorDefault": "#1E293B",
        "supportedSections": ["summary", "experience", "education", "skills", "certifications"],
        "thumbnail": "/assets/templates/executive-timeline-thumb.png"
    },
    {
        "id": "creative-portfolio",
        "name": "Creative Portfolio",
        "description": "Bold full-width color header block; asymmetric two-panel layout.",
        "tier": "free",
        "category": ["creative", "design", "marketing"],
        "atsScore": 65,
        "layout": "asymmetric",
        "accentColorDefault": "#EC4899",
        "supportedSections": ["summary", "experience", "education", "skills", "projects"],
        "thumbnail": "/assets/templates/creative-portfolio-thumb.png"
    },
    {
        "id": "minimalist-clean",
        "name": "Minimalist Clean",
        "description": "Maximum white space; narrow centered column.",
        "tier": "free",
        "category": ["academia", "research", "startups"],
        "atsScore": 96,
        "layout": "centered-column",
        "accentColorDefault": "#111827",
        "supportedSections": ["summary", "experience", "education", "skills", "certifications"],
        "thumbnail": "/assets/templates/minimalist-clean-thumb.png"
    },
    {
        "id": "tech-developer",
        "name": "Tech Developer",
        "description": "Monospace font accents, inline code-style skill tags.",
        "tier": "free",
        "category": ["tech", "engineering", "data"],
        "atsScore": 88,
        "layout": "single-column",
        "accentColorDefault": "#0D9488",
        "supportedSections": ["summary", "experience", "education", "skills", "projects"],
        "thumbnail": "/assets/templates/tech-developer-thumb.png"
    },
    {
        "id": "ats-maximizer",
        "name": "ATS Maximizer",
        "description": "Zero design — pure ATS optimization mode.",
        "tier": "free",
        "category": ["all"],
        "atsScore": 100,
        "layout": "pure-text",
        "accentColorDefault": "#000000",
        "supportedSections": ["summary", "experience", "education", "skills", "certifications", "projects"],
        "thumbnail": "/assets/templates/ats-maximizer-thumb.png"
    }
]

@templates_bp.route('/', methods=['GET'])
def get_templates():
    return jsonify({"templates": TEMPLATES}), 200

@templates_bp.route('/<template_id>', methods=['GET'])
def get_template(template_id):
    for t in TEMPLATES:
        if t["id"] == template_id:
            return jsonify(t), 200
    return jsonify({"error": "Template not found"}), 404

@templates_bp.route('/apply', methods=['POST'])
@jwt_required_custom
def apply_template():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    
    resume_id = data.get("resume_id")
    template_id = data.get("template_id")
    customizations = data.get("customizations", {})
    
    if not resume_id or not template_id:
        return jsonify({"error": "resume_id and template_id are required"}), 400
        
    # Check if template exists
    target_template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not target_template:
        return jsonify({"error": "Template not found"}), 404
        
    # Premium gating removed as requested
    # Verify resume ownership
    resume = ResumeModel.find_by_id(db, resume_id)
    if not resume:
        return jsonify({"error": "Resume not found"}), 404
    if resume.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403
        
    # Save current state as snapshot
    try:
        ResumeModel.save_snapshot(db, resume_id, dict(resume))
    except Exception:
        pass
        
    # Apply new template configuration
    template_config = {
        "id": template_id,
        "customizations": customizations,
        "appliedAt": datetime.now(timezone.utc)
    }
    
    ResumeModel.update(db, resume_id, {"template": template_config})
    updated_resume = ResumeModel.find_by_id(db, resume_id)
    
    return jsonify({
        "message": "Template applied successfully",
        "resume": ResumeModel.serialize(updated_resume)
    }), 200
