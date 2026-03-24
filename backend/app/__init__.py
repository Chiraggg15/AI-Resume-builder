"""
Flask Application Factory
--------------------------
Initializes the Flask app with all extensions and registers blueprints.
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from .config import Config

# Global MongoDB client accessible across the app
mongo_client = None
db = None


def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── Extensions ──────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins (restrict in production)
    JWTManager(app)

    # ── MongoDB Connection ───────────────────────────────────────────────────
    global mongo_client, db
    mongo_client = MongoClient(app.config["MONGO_URI"])
    db = mongo_client[app.config["DB_NAME"]]

    # ── Register Blueprints (Route Modules) ──────────────────────────────────
    from .routes.auth import auth_bp
    from .routes.resume import resume_bp
    from .routes.ai import ai_bp

    app.register_blueprint(auth_bp,   url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(ai_bp,     url_prefix="/api/ai")

    # ── Health Check Route ───────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "AI Resume Generator API is running"}

    return app
