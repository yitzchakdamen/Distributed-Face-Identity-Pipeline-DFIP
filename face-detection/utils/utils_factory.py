from datetime import datetime, timezone
import uuid
import hashlib


def now_utc_iso_ms() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def create_unique_id(content: bytes) -> str:
    """
    Produce a deterministic UUID5 from the sha256 of the provided content.

    Args:
        content: Bytes used to derive a stable identifier.

    Returns:
        A string UUID that is stable for identical content.
    """
    sha = hashlib.sha256(content).hexdigest()
    ns = uuid.UUID("00000000-0000-0000-0000-000000000000")
    return str(uuid.uuid5(ns, sha))


def create_dict_message(data: dict) -> dict:
    """Wrap a dictionary in a message envelope with metadata."""
    return {
        "image_id": create_unique_id(),
        "event_ts": now_utc_iso_ms(),
        "data": data
    }