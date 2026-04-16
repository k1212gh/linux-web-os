"""Guestbook / contact REST API."""
import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
DATA_FILE = Path(__file__).parent.parent / "data" / "guestbook.json"


def _load():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return []


def _save(entries):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")


class GuestbookEntry(BaseModel):
    name: str
    message: str


@router.get("/guestbook")
async def list_guestbook():
    return _load()


@router.post("/guestbook")
async def add_guestbook(entry: GuestbookEntry):
    entries = _load()
    new_entry = {
        "name": entry.name,
        "message": entry.message,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
    }
    entries.insert(0, new_entry)
    _save(entries)
    return new_entry
