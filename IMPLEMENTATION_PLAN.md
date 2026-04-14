# 📐 구현 계획서 — Linux Web OS

> AMD RDNA 2 기반 AI 워크스테이션용 웹 OS 상세 설계 문서

---

## 1. 프로젝트 배경 및 목표

### 해결하려는 문제
- 태블릿/원격 노트북에서 리눅스 AI 워크스테이션에 접속 시 매번 SSH + 터미널만으로 작업해야 함
- VS Code Tunnel은 코딩 환경만 제공하고, KasmVNC는 전체 GUI를 스트리밍하여 무거움
- 시스템 상태 (GPU 사용률, VRAM 등)를 별도 앱 없이 확인할 방법이 없음
- Claude Code, Antigravity 같은 에이전트 도구를 태블릿에서 편리하게 쓸 수 없음

### 목표
하나의 브라우저 URL로 접속하면 Windows처럼 창을 열고 닫고, 앱을 실행하고, AI와 대화하고, 터미널을 쓸 수 있는 웹 기반 OS 환경 구축.

---

## 2. 기술 리서치

### 2-1. 웹 기반 창 관리 라이브러리 비교

| 라이브러리 | Stars | 마지막 업데이트 | 특징 | 선택 이유 |
|---|---|---|---|---|
| **react-rnd** | 4k+ | 활발 | 드래그+리사이즈 통합, React 18 지원 | ✅ 선택 |
| react-draggable | 8k+ | 활발 | 드래그만, 리사이즈 없음 | - |
| react-resizable | 2k+ | 보통 | 리사이즈만 | - |
| interactjs | 11k+ | 활발 | 바닐라 JS, 무거움 | - |

**결론**: `react-rnd`는 드래그와 리사이즈를 하나의 컴포넌트로 처리하며, bounds="parent"로 데스크탑 영역 밖으로 나가지 않도록 제어 가능.

### 2-2. 브라우저 내 실제 터미널 구현

**xterm.js** (Microsoft Terminal 팀이 개발, VS Code에서 사용)
- PTY(Pseudo-Terminal)를 서버에서 열고 WebSocket으로 연결
- 256색, 유니코드, 한글 완벽 지원
- 리사이즈 이벤트를 `TIOCSWINSZ` ioctl로 전달

```python
# 서버 사이드 PTY 구현 핵심
pid, fd = pty.fork()
if pid == 0:
    os.execvpe("/bin/bash", ["/bin/bash", "--login"], env)
else:
    # WebSocket ↔ PTY fd relay
```

**대안 비교**:
- wetty: Node.js 기반, 설치 복잡
- ttyd: C 기반, 별도 프로세스 필요
- ✅ **직접 구현** (FastAPI WebSocket + Python pty): 의존성 최소화, 커스터마이징 자유

### 2-3. GPU 모니터링 (ROCm)

```bash
# rocm-smi JSON 출력 구조
rocm-smi --showuse --showmeminfo vram --showtemp --json
```

출력 예시:
```json
{
  "card0": {
    "GPU use (%)": "34",
    "VRAM Total Used Memory (B)": "6609543168",
    "VRAM Total Memory (B)": "17163091968",
    "Temperature (Sensor junction) (C)": "67"
  }
}
```

`psutil`로 CPU/RAM, `rocm-smi`로 GPU 정보를 2초 간격 폴링하여 Sparkline 그래프로 시각화.

### 2-4. VS Code 원격 접속 방식 비교

| 방식 | 지연 | 설치 | AI 확장 | 선택 |
|---|---|---|---|---|
| **VS Code Tunnel** | 낮음 | snap만 | ✅ 완전 지원 | ✅ 선택 |
| code-server | 낮음 | 직접 빌드 | ✅ 지원 | 대안 |
| Remote-SSH | 낮음 | SSH 설정 | ✅ 지원 | 태블릿 불편 |
| Guacamole RDP | 높음 | 복잡 | ✅ 지원 | 무거움 |

VS Code Tunnel은 Microsoft 인프라를 경유하지만, `tailscale serve`로 URL을 노출하지 않고 내부에서만 사용 가능.

### 2-5. GUI 스트리밍 (Antigravity 등 Electron 앱)

**KasmVNC vs Apache Guacamole 비교**:

| | KasmVNC | Guacamole |
|---|---|---|
| 설치 | Docker 1개 | 서버+클라이언트+DB |
| 프로토콜 | WebSocket (네이티브 웹) | VNC/RDP 변환 |
| 해상도 | 4K 60fps 지원 | 1080p 한계 |
| 터치 지원 | ✅ 우수 | 보통 |
| **선택** | ✅ | - |

```bash
docker run -d -p 6901:6901 \
  lscr.io/linuxserver/webtop:ubuntu-kde
```

iframe에 임베드하면 Web OS 안에서 전체 KDE 데스크탑이 스트리밍됨.

### 2-6. 보안 아키텍처

