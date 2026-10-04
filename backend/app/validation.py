"""Upload validation: extension allow-list, size limit, safe filenames, magic-byte sniffing."""
import re

ALLOWED = {"txt", "csv", "md", "json", "log", "pdf", "docx", "png", "jpg", "jpeg", "tif"}


class UploadError(ValueError):
    """Raised with a message that is safe to show to end users."""


def safe_filename(name: str) -> str:
    base = (name or "upload").replace("\\", "/").split("/")[-1]
    base = re.sub(r"[^\w.\- ()]", "_", base).strip(". ") or "upload"
    return base[:120]


def extension(name: str) -> str:
    return safe_filename(name).rsplit(".", 1)[-1].lower() if "." in name else ""


def validate_upload(name: str, data: bytes, max_bytes: int) -> str:
    ext = extension(name)
    if ext not in ALLOWED:
        raise UploadError("Unsupported file type. Use PDF, DOCX, TXT, CSV, MD, JSON or an image.")
    if not data:
        raise UploadError("This file is empty.")
    if len(data) > max_bytes:
        raise UploadError(f"This file is over the {max_bytes // (1024 * 1024)} MB limit.")
    head = data[:8]
    if ext == "pdf" and not head.startswith(b"%PDF"):
        raise UploadError("This file is not a valid PDF.")
    if ext == "docx" and not head.startswith(b"PK"):
        raise UploadError("This file is not a valid DOCX document.")
    if ext == "png" and not head.startswith(b"\x89PNG"):
        raise UploadError("This file is not a valid PNG image.")
    if ext in {"jpg", "jpeg"} and not head.startswith(b"\xff\xd8"):
        raise UploadError("This file is not a valid JPEG image.")
    return ext
