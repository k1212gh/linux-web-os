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

# Same-origin by default. Extra origins via CORS_ALLOW_ORIGINS (comma-separated).
_default_origins = [
    "http://localhost:8000", "http://127.0.0.1:8000",
    "http://localhost:5173", "http://127.0.0.1:5173",
]
_extra = [o.strip() for o in os.environ.get("CORS_ALLOW_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}


app.include_router(terminal.router,  prefix="/ws",     tags=["terminal"])
app.include_router(system.router,    prefix="/api/system",  tags=["system"])
app.include_router(chat.router,      prefix="/api",    tags=["chat"])
app.include_router(config.router,    prefix="/api",    tags=["config"])
app.include_router(services.router,  prefix="/api/services", tags=["services"])

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