**Tailscale Zero-Trust 모델**:
```
인터넷 ─✗→ 워크스테이션 (포트 개방 없음)
태블릿 ──Tailscale WireGuard──→ 워크스테이션:8000
```

`tailscale serve https:443 / http://localhost:8000`  
→ Tailnet 내부 기기만 접속 가능, Let's Encrypt 인증서 자동 발급

**API 키 보안**: 브라우저는 API 키를 절대 보지 못함. FastAPI 백엔드가 서버 사이드에서 `.env.json` 읽어서 Anthropic API에 요청.

### 2-7. 상태 관리 (Zustand 선택 이유)

창 관리에 필요한 상태:
- 각 창의 위치/크기 (x, y, w, h)
- 열림/닫힘/최소화 상태
- z-index (포커스 관리)

**Redux vs Zustand**:
- Redux: 보일러플레이트 많음, 오버킬
- ✅ Zustand: 단순 API, TypeScript 친화적, devtools 지원

```js
const { open, close, move, resize } = useWindowStore()
```

---

## 3. 시스템 아키텍처

### 3-1. 컴포넌트 다이어그램

```
Browser (React SPA)
│
├── Desktop.jsx ─── 앱 레지스트리, 배경, 창 컨테이너
│   ├── AppIcon.jsx ─── 더블클릭 → windowStore.open(id)
│   ├── Window.jsx ─── react-rnd 래퍼, 타이틀바, 트래픽 라이트
│   │   └── <App.component /> ─── 앱별 콘텐츠
│   └── Taskbar.jsx ─── 실행 중 앱 목록, 시계, GPU tray
│
├── store/windowStore.js ─── Zustand (창 상태 전역 관리)
│
└── apps/
    ├── Terminal.jsx ─── xterm.js + WebSocket /ws/terminal
    ├── VSCode.jsx ─── iframe + /api/services/vscode
    ├── Claude.jsx ─── fetch POST /api/chat
    ├── SystemMonitor.jsx ─── fetch GET /api/system/stats (2s)
    ├── Kasm.jsx ─── iframe + /api/services/kasm
    └── Settings.jsx ─── GET/POST /api/config
```

### 3-2. WebSocket PTY 흐름

```
xterm.js (브라우저)
    │ onData(keypress) → JSON {type:"input", data:"\r"}
    │ onResize → JSON {type:"resize", cols:120, rows:30}
    ↓ WebSocket /ws/terminal
FastAPI WebSocket Handler
    ├── read_from_ws: ws.iter_text() → os.write(fd, data)
    └── read_from_pty: select(fd) → ws.send_text(output)
         ↓ pty.fork() + os.execvpe("/bin/bash")
         실제 bash 프로세스 (TERM=xterm-256color)
```

### 3-3. GPU 모니터링 흐름

```
frontend (매 2초)
    GET /api/system/stats
         ↓
backend/routers/system.py
    subprocess.run(["rocm-smi", "--json"])
    psutil.cpu_percent(), psutil.virtual_memory()
         ↓
JSON 응답:
{
  "gpu": {"utilization": 34, "vram_used_gb": 6.2, "temperature": 67},
  "cpu": {"percent": 12.4, "model": "Ryzen 5 5600X"},
  "ram": {"used_gb": 14.2, "total_gb": 32}
}
         ↓
Sparkline 그래프 (60 포인트 히스토리 유지)
```

---

## 4. 단계별 구현 로드맵

### Phase 1 — MVP (현재 완성)
- [x] React + Vite 프론트엔드 셋업
- [x] Zustand 창 관리 시스템
- [x] 드래그/리사이즈 창 (react-rnd)
- [x] 데스크탑 아이콘 + 작업 표시줄
- [x] WebSocket PTY 터미널
- [x] VS Code Tunnel iframe
- [x] Claude API 채팅
- [x] GPU/CPU 실시간 모니터
- [x] KasmVNC iframe
- [x] 설정 앱 (.env.json 영구 저장)
- [x] FastAPI 백엔드 (모든 라우터)
- [x] 원클릭 설치 스크립트

### Phase 2 — 강화 (1~2주)

#### 2-1. 파일 탐색기 앱
```bash
# FileBrowser 도커
docker run -d -p 8081:80 \
  -v /home/$USER:/srv \
  filebrowser/filebrowser:s6
```
별도 앱 컴포넌트로 iframe 임베드.

#### 2-2. 로컬 LLM 통합 (ollama)
```python
# /api/chat 에 ollama 옵션 추가
if model.startswith("ollama/"):
    resp = httpx.post("http://localhost:11434/api/chat", ...)
```
모델 선택 드롭다운에 `ollama/llama3.1:8b`, `ollama/mistral` 등 추가.

#### 2-3. 알림 시스템
```jsx
// 토스트 알림 (창 우하단)
// GPU 온도 85°C 초과 경고
// 디스크 사용량 90% 경고
```

#### 2-4. 창 스냅 기능
- 화면 좌/우 반으로 창 스냅 (드래그 시 엣지 감지)
- `Win+Left`, `Win+Right` 단축키

