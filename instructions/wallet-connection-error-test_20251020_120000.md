# 지시서: 배포 후 월렛 연결 오류 테스트 및 해결

**요청자:** 사용자
**요청 일시:** 2025년 10월 20일
**요청 내용:**
- 배포 후 App Manifest Error 발생 확인
- PoC 폴더의 모든 코드 분석하여 해결 방법 찾기
- PoC에서는 월렛 연결 오류가 발생하지 않았음
- aiandyou.me 도메인 연결 설정되어 배포 시 자동 접속 가능
- 앞으로 문서화 작업 후 문서 수정/생성 시 문서도 커밋&푸시

**분석 결과:**
- 현재 프로젝트와 PoC 모두 TON Connect 사용
- manifest URL 동일: https://aiandyou.me/tonconnect-manifest.json
- PoC에서는 manifest 파일 없음, 현재는 최상위에 있었으나 public/으로 이동 필요
- icon.png가 public/에 없어 iconUrl 오류 가능성
- manifest의 iconUrl이 /assets/icon-192.png였으나 public/ 파일은 /로 서빙

**해결 계획:**
1. icon.png를 public/icon-192.png로 복사
2. tonconnect-manifest.json를 public/으로 이동
3. manifest의 iconUrl을 https://aiandyou.me/icon-192.png로 변경
4. 변경 사항 커밋&푸시
5. 배포 후 테스트