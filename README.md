# CandleSpinner

**TON 블록체인 기반의 서버리스 슬롯머신 게임 (요약 안내)**

간단 소개
- CandleSpinner는 TON 블록체인 위에서 동작하는 서버리스 슬롯머신 게임입니다.
- 프론트엔드: React + TypeScript + Vite
- 백엔드: Cloudflare Workers (Functions)
- 블록체인 연동: TonCenter RPC (TONCENTER_RPC / TonCenter API)
- 배포: Cloudflare Pages / Workers

중요 안내: 아카이브(archive/mvp-v2-완성본)
- `archive/mvp-v2-완성본` 폴더는 **학습 및 참조용 스냅샷**입니다.
- 해당 디렉터리의 파일은 보존용이며 **절대 수정하거나 삭제하지 마십시오**.
- 아카이브 내부 문서(QUICKSTART.md, README.md 등)에 과거/참고 아키텍처가 담겨 있으니, 실제 운영 환경과 설정값은 코드와 wrangler.toml 등에서 확인하세요.

TonCenter RPC 관련 (확인 및 설정)
- 현재 리포지토리 코드는 TonCenter REST API (TonCenter JSON-RPC endpoint, 통칭 TONCENTER_RPC)를 사용합니다.
- 로컬 개발 및 프론트엔드(환경변수 예시):
  ```bash
  # 로컬(예시)
  VITE_TONCENTER_RPC_URL=https://toncenter.com/api/v2/jsonRPC
  ```
- Cloudflare Workers / 서버 측(Secrets):
  - TONCENTER_API_KEY — TonCenter API Key (Cloudflare Secrets 또는 `npx wrangler secret put TONCENTER_API_KEY` 로 설정)
  - 필요 시 Workers에서 TONCENTER_RPC_URL(또는 별도 엔드포인트 변수)을 참조하도록 구성하세요.
- wrangler.toml 및 QUICKSTART.md 에 TonCenter 관련 설정(예: TONCENTER_API_KEY)이 문서화되어 있습니다. 운영 환경에서는 반드시 Dashboard 또는 wrangler secret 로 비밀값을 설정하세요.

빠른 시작 (개발자용 요약)
1. 의존성 설치
   - npm install
2. 환경 설정 (예시)
   - 로컬: `.env.local` 생성 (절대 리포지토리에 커밋 금지)
   - 예시 변수:
     - VITE_TONCENTER_RPC_URL=https://toncenter.com/api/v2/jsonRPC
     - TONCENTER_API_KEY=[TonCenter API Key — Cloudflare Secret으로 설정]
     - GAME_WALLET_PRIVATE_KEY=[Cloudflare Secret으로 설정]
3. 로컬 개발
   - npm run dev
   - 브라우저에서 http://localhost:5173 접속
4. 빌드 및 배포
   - npm run build
   - Cloudflare 배포: wrangler deploy 또는 프로젝트의 배포 스크립트 사용

보안 및 운영 주의
- 절대 개인키/니모닉을 코드에 포함하거나 버전관리 시스템에 커밋하지 마세요.
- 민감 정보는 Cloudflare 환경변수 또는 안전한 비밀 저장소에 보관하세요.
- 메인넷에서의 트랜잭션은 실제 자산 이동이므로 충분히 테스트 후 배포하세요.

문서 & 참고
- 자세한 설치·배포·아키텍처 정보는 repository의 docs/ 및 `archive/mvp-v2-완성본/QUICKSTART.md`, `archive/mvp-v2-완성본/README.md`를 참조하세요(아카이브는 읽기 전용).
- 주요 파일:
  - `src/` — 프론트엔드 소스
  - `functions/` — Cloudflare Workers (백엔드)
  - `public/` — 정적 자산 (tonconnect-manifest.json 등)
  - 설정 파일: `package.json`, `tsconfig.json`, `vite.config.ts`, `wrangler.toml`

라이선스
- MIT (자세한 내용은 LICENSE 파일 참조)

마지막 업데이트: 2025-11-02
