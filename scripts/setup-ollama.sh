#!/bin/bash
# ─── AgentOS — Ollama 설치 및 설정 (RX 6800 XT / ROCm) ───

set -e

echo "🤖 Ollama 설치 시작..."

# 1. Ollama 설치
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "✅ Ollama 설치 완료"
else
    echo "✅ Ollama 이미 설치됨: $(ollama --version)"
fi

# 2. ROCm 환경 변수 (RX 6800 XT = gfx1030)
echo 'export HSA_OVERRIDE_GFX_VERSION=10.3.0' >> ~/.bashrc
export HSA_OVERRIDE_GFX_VERSION=10.3.0
echo "✅ ROCm 환경 변수 설정 (HSA_OVERRIDE_GFX_VERSION=10.3.0)"

# 3. Ollama 서비스 시작
sudo systemctl enable ollama 2>/dev/null || true
sudo systemctl start ollama 2>/dev/null || ollama serve &
sleep 2
echo "✅ Ollama 서비스 시작됨"

# 4. 추천 모델 다운로드 (16GB VRAM 기준)
echo ""
echo "📦 추천 모델 다운로드..."
echo "  선택하세요 (Ctrl+C로 건너뛰기 가능):"
echo ""

# 빠른 일반 대화 (3B, ~6GB VRAM)
echo "1/4: llama3.2 (3B, 빠른 대화용)..."
ollama pull llama3.2:latest || echo "⚠️ 다운로드 실패 — 나중에 수동으로 설치하세요"

# 코딩용 (7B, ~8GB VRAM)
echo "2/4: qwen2.5-coder:7b (코딩용)..."
ollama pull qwen2.5-coder:7b || echo "⚠️ 다운로드 실패"

# 한국어 + 범용 (14B Q4, ~9GB VRAM)
echo "3/4: qwen2.5:14b (한국어 + 범용)..."
ollama pull qwen2.5:14b || echo "⚠️ 다운로드 실패"

# 고급 코딩 (16B Q4, ~10GB VRAM)
echo "4/4: deepseek-coder-v2:16b (고급 코딩)..."
ollama pull deepseek-coder-v2:16b-lite-instruct-q4_0 || echo "⚠️ 다운로드 실패"

echo ""
echo "✅ Ollama 설정 완료!"
echo ""
echo "📋 설치된 모델:"
ollama list
echo ""
echo "🔗 AgentOS 연동:"
echo "   Ollama API: http://localhost:11434"
echo "   설정 → PROJECTS_BASE, HSA_OVERRIDE_GFX_VERSION 확인"
echo ""
echo "💡 추가 모델 설치: ollama pull <model-name>"
echo "💡 모델 실행: ollama run <model-name>"
