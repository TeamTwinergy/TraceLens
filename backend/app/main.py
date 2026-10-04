"""TraceLens API (FastAPI). Thin HTTP layer over validation / extraction / retrieval modules."""
import json
import logging
from functools import lru_cache

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import auth, config, extract, retrieval
from .validation import UploadError, safe_filename, validate_upload

log = logging.getLogger("tracelens")
app = FastAPI(title="TraceLens API", version="1.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(CORSMiddleware, allow_origins=config.ALLOWED_ORIGINS, allow_methods=["GET", "POST"], allow_headers=["*"])


@lru_cache(maxsize=1)
def demo_case() -> dict:
    return json.loads(config.DEMO_PATH.read_text(encoding="utf-8"))


def get_case(inv_id: str) -> dict:
    if inv_id != "demo":
        raise HTTPException(404, "Investigation not found. Only the synthetic demo investigation is stored in this build.")
    return demo_case()


class RegisterIn(BaseModel):
    name: str = Field(max_length=80)
    email: str = Field(max_length=320)
    password: str = Field(max_length=128)


class LoginIn(BaseModel):
    email: str = Field(max_length=320)
    password: str = Field(max_length=128)


def current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Please sign in to continue.")
    try:
        return auth.read_token(authorization[7:].strip())
    except auth.AuthError as e:
        raise HTTPException(e.status, str(e))


@app.post("/api/auth/register")
def register(body: RegisterIn):
    try:
        return auth.register(body.name, body.email, body.password)
    except auth.AuthError as e:
        raise HTTPException(e.status, str(e))


@app.post("/api/auth/login")
def login(body: LoginIn):
    try:
        return auth.login(body.email, body.password)
    except auth.AuthError as e:
        raise HTTPException(e.status, str(e))


@app.get("/api/auth/me")
def me(user: dict = Depends(current_user)):
    return {"user": {"email": user["sub"], "name": user["name"]}}


class ChatIn(BaseModel):
    question: str = Field(min_length=2, max_length=500)


@app.get("/api/health")
def health():
    return {"status": "ok", "extractors": extract.available(), "llm": bool(config.LLM_API_KEY), "database": bool(config.DATABASE_URL)}


@app.get("/api/investigations")
def list_investigations():
    c = demo_case()
    return [{"id": "demo", "label": c["label"], "synthetic": True, "documents": len(c["docs"])}]


@app.get("/api/investigations/{inv_id}")
def get_investigation(inv_id: str):
    return get_case(inv_id)


@app.get("/api/investigations/{inv_id}/{part}")
def get_part(inv_id: str, part: str):
    keys = {"documents": "docs", "entities": "entities", "relationships": "relationships", "timeline": "events", "evidence": "evidence",
            "contradictions": "contradictions", "anomalies": "anomalies", "gaps": "gaps"}
    if part not in keys:
        raise HTTPException(404, "Unknown resource.")
    return get_case(inv_id)[keys[part]]


@app.post("/api/investigations/{inv_id}/chat")
def chat(inv_id: str, body: ChatIn):
    return retrieval.answer(get_case(inv_id), body.question)


@app.post("/api/extract")
async def extract_text(file: UploadFile = File(...), user: dict = Depends(current_user)):
    """Validate an upload and return extracted text. Nothing is stored."""
    data = await file.read(config.MAX_UPLOAD_BYTES + 1)
    name = safe_filename(file.filename or "upload")
    try:
        ext = validate_upload(name, data, config.MAX_UPLOAD_BYTES)
        out = extract.extract(ext, data)
    except UploadError as e:
        raise HTTPException(422, str(e))
    except Exception:
        log.exception("extraction failed")
        raise HTTPException(500, "The document could not be processed.")
    return {"filename": name, "text": out.text, "pages": out.pages, "kind": out.kind}
