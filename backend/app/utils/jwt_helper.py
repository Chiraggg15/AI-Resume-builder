"""
JWT Utilities
-------------
Helper functions for creating tokens and protecting routes.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity


def jwt_required_custom(fn):
    """
    Custom decorator that wraps flask_jwt_extended's jwt_required.
    Returns a clean JSON error instead of the default HTML error.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception as e:
            return jsonify({"error": "Authentication required", "detail": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper


def get_current_user_id() -> str:
    """Return the user_id stored in the JWT 'identity' claim."""
    return get_jwt_identity()
