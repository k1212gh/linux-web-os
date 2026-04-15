# Linux Web OS — 테스트 시나리오

> 이 문서의 목적
> - 이 프로젝트를 처음 보는 사람이 **설치 → 동작 확인 → 보안 검증**까지 끝낼 수 있다.
> - 각 단계는 **실행할 명령**, **예상 출력**, **실패 시 조치**가 짝지어져 있다.
> - 모든 체크박스를 통과하면 PR을 머지해도 좋다는 신호다.

---

## 0. 이 앱이 뭔가요?

**Linux Web OS**는 리눅스 워크스테이션을 **브라우저 하나로 쓰는 웹 OS**다.
브라우저 창 안에 데스크탑·작업표시줄·창 관리가 있고, 그 안에서 다음 앱들이 돈다.

| 앱 | 동작 방식 |
|---|---|
| ⌨ Terminal | WebSocket + PTY로 진짜 `bash` 세션이 브라우저에 뜸 |
| ◈ VS Code | `code tunnel` 로 띄운 VS Code를 iframe으로 띄움 |
| ✦ Claude | Anthropic API를 서버가 프록시 (API 키는 서버에만) |
| 📊 Monitor | `rocm-smi` / `psutil` 폴링 결과 표시 |
| 🖥 Desktop | KasmVNC 리눅스 GUI 스트리밍을 iframe으로 띄움 |
| ⚙ Settings | `backend/.env.json` 편집 (API 키·URL 저장) |

백엔드는 **FastAPI (port 8000, 127.0.0.1 전용)**, 프런트는 **Vite + React (빌드 산출물을 FastAPI가 같이 서빙)**.
원격 접속은 반드시 **Tailscale** 경유 — 공인망 직접 노출은 금지다.

---

## 1. 사전 준비

### 1.1 하드웨어/OS 요구사항
- Ubuntu 22.04 또는 24.04 (x86_64)
- Python 3.10 이상
- Node.js 18 이상
- (선택) AMD GPU + ROCm 6.1 이상 — GPU 통계 기능에만 필요

### 1.2 테스트에 필요한 계정 권한
- `sudo` 가능한 일반 사용자 (예: `ubuntu`, `ssafy`)

### 1.3 준비할 것
- Anthropic API 키 (없어도 Claude 앱의 "키 없음" 분기 확인은 가능)
- 같은 LAN에 있는 **다른 기기** 한 대 (보안 테스트용, 폰·노트북 등)

### 1.4 체크리스트
- [ ] Ubuntu 22.04/24.04 접속 가능
- [ ] `sudo apt-get update` 가능
- [ ] 포트 8000이 현재 비어있음 (`ss -tlnH "sport = :8000"` 실행 시 출력 없음)

---

## 2. 설치

### 2.1 레포 체크아웃 + 브랜치 전환

```bash
git clone https://github.com/k1212gh/linux-web-os.git
cd linux-web-os
git fetch origin
git checkout fix/security-service-ux-hardening
```

**예상**: 현재 브랜치가 `fix/security-service-ux-hardening` 로 표시됨.
```bash
git branch --show-current
# → fix/security-service-ux-hardening
```

### 2.2 설치 스크립트 실행

```bash
chmod +x install.sh dev.sh
./install.sh
```

**예상 출력 (핵심 라인)**
```
[INFO]  시스템 패키지 업데이트...
[OK]    Node.js v20.x.x ✓
[INFO]  Python 가상환경 설정...
[OK]    Python deps ✓
[INFO]  프론트엔드 빌드...
[OK]    Frontend build ✓
[INFO]  전용 서비스 사용자 생성: webos
[OK]    사용자 생성됨
[INFO]  systemd 서비스 설치/갱신...
[OK]    systemd 서비스 등록됨 (User=webos, 127.0.0.1 바인딩)
[INFO]  네트워크 노출 정책: 서비스는 127.0.0.1:8000에만 바인딩됩니다.
```

**체크**
- [ ] 에러로 스크립트가 중단되지 않음
- [ ] `webos` 사용자 생성 로그가 보임
- [ ] "127.0.0.1 바인딩" 문구가 보임

**실패 시**
- `apt-get` 실패 → 네트워크/proxy 확인
- `npm install` 실패 → Node 버전이 18 미만이면 스크립트가 20 설치하도록 되어 있음. 그래도 실패 시 `node --version` 확인
- 포트 8000 선점 경고 → `sudo lsof -i :8000` 로 점유 프로세스 확인 후 해당 프로세스 종료

### 2.3 frontend 빌드 산출물이 backend가 서빙하는 위치에 있는지 확인

현재 프로젝트는 프런트를 `frontend/dist` 로 빌드하지만, FastAPI는 `backend/static/` 을 본다.
설치 스크립트가 빌드만 하고 복사하지 않으면 UI가 안 뜬다. 아래로 확인/복사.

```bash
ls backend/static 2>/dev/null || echo "MISSING"
# MISSING 이 뜨면 수동 복사:
cp -r frontend/dist backend/static
ls backend/static/index.html
```

**체크**
- [ ] `backend/static/index.html` 이 존재함

> ℹ️ 이 단계가 필요하면 `install.sh` 버그 가능성 — 결과를 PR 코멘트로 남겨줘.

### 2.4 API 키 입력 (선택)

```bash
sudo -u webos nano /path/to/linux-web-os/backend/.env.json
# ANTHROPIC_API_KEY 값만 채우면 됨. URL들은 나중에 앱 내에서 설정 가능.
```

또는 UI의 Settings 앱에서 나중에 입력해도 된다.

---

## 3. 서비스 시작

```bash
sudo systemctl start linux-web-os
sudo systemctl status linux-web-os
```

**예상 (핵심)**
```
● linux-web-os.service - Linux Web OS
     Loaded: loaded (/etc/systemd/system/linux-web-os.service; enabled; ...)
     Active: active (running) since ...
   Main PID: XXXX (uvicorn)
```

**체크**
- [ ] `Active: active (running)` 표시
- [ ] `User=webos` (`systemctl show linux-web-os -p User`) 로 확인
- [ ] 에러 로그 없음 — `journalctl -u linux-web-os -n 50 --no-pager`

**실패 시**
- 즉시 재시작 반복 → `journalctl -u linux-web-os -e` 로 원인 확인. 가장 흔한 원인은 `.env.json` 권한(600인데 서비스 사용자가 읽을 수 있는지) 또는 `.venv` 경로 오류.

---

## 4. 기본 동작 검증 (커맨드라인)

### 4.1 헬스체크 (로컬)

```bash
curl -s http://localhost:8000/health
# 예상: {"status":"ok"}
```

- [ ] `{"status":"ok"}` 반환

### 4.2 API 문서

```bash
curl -s http://localhost:8000/docs -o /dev/null -w "%{http_code}\n"
# 예상: 200
```

- [ ] 200 OK

### 4.3 프런트 SPA 진입

```bash
curl -s http://localhost:8000/ | grep -o "<title>.*</title>"
# 예상: <title>...</title> 형태로 뭔가 나옴 (index.html이 돌아와야 함)
```

- [ ] index.html 응답

---

## 5. 보안 검증 (이번 PR의 핵심)

### 5.1 🔴 LAN의 다른 기기에서 접근 불가능해야 함

**테스트용 기기 IP 확인**
```bash
ip -4 addr show | grep inet | grep -v 127.0.0.1
# 예: inet 192.168.0.42/24 ...
```

**같은 LAN의 다른 기기(폰/노트북)에서**
```
브라우저로 http://192.168.0.42:8000  접속
```

**예상**: 접속 실패 / 타임아웃 / Connection refused
- [ ] **다른 기기에서 접근 불가능** ← 이게 실패하면 PR 머지 금지

### 5.2 🔴 서비스가 `webos` 사용자로 돌고 있다

```bash
ps -o user,pid,cmd -p $(systemctl show -p MainPID --value linux-web-os)
# 예상: USER 컬럼에 "webos"
```

- [ ] `webos` 로 프로세스 동작

### 5.3 🔴 `.env.json` 권한이 600이고 `webos` 소유

```bash
ls -la backend/.env.json
# 예상: -rw------- 1 webos webos ...
```

- [ ] `-rw-------`
- [ ] 소유자 `webos`

### 5.4 🔴 `webos` 가 관리자 홈/파일에 접근 불가

```bash
sudo -u webos cat /root/.bashrc 2>&1 | head -1
# 예상: cat: /root/.bashrc: Permission denied

sudo -u webos ls /home/$USER 2>&1 | head -1
# 예상: ls: cannot open directory '/home/...': Permission denied
# (ProtectHome=read-only 때문에 마운트 자체가 read-only 혹은 접근 제한)
```

- [ ] 관리자 홈 읽기 거부됨

### 5.5 🟠 iframe sandbox 적용 여부

브라우저 개발자도구에서 VS Code/Kasm 앱 열기 → Elements 탭에서 `<iframe>` 선택.
- [ ] `sandbox="allow-scripts allow-same-origin allow-forms allow-popups..."` 속성 있음
- [ ] `referrerpolicy="no-referrer"` 속성 있음

### 5.6 🟠 API 키 마스킹

1. Settings 앱에서 API 키(`sk-ant-xxxxxxxxxxxxxxxxxxxx`) 입력 후 저장
2. 새로고침(F5)
3. Settings 앱 다시 열기
4. API Key 필드에 `sk-ant-x...xxxx` 같이 마스킹된 값이 보여야 함

