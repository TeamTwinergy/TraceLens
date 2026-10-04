"""Account sign-up / sign-in. Standard library only: PBKDF2 password hashing, SQLite storage, HMAC-signed tokens."""
import base64
import hashlib
import hmac
import json
import re
import secrets
import sqlite3
import time
from collections import defaultdict, deque

from . import config

EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,}$")
ITERATIONS = 200_000
TOKEN_TTL = 7 * 24 * 3600
_SECRET = (config.AUTH_SECRET or secrets.token_hex(32)).encode()
_attempts: dict = defaultdict(deque)


class AuthError(ValueError):
    """Raised with a message that is safe to show to end users."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(config.AUTH_DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT NOT NULL, salt TEXT NOT NULL, pw TEXT NOT NULL, created INTEGER NOT NULL)")
    return conn


def _hash(password: str, salt: bytes) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS).hex()


def _throttle(key: str, limit: int = 10, window: int = 300) -> None:
    q, now = _attempts[key], time.time()
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise AuthError("Too many attempts. Please wait a few minutes and try again.", 429)
    q.append(now)


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).decode().rstrip("=")


def make_token(email: str, name: str) -> str:
    body = _b64(json.dumps({"sub": email, "name": name, "exp": int(time.time()) + TOKEN_TTL}).encode())
    return body + "." + _b64(hmac.new(_SECRET, body.encode(), hashlib.sha256).digest())


def read_token(token: str) -> dict:
    try:
        body, sig = token.split(".", 1)
        good = _b64(hmac.new(_SECRET, body.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, good):
            raise ValueError
        data = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if data["exp"] < time.time():
            raise ValueError
        return data
    except Exception:
        raise AuthError("Your session has expired. Please sign in again.", 401)


def register(name: str, email: str, password: str) -> dict:
    name, email = (name or "").strip(), (email or "").strip().lower()
    if not 1 <= len(name) <= 80:
        raise AuthError("Please enter your name.")
    if not EMAIL_RE.match(email):
        raise AuthError("Please enter a valid email address.")
    if not 8 <= len(password or "") <= 128:
        raise AuthError("Use a password of 8 to 128 characters.")
    salt = secrets.token_bytes(16)
    try:
        with _db() as c:
            c.execute("INSERT INTO users VALUES (?,?,?,?,?)", (email, name, salt.hex(), _hash(password, salt), int(time.time())))
    except sqlite3.IntegrityError:
        raise AuthError("An account with this email already exists.", 409)
    return {"token": make_token(email, name), "user": {"email": email, "name": name}}


def login(email: str, password: str) -> dict:
    email = (email or "").strip().lower()
    _throttle(email)
    row = _db().execute("SELECT name, salt, pw FROM users WHERE email=?", (email,)).fetchone()
    salt = bytes.fromhex(row[1]) if row else b"\0" * 16
    ok = hmac.compare_digest(_hash(password or "", salt), row[2] if row else "0" * 64)
    if not row or not ok:
        raise AuthError("Incorrect email or password.", 401)
    return {"token": make_token(email, row[0]), "user": {"email": email, "name": row[0]}}
