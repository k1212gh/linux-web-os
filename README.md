# 🖥 Linux Web OS

> AMD Radeon RX 6800 XT + ROCm AI 워크스테이션을 위한 브라우저 기반 Web OS

브라우저 탭 하나로 리눅스 워크스테이션 전체를 제어하는 웹 운영체제입니다.  
태블릿이나 원격 노트북에서 접속하면 즉시 AI 개발 환경으로 사용할 수 있습니다.

---

## 스크린샷

```
┌─────────────────────────────────────────────────────────────────┐
│  ⊞  ◈ VS Code  ✦ Claude  ⌨ Terminal                  GPU 34%  │ ← Taskbar
├─────────────────────────────────────────────────────────────────┤
│ ⌨  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│ ◈  │ Terminal — bash      │  │ Claude                       │  │
│ ✦  │ $ claude --chat      │  │ ✦                            │  │
│ 📊 │ > ROCm 설정 도와줘  │  │ 네, ROCm 6.1을 기준으로...   │  │
│ 🖥  └─────────────────────┘  └──────────────────────────────┘  │
│ ⚙  ┌──────────────────────────────────────────────────────┐    │
│    │ 시스템 모니터                                        │    │
│    │ GPU 34% ████░░░░   VRAM 6.2/16GB ████░░░            │    │
│    └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 핵심 기능

| 앱 | 설명 | 구현 방식 |
|---|---|---|
| **⌨ Terminal** | 실제 bash 세션 (PTY) | xterm.js + WebSocket + pty |
| **◈ VS Code** | Claude Code, Roo Code 포함 | VS Code Tunnel iframe |
| **✦ Claude** | Claude API 직접 대화 | Anthropic API 프록시 |
| **📊 Monitor** | GPU/VRAM/CPU 실시간 그래프 | rocm-smi + psutil polling |
| **🖥 Desktop** | Antigravity / GUI 앱 스트리밍 | KasmVNC iframe |
| **⚙ Settings** | API 키, 서비스 URL 관리 | .env.json 영구 저장 |

---

## 빠른 시작

### 필요 조건
- Ubuntu 22.04 / 24.04
- Python 3.10+
- Node.js 18+
- (GPU 기능) ROCm 6.1+ 설치됨

### 1분 설치

```bash
git clone https://github.com/YOUR_USERNAME/linux-web-os.git
cd linux-web-os
chmod +x install.sh
./install.sh
```

### 시작

```bash
# 서비스로 실행 (재부팅 후 자동 시작)
sudo systemctl start linux-web-os

# 개발 모드
./dev.sh
```

### 접속
- **로컬**: http://localhost:8000
- **태블릿** (Tailscale): https://workstation.tail-xxxxx.ts.net

---

## 상세 설치 가이드

### Step 1 — ROCm 설치 (AMD GPU 필수)

```bash
# amdgpu 드라이버 + ROCm 스택
wget https://repo.radeon.com/amdgpu-install/6.1.3/ubuntu/jammy/amdgpu-install_6.1.60103-1_all.deb
sudo dpkg -i amdgpu-install_6.1.60103-1_all.deb
sudo amdgpu-install --usecase=graphics,rocm -y

# 사용자 권한 추가
sudo usermod -aG render,video $USER

# RDNA2 (RX 6800 XT) 오버라이드 — 필수!
echo 'export HSA_OVERRIDE_GFX_VERSION=10.3.0' >> ~/.bashrc
source ~/.bashrc

# 검증
rocminfo | grep gfx   # gfx1030 출력되어야 함
```

### Step 2 — VS Code Tunnel 설정 (Claude Code용)

```bash
# VS Code 설치
sudo snap install code --classic

# 터널 시작 (처음 한 번 GitHub 인증 필요)
code tunnel --accept-server-license-terms

# 출력된 URL을 Settings 앱의 "VS Code Tunnel URL"에 입력
# 예: https://vscode.dev/tunnel/my-workstation
```

터널 URL을 등록하면 태블릿에서 **Claude Code**, **Roo Code** 등 모든 확장 프로그램이 완전히 동작합니다.

### Step 3 — KasmVNC (GUI 스트리밍, Antigravity용)

```bash
# Docker 설치
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# KasmVNC 실행
docker run -d \
  --name kasmvnc \
  --restart unless-stopped \
  -p 6901:6901 \
  -e VNC_PW=yourpassword \
  -v /home/$USER:/home/kasm-user \
  lscr.io/linuxserver/webtop:ubuntu-kde

# 컨테이너 안에서 Antigravity 설치 후
# Settings 앱에서 KASM_URL: http://localhost:6901 입력
```

### Step 4 — Tailscale (태블릿 원격 접속)

```bash
# 설치
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Web OS를 Tailnet 내부에만 HTTPS로 노출 (가장 안전)
tailscale serve https:443 / http://localhost:8000

