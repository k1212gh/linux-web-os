#!/usr/bin/env bash
# linux-web-os GitHub 업로드 스크립트
# 실행 전: GitHub에서 "linux-web-os" 이름의 빈 레포 생성 필요
# 사용법: bash github-push.sh YOUR_GITHUB_USERNAME

set -e
USERNAME="${1:-}"
if [ -z "$USERNAME" ]; then
  echo "사용법: bash github-push.sh YOUR_GITHUB_USERNAME"
  exit 1
fi

REPO="linux-web-os"
cd "$(dirname "$0")"

echo "🔗 GitHub 원격 저장소 연결: github.com/$USERNAME/$REPO"
git remote add origin "https://github.com/$USERNAME/$REPO.git" 2>/dev/null || \
  git remote set-url origin "https://github.com/$USERNAME/$REPO.git"

echo "📤 push 중..."
git push -u origin main

echo ""
echo "✅ 완료! 레포 주소: https://github.com/$USERNAME/$REPO"
