"""
System monitoring: GPU (ROCm), CPU, RAM, processes.
"""
import subprocess
import json
import os

import psutil
from fastapi import APIRouter

router = APIRouter()


def get_gpu_stats() -> dict:
    """Use rocm-smi JSON output to get GPU stats."""
    try:
        result = subprocess.run(
            ["rocm-smi", "--showuse", "--showmeminfo", "vram", "--showtemp",
             "--showpower", "--json"],
            capture_output=True, text=True, timeout=5
        )
        data = json.loads(result.stdout)
        # rocm-smi JSON key is usually "card0"
        card = next(iter(data.values()), {})

        vram_used = _parse_mb(card.get("VRAM Total Used Memory (B)", "0")) / 1024
        vram_total = _parse_mb(card.get("VRAM Total Memory (B)", str(16 * 1024 ** 3))) / 1024

        return {
            "name": card.get("Card Series", "Radeon RX 6800 XT"),
            "utilization": float(card.get("GPU use (%)", 0)),
            "vram_used_gb": round(vram_used, 2),
            "vram_total_gb": round(vram_total, 2),
            "temperature": float(card.get("Temperature (Sensor junction) (C)", 0)),
            "power_watts": float(card.get("Average Graphics Package Power (W)", 0)),
        }
    except Exception:
        # Fallback: try nvidia-smi for those with NVIDIA
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw",
                 "--format=csv,noheader,nounits"],
                capture_output=True, text=True, timeout=5
            )
            parts = [p.strip() for p in result.stdout.strip().split(",")]
            return {
                "name": parts[0],
                "utilization": float(parts[1]),
                "vram_used_gb": round(float(parts[2]) / 1024, 2),
                "vram_total_gb": round(float(parts[3]) / 1024, 2),
                "temperature": float(parts[4]),
                "power_watts": float(parts[5]),
            }
        except Exception:
            return {
                "name": "GPU (unavailable)",
                "utilization": 0, "vram_used_gb": 0,
                "vram_total_gb": 16, "temperature": 0, "power_watts": 0,
            }


def _parse_mb(val: str) -> float:
    try:
        return float(str(val).replace(",", "").strip())
    except ValueError:
        return 0.0


def get_inference_stats() -> dict:
    """Check if ollama is running and get inference metrics."""
    try:
        import urllib.request

        # Check running models
        with urllib.request.urlopen("http://localhost:11434/api/ps", timeout=1) as r:
            data = json.loads(r.read())
            models = data.get("models", [])
            if models:
                model_info = models[0]
                # Try to get generation stats from latest request
                tps = 0
                ttft_ms = 0
                total_requests = 0

                # Try /api/generate with empty prompt to get stats
                try:
                    with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=1) as r2:
                        tags = json.loads(r2.read())
                        total_requests = len(tags.get("models", []))
                except Exception:
                    pass

                return {
                    "active_model": model_info.get("name", ""),
                    "tokens_per_sec": tps,
                    "ttft_ms": ttft_ms,
                    "total_requests": total_requests,
                    "size_gb": round(model_info.get("size", 0) / (1024**3), 1),
                }
    except Exception:
        pass
    return {"active_model": None, "tokens_per_sec": 0, "ttft_ms": 0, "total_requests": 0}


@router.get("/stats")
async def system_stats():
    cpu_freq = psutil.cpu_freq()
    ram = psutil.virtual_memory()
    processes = sorted(
        [
            {
                "name": p.info["name"],
                "cpu": p.info["cpu_percent"],
                "memory_mb": p.info["memory_info"].rss / (1024 * 1024) if p.info["memory_info"] else 0,
            }
            for p in psutil.process_iter(["name", "cpu_percent", "memory_info"])
            if p.info["cpu_percent"] is not None
        ],
        key=lambda x: x["cpu"],
        reverse=True,
    )[:8]

    return {
        "gpu": get_gpu_stats(),
        "cpu": {
            "model": _get_cpu_model(),
            "percent": psutil.cpu_percent(interval=0.1),
            "cores": psutil.cpu_count(logical=False),
            "threads": psutil.cpu_count(logical=True),
            "freq_mhz": round(cpu_freq.current) if cpu_freq else 0,
        },
        "ram": {
            "total_gb": round(ram.total / 1024 ** 3, 1),
            "used_gb": round(ram.used / 1024 ** 3, 1),
            "percent": ram.percent,
        },
        "inference": get_inference_stats(),
        "processes": processes,
    }


@router.get("/quick")
async def quick_stats():
    """Lightweight endpoint for taskbar tray."""
    gpu = get_gpu_stats()
    return {
        "gpu_util": gpu["utilization"],
        "vram_used": gpu["vram_used_gb"],
        "cpu": psutil.cpu_percent(interval=None),
    }


def _get_cpu_model() -> str:
    try:
        with open("/proc/cpuinfo") as f:
            for line in f:
                if "model name" in line:
                    return line.split(":")[1].strip()
    except Exception:
        pass
    return "CPU"
