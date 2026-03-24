"""
AI Service
----------
Handles all OpenAI GPT API calls for:
  - Resume content generation
  - Cover letter generation
  - Professional summary improvement

NOTE: Requires OPENAI_API_KEY set in .env
"""

import os
from openai import OpenAI

# Initialize client once (reads OPENAI_API_KEY from env automatically)
_client = None


def _get_client() -> OpenAI:
    """Lazy-initialize the OpenAI client."""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment variables")
        _client = OpenAI(api_key=api_key)
    return _client


def _chat(system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> str:
    """
    Send a chat completion request and return the response text.
    Uses gpt-3.5-turbo (cost-effective for FYP).
    """
    client = _get_client()
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


class AIService:

    @staticmethod
    def generate_resume_content(
        job_title: str,
        skills: list,
        experience_years: int,
        industry: str,
        extra_info: str = "",
    ) -> dict:
        """
        Generate ATS-friendly resume content based on user inputs.
        Returns a dict with: summary, experience bullets, and skills list.
        """
        system = (
            "You are an expert resume writer specializing in ATS-optimized resumes. "
            "Always write in first-person, use strong action verbs, and include quantifiable achievements."
        )
        skills_str = ", ".join(skills) if skills else "general professional skills"
        user = (
            f"Generate a professional resume section for a {job_title} with {experience_years} years "
            f"of experience in the {industry} industry. Skills: {skills_str}. "
            f"Additional info: {extra_info}\n\n"
            "Provide:\n"
            "1. A 2-3 sentence professional summary\n"
            "2. 4 strong bullet points for work experience\n"
            "3. A list of 8 relevant technical skills\n\n"
            "Format as:\nSUMMARY:\n[summary]\n\nEXPERIENCE BULLETS:\n[bullets]\n\nSKILLS:\n[skills]"
        )
        raw = _chat(system, user, max_tokens=800)

        # Parse the structured response into a dict
        sections = {"summary": "", "experience_bullets": [], "skills": []}
        current = None
        for line in raw.splitlines():
            line = line.strip()
            if line.startswith("SUMMARY:"):
                current = "summary"
            elif line.startswith("EXPERIENCE BULLETS:"):
                current = "bullets"
            elif line.startswith("SKILLS:"):
                current = "skills"
            elif line and current == "summary":
                sections["summary"] += line + " "
            elif line and current == "bullets" and (line.startswith("-") or line.startswith("•")):
                sections["experience_bullets"].append(line.lstrip("-•").strip())
            elif line and current == "skills":
                sections["skills"].extend([s.strip() for s in line.split(",") if s.strip()])

        return {
            "summary": sections["summary"].strip(),
            "experience_bullets": sections["experience_bullets"],
            "suggested_skills": sections["skills"],
        }

    @staticmethod
    def generate_cover_letter(
        resume_summary: str,
        job_description: str,
        company_name: str,
        applicant_name: str,
    ) -> str:
        """Generate a personalized, professional cover letter."""
        system = (
            "You are an expert career coach who writes compelling, personalized cover letters. "
            "Keep letters concise (3 paragraphs), professional, and tailored to the job."
        )
        user = (
            f"Write a cover letter for {applicant_name} applying to {company_name}.\n\n"
            f"Applicant summary: {resume_summary}\n\n"
            f"Job description: {job_description}\n\n"
            "Format: Opening paragraph, Skills/Experience match paragraph, Closing paragraph."
        )
        return _chat(system, user, max_tokens=600)

    @staticmethod
    def improve_summary(summary: str, job_title: str = "") -> str:
        """Rewrite a professional summary to be more impactful and ATS-friendly."""
        system = (
            "You are an expert resume writer. Rewrite professional summaries to be "
            "concise, impactful, ATS-friendly, and packed with relevant keywords."
        )
        context = f" for a {job_title} role" if job_title else ""
        user = (
            f"Rewrite this professional summary{context} to be more compelling (max 3 sentences):\n\n{summary}"
        )
        return _chat(system, user, max_tokens=300)

    @staticmethod
    def generate_interview_questions(job_title: str, skills: list, experience_years: int, count: int = 7) -> list[dict]:
        """Generate tailored mock interview questions with sample model answers."""
        system = (
            "You are an expert technical interviewer and career coach. "
            "Generate interview questions with brief, excellent model answers."
        )
        skills_str = ", ".join(skills) if skills else "general professional skills"
        user = (
            f"Generate exactly {count} interview questions for a {job_title} "
            f"with {experience_years} years of experience. Key skills: {skills_str}.\n\n"
            "Include a mix of technical, behavioral, and situational questions.\n"
            "Format the output EXACTLY like this for each question:\n"
            "Q: [The Question]\n"
            "A: [A concise, strong model answer]\n"
            "---\n"
        )
        raw = _chat(system, user, max_tokens=1500)
        
        questions = []
        blocks = raw.split("---")
        for block in blocks:
            q_match = [line.replace("Q:", "").strip() for line in block.splitlines() if line.startswith("Q:")]
            a_match = [line.replace("A:", "").strip() for line in block.splitlines() if line.startswith("A:")]
            if q_match and a_match:
                questions.append({
                    "question": q_match[0],
                    "answer": " ".join(a_match)
                })
        
        return questions[:count]
