***REMOVED***명령 지시서: APP-Manifest-Error-해결-및-배포-방식-변경

**타임스탬프:** 20251020_130000
**요청자:** 사용자
**요청 내용:** 
1. 지갑 연결 시 APP Manifest Error 발생 해결
2. PoC 코드 분석 및 학습 후 해결 방법 찾기 (PoC 코드/문서 훼손 금지)
3. 배포 과정 수정: 직접 Cloudflare 배포 대신 GitHub 커밋&푸시로 자동 배포

**상세 요구사항:**
- APP Manifest Error: TON Connect manifest 형식이 잘못됨
- PoC 분석: PoC/docs 및 PoC/src에서 manifest 설정 방법 학습
- 배포 변경: 수동 wrangler deploy → GitHub push 자동 배포
- PoC 보존: 절대 PoC 폴더 내용 수정/훼손하지 않음

**참조 문서:**
- PoC/docs/PoC/developer-notes.md
- PoC/docs/PoC/troubleshooting.md
- kanban.md (현재 작업 상태)

**기대 결과:**
- APP Manifest Error 해결
- GitHub push 기반 자동 배포 설정 작동 확인
- PoC 코드는 변경 없이 분석만 수행