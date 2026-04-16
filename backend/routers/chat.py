"""
AI Chat API — multi-provider routing.
Supports: Anthropic (Claude), Ollama (local), Gemini, OpenAI/Codex.
"""
import os
import json
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
    system: str = "You are a helpful AI assistant integrated into AgentOS Web OS. You help with coding, system administration, and development tasks. Respond in Korean when the user writes in Korean."


@router.post("/chat")
async def chat(req: ChatRequest):
    model = req.model

    # Route by provider prefix
    if model.startswith("claude"):
        return await _anthropic_chat(req)
    elif model.startswith("gemini"):
        return await _gemini_chat(req)
    elif model.startswith("gpt") or model.startswith("codex") or model.startswith("o"):
        return await _openai_chat(req)
    else:
        # Default: try Ollama (local)
        return await _ollama_chat(req)


@router.get("/models")
async def list_models():
    """List all available models across providers."""
    models = {
        "cloud": [
            {"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "provider": "anthropic", "icon": "✦"},
            {"id": "claude-opus-4-20250514", "name": "Claude Opus 4", "provider": "anthropic", "icon": "✦"},
            {"id": "claude-haiku-4-5-20251001", "name": "Claude Haiku 4.5", "provider": "anthropic", "icon": "✦"},
        ],
        "gemini": [],
        "openai": [],
        "local": [],
    }

    # Check Gemini API key
    if os.environ.get("GEMINI_API_KEY"):
        models["gemini"] = [
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "provider": "gemini", "icon": "◆"},
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "provider": "gemini", "icon": "◆"},
        ]

    # Check OpenAI API key
    if os.environ.get("OPENAI_API_KEY"):
        models["openai"] = [
            {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai", "icon": "●"},
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai", "icon": "●"},
            {"id": "o3-mini", "name": "o3-mini", "provider": "openai", "icon": "●"},
        ]

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
                    "icon": "🖥",
                })
    except Exception:
        pass

    return models


# ─── Anthropic (Claude) ───
async def _anthropic_chat(req: ChatRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            json={
                "model": req.model, "max_tokens": req.max_tokens, "system": req.system,
                "messages": [{"role": m.role, "content": m.content} for m in req.messages],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return {"content": data["content"][0]["text"], "model": data.get("model"), "provider": "anthropic"}


# ─── Google Gemini ───
async def _gemini_chat(req: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured. Add it in Settings.")

    # Convert messages to Gemini format
    contents = []
    for m in req.messages:
        role = "user" if m.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m.content}]})

    # Prepend system as first user message if provided
    if req.system:
        contents.insert(0, {"role": "user", "parts": [{"text": f"[System instruction]: {req.system}"}]})
        contents.insert(1, {"role": "model", "parts": [{"text": "Understood."}]})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{req.model}:generateContent?key={api_key}",
            json={"contents": contents, "generationConfig": {"maxOutputTokens": req.max_tokens}},
        )
        resp.raise_for_status()
        data = resp.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return {"content": text, "model": req.model, "provider": "gemini"}


# ─── OpenAI (GPT / Codex / o-series) ───
async def _openai_chat(req: ChatRequest):
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured. Add it in Settings.")

    messages = [{"role": "system", "content": req.system}] if req.system else []
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": req.model, "messages": messages, "max_tokens": req.max_tokens},
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["choices"][0]["message"]["content"]
        return {"content": text, "model": req.model, "provider": "openai"}


# ─── Ollama (Local LLM) ───
async def _ollama_chat(req: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    if req.system:
        messages.insert(0, {"role": "system", "content": req.system})

    async with httpx.AsyncClient(timeout=120) as client:
        try:
            resp = await client.post(
                "http://localhost:11434/api/chat",
                json={"model": req.model, "messages": messages, "stream": False},
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "content": data.get("message", {}).get("content", ""),
                "model": req.model, "provider": "ollama",
                "eval_count": data.get("eval_count"),
                "total_duration": data.get("total_duration"),
            }
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Ollama not running. Run: ollama serve")
