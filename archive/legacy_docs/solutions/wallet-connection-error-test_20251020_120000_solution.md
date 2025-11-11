***REMOVED***해결 기록: 배포 후 월렛 연결 오류 테스트 및 해결

> **원본 지시서:** `instructions/wallet-connection-error-test_20251020_120000.md`
> **관련 커밋:** 28af856
> **최종 버전:** v1.0.3

---

##***REMOVED***1. 해결 방법 요약

배포 후 발생한 App Manifest Error를 해결하기 위해 TON Connect manifest 설정을 수정했습니다.

- `tonconnect-manifest.json`을 `public/` 폴더로 이동하여 올바른 서빙 경로 설정
- `icon.png`를 `public/icon-192.png`로 복사하여 manifest에서 참조 가능하도록 함
- manifest의 `iconUrl`을 `https://aiandyou.me/assets/icon-192.png`에서 `https://aiandyou.me/icon-192.png`로 수정
- 버전을 v1.0.3으로 업데이트하고 변경 사항을 커밋&푸시

---

##***REMOVED***2. 핵심 코드 변경 사항

###***REMOVED***public/tonconnect-manifest.json
```json
{
  "url": "https://aiandyou.me",
  "name": "CandleSpinner",
  "iconUrl": "https://aiandyou.me/icon-192.png"
}
```

###***REMOVED***파일 구조 변경
- `tonconnect-manifest.json` → `public/tonconnect-manifest.json`
- `icon.png` → `public/icon-192.png` (복사)

---

##***REMOVED***3. 참고 사항

- PoC 코드 분석 결과, PoC에서는 manifest 파일이 없었음에도 월렛 연결이 작동했으나, 배포 환경에서는 manifest가 필수적임
- Vite의 public 폴더 서빙 규칙에 따라 manifest와 icon을 public/으로 이동
- aiandyou.me 도메인 연결이 설정되어 있어 배포 시 자동 적용됨

---

##***REMOVED***4. 후임 AI를 위한 인수인계

- 배포 후 https://aiandyou.me에서 월렛 연결을 테스트하여 오류가 해결되었는지 확인 필요
- manifest URL은 `https://aiandyou.me/tonconnect-manifest.json`으로 유지
- 향후 manifest 수정 시 public/ 폴더 내에서 진행