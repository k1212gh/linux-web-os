"""
Chat API — routes to Anthropic (Claude) or Ollama (local LLM).
"""
import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 2048
    system: str = "You are a helpful AI assistant integrated into a Linux AI Workstation Web OS. You help with coding, system administration, ROCm/GPU configuration, and general development tasks. Respond in Korean when the user writes in Korean."


@router.post("/chat")
async def chat(req: ChatRequest):
    # Route to Ollama if not a Claude model
    if not req.model.startswith("claude"):
        return await _ollama_chat(req)
    return await _anthropic_chat(req)


@router.get("/models")
async def list_models():
    """List available models (Anthropic + Ollama)."""
    models = {
        "cloud": [
            {"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": "anthropic"},
            {"id": "claude-opus-4-20250514", "name": "Claude Opus 4", "provider": "anthropic"},
            {"id": "claude-haiku-4-5-20251001", "name": "Claude Haiku 4.5", "provider": "anthropic"},
        ],
        "local": [],
    }

    # Fetch Ollama models
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            data = resp.json()
            for m in data.get("models", []):
                models["local"].append({
                    "id": m["name"],
                    "name": m["name"],
                    "size": m.get("size", 0),
                    "provider": "ollama",
                })
    except Exception:
        pass

    return models


async def _anthropic_chat(req: ChatRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured. Go to Settings.")

    payload = {
        "model": req.model,
        "max_tokens": req.max_tokens,
        "system": req.system,
        "messages": [{"role": m.role, "content": m.content} for m in req.messages],
    }

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "content": data["content"][0]["text"],
                "model": data.get("model"),
                "usage": data.get("usage"),
                "provider": "anthropic",
            }
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


async def _ollama_chat(req: ChatRequest):
    """Forward chat to local Ollama instance."""
    payload = {
        "model": req.model,
        "messages": [{"role": m.role, "content": m.content} for m in req.messages],
        "stream": False,
    }

    if req.system:
        payload["messages"].insert(0, {"role": "system", "content": req.system})

    async with httpx.AsyncClient(timeout=120) as client:
        try:
            resp = await client.post("http://localhost:11434/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return {
                "content": data.get("message", {}).get("content", ""),
                "model": req.model,
                "provider": "ollama",
                "eval_count": data.get("eval_count"),
                "eval_duration": data.get("eval_duration"),
                "total_duration": data.get("total_duration"),
            }
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Ollama not running. Run: ollama serve")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
