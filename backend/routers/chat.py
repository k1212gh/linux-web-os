"""
Claude API proxy — keeps the API key server-side.
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
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY not configured. Go to Settings app to add it."
        )

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
            }
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