- [ ] 평문 키가 UI에 다시 뜨지 않음
- [ ] 저장 시 마스킹된 값이 덮어쓰지 않음 (다른 필드 하나 바꾸고 저장 후 실제 키가 유지되는지 `sudo cat backend/.env.json` 로 확인)

### 5.7 🟢 CORS 제한

```bash
curl -i -H "Origin: http://evil.example.com" http://localhost:8000/api/config 2>&1 | grep -i access-control-allow-origin
# 예상: 헤더가 없거나, 허용 origin만 echo 되고 evil은 안 됨
```

- [ ] `evil.example.com` 이 응답 헤더에 포함 안 됨

---

## 6. 브라우저 UI 동작 테스트

**접속 방법 (로컬 머신에서)**
```bash
# 원격 접속이 필요하면 먼저 Tailscale
sudo tailscale up
sudo tailscale serve --bg http://localhost:8000
tailscale status   # https://<hostname>.ts.net 확인
```

- 로컬 브라우저: `http://localhost:8000`
- 태블릿/원격: `https://<hostname>.ts.net`

### 6.1 데스크탑 기본 렌더링
- [ ] 어두운 배경의 데스크탑이 뜸
- [ ] 좌측에 6개 앱 아이콘 (Terminal, VS Code, Claude, Monitor, Desktop, Settings)
- [ ] 하단에 작업표시줄 + 우측에 시계 + GPU/VRAM 숫자
- [ ] 브라우저 콘솔(F12)에 에러 없음

### 6.2 키보드 접근성 (이번 PR 추가 사항)
- [ ] Tab 키로 아이콘 간 포커스 이동
- [ ] Enter 또는 Space 로 앱 열림

### 6.3 창 조작
Terminal 아이콘 더블클릭해서 열고:
- [ ] 타이틀바 드래그로 이동
- [ ] 우하단 모서리 드래그로 리사이즈
- [ ] 초록 버튼(최대화) → 전체로 채워짐
- [ ] 초록 버튼 다시 → 원래 크기로 복원 (이번 PR의 `_prev*` 수정 확인)
- [ ] 노랑 버튼(최소화) → 사라지고 작업표시줄에서 다시 클릭 시 복원
- [ ] 빨강 버튼(닫기) → 사라짐

### 6.4 Terminal 앱
- [ ] 프롬프트 표시됨 (`$` 또는 `#`)
- [ ] `ls`, `pwd`, `echo hello` 정상 실행
- [ ] `htop` 이나 긴 출력도 깨짐 없이 표시
- [ ] 창 리사이즈 시 터미널이 해당 크기를 따라감 (서버 콘솔에 `TIOCSWINSZ` 에러 없어야 함)
- [ ] `exit` 입력 시 세션 종료
- [ ] 닫기 후 서버에서 `ps -ef | grep bash` 해도 해당 PTY bash가 남아있지 않음 (graceful teardown 확인)

**CPU 사용률 확인 (이번 PR의 S5 수정)**
```bash
# 터미널 앱 열어둔 채로 유휴 상태 1분 유지 후
top -bn1 -p $(systemctl show -p MainPID --value linux-web-os)
# CPU% 가 거의 0 이어야 함 (이전: 폴링 때문에 1~3% 정도 올라감)
```
- [ ] 유휴 시 CPU ~0%

### 6.5 Settings 앱
- [ ] 다섯 개 필드(ANTHROPIC_API_KEY 외 4개) 표시
- [ ] 값 입력 → 저장 → "저장됨" 토스트
- [ ] `backend/.env.json` 파일에 실제 값이 반영됨 (`sudo cat`)

### 6.6 Claude 앱 (API 키 등록 시)
- [ ] "안녕" 전송 → 응답 수신
- [ ] 모델 선택(Sonnet/Opus/Haiku) 변경 가능
- [ ] 에러 발생 시 "API 연결 오류" 메시지 표시

**API 키 없을 때**
- [ ] 메시지 전송 시 503 에러 응답 + 안내 메시지

### 6.7 System Monitor 앱
- [ ] CPU %, RAM GB 숫자 보임
- [ ] ROCm 설치 환경이면 GPU util/VRAM/temp 표시
- [ ] ROCm 없어도 `GPU (unavailable)` 라벨로 화면 깨지지 않음

### 6.8 VS Code 앱
**터널 미설정 상태**
- [ ] "VS Code 터널 미연결" 가이드 화면이 뜸 (3-step 안내)

**터널 설정 후**
```bash
# 다른 터미널에서
code tunnel --accept-server-license-terms
# 출력되는 URL을 Settings 앱 "VS Code Tunnel URL" 에 입력 → 저장
```
- [ ] iframe 안에 VS Code가 로드됨
- [ ] 파일 편집, 터미널 패널, 확장 설치 동작
- [ ] `sandbox` 속성 덕분에 경고/블록이 뜨면 해당 기능 이름 메모 (일부 VSCode 기능이 막힐 수 있음)

