"""
Persistent config stored in .env.json (gitignored).
Writes values to env at runtime so other routers can read them.
"""
import os
import json
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

CONFIG_PATH = Path(__file__).parent.parent / ".env.json"

ALLOWED_KEYS = {
    "ANTHROPIC_API_KEY",
    "VSCODE_TUNNEL_URL",
    "KASM_URL",
    "FILEBROWSER_URL",
    "HSA_OVERRIDE_GFX_VERSION",
}


def _load() -> dict:
    if CONFIG_PATH.exists():
        try:
            return json.loads(CONFIG_PATH.read_text())
        except Exception:
            pass
    return {}


def _save(data: dict):
    CONFIG_PATH.write_text(json.dumps(data, indent=2))


@router.get("/config")
async def get_config():
    data = _load()
    # Mask API key
    masked = {**data}
    if masked.get("ANTHROPIC_API_KEY"):
        key = masked["ANTHROPIC_API_KEY"]
        masked["ANTHROPIC_API_KEY"] = key[:8] + "..." + key[-4:] if len(key) > 12 else "****"
    return masked


@router.post("/config")
async def save_config(payload: dict):
    current = _load()
    for k, v in payload.items():
        if k not in ALLOWED_KEYS:
            continue
        # Don't overwrite with masked placeholder
        if "..." in str(v) and k == "ANTHROPIC_API_KEY":
            continue
        current[k] = v
        if v:
            os.environ[k] = v
    _save(current)
    return {"ok": True}
