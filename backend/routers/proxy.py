"""
Generic HTTP proxy — strips X-Frame-Options so services can be iframed.
Useful for Jenkins, Grafana, Portainer that refuse framing by default.
"""
import os
import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse

router = APIRouter()

# Service registry: alias → base URL
SERVICES = {
    "jenkins": lambda: os.environ.get("JENKINS_URL", "http://localhost:8080"),
    "grafana": lambda: os.environ.get("GRAFANA_URL", "http://localhost:3001"),
    "portainer": lambda: os.environ.get("PORTAINER_URL", "http://localhost:9000"),
    "prometheus": lambda: os.environ.get("PROMETHEUS_URL", "http://localhost:9090"),
}

# Headers to strip from upstream response (prevents iframe blocking)
STRIP_HEADERS = {
    "x-frame-options",
    "content-security-policy",
    "content-length",
    "transfer-encoding",
    "content-encoding",
}


@router.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"])
async def proxy(service: str, path: str, request: Request):
    """Proxy any request to a configured upstream service."""
    if service not in SERVICES:
        return Response(content=f"Unknown service: {service}", status_code=404)

    base = SERVICES[service]().rstrip("/")
    upstream_url = f"{base}/{path}"
    if request.url.query:
        upstream_url += f"?{request.url.query}"

    # Forward headers (minus hop-by-hop)
    headers = dict(request.headers)
    headers.pop("host", None)

    body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=False) as client:
            resp = await client.request(
                method=request.method,
                url=upstream_url,
                headers=headers,
                content=body,
            )

        # Filter response headers
        out_headers = {
            k: v for k, v in resp.headers.items()
            if k.lower() not in STRIP_HEADERS
        }

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=out_headers,
            media_type=resp.headers.get("content-type"),
        )
    except httpx.ConnectError:
        return Response(content=f"Service {service} unreachable at {base}", status_code=503)
    except Exception as e:
        return Response(content=f"Proxy error: {e}", status_code=500)