### Phase 3 — 고도화 (1개월)

#### 3-1. 멀티탭 터미널
하나의 터미널 창 안에 탭 여러 개, 각각 독립적인 bash 세션.

#### 3-2. Claude Code 직접 실행 앱
터미널 앱에서 `claude` CLI를 실행하는 것이 아닌, Web OS 전용 Claude Code UI:
- 프로젝트 선택
- 작업 히스토리
- 파일 변경 사항 diff 뷰어

#### 3-3. 모바일/태블릿 최적화
- 터치 제스처 (핀치 줌, 스와이프로 창 전환)
- PWA manifest (홈 화면에 앱처럼 추가)
- 가상 키보드 대응 (창 이동 시 키보드 영역 피하기)

#### 3-4. 다크/라이트 테마 토글
현재 다크 전용 → CSS 변수 기반으로 라이트 모드 추가.

---

## 5. 태블릿 원격 접속 최적화

### 접속 지연 최소화

```
앱별 지연 시간 (예상):
Terminal   → ~10ms  (WebSocket, 텍스트만 전송)
VS Code    → ~20ms  (코드 데이터만, 화면 전송 없음)
Claude     → ~50ms  (API 왕복)
Monitor    → ~100ms (2초 폴링, 지연 무관)
KasmVNC    → ~150ms (이미지 스트리밍, 네트워크 의존)
```

### 태블릿 사용성 개선

**iPad + Magic Keyboard 최적 설정**:
```bash
# VS Code 터널에서 Cmd 키 맵핑 수정
# settings.json
{
  "keyboard.dispatch": "keyCode"
}
```

**화면 활용**:
- iPad 11인치: 창 2개 나란히 (Terminal + Claude)
- iPad 13인치: 창 3개 (Terminal + VS Code + Monitor)

---

## 6. ROCm 성능 최적화 설정

### RDNA 2 전용 설정 (RX 6800 XT)

```bash
# ~/.bashrc 또는 /etc/environment에 추가
export HSA_OVERRIDE_GFX_VERSION=10.3.0  # gfx1030 호환성 강제
export GPU_ENABLE_WGP_MODE=0            # CU 모드 활성화 (3~4배 GEMM 향상)
export PYTORCH_HIP_ALLOC_CONF=max_split_size_mb:512

# 전력 프로파일 고정 (AI 추론 중 쓰로틀링 방지)
echo performance | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level

# Resizable BAR 확인 (BIOS에서 활성화 필요)
sudo lspci -v | grep -A 10 "VGA" | grep "prefetchable"
# "64-bit, prefetchable" + 크기가 16G이면 SAM 활성화됨
```

### PyTorch ROCm 설치

```bash
# AMD 공식 nightly 빌드 (최신 RDNA2 최적화 포함)
pip install --pre torch torchvision torchaudio \
  --index-url https://download.pytorch.org/whl/nightly/rocm6.4/

# 검증
python3 -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
# True
# AMD Radeon RX 6800 XT
```

---

## 7. 보안 체크리스트

- [ ] `backend/.env.json` → `.gitignore`에 포함 ✅
- [ ] Tailscale ACL로 특정 기기만 워크스테이션 접근 허용
- [ ] VS Code Tunnel: GitHub 계정 2FA 활성화
- [ ] KasmVNC: 강력한 VNC 비밀번호 설정
- [ ] systemd 서비스: root가 아닌 일반 사용자로 실행 ✅
- [ ] Tailscale Funnel 사용 안 함 (공개 URL 노출 금지)

---

## 8. 트러블슈팅

### GPU 모니터가 0% 표시됨
```bash
# ROCm 권한 확인
groups | grep -E "render|video"
# 없으면:
sudo usermod -aG render,video $USER
# 재로그인 후 재시도
```

### 터미널 접속 불가
```bash
# 백엔드 로그 확인
journalctl -u linux-web-os -n 50
# pty 관련 오류 시 python3-full 설치
sudo apt-get install python3-full
```

### VS Code Tunnel 끊김
```bash
# Tunnel을 systemd 서비스로 등록
sudo systemctl enable --now code-tunnel.service
# 또는 직접 서비스 파일 작성
```

### KasmVNC 검은 화면
```bash
# 컨테이너 로그 확인
docker logs kasmvnc
# 포트 충돌 확인
ss -tlnp | grep 6901
```

---

## 9. 향후 계획 (v2.0 아이디어)

1. **멀티유저 지원**: 여러 사람이 동시에 다른 세션으로 접속
2. **앱 스토어**: YAML로 새 앱 정의 → 자동 아이콘 등록
3. **AI 오케스트레이터**: Web OS 안에서 Claude Code가 여러 터미널 창을 동시 제어
4. **GPU 스케줄러**: 여러 AI 작업의 VRAM 사용량 자동 조절
5. **백업/스냅샷**: 창 배치 및 세션 상태 저장/복원
