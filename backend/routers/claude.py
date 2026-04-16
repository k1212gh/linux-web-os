"""
Claude Code WebSocket + REST router.
Manages Claude Code sessions and relays messages.
"""
import os
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

router = APIRouter()

# Lazy import to avoid issues on Windows (pty is Linux-only)
session_manager = None


def get_manager():
    global session_manager
    if session_manager is None:
        from services.claude_session import session_manager as sm
        session_manager = sm
    return session_manager


class CreateSessionRequest(BaseModel):
    project_dir: str


@router.get("/sessions")
async def list_sessions():
    return get_manager().list_all()


@router.post("/sessions")
async def create_session(req: CreateSessionRequest):
    if not os.path.isdir(req.project_dir):
        return {"error": f"Directory not found: {req.project_dir}"}
    session = await get_manager().create(req.project_dir)
    return session.to_dict()


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    await get_manager().remove(session_id)
    return {"status": "ok"}


@router.get("/projects")
async def list_projects():
    """List available project directories."""
    base = os.environ.get("PROJECTS_BASE", os.path.expanduser("~"))
    try:
        dirs = []
        for name in sorted(os.listdir(base)):
            path = os.path.join(base, name)
            if os.path.isdir(path) and not name.startswith("."):
                dirs.append({"name": name, "path": path})
        return dirs
    except Exception as e:
        return {"error": str(e)}


@router.websocket("/ws/{session_id}")
async def claude_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()

    session = get_manager().get(session_id)
    if not session:
        await websocket.send_json({"type": "error", "message": "Session not found"})
        await websocket.close()
        return

    # Read output from claude process and send to client
    async def read_loop():
        while session.is_running:
            output = await session.read_output()
            if output:
                await websocket.send_json({
                    "type": "output",
                    "content": output,
                })
            await asyncio.sleep(0.05)

    read_task = asyncio.create_task(read_loop())

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")

            if msg_type == "message":
                content = data.get("content", "")
                session.messages.append({"role": "user", "content": content})
                await session.send_input(content)

            elif msg_type == "approve":
                await session.send_input("y")

            elif msg_type == "deny":
                await session.send_input("n")

    except WebSocketDisconnect:
        pass
    finally:
        read_task.cancel()


# --- Fallback chat endpoint (works without claude CLI) ---

@router.post("/chat")
async def claude_chat_fallback(request: dict):
    """
    Simple Anthropic API proxy fallback.
    Used when claude CLI is not available.
    """
    import httpx

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY not configured", "status": 503}

    messages = request.get("messages", [])
    model = request.get("model", "claude-sonnet-4-20250514")
    max_tokens = request.get("max_tokens", 2048)

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": max_tokens,
                "messages": messages,
            },
        )
        result = resp.json()
        content = ""
        if "content" in result and result["content"]:
            content = result["content"][0].get("text", "")
        return {"content": content, "model": model}
