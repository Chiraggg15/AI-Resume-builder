"""
NLP Service
-----------
Uses spaCy to perform keyword extraction and resume-vs-job-description analysis.
Returns ATS match score, missing keywords, and improvement suggestions.

Setup: python -m spacy download en_core_web_sm
"""

import re
from collections import Counter

# spaCy is loaded lazily to avoid slow startup time
_nlp = None


def _get_nlp():
    """Lazy-load the spaCy English model."""
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError(
                "spaCy model not found. Run: python -m spacy download en_core_web_sm"
            )
    return _nlp


def _extract_keywords(text: str, top_n: int = 30) -> list[str]:
    """
    Extract meaningful keywords from text using spaCy.
    Filters out stopwords and punctuation; keeps nouns, proper nouns, and adjectives.
    """
    nlp = _get_nlp()
    doc = nlp(text.lower())

    keywords = []
    for token in doc:
        if (
            not token.is_stop
            and not token.is_punct
            and token.pos_ in ("NOUN", "PROPN", "ADJ")
            and len(token.lemma_) > 2
        ):
            keywords.append(token.lemma_)

    # Also extract noun chunks (multi-word phrases like "machine learning")
    for chunk in doc.noun_chunks:
        phrase = chunk.text.strip()
        if len(phrase) > 3:
            keywords.append(phrase)

    # Return most common keywords
    counts = Counter(keywords)
    return [word for word, _ in counts.most_common(top_n)]


def _normalize(text: str) -> str:
    """Clean and normalize text for comparison."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return text


class NLPService:

    @staticmethod
    def analyze_resume(resume_text: str, job_description: str) -> dict:
        """
        Compare a resume against a job description and return:
          - ats_score (0-100): percentage of JD keywords found in resume
          - matched_keywords: list of keywords found in both
          - missing_keywords: important JD keywords absent from resume
          - suggestions: actionable improvement tips
        """
        # Extract keywords from both documents
        jd_keywords   = _extract_keywords(job_description, top_n=40)
        res_text_norm  = _normalize(resume_text)

        matched    = []
        missing    = []

        for keyword in jd_keywords:
            if keyword in res_text_norm:
                matched.append(keyword)
            else:
                missing.append(keyword)

        # ATS score = ratio of matched keywords
        total = len(jd_keywords) if jd_keywords else 1
        ats_score = round((len(matched) / total) * 100)

        # Generate human-readable suggestions
        suggestions = NLPService._build_suggestions(ats_score, missing)

        return {
            "ats_score": ats_score,
            "matched_keywords": matched[:20],     # Top 20 matches
            "missing_keywords": missing[:15],     # Top 15 missing
            "total_jd_keywords": len(jd_keywords),
            "score_label": NLPService._score_label(ats_score),
            "suggestions": suggestions,
        }

    @staticmethod
    def _score_label(score: int) -> str:
        """Return a human-readable label for the ATS score."""
        if score >= 80:
            return "Excellent"
        elif score >= 60:
            return "Good"
        elif score >= 40:
            return "Fair"
        else:
            return "Needs Improvement"

    @staticmethod
    def _build_suggestions(score: int, missing: list) -> list[str]:
        """Build actionable suggestions based on score and missing keywords."""
        suggestions = []

        if score < 50:
            suggestions.append(
                "Your resume matches less than 50% of the job description keywords. "
                "Consider rewriting your experience section to align with the job requirements."
            )

        if missing:
            top_missing = ", ".join(missing[:5])
            suggestions.append(
                f"Add these missing keywords to your resume: {top_missing}."
            )

        suggestions.append(
            "Use the exact phrases from the job description where applicable — ATS systems match exact strings."
        )
        suggestions.append(
            "Ensure your skills section explicitly lists all relevant technical tools and technologies."
        )

        if score >= 70:
            suggestions.append(
                "Good keyword match! Focus on quantifying your achievements with numbers and percentages."
            )

        return suggestions

    @staticmethod
    def extract_skills_from_text(text: str) -> list[str]:
        """
        Simple skill extraction: find common tech skills mentioned in any text.
        Useful for auto-populating the skills field.
        """
        KNOWN_SKILLS = [
            "python", "java", "javascript", "typescript", "react", "node.js",
            "django", "flask", "fastapi", "sql", "mongodb", "postgresql", "mysql",
            "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux",
            "machine learning", "deep learning", "tensorflow", "pytorch",
            "nlp", "data analysis", "rest api", "graphql", "html", "css",
            "c++", "c#", "ruby", "php", "swift", "kotlin", "agile", "scrum",
        ]
        text_lower = text.lower()
        return [skill for skill in KNOWN_SKILLS if skill in text_lower]