### 6.9 Desktop (KasmVNC) 앱
**KasmVNC 미설치**
- [ ] 설치 가이드 화면(3-step Docker 명령) 표시

**KasmVNC 실행 후**
- [ ] iframe에 리눅스 GUI 데스크탑 스트리밍
- [ ] 마우스/키보드 상호작용 동작

### 6.10 ErrorBoundary (이번 PR 추가 사항)
일부러 망가뜨려 확인:
```bash
# backend/routers/chat.py 에서 return 줄을 "return 1/0" 등으로 깨뜨린 후 재시작
```
- [ ] Claude 앱 안에서만 에러 화면(빨간 "앱에서 오류가 발생했습니다")이 뜸
- [ ] **다른 앱과 데스크탑은 정상** — 화이트스크린 없음
- [ ] "다시 시도" 버튼 동작
- [ ] 검증 끝나면 변경사항 원복 (`git checkout backend/routers/chat.py`)

---

## 7. 원격 접속 테스트 (Tailscale)

### 7.1 Tailscale 서빙 설정
```bash
sudo tailscale serve --bg http://localhost:8000
tailscale serve status
# 예상: https://<hostname>.ts.net/ → proxy http://127.0.0.1:8000
```

### 7.2 태블릿/다른 기기(같은 Tailnet)에서
- [ ] `https://<hostname>.ts.net` 접속 성공
- [ ] Terminal/Claude 정상 동작
- [ ] 터치 제스처로 창 드래그/리사이즈 가능

### 7.3 Tailnet이 **아닌** 기기에서
- [ ] 같은 도메인 접속 시도 → 응답 없음/연결 거부

---

## 8. 부하/복구 테스트

### 8.1 서비스 재시작
```bash
sudo systemctl restart linux-web-os
curl -s http://localhost:8000/health   # ok 여야 함
```
- [ ] 재시작 후 5초 이내 `/health` 응답

### 8.2 비정상 종료 자동 복구
```bash
sudo kill -9 $(systemctl show -p MainPID --value linux-web-os)
sleep 6
systemctl is-active linux-web-os
# 예상: active (Restart=on-failure + RestartSec=5)
```
- [ ] 자동 복구

### 8.3 장시간 Terminal 세션
Terminal 열어 두고 30분 이상 유휴 상태.
- [ ] 세션 유지됨 (WebSocket keepalive)
- [ ] CPU 여전히 ~0%

---

## 9. 합격 기준

다음이 전부 통과해야 PR 머지 가능:

**MUST** (하나라도 실패하면 머지 금지)
- [ ] 5.1 LAN의 다른 기기에서 접근 불가
- [ ] 5.2 프로세스가 `webos` 로 실행
- [ ] 5.3 `.env.json` 이 600 / `webos:webos`
- [ ] 5.4 `webos` 가 `/root`, `/home/<admin>` 접근 불가
- [ ] 4.1 `/health` 200
- [ ] 6.1 데스크탑 렌더링 + 콘솔 에러 없음
- [ ] 6.4 Terminal 입력/출력/종료 후 좀비 프로세스 없음
- [ ] 8.2 비정상 종료 자동 복구

**SHOULD**
- [ ] 5.5, 5.6, 5.7 (iframe/마스킹/CORS)
- [ ] 6.3 창 최대화/복원 버그 없음
- [ ] 6.10 ErrorBoundary 격리
- [ ] 6.4 유휴 CPU ~0%

**NICE**
- [ ] 7.2 Tailscale 원격 정상
- [ ] 6.8, 6.9 VS Code / Kasm iframe 동작

---

## 10. 문제 보고 양식

문제가 발생하면 GitHub Issue에 아래 템플릿으로 남길 것.

```markdown
### 체크포인트
(예: 5.4 — webos 가 /root 접근 가능)

### 실행 환경
- OS: Ubuntu 24.04
- 커널: uname -r 결과
- GPU: rocminfo 또는 lspci | grep -i vga

### 재현 명령과 출력
(붙여넣기)

### journalctl
$ journalctl -u linux-web-os -n 100 --no-pager
(붙여넣기)

### 예상 vs 실제
```

---

## 11. 정리

테스트 끝났으면 설치를 되돌리고 싶을 때:
```bash
sudo systemctl stop linux-web-os
sudo systemctl disable linux-web-os
sudo rm /etc/systemd/system/linux-web-os.service
sudo systemctl daemon-reload
sudo userdel -r webos  # 홈(/var/lib/webos) 까지 삭제
```

`.claude/` 는 AI 에이전트 로컬 설정이니 `.gitignore` 에 추가해두면 좋다.
