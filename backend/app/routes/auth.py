"""
Auth Routes  –  /api/auth
--------------------------
POST /api/auth/register   → Create a new user account
POST /api/auth/login      → Login and receive JWT
GET  /api/auth/me         → Get current user profile (protected)
PUT  /api/auth/me         → Update profile (protected)
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import UserModel
from app.utils.validators import is_valid_email, is_strong_password, validate_required_fields
from app.utils.jwt_helper import jwt_required_custom, get_current_user_id

auth_bp = Blueprint("auth", __name__)


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user and return a JWT token."""
    data = request.get_json() or {}

    # Validate required fields
    ok, err = validate_required_fields(data, ["full_name", "email", "password"])
    if not ok:
        return jsonify({"error": err}), 400

    # Validate email format
    if not is_valid_email(data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    # Validate password strength
    ok, err = is_strong_password(data["password"])
    if not ok:
        return jsonify({"error": err}), 400

    # Check if email already registered
    if UserModel.find_by_email(db, data["email"]):
        return jsonify({"error": "Email already registered"}), 409

    # Create user
    user = UserModel.create(db, data["full_name"], data["email"], data["password"])

    # Generate JWT (identity = user id string)
    token = create_access_token(identity=user["_id"])

    return jsonify({
        "message": "Account created successfully",
        "token": token,
        "user": UserModel.serialize(user),
    }), 201


# ────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return a JWT token."""
    data = request.get_json() or {}

    ok, err = validate_required_fields(data, ["email", "password"])
    if not ok:
        return jsonify({"error": err}), 400

    user = UserModel.find_by_email(db, data["email"])
    if not user or not UserModel.verify_password(data["password"], user["password_hash"]):
        # Generic message to prevent user enumeration
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["_id"]))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": UserModel.serialize(user),
    }), 200


# ────────────────────────────────────────────────────────────────────────────
# GET /api/auth/me
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required_custom
def get_me():
    """Return the currently authenticated user's profile."""
    user_id = get_current_user_id()
    user = UserModel.find_by_id(db, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(UserModel.serialize(user)), 200


# ────────────────────────────────────────────────────────────────────────────
# PUT /api/auth/me
# ────────────────────────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["PUT"])
@jwt_required_custom
def update_me():
    """Update the authenticated user's profile information."""
    user_id = get_current_user_id()
    data = request.get_json() or {}

    # Only allow updating profile sub-document fields
    allowed = ["phone", "location", "linkedin", "github", "portfolio", "summary"]
    profile_data = {k: v for k, v in data.items() if k in allowed}

    if not profile_data:
        return jsonify({"error": "No valid fields to update"}), 400

    UserModel.update_profile(db, user_id, profile_data)
    user = UserModel.find_by_id(db, user_id)
    return jsonify({
        "message": "Profile updated",
        "user": UserModel.serialize(user),
    }), 200
