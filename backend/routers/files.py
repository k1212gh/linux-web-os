"""File manager REST API."""
import os
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter()


def _safe_path(path: str) -> str:
    """Prevent path traversal."""
    base = os.environ.get("PROJECTS_BASE", os.path.expanduser("~"))
    resolved = os.path.realpath(os.path.join(base, path))
    if not resolved.startswith(os.path.realpath(base)):
        raise ValueError("Path traversal detected")
    return resolved


@router.get("/list")
async def list_dir(path: str = ""):
    try:
        real = _safe_path(path)
        items = []
        for name in sorted(os.listdir(real)):
            full = os.path.join(real, name)
            stat = os.stat(full)
            items.append({
                "name": name,
                "path": os.path.join(path, name) if path else name,
                "is_dir": os.path.isdir(full),
                "size": stat.st_size if not os.path.isdir(full) else None,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
        return {"path": path, "items": items}
    except Exception as e:
        return {"error": str(e)}


@router.get("/read")
async def read_file(path: str):
    try:
        real = _safe_path(path)
        if os.path.isdir(real):
            return {"error": "Is a directory"}
        size = os.path.getsize(real)
        if size > 1_000_000:
            return {"error": "File too large (>1MB)"}
        content = Path(real).read_text(encoding="utf-8", errors="replace")
        return {"path": path, "content": content, "size": size}
    except Exception as e:
        return {"error": str(e)}


@router.post("/upload")
async def upload_file(path: str, file: UploadFile = File(...)):
    try:
        real = _safe_path(path)
        dest = os.path.join(real, file.filename) if os.path.isdir(real) else real
        with open(dest, "wb") as f:
            content = await file.read()
            f.write(content)
        return {"status": "ok", "path": dest, "size": len(content)}
    except Exception as e:
        return {"error": str(e)}


@router.get("/download")
async def download_file(path: str):
    try:
        real = _safe_path(path)
        return FileResponse(real, filename=os.path.basename(real))
    except Exception as e:
        return {"error": str(e)}


class MkdirRequest(BaseModel):
    path: str

@router.post("/mkdir")
async def make_dir(req: MkdirRequest):
    try:
        real = _safe_path(req.path)
        os.makedirs(real, exist_ok=True)
        return {"status": "ok"}
    except Exception as e:
        return {"error": str(e)}


class RenameRequest(BaseModel):
    old_path: str
    new_name: str

@router.post("/rename")
async def rename_item(req: RenameRequest):
    try:
        old = _safe_path(req.old_path)
        new = os.path.join(os.path.dirname(old), req.new_name)
        os.rename(old, new)
        return {"status": "ok"}
    except Exception as e:
        return {"error": str(e)}


@router.delete("/delete")
async def delete_item(path: str):
    try:
        real = _safe_path(path)
        if os.path.isdir(real):
            shutil.rmtree(real)
        else:
            os.remove(real)
        return {"status": "ok"}
    except Exception as e:
        return {"error": str(e)}
