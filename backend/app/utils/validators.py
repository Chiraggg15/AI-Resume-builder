"""
Validators
----------
Input validation helpers used across routes.
"""

import re


def is_valid_email(email: str) -> bool:
    """Basic RFC 5322 email format check."""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


def is_strong_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Returns (is_valid: bool, error_message: str).
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"
    return True, ""


def validate_required_fields(data: dict, required: list) -> tuple[bool, str]:
    """
    Check that all required keys exist and are non-empty in data dict.
    Returns (is_valid: bool, error_message: str).
    """
    for field in required:
        if not data.get(field):
            return False, f"'{field}' is required"
    return True, ""
