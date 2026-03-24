"""
db.py  –  MongoDB Connection Utility
--------------------------------------
Provides a db_check() function to verify the MongoDB connection
and ensure required collections + indexes exist.

Run standalone: python app/db.py
"""

from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

load_dotenv()


def get_db(uri: str = None, db_name: str = None):
    """Return a connected MongoDB database object."""
    uri     = uri     or os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    db_name = db_name or os.getenv("DB_NAME", "ai_resume_db")
    client  = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return client[db_name]


def ensure_indexes(db) -> None:
    """
    Create indexes to speed up queries and enforce uniqueness.
    This is idempotent — safe to run multiple times.
    """
    # Users: unique email index
    db["users"].create_index([("email", ASCENDING)], unique=True, name="email_unique")

    # Resumes: index by user_id for fast lookups
    db["resumes"].create_index([("user_id", ASCENDING)], name="user_id_idx")
    db["resumes"].create_index(
        [("user_id", ASCENDING), ("created_at", ASCENDING)],
        name="user_created_idx"
    )

    print("✅ Indexes created/verified")


def db_check() -> bool:
    """
    Test the MongoDB connection, print status, and set up indexes.
    Returns True if connected, False otherwise.
    """
    uri     = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("DB_NAME", "ai_resume_db")

    print(f"\n🔌 Connecting to MongoDB...")
    print(f"   URI     : {uri}")
    print(f"   Database: {db_name}")

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Force connection — raises if unreachable
        client.admin.command("ping")

        db = client[db_name]
        ensure_indexes(db)

        # Show existing collections
        colls = db.list_collection_names()
        print(f"✅ Connected! Collections: {colls or '(none yet — will be created on first insert)'}")
        return True

    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"\n❌ MongoDB connection FAILED: {e}")
        print("\n👉 Possible fixes:")
        print("   • Local MongoDB  : make sure 'mongod' service is running")
        print("     Windows: net start MongoDB   OR   mongod --dbpath C:\\data\\db")
        print("   • MongoDB Atlas  : check your MONGO_URI in backend/.env")
        print("     Format: mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/")
        return False


if __name__ == "__main__":
    success = db_check()
    exit(0 if success else 1)
