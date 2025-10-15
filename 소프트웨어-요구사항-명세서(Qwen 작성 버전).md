**CandleSpinner: The Galactic Casino — AI 코딩 에이전트용 최종 요구사항 명세서**  
**버전**: 3.0  
**작성일**: 2025-04-05  
**상태**: ✅ **Final — AI 즉시 실행용**  
**작성자**: Human (Project Lead)  
**대상**: AI 코딩 에이전트 (예: Jules, Claude, GPT-4)  

> 🎯 **목적**: 이 문서 하나로 **완전한 프론트엔드 애플리케이션을 처음부터 끝까지 구현**하라.  
> ❗ **이 문서가 유일한 진실 공급원**(SSOT)이며, 외부 문서/과거 코드/모호한 지시는 무시한다.

---

## 🔑 1. 핵심 원칙 (반드시 준수)

| 원칙 | 설명 |
|------|------|
| ✅ **서버리스** | Cloudflare Pages + Functions만 사용 (백엔드 없음) |
| ✅ **비수탁형** | 사용자 자산은 항상 사용자 지갑에 보관 |
| ✅ **검증 가능한 공정성** | `Math.random()` 금지, Commit-Reveal 플로우만 허용 |
| ✅ **보안** | 하드코딩 금지, 모든 값은 환경 변수 또는 상수로 관리 |
| ✅ **기술 스택 고정** | **Lit + `@preact/signals` + `@tonconnect/ui` (NPM 번들링)** — 변경 금지 |

---

## 🛠️ 2. 기술 스택 (절대 변경 금지)

| 역할 | 기술 | 버전 | 비고 |
|------|------|------|------|
| 프레임워크 | **Lit** | `^3.1.0` | Web Components 기반 |
| 상태 관리 | **`@preact/signals`** | `^1.3.0` | 반응형 상태만 허용 |
| 지갑 UI | **`@tonconnect/ui`** | `^2.0.0` | **NPM 번들링 필수**, CDN/수동 링크 금지 |
| 다국어 | **`i18next` + `lit-i18n`** | `^23.0.0` + `^1.0.0` | ICU MessageFormat 사용 |
| 빌드 도구 | **Vite + esbuild + Terser** | `^5.0.0` | 프로덕션 빌드 최적화 |
| 배포 | **Cloudflare Pages** | — | 정적 사이트 |

> ⚠️ **React, Vue, Svelte, 순수 HTML, CDN, 수동 deep-link는 절대 사용 금지**

---

## 📁 3. 파일 구조 (총 6개 — 초과 금지)

```
candlespinner/
├── index.html
├── src/components/app-root.ts
├── public/tonconnect-manifest.json
├── package.json
├── vite.config.js
└── .gitignore
```

---

## 📦 4. 의존성 (`package.json`)

```json
{
  "name": "candlespinner",
  "version": "4.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "lit": "^3.1.0",
    "@preact/signals": "^1.3.0",
    "@tonconnect/ui": "^2.0.0",
    "i18next": "^23.0.0",
    "lit-i18n": "^1.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "esbuild": "^0.19.0",
    "terser": "^5.20.0"
  }
}
```

---

## ⚙️ 5. 빌드 설정 (`vite.config.js`)

```js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: { compress: { drop_console: true } },
    rollupOptions: { input: '/index.html' }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('4.0.0')
  }
});
```

---

## 🌐 6. TON Connect 매니페스트 (`public/tonconnect-manifest.json`)

```json
{
  "url": "https://aiandyou.me",
  "name": "CandleSpinner: The Galactic Casino",
  "iconUrl": "https://aiandyou.me/icon.png"
}
```

---

## 🏠 7. 진입점 (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CandleSpinner: The Galactic Casino</title>
</head>
<body>
  <app-root></app-root>
  <script type="module" src="/src/components/app-root.ts"></script>
</body>
</html>
```

---

## 🧠 8. 핵심 구현 (`src/components/app-root.ts`)

### 구현 지침:
1. **LitElement 상속** + **`LitI18nMixin` 적용**
2. **`@preact/signals`** 로 다음 상태 관리:
   - `walletAddress: string | null`
   - `balance: number` (DEV 모드: 1000)
   - `currentView: 'landing' | 'game'`
3. **`@tonconnect/ui` 초기화**:
   ```ts
   const tonConnectUI = new TonConnectUI({ manifestUrl: 'https://aiandyou.me/tonconnect-manifest.json' });
   ```
4. **`firstUpdated()`에서 `tonConnectUI.mount(container)` 호출**
5. **다국어 리소스**: en, ko, ja, zh-CN, zh-TW 지원
6. **슬롯머신**: CSS Grid 기반 5릴
7. **푸터**: `${i18next.t('version')}` → `v4.0.0` 출력
8. **개발자 모드**: `import.meta.env.DEV === true` 시 BOC 로깅 (프로덕션 제거)

> 💡 **BOC 생성 및 트랜잭션 플로우**는 추후 `transactionBuilder.ts`에서 구현 예정 — 현재는 스핀 버튼 클릭 시 `console.log('[DEV] Spin triggered')`만 출력

---

## 🚀 9. 배포 지침

1. GitHub 저장소 생성
2. 위 6개 파일 푸시
3. Cloudflare Pages 프로젝트 생성
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. 도메인: `aiandyou.me` 연결

---

## ✅ 10. 검증 체크리스트 (구현 후 반드시 확인)

- [ ] `@tonconnect/ui`가 **NPM으로 설치**되었는가?
- [ ] `tonConnectUI.mount()`가 **Lit shadow DOM 내부**에서 호출되는가?
- [ ] 언어 변경 시 **텍스트가 자동 갱신**되는가?
- [ ] 지갑 연결 성공 시 **랜딩 → 게임 뷰 전환**되는가?
- [ ] 푸터에 **`v4.0.0`** 표시되는가?
- [ ] 프로덕션 빌드 시 **`console.log` 제거**되는가?
- [ ] 파일 수가 **6개 이하**인가?

---

## 📌 최종 지시

> **이 문서를 유일한 기준으로 삼아, 위 6개 파일을 생성하고, 모든 기능을 요구사항대로 구현하라.**  
> **과거 코드, 외부 링크, 모호한 해석은 무시하고, 이 문서의 명령만 따를 것.**

---
