# 배포

프론트엔드 빌드 + 배포 준비를 수행합니다.

## 절차

1. `git status`로 커밋되지 않은 변경 확인 → 있으면 커밋 먼저
2. `cd frontend && ./node_modules/.bin/vite build` 실행
3. 빌드 성공 확인
4. `git log --oneline -5`로 최근 커밋 확인
5. 배포 준비 완료 보고

## 배포 방법 안내

### GitHub Pages (정적)
```bash
git checkout main
git merge feat/portfolio-apps
git push origin main
# GitHub Actions가 자동 배포
```

### Tailscale (풀스택)
```bash
# WSL에서:
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
sudo tailscale serve https:443 / http://localhost:8000
```

빌드 결과를 보고해주세요.
