// src/App.tsx
// MVP 개발 준비 중입니다.
// PoC 코드는 PoC/ 폴더에 보존되어 있습니다.

import React from 'react';

function App() {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>CandleSpinner MVP</h1>
      <p>🚧 MVP 개발 준비 중입니다.</p>
      <p>PoC 코드는 <code>PoC/</code> 폴더에 보존되어 있습니다.</p>
      <p>📖 <a href="./PoC/docs/PoC-restoration-guide.md" target="_blank">PoC 복원 가이드 문서</a>도 참고하세요.</p>

      {/* ============================================
         PoC로 돌아가기 위한 방법 (자세한 가이드)
         ============================================

         방법 1: 터미널 명령어로 복원 (권장)
         -----------------------------------
         1. 터미널에서 프로젝트 루트로 이동
         2. 다음 명령어들을 순서대로 실행:

            ***REMOVED***src 폴더 복원
            cp -r PoC/src/* src/

            ***REMOVED***functions 폴더 생성 및 복원 (없으면 자동 생성)
            mkdir -p functions
            cp -r PoC/functions/* functions/

            ***REMOVED***docs 폴더 생성 및 복원 (없으면 자동 생성)
            mkdir -p docs
            cp -r PoC/docs/* docs/

         3. 의존성 설치 및 실행:
            npm install
            npm run dev

         방법 2: 수동 복사
         -----------------
         1. 파일 탐색기로 PoC 폴더 열기
         2. PoC/src/ 폴더의 모든 파일을 프로젝트 src/ 폴더로 복사
         3. PoC/functions/ 폴더의 모든 파일을 프로젝트 functions/ 폴더로 복사
         4. PoC/docs/ 폴더의 모든 파일을 프로젝트 docs/ 폴더로 복사
         5. npm install && npm run dev

         방법 3: 백업 ZIP 파일 사용 (안전 복원)
         -----------------------------------
         1. PoC/PoC보존-압축파일(2025.10.18.).zip 압축 해제
         2. 압축 해제된 폴더의 내용을 프로젝트 루트로 복사
         3. npm install && npm run dev

         주의사항:
         - MVP 개발 중인 코드를 덮어쓰지 않도록 백업하세요
         - 복원 후 tsconfig.json의 exclude 설정이 자동으로 적용됩니다
         - 문제가 발생하면 npm install을 다시 실행하세요

         ============================================ */}
    </div>
  );
}

export default App;
