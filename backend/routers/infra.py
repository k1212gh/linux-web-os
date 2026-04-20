"""
Infrastructure management — Jenkins, Docker, Grafana, Portainer.
Hybrid approach: direct API for status/actions + iframe URLs for UIs.
"""
import os
import subprocess
import json
import httpx
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


def _run(cmd: list[str], timeout: int = 5) -> tuple[int, str, str]:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.returncode, r.stdout.strip(), r.stderr.strip()
    except Exception as e:
        return -1, "", str(e)


# ─── Overview (all services) ───
@router.get("/overview")
async def overview():
    """Return status of all infrastructure services."""
    services = []

    # Docker
    code, out, _ = _run(["docker", "ps", "--format", "{{.Names}}"])
    services.append({
        "name": "Docker",
        "icon": "🐳",
        "url": None,
        "status": "running" if code == 0 else "not_installed",
        "count": len(out.splitlines()) if code == 0 else 0,
        "hint": "컨테이너" if code == 0 else "docker 설치 필요",
    })

    # Jenkins
    jenkins_url = os.environ.get("JENKINS_URL", "http://localhost:8080")
    j_status = await _check_http(jenkins_url)
    services.append({
        "name": "Jenkins",
        "icon": "⚙",
        "url": jenkins_url if j_status == "ok" else None,
        "status": j_status,
        "hint": "CI/CD 서버",
    })

    # Grafana
    grafana_url = os.environ.get("GRAFANA_URL", "http://localhost:3001")
    g_status = await _check_http(grafana_url)
    services.append({
        "name": "Grafana",
        "icon": "📊",
        "url": grafana_url if g_status == "ok" else None,
        "status": g_status,
        "hint": "대시보드/모니터링",
    })

    # Portainer
    portainer_url = os.environ.get("PORTAINER_URL", "http://localhost:9000")
    p_status = await _check_http(portainer_url)
    services.append({
        "name": "Portainer",
        "icon": "🐋",
        "url": portainer_url if p_status == "ok" else None,
        "status": p_status,
        "hint": "Docker GUI",
    })

    # Prometheus
    prom_url = os.environ.get("PROMETHEUS_URL", "http://localhost:9090")
    pr_status = await _check_http(prom_url)
    services.append({
        "name": "Prometheus",
        "icon": "🔥",
        "url": prom_url if pr_status == "ok" else None,
        "status": pr_status,
        "hint": "메트릭 수집",
    })

    # Ollama
    ollama_url = "http://localhost:11434"
    o_status = await _check_http(ollama_url + "/api/tags")
    services.append({
        "name": "Ollama",
        "icon": "🦙",
        "url": None,  # No UI
        "status": o_status,
        "hint": "로컬 LLM 서버",
    })

    return {"services": services}