# 이제 태블릿에서: https://workstation.tail-xxxxx.ts.net
```

---

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    태블릿 / 원격 브라우저                    │
│                  https://workstation.ts.net                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ Tailscale WireGuard (암호화)
┌──────────────────────────▼──────────────────────────────────┐
│                   Linux 워크스테이션                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              FastAPI (port 8000)                    │   │
│  │                                                     │   │
│  │  /          → React SPA (Web OS UI)                 │   │
│  │  /ws/terminal → WebSocket PTY (bash)                │   │
│  │  /api/chat    → Anthropic API 프록시                │   │
│  │  /api/system  → rocm-smi + psutil                   │   │
│  │  /api/config  → .env.json 읽기/쓰기                 │   │
│  │  /api/services → 서비스 상태 확인                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ code tunnel  │  │  KasmVNC     │  │  ollama      │     │
│  │ :8080        │  │  :6901       │  │  :11434      │     │
│  │ (VS Code)    │  │ (GUI 스트림) │  │ (로컬 LLM)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AMD Radeon RX 6800 XT — ROCm 6.1 — 16GB VRAM       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 환경 설정

Settings 앱 또는 `backend/.env.json` 직접 편집:

```json
{
  "ANTHROPIC_API_KEY": "sk-ant-...",
  "VSCODE_TUNNEL_URL": "https://vscode.dev/tunnel/my-workstation",
  "KASM_URL": "http://localhost:6901",
  "FILEBROWSER_URL": "http://localhost:8081",
  "HSA_OVERRIDE_GFX_VERSION": "10.3.0"
}
```

> ⚠️ `.env.json`은 `.gitignore`에 포함되어 있어 Git에 올라가지 않습니다.

---

## 보안

| 계층 | 기술 | 효과 |
|---|---|---|
| 네트워크 | Tailscale (WireGuard) | 외부 포트 비노출, E2E 암호화 |
| 전송 | Tailscale Serve HTTPS | 자동 TLS 인증서 |
| 인증 | GitHub OAuth (Tailscale) | 본인 기기만 접속 |
| API 키 | 서버 사이드 보관 | 브라우저에 API 키 노출 없음 |

---

## ollama 로컬 LLM 연동 (선택)

```bash
# 설치
curl -fsSL https://ollama.com/install.sh | sh

# Llama 3 8B 다운로드 (RX 6800 XT — 16GB VRAM에서 완주 가능)
HSA_OVERRIDE_GFX_VERSION=10.3.0 ollama pull llama3.1:8b

# 실행 확인
ollama list
```

Terminal 앱에서 `ollama run llama3.1:8b` 명령으로 즉시 사용 가능합니다.

---

## 개발 가이드

```
linux-web-os/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Desktop.jsx      # 앱 레지스트리, 아이콘 배치
│   │   │   ├── Window.jsx       # react-rnd 드래그/리사이즈 창
│   │   │   ├── Taskbar.jsx      # 하단 작업 표시줄
│   │   │   ├── AppIcon.jsx      # 더블클릭 아이콘
│   │   │   └── apps/
│   │   │       ├── Terminal.jsx  # xterm.js PTY 터미널
│   │   │       ├── VSCode.jsx    # VS Code Tunnel iframe
│   │   │       ├── Claude.jsx    # Claude API 채팅
│   │   │       ├── SystemMonitor.jsx  # GPU/CPU 실시간 그래프
│   │   │       ├── Kasm.jsx      # KasmVNC iframe
│   │   │       └── Settings.jsx  # 설정 관리
│   │   ├── store/
│   │   │   └── windowStore.js   # Zustand 창 관리 상태
│   │   └── styles/
│   │       └── global.css       # 다크 OS 테마
│   └── package.json
├── backend/
│   ├── main.py                  # FastAPI 앱, SPA 서빙
│   ├── routers/
│   │   ├── terminal.py          # WebSocket PTY bash
│   │   ├── system.py            # rocm-smi + psutil
│   │   ├── chat.py              # Anthropic API 프록시
│   │   ├── config.py            # .env.json 관리
│   │   └── services.py          # 서비스 URL 상태 확인
│   └── requirements.txt
├── install.sh                   # 원클릭 설치
├── dev.sh                       # 개발 모드 실행
└── README.md
```

### 새 앱 추가하기

```jsx
// 1. frontend/src/components/apps/MyApp.jsx 생성
export default function MyApp() {
  return <div>내 앱</div>
}

// 2. Desktop.jsx의 APPS 배열에 추가
{
  id: 'myapp',
  title: '내 앱',
  icon: '🔧',
  label: 'My App',
  gradient: 'linear-gradient(135deg, #333, #111)',
  component: MyApp,
}
```

---

## 라이선스

MIT © 2024
