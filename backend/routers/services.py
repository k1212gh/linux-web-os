"""
Service discovery — returns URLs for embedded iframes.
Also does a live health check when possible.
"""
import os
import asyncio

import httpx
from fastapi import APIRouter

router = APIRouter()


async def _is_reachable(url: str) -> bool:
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            resp = await client.get(url)
            return resp.status_code < 500
    except Exception:
        return False


@router.get("/vscode")
async def vscode_service():
    url = os.environ.get("VSCODE_TUNNEL_URL", "")
    if not url:
        return {"url": "", "status": "not_configured"}
    ok = await _is_reachable(url)
    return {"url": url if ok else "", "status": "ok" if ok else "unreachable"}


@router.get("/kasm")
async def kasm_service():
    url = os.environ.get("KASM_URL", "http://localhost:6901")
    ok = await _is_reachable(url)
    return {"url": url if ok else "", "status": "ok" if ok else "unreachable"}


@router.get("/filebrowser")
async def filebrowser_service():
    url = os.environ.get("FILEBROWSER_URL", "http://localhost:8081")
    ok = await _is_reachable(url)
    return {"url": url if ok else "", "status": "ok" if ok else "unreachable"}
