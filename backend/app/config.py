"""Settings read from environment variables. No secrets are ever sent to the frontend."""
import os
from pathlib import Path

DEMO_PATH = Path(os.getenv("DEMO_DATA_PATH", Path(__file__).resolve().parents[2] / "demo_data" / "orion_case.json"))
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "15")) * 1024 * 1024
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()]
DATABASE_URL = os.getenv("DATABASE_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
AUTH_SECRET = os.getenv("AUTH_SECRET", "")  # set this on the server so sessions survive restarts
AUTH_DB_PATH = os.getenv("AUTH_DB_PATH", "tracelens_users.db")
