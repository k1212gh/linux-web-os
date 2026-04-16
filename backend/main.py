"""
Linux Web OS — FastAPI Backend
"""
import os
import json
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from routers import terminal, system, chat, config, services
from routers import claude as claude_router
from routers import blog as blog_router
from routers import contact as contact_router
from routers import git as git_router
from routers import cicd as cicd_router
from routers import files as files_router
from routers import harness as harness_router
from routers import obsidian as obsidian_router

CONFIG_PATH = Path(__file__).parent / ".env.json"

def load_env_json():
    if CONFIG_PATH.exists():
        data = json.loads(CONFIG_PATH.read_text())
        for k, v in data.items():
            if v:
                os.environ.setdefault(k, v)

load_env_json()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Linux Web OS Backend starting...")
    yield
    print("🛑 Backend shutting down")

app = FastAPI(title="Linux Web OS", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(terminal.router,  prefix="/ws",     tags=["terminal"])
app.include_router(system.router,    prefix="/api/system",  tags=["system"])
app.include_router(chat.router,      prefix="/api",    tags=["chat"])
app.include_router(config.router,    prefix="/api",    tags=["config"])
app.include_router(services.router,  prefix="/api/services", tags=["services"])
app.include_router(claude_router.router, prefix="/api/claude", tags=["claude"])
app.include_router(blog_router.router,  prefix="/api/blog",   tags=["blog"])
app.include_router(contact_router.router, prefix="/api/contact", tags=["contact"])
app.include_router(git_router.router,   prefix="/api/git",     tags=["git"])
app.include_router(cicd_router.router,  prefix="/api/cicd",    tags=["cicd"])
app.include_router(files_router.router, prefix="/api/files",   tags=["files"])
app.include_router(harness_router.router, prefix="/api/harness", tags=["harness"])
app.include_router(obsidian_router.router, prefix="/api/obsidian", tags=["obsidian"])

# Serve built frontend
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        index = STATIC_DIR / "index.html"
        if index.exists():
            return FileResponse(index)
        return {"message": "Frontend not built. Run: cd frontend && npm run build"}
else:
    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "message": "Linux Web OS API running",
            "frontend": "Not built — run: cd frontend && npm install && npm run build",
            "docs": "/docs",
        }
