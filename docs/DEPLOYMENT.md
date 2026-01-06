# 배포 가이드 (Deployment Guide)

## 목차
1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [GitHub 저장소 업로드](#github-저장소-업로드)
4. [배포 옵션](#배포-옵션)
   - [Vercel (추천)](#vercel-추천)
   - [Netlify](#netlify)
   - [GitHub Pages](#github-pages)
   - [Cloudflare Pages](#cloudflare-pages)
5. [환경 변수 설정](#환경-변수-설정)
6. [배포 후 확인사항](#배포-후-확인사항)

---

## 개요

이 프로젝트는 React + Vite 기반의 가계부 웹 애플리케이션입니다. 
Supabase를 백엔드로 사용하며, 무료로 배포할 수 있는 여러 플랫폼이 있습니다.

**추천 배포 플랫폼: Vercel** (가장 간단하고 빠름)

---

## 사전 준비

### 1. GitHub 저장소 준비
- GitHub 계정이 있어야 합니다
- 프로젝트를 Git으로 관리하고 있어야 합니다

### 2. Supabase 설정 확인
- Supabase 프로젝트가 생성되어 있어야 합니다
- `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY` 값을 알고 있어야 합니다

### 3. 프로젝트 빌드 테스트
```bash
npm install
npm run build
```
빌드가 성공적으로 완료되는지 확인하세요.

---

## GitHub 저장소 업로드

### 1. Git 초기화 (아직 안 했다면)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. GitHub 저장소 생성
1. GitHub.com에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `housebook`)
4. "Public" 또는 "Private" 선택
5. "Create repository" 클릭

### 3. 로컬 저장소를 GitHub에 연결
```bash
git remote add origin https://github.com/YOUR_USERNAME/housebook.git
git branch -M main
git push -u origin main
```

---

## 배포 옵션

### Vercel (추천) ⭐

**장점:**
- 무료 플랜 제공 (개인 프로젝트 충분)
- GitHub 자동 연동 및 자동 배포
- 매우 빠른 CDN
- 쉬운 환경 변수 설정
- 커스텀 도메인 지원 (무료)

**배포 과정:**

1. **Vercel 가입**
   - https://vercel.com 접속
   - "Sign Up" 클릭
   - GitHub 계정으로 로그인

2. **프로젝트 배포**
   - Dashboard에서 "Add New..." → "Project" 클릭
   - GitHub 저장소 선택 (`housebook`)
   - "Import" 클릭

3. **프로젝트 설정**
   - **Framework Preset**: Vite 선택
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `dist` (기본값)
   - **Install Command**: `npm install` (기본값)

4. **환경 변수 설정** (중요!)
   - "Environment Variables" 섹션에서 다음 추가:
     - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
     - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key
   - "Add" 클릭 후 "Deploy" 클릭

5. **배포 완료**
   - 몇 분 후 배포 완료
   - 자동 생성된 URL 확인 (예: `housebook.vercel.app`)
   - 이 URL을 사용자들에게 공유

**추가 설정:**
- 커스텀 도메인: Settings → Domains에서 도메인 추가 가능
- 자동 배포: GitHub에 push할 때마다 자동으로 재배포됨

---

### Netlify

**장점:**
- 무료 플랜 제공
- GitHub 자동 연동
- 쉬운 환경 변수 설정
- 폼 처리 기능 제공

**배포 과정:**

1. **Netlify 가입**
   - https://www.netlify.com 접속
   - "Sign up" 클릭
   - GitHub 계정으로 로그인

2. **프로젝트 배포**
   - Dashboard에서 "Add new site" → "Import an existing project" 클릭
   - GitHub 저장소 선택
   - "Connect to GitHub" 클릭 후 권한 허용
   - 저장소 선택 (`housebook`)

3. **빌드 설정**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - "Show advanced" 클릭

4. **환경 변수 설정**
   - "New variable" 클릭하여 추가:
     - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
     - `VITE_SUPABASE_ANON_KEY`: Supabase Anon Key
   - "Deploy site" 클릭

5. **배포 완료**
   - 자동 생성된 URL 확인 (예: `housebook.netlify.app`)
   - 이 URL을 사용자들에게 공유

---

### GitHub Pages

**장점:**
- 완전 무료
- GitHub와 통합
- 제한: SPA 라우팅 설정 필요

**배포 과정:**

1. **빌드 설정 수정**
   - `vite.config.ts`에 base 경로 추가 필요:
   ```typescript
   export default defineConfig({
     base: '/housebook/', // 저장소 이름
     plugins: [react()],
   })
   ```

2. **GitHub Actions 설정**
   - `.github/workflows/deploy.yml` 파일 생성:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         
         - name: Install dependencies
           run: npm install
         
         - name: Build
           run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
         
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **환경 변수 설정**
   - GitHub 저장소 → Settings → Secrets and variables → Actions
   - "New repository secret" 추가:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

4. **배포 활성화**
   - 저장소 Settings → Pages
   - Source: "GitHub Actions" 선택

5. **URL 확인**
   - `https://YOUR_USERNAME.github.io/housebook/` 형태로 접근 가능

---

### Cloudflare Pages

**장점:**
- 무료 플랜 제공
- 매우 빠른 CDN
- 무제한 대역폭

**배포 과정:**

1. **Cloudflare 가입**
   - https://pages.cloudflare.com 접속
   - "Sign up" 클릭
   - GitHub 계정으로 로그인

2. **프로젝트 배포**
   - "Create a project" 클릭
   - "Connect to Git" → GitHub 저장소 선택
   - 저장소 선택 (`housebook`)

3. **빌드 설정**
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

4. **환경 변수 설정**
   - "Environment variables" 섹션에서 추가:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - "Save and Deploy" 클릭

5. **배포 완료**
   - 자동 생성된 URL 확인 (예: `housebook.pages.dev`)

---

## 환경 변수 설정

모든 배포 플랫폼에서 다음 환경 변수를 설정해야 합니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon (공개) Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**중요:** 환경 변수는 배포 플랫폼의 설정 메뉴에서만 설정하면 됩니다. 
GitHub 저장소에 `.env` 파일을 올리지 마세요! (보안 위험)

---

## 배포 후 확인사항

### 1. 기본 기능 테스트
- [ ] 로그인/회원가입이 정상 작동하는지
- [ ] 거래 내역 추가/수정/삭제가 가능한지
- [ ] 사진 첨부 기능이 작동하는지
- [ ] 모든 화면이 정상적으로 표시되는지

### 2. Supabase Storage 확인
- [ ] `profile-images` 버킷이 생성되어 있는지
- [ ] `transaction-photos` 버킷이 생성되어 있는지
- [ ] Storage 정책이 올바르게 설정되어 있는지

### 3. 데이터베이스 확인
- [ ] 필요한 테이블이 모두 생성되어 있는지
  - `users`
  - `transactions`
  - `budgets`
  - `transaction_photos`
  - `auto_classification_rules` (선택사항)
  - `recurring_transactions` (선택사항)

### 4. 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 업로드 속도
- [ ] 모바일에서의 사용성

### 5. 보안 확인
- [ ] HTTPS가 활성화되어 있는지 (대부분 플랫폼 자동)
- [ ] 환경 변수가 올바르게 설정되었는지
- [ ] `.env` 파일이 GitHub에 커밋되지 않았는지

---

## 커스텀 도메인 설정 (선택사항)

### Vercel
1. Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 공급자에서 설정

### Netlify
1. Site settings → Domain management
2. "Add custom domain" 클릭
3. DNS 설정 안내에 따라 설정

---

## 자동 배포 설정

모든 플랫폼은 기본적으로 GitHub에 push할 때마다 자동으로 재배포됩니다.

**자동 배포 동작:**
- `main` 브랜치에 push → 프로덕션 배포
- Pull Request 생성 → 미리보기 배포

---

## 문제 해결

### 빌드 실패 시
1. 로컬에서 `npm run build` 테스트
2. 에러 메시지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 환경 변수 인식 안 됨
- 환경 변수는 반드시 `VITE_` 접두사가 필요합니다
- 배포 후 재배포가 필요할 수 있습니다
- 브라우저 캐시를 지우고 다시 시도

### 라우팅 문제 (404 오류)
- SPA이므로 모든 경로를 `index.html`로 리다이렉트해야 함
- Vercel/Netlify는 자동 처리
- GitHub Pages는 `_redirects` 파일 필요

### CORS 오류
- Supabase 설정에서 배포된 도메인을 허용 목록에 추가
- Supabase Dashboard → Settings → API → Additional Allowed Origins

---

## 추천 배포 플랫폼 비교

| 플랫폼 | 난이도 | 속도 | 자동 배포 | 커스텀 도메인 | 추천도 |
|--------|--------|------|-----------|---------------|--------|
| **Vercel** | ⭐ 매우 쉬움 | ⭐⭐⭐ 매우 빠름 | ✅ | ✅ 무료 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐⭐ 쉬움 | ⭐⭐⭐ 빠름 | ✅ | ✅ 무료 | ⭐⭐⭐⭐ |
| **Cloudflare Pages** | ⭐⭐ 쉬움 | ⭐⭐⭐ 매우 빠름 | ✅ | ✅ 무료 | ⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐⭐⭐ 보통 | ⭐⭐ 보통 | ✅ (Actions 설정 필요) | ❌ | ⭐⭐⭐ |

**결론: Vercel을 강력 추천합니다!**

---

## 다음 단계

1. 배포 완료 후 사용자들에게 URL 공유
2. 피드백 수집 및 개선
3. 필요시 커스텀 도메인 설정
4. Google Analytics 등 분석 도구 추가 (선택사항)

---

## 도움말

- Vercel 문서: https://vercel.com/docs
- Netlify 문서: https://docs.netlify.com
- Supabase 문서: https://supabase.com/docs
- 프로젝트 이슈: GitHub Issues에 문의

---

**배포 성공을 기원합니다! 🚀**