async def _check_http(url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            r = await client.get(url)
            return "ok" if r.status_code < 500 else "error"
    except Exception:
        return "unreachable"


# ─── Docker ───
@router.get("/docker/containers")
async def docker_containers():
    """List all containers (running and stopped)."""
    code, out, err = _run(["docker", "ps", "-a", "--format",
                           "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}"])
    if code != 0:
        return {"error": err or "docker not available", "containers": []}
    containers = []
    for line in out.splitlines():
        parts = line.split("|")
        if len(parts) >= 4:
            containers.append({
                "id": parts[0][:12],
                "name": parts[1],
                "image": parts[2],
                "status": parts[3],
                "ports": parts[4] if len(parts) > 4 else "",
                "running": parts[3].lower().startswith("up"),
            })
    return {"containers": containers}


@router.get("/docker/images")
async def docker_images():
    code, out, err = _run(["docker", "images", "--format",
                           "{{.Repository}}|{{.Tag}}|{{.Size}}|{{.CreatedSince}}"])
    if code != 0:
        return {"error": err, "images": []}
    images = []
    for line in out.splitlines():
        parts = line.split("|")
        if len(parts) >= 4:
            images.append({
                "repo": parts[0], "tag": parts[1],
                "size": parts[2], "created": parts[3],
            })
    return {"images": images}


class ContainerAction(BaseModel):
    container_id: str


@router.post("/docker/start")
async def docker_start(req: ContainerAction):
    code, _, err = _run(["docker", "start", req.container_id])
    return {"ok": code == 0, "error": err if code != 0 else None}


@router.post("/docker/stop")
async def docker_stop(req: ContainerAction):
    code, _, err = _run(["docker", "stop", req.container_id])
    return {"ok": code == 0, "error": err if code != 0 else None}


@router.post("/docker/restart")
async def docker_restart(req: ContainerAction):
    code, _, err = _run(["docker", "restart", req.container_id])
    return {"ok": code == 0, "error": err if code != 0 else None}


@router.get("/docker/logs/{container_id}")
async def docker_logs(container_id: str, tail: int = 100):
    code, out, err = _run(["docker", "logs", "--tail", str(tail), container_id], timeout=10)
    return {"logs": out if code == 0 else err}


# ─── Jenkins ───
@router.get("/jenkins/jobs")
async def jenkins_jobs():
    """List Jenkins jobs via REST API."""
    url = os.environ.get("JENKINS_URL", "http://localhost:8080")
    user = os.environ.get("JENKINS_USER", "")
    token = os.environ.get("JENKINS_TOKEN", "")

    auth = (user, token) if user and token else None

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{url}/api/json?tree=jobs[name,color,url,lastBuild[number,timestamp,result]]", auth=auth)
            r.raise_for_status()
            data = r.json()
            jobs = []
            for j in data.get("jobs", []):
                color = j.get("color", "")
                status = "success" if "blue" in color else "failed" if "red" in color else "running" if "anime" in color else "unknown"
                last = j.get("lastBuild") or {}
                jobs.append({
                    "name": j.get("name"),
                    "status": status,
                    "url": j.get("url"),
                    "last_build": last.get("number"),
                    "last_result": last.get("result"),
                })
            return {"jobs": jobs}
    except Exception as e:
        return {"error": str(e), "jobs": []}


class BuildRequest(BaseModel):
    job_name: str


@router.post("/jenkins/build")
async def jenkins_build(req: BuildRequest):
    """Trigger a Jenkins build."""
    url = os.environ.get("JENKINS_URL", "http://localhost:8080")
    user = os.environ.get("JENKINS_USER", "")
    token = os.environ.get("JENKINS_TOKEN", "")

    if not (user and token):
        return {"ok": False, "error": "JENKINS_USER and JENKINS_TOKEN not configured"}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(f"{url}/job/{req.job_name}/build", auth=(user, token))
            return {"ok": r.status_code in (200, 201), "status_code": r.status_code}
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ─── GitHub Actions ───
@router.get("/github-actions/runs")
async def github_runs(owner: str = "", repo: str = ""):
    """List recent GitHub Actions runs."""
    owner = owner or os.environ.get("GITHUB_OWNER", "")
    repo = repo or os.environ.get("GITHUB_REPO", "")
    token = os.environ.get("GITHUB_TOKEN", "")

    if not (owner and repo):
        return {"error": "GITHUB_OWNER and GITHUB_REPO required", "runs": []}

    headers = {"Authorization": f"Bearer {token}"} if token else {}
    headers["Accept"] = "application/vnd.github+json"

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page=10",
                headers=headers,
            )
            r.raise_for_status()
            data = r.json()
            runs = []
            for run in data.get("workflow_runs", []):
                runs.append({
                    "id": run["id"],
                    "name": run.get("name"),
                    "status": run.get("status"),
                    "conclusion": run.get("conclusion"),
                    "branch": run.get("head_branch"),
                    "created": run.get("created_at"),
                    "url": run.get("html_url"),
                })
            return {"runs": runs}
    except Exception as e:
        return {"error": str(e), "runs": []}
