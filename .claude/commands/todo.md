# TODO 목록 관리 (/todo)

프로젝트의 TODO 목록을 관리합니다.

## 절차

1. **SESSION_CONTEXT.md에서 "미구현 항목" 섹션 읽기**

2. **현재 TODO 표시**
   ```
   ═══ AgentOS TODO ═══

   🔴 1순위 — 인프라 관리
   [ ] Jenkins/GitHub Actions 대시보드
   [ ] Docker/Portainer 관리
   [ ] Grafana/Prometheus 모니터링

   🟡 2순위 — 자동화
   [ ] 블로그 에디터 완성
   [ ] /blog 스킬 실동작
   [ ] Obsidian 뷰어 앱

   🟢 3순위 — 배포
   [ ] main 머지 + GitHub Pages
   [ ] PWA manifest
   ...
   ```

3. **사용자가 완료 표시하면 SESSION_CONTEXT.md 업데이트**
   - `[ ]` → `[x]`

4. **사용자가 새 항목 추가하면 적절한 우선순위에 배치**
