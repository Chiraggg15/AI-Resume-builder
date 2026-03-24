"""
Updated NLP Service — No spaCy Required
-----------------------------------------
Uses regex + a curated tech-skills dictionary for keyword extraction.
This avoids any C-extension build issues on Windows.

If spaCy is later installed, the service automatically upgrades to use it.
"""

import re
from collections import Counter

# ── Curated tech / professional keyword list ─────────────────────────────────
TECH_KEYWORDS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "php",
    "swift", "kotlin", "go", "rust", "scala", "r", "matlab",

    # Frontend
    "react", "angular", "vue", "html", "css", "sass", "tailwind", "bootstrap",
    "next.js", "gatsby", "redux", "webpack", "vite",

    # Backend
    "node.js", "express", "django", "flask", "fastapi", "spring", "laravel",
    "graphql", "rest api", "microservices", "grpc",

    # Databases
    "mongodb", "postgresql", "mysql", "sqlite", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "linux", "nginx",

    # AI/ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "nlp", "computer vision", "data science", "pandas",
    "numpy", "matplotlib", "jupyter",

    # Practices
    "agile", "scrum", "kanban", "tdd", "bdd", "rest", "git", "jira",
    "unit testing", "code review", "object oriented", "api",

    # Soft Skills
    "leadership", "communication", "teamwork", "problem solving",
    "critical thinking", "project management", "collaboration",
}


def _tokenize(text: str) -> list[str]:
    """Lowercase text and split on non-word characters."""
    return re.findall(r"[a-z][a-z0-9+#.]*(?:[\s\-][a-z][a-z0-9+#.]*)*", text.lower())


def _extract_keywords(text: str) -> list[str]:
    """
    Extract keywords by matching against our curated keyword set.
    Also picks up meaningful single words (nouns / proper nouns heuristic).
    Falls back to spaCy if installed for better accuracy.
    """
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text.lower())
        tokens = [
            t.lemma_ for t in doc
            if not t.is_stop and not t.is_punct and t.pos_ in ("NOUN","PROPN","ADJ") and len(t.lemma_) > 2
        ]
        chunks = [c.text.strip() for c in doc.noun_chunks if len(c.text.strip()) > 3]
        all_kw = tokens + chunks
        counts = Counter(all_kw)
        return [w for w, _ in counts.most_common(40)]
    except Exception:
        pass  # Fall through to regex approach

    # ── Regex / dictionary approach ──────────────────────────────────────────
    found = []
    text_lower = text.lower()

    # Multi-word phrases first
    multi = [kw for kw in TECH_KEYWORDS if " " in kw and kw in text_lower]
    found.extend(multi)

    # Single-word keywords
    words = set(re.findall(r"\b[a-z][a-z0-9#+.]{1,}\b", text_lower))
    single = [kw for kw in TECH_KEYWORDS if " " not in kw and kw in words]
    found.extend(single)

    # Deduplicate keeping order
    seen = set()
    unique = []
    for kw in found:
        if kw not in seen:
            seen.add(kw)
            unique.append(kw)
    return unique[:40]


class NLPService:

    @staticmethod
    def analyze_resume(resume_text: str, job_description: str) -> dict:
        """
        Compare resume vs job description.
        Returns: ats_score, matched_keywords, missing_keywords, suggestions.
        """
        jd_keywords  = _extract_keywords(job_description)
        res_norm     = resume_text.lower()

        matched = [kw for kw in jd_keywords if kw in res_norm]
        missing = [kw for kw in jd_keywords if kw not in res_norm]

        total     = len(jd_keywords) or 1
        ats_score = round(len(matched) / total * 100)

        return {
            "ats_score":        ats_score,
            "matched_keywords": matched[:20],
            "missing_keywords": missing[:15],
            "total_jd_keywords": len(jd_keywords),
            "score_label":      NLPService._score_label(ats_score),
            "suggestions":      NLPService._build_suggestions(ats_score, missing),
        }

    @staticmethod
    def _score_label(score: int) -> str:
        if score >= 80: return "Excellent"
        if score >= 60: return "Good"
        if score >= 40: return "Fair"
        return "Needs Improvement"

    @staticmethod
    def _build_suggestions(score: int, missing: list) -> list[str]:
        tips = []
        if score < 50:
            tips.append(
                "Your resume matches fewer than 50% of the job's keywords. "
                "Rewrite your experience section using language from the job description."
            )
        if missing:
            tips.append(f"Add these missing keywords: {', '.join(missing[:5])}.")
        tips.append("Use exact phrases from the job description — ATS systems match exact strings.")
        tips.append("List all relevant technical tools and technologies in a dedicated Skills section.")
        if score >= 70:
            tips.append("Great match! Strengthen impact further by quantifying achievements (%, $, #).")
        return tips

    @staticmethod
    def extract_skills_from_text(text: str) -> list[str]:
        """Auto-extract known skills from any text block."""
        return [kw for kw in TECH_KEYWORDS if kw in text.lower()]
