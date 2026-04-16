"""Blog posts REST API — file-based storage."""
import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
DATA_FILE = Path(__file__).parent.parent / "data" / "blog_posts.json"


def _load():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return []


def _save(posts):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")


class PostCreate(BaseModel):
    title: str
    category: str = "TIL"
    tags: list[str] = []
    content: str = ""
    source: str = "manual"


@router.get("/posts")
async def list_posts():
    return _load()


@router.post("/posts")
async def create_post(post: PostCreate):
    posts = _load()
    date = datetime.now().strftime("%Y-%m-%d")
    slug = post.title.lower().replace(" ", "-")[:30]
    new_post = {
        "id": f"{post.category.lower().replace(' ', '-')}-{date}-{slug}",
        "title": post.title,
        "date": date,
        "category": post.category,
        "tags": post.tags,
        "summary": post.content[:100].replace("<", "").replace(">", ""),
        "content": post.content,
        "source": post.source,
    }
    posts.insert(0, new_post)
    _save(posts)
    return new_post


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    posts = _load()
    posts = [p for p in posts if p["id"] != post_id]
    _save(posts)
    return {"status": "ok"}
