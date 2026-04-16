"""Git dashboard REST API — wraps git CLI."""
import os
import json
import subprocess
from fastapi import APIRouter

router = APIRouter()


def _run(cmd, cwd):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=10)
        return r.stdout.strip()
    except Exception as e:
        return str(e)


def _get_repos():
    base = os.environ.get("PROJECTS_BASE", os.path.expanduser("~"))
    repos = []
    try:
        for name in sorted(os.listdir(base)):
            path = os.path.join(base, name)
            if os.path.isdir(os.path.join(path, ".git")):
                repos.append({"name": name, "path": path})
    except Exception:
        pass
    return repos


@router.get("/repos")
async def list_repos():
    return _get_repos()


@router.get("/branches")
async def list_branches(repo: str):
    out = _run(["git", "branch", "-a", "--no-color"], repo)
    branches = []
    for line in out.splitlines():
        name = line.strip().lstrip("* ").strip()
        if name and "HEAD" not in name:
            branches.append({
                "name": name,
                "current": line.strip().startswith("*"),
            })
    return branches


@router.get("/log")
async def git_log(repo: str, limit: int = 20):
    fmt = '{"hash":"%h","message":"%s","author":"%an","date":"%cr"}'
    out = _run(["git", "log", f"--max-count={limit}", f"--format={fmt}"], repo)
    commits = []
    for line in out.splitlines():
        try:
            commits.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return commits


@router.get("/status")
async def git_status(repo: str):
    out = _run(["git", "status", "--porcelain"], repo)
    files = []
    for line in out.splitlines():
        if line.strip():
            status = line[:2].strip()
            path = line[3:]
            files.append({"status": status, "path": path})
    return {"files": files, "clean": len(files) == 0}
