"""Obsidian vault integration — read/search/sync notes."""
import os
import re
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


def _vault_path():
    return os.environ.get("OBSIDIAN_VAULT", os.path.expanduser("~/ObsidianVault"))


def _safe_path(rel):
    base = os.path.realpath(_vault_path())
    resolved = os.path.realpath(os.path.join(base, rel))
    if not resolved.startswith(base):
        raise ValueError("Path traversal")
    return resolved


def _parse_frontmatter(content):
    """Extract YAML frontmatter from markdown."""
    if not content.startswith("---"):
        return {}, content
    try:
        end = content.index("---", 3)
        fm_text = content[3:end].strip()
        body = content[end + 3:].strip()
        fm = {}
        for line in fm_text.splitlines():
            if ":" in line:
                key, val = line.split(":", 1)
                fm[key.strip()] = val.strip().strip('"').strip("'")
        return fm, body
    except ValueError:
        return {}, content


@router.get("/notes")
async def list_notes(path: str = "", search: str = ""):
    """List notes in vault directory, optionally filtered by search term."""
    try:
        vault = _vault_path()
        target = _safe_path(path) if path else vault
        if not os.path.isdir(target):
            return {"error": "Not a directory"}

        items = []
        for name in sorted(os.listdir(target)):
            full = os.path.join(target, name)
            rel = os.path.relpath(full, vault)
            if name.startswith("."):
                continue

            is_dir = os.path.isdir(full)
            if search and not is_dir:
                # Search in file content
                try:
                    content = Path(full).read_text(encoding="utf-8", errors="replace")
                    if search.lower() not in content.lower() and search.lower() not in name.lower():
                        continue
                except Exception:
                    continue

            items.append({
                "name": name,
                "path": rel,
                "is_dir": is_dir,
                "is_md": name.endswith(".md"),
                "modified": datetime.fromtimestamp(os.path.getmtime(full)).isoformat() if os.path.isfile(full) else None,
            })
        return {"path": path, "vault": vault, "items": items}
    except Exception as e:
        return {"error": str(e)}


@router.get("/note")
async def read_note(path: str):
    """Read a note with frontmatter parsing."""
    try:
        real = _safe_path(path)
        content = Path(real).read_text(encoding="utf-8", errors="replace")
        fm, body = _parse_frontmatter(content)

        # Extract wiki-links [[link]]
        links = re.findall(r'\[\[([^\]]+)\]\]', content)

        return {
            "path": path,
            "frontmatter": fm,
            "content": body,
            "links": links,
            "raw": content,
        }
    except Exception as e:
        return {"error": str(e)}


class SyncRequest(BaseModel):
    note_path: str


@router.post("/sync-to-blog")
async def sync_to_blog(req: SyncRequest):
    """Convert Obsidian note to blog post format."""
    try:
        real = _safe_path(req.note_path)
        content = Path(real).read_text(encoding="utf-8", errors="replace")
        fm, body = _parse_frontmatter(content)

        # Convert markdown to simple HTML
        html = body
        html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
        html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
        html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
        html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
        html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
        html = re.sub(r'`(.+?)`', r'<code>\1</code>', html)
        # Wrap paragraphs
        paragraphs = html.split('\n\n')
        html = '\n'.join(
            p if p.startswith('<h') or p.startswith('<ul') or p.startswith('<ol')
            else f'<p>{p}</p>'
            for p in paragraphs if p.strip()
        )

        title = fm.get("title", Path(req.note_path).stem)
        tags = [t.strip() for t in fm.get("tags", "").split(",") if t.strip()]
        category = fm.get("category", "TIL")
        date = fm.get("date", datetime.now().strftime("%Y-%m-%d"))

        return {
            "id": f"{category.lower().replace(' ', '-')}-{date}-{Path(req.note_path).stem}",
            "title": title,
            "date": date,
            "category": category,
            "tags": tags,
            "content": html,
            "source": "obsidian",
        }
    except Exception as e:
        return {"error": str(e)}
