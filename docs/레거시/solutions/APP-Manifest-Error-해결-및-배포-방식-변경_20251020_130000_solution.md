***REMOVED***해결 기록: APP-Manifest-Error-해결-및-배포-방식-변경

> **원본 지시서:** `instructions/APP-Manifest-Error-해결-및-배포-방식-변경_20251020_130000.md`
> **관련 커밋:** 079a1f0 (fix: TON Connect manifest 형식 수정 및 인출 기능 개선)
> **최종 버전:** [v1.0.2]

---

##***REMOVED***1. 해결 방법 요약

APP Manifest Error와 배포 방식 문제를 해결하기 위해 다음과 같은 조치를 취했습니다:

- **Manifest Error 해결**: PoC 코드 분석을 통해 TON Connect manifest 형식을 PWA 형식에서 올바른 TON Connect 형식으로 변경
- **배포 방식 변경**: 수동 Cloudflare 배포에서 GitHub push 기반 자동 배포로 전환
- **PoC 보존**: PoC 폴더 내용은 절대 수정하지 않고 분석만 수행

---

##***REMOVED***2. 핵심 변경 사항

**TON Connect Manifest 수정:**
```json
// 변경 전 (PWA 형식 - 오류 발생)
{
  "name": "CandleSpinner PoC",
  "icon": "https://aiandyou.me/assets/icon-192.png",
  "start_url": "/",
  "short_name": "CandleSpinner",
  "description": "PoC for CSPIN Jetton deposits via TonConnect",
  "theme_color": "#ffffff"
}

// 변경 후 (TON Connect 형식 - 정상)
{
  "url": "https://aiandyou.me",
  "name": "CandleSpinner",
  "iconUrl": "https://aiandyou.me/assets/icon-192.png"
}
```

**배포 방식 변경:**
```bash
***REMOVED***변경 전: 수동 Cloudflare 배포
npx wrangler pages deploy dist

***REMOVED***변경 후: GitHub push 자동 배포
git add .
git commit -m "fix: manifest and deployment changes"
git push origin main  ***REMOVED***→ 자동으로 Cloudflare Pages 배포
```

---

##***REMOVED***3. PoC 분석 결과 (PoC 코드/문서 훼손하지 않음)

**분석한 PoC 파일들:**
- `PoC/docs/PoC/developer-notes.md`: TON Connect 매니페스트 설정 언급
- `PoC/docs/PoC/troubleshooting.md`: 제톤 전송 오류 해결 가이드
- `PoC/src/hooks/useTonConnect.ts`: TON Connect 구현 예제

**학습한 주요 내용:**
1. **Manifest 형식**: PoC에서도 동일한 manifest 형식을 사용했으나 현재 구현에서 PWA 형식으로 변경됨
2. **오류 패턴**: troubleshooting.md에서 유사한 manifest 관련 오류 사례 확인
3. **보존 원칙**: PoC 코드는 "읽기 전용 아카이브"로 유지되어야 함

---

##***REMOVED***4. 후임 AI를 위한 인수인계

- **APP Manifest Error**: TON Connect에서는 `url`, `name`, `iconUrl` 필드만 필요. PWA 형식의 추가 필드는 오류 유발
- **배포 자동화**: GitHub push 시 Cloudflare Pages 자동 배포 설정이 구성되어 있음
- **PoC 활용**: 향후 유사 오류 발생 시 PoC/docs/PoC/troubleshooting.md 참조
- **다음 단계**: manifest 수정 후 실제 지갑 연결 테스트 필요