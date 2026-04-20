"""Harness Manager API — reads .claude/ config and logs."""
import os
import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter()

PROJECT_ROOT = Path(__file__).parent.parent.parent
CLAUDE_DIR = PROJECT_ROOT / ".claude"


@router.get("/rules")
async def list_rules():
    """List active rules from .claude/rules/"""
    rules_dir = CLAUDE_DIR / "rules"
    rules = []
    if rules_dir.exists():
        for f in sorted(rules_dir.glob("*.md")):
            content = f.read_text(encoding="utf-8")
            # Extract paths from frontmatter
            paths = []
            if content.startswith("---"):
                fm_end = content.index("---", 3)
                fm = content[3:fm_end]
                for line in fm.splitlines():
                    line = line.strip().lstrip("- ").strip('"').strip("'")
                    if line and not line.startswith("paths"):
                        paths.append(line)
            rules.append({
                "name": f.stem,
                "file": str(f.relative_to(PROJECT_ROOT)),
                "paths": paths,
                "lines": len(content.splitlines()),
            })
    return rules


@router.get("/hooks")
async def list_hooks():
    """List active hooks from .claude/settings.json"""
    settings_file = CLAUDE_DIR / "settings.json"
    if not settings_file.exists():
        return {"hooks": {}}
    settings = json.loads(settings_file.read_text(encoding="utf-8"))
    return {"hooks": settings.get("hooks", {})}


@router.get("/permissions")
async def list_permissions():
    """List permission rules from .claude/settings.json"""
    settings_file = CLAUDE_DIR / "settings.json"
    if not settings_file.exists():
        return {"permissions": {}}
    settings = json.loads(settings_file.read_text(encoding="utf-8"))
    return {"permissions": settings.get("permissions", {})}


@router.get("/skills")
async def list_skills():
    """List available skills from .claude/commands/"""
    commands_dir = CLAUDE_DIR / "commands"
    skills = []
    if commands_dir.exists():
        for f in sorted(commands_dir.glob("*.md")):
            content = f.read_text(encoding="utf-8")
            first_line = content.strip().splitlines()[0] if content.strip() else ""
            title = first_line.lstrip("# ").strip()
            skills.append({
                "name": f.stem,
                "title": title,
                "file": str(f.relative_to(PROJECT_ROOT)),
                "invoke": f"/{f.stem}",
            })
    return skills


@router.get("/status")
async def harness_status():
    """Overall harness status."""
    return {
        "claude_md": (PROJECT_ROOT / "CLAUDE.md").exists(),
        "settings_json": (CLAUDE_DIR / "settings.json").exists(),
        "rules_count": len(list((CLAUDE_DIR / "rules").glob("*.md"))) if (CLAUDE_DIR / "rules").exists() else 0,
        "hooks_count": len(list((CLAUDE_DIR / "hooks").glob("*.sh"))) if (CLAUDE_DIR / "hooks").exists() else 0,
        "skills_count": len(list((CLAUDE_DIR / "commands").glob("*.md"))) if (CLAUDE_DIR / "commands").exists() else 0,
    }
