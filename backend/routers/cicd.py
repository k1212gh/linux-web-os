"""CI/CD runner — execute build/test pipelines with WebSocket log streaming."""
import os
import json
import asyncio
import subprocess
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
DATA_FILE = Path(__file__).parent.parent / "data" / "pipelines.json"
_runs = {}  # run_id -> {"status", "logs"}


def _load_pipelines():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    return []


def _save_pipelines(pipelines):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(pipelines, ensure_ascii=False, indent=2), encoding="utf-8")


@router.get("/pipelines")
async def list_pipelines():
    return _load_pipelines()


@router.post("/pipelines")
async def save_pipeline(pipeline: dict):
    pipelines = _load_pipelines()
    # Update or append
    existing = next((i for i, p in enumerate(pipelines) if p.get("id") == pipeline.get("id")), None)
    if existing is not None:
        pipelines[existing] = pipeline
    else:
        pipeline.setdefault("id", f"pipe-{len(pipelines)+1}")
        pipelines.append(pipeline)
    _save_pipelines(pipelines)
    return pipeline


@router.post("/run/{pipeline_id}")
async def run_pipeline(pipeline_id: str):
    """Start a pipeline run (non-blocking). Connect via WS to stream logs."""
    pipelines = _load_pipelines()
    pipeline = next((p for p in pipelines if p["id"] == pipeline_id), None)
    if not pipeline:
        return {"error": "Pipeline not found"}

    run_id = f"{pipeline_id}-{int(datetime.now().timestamp())}"
    _runs[run_id] = {"status": "running", "logs": [], "pipeline": pipeline}

    # Run in background
    asyncio.create_task(_execute_pipeline(run_id, pipeline))
    return {"run_id": run_id, "status": "started"}


async def _execute_pipeline(run_id, pipeline):
    run = _runs[run_id]
    cwd = pipeline.get("cwd", os.path.expanduser("~"))
    steps = pipeline.get("steps", [])

    for step in steps:
        name = step.get("name", "unnamed")
        command = step.get("command", "echo 'no command'")
        run["logs"].append(f"\n>>> Step: {name}")
        run["logs"].append(f"$ {command}")

        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                cwd=cwd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            async for line in proc.stdout:
                run["logs"].append(line.decode("utf-8", errors="replace").rstrip())
            await proc.wait()

            if proc.returncode != 0:
                run["logs"].append(f"✗ Step '{name}' failed (exit code {proc.returncode})")
                run["status"] = "failed"
                return
            else:
                run["logs"].append(f"✓ Step '{name}' passed")
        except Exception as e:
            run["logs"].append(f"✗ Error: {e}")
            run["status"] = "failed"
            return

    run["status"] = "passed"
    run["logs"].append("\n✅ Pipeline completed successfully")


@router.websocket("/ws/{run_id}")
async def stream_logs(websocket: WebSocket, run_id: str):
    await websocket.accept()
    sent = 0

    try:
        while True:
            run = _runs.get(run_id)
            if not run:
                await websocket.send_json({"type": "error", "message": "Run not found"})
                break

            # Send new log lines
            new_logs = run["logs"][sent:]
            for line in new_logs:
                await websocket.send_json({"type": "log", "line": line})
                sent += 1

            if run["status"] in ("passed", "failed"):
                await websocket.send_json({"type": "done", "status": run["status"]})
                break

            await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        pass
