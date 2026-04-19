# 환경 점검 (/env-check)

새 기기에서 처음 세팅할 때 필요한 것들을 점검합니다.

## 점검 항목

순서대로 확인하고 결과를 보고하세요:

1. **필수 도구**
   - `node --version` (필요: 18+)
   - `npm --version` (필요: 8+)
   - `python3 --version` (필요: 3.10+)
   - `pip3 --version`
   - `git --version`

2. **선택 도구**
   - `claude --version` (Claude Code CLI)
   - `docker --version` (Docker)
   - `ollama --version` (Ollama — 로컬 LLM)
   - `tailscale --version` (Tailscale — 원격 접속)

3. **GPU**
   - `nvidia-smi` (NVIDIA GPU)
   - `rocm-smi` (AMD GPU)
   - 둘 다 없으면 "CPU only"

4. **네트워크**
   - `curl -s https://api.anthropic.com/ -o /dev/null -w "%{http_code}"` (Anthropic API 접근 가능?)

5. **프로젝트 파일**
   - `backend/.env.json` 존재?
   - `frontend/node_modules/` 존재?
   - `backend/.venv/` 존재?

6. **출력 형식**
   ```
   ═══ AgentOS Environment Check ═══

   ✅ node v20.x
   ✅ npm v10.x
   ✅ python3 v3.12
   ✅ git v2.x
   ⚠️ claude — 미설치 (npm i -g @anthropic-ai/claude-code)
   ✅ docker v27.x
   ❌ ollama — 미설치 (./scripts/setup-ollama.sh)
   ✅ tailscale v1.x

   GPU: NVIDIA RTX 4070 (8GB VRAM)

   프로젝트:
   ⚠️ .env.json — 없음 (cp .env.json.example .env.json)
   ❌ node_modules — 없음 (cd frontend && npm install)
   ❌ .venv — 없음 (cd backend && python3 -m venv .venv)

   ── 필요한 명령 ──
   cd frontend && npm install
   cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
   cp backend/.env.json.example backend/.env.json
   ```
