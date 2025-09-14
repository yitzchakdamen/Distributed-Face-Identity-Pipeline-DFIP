from datetime import datetime, timezone
import uuid


def now_utc_iso_ms() -> str:
    return str(datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"))


def create_unique_id() -> str:
    """Generate a unique UUID4 string"""
    return str(uuid.uuid4())


