from datetime import datetime, timezone
import uuid
import hashlib


def now_utc_iso_ms() -> str:
    """Generate ISO timestamp with milliseconds in UTC timezone ending with Z"""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

def create_stable_face_id(content: bytes) -> str:
    """
    Create a deterministic face ID based on image content.
    
    This generates a stable UUID5 from the SHA256 hash of the provided content,
    ensuring the same face image will always get the same ID.
    
    Args:
        content: Image bytes used to derive a stable identifier
        
    Returns:
        A string UUID that is stable for identical content
    """
    sha = hashlib.sha256(content).hexdigest()
    namespace = uuid.UUID("00000000-0000-0000-0000-000000000000")
    return str(uuid.uuid5(namespace, sha))


