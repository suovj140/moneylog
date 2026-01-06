# Vercel 배포 가이드

Vercel을 사용하여 GitHub에 업로드된 머니로그 프로젝트를 배포하는 방법입니다.

## 📋 사전 준비 사항

1. **GitHub 저장소**: 프로젝트가 GitHub에 업로드되어 있어야 합니다
2. **Vercel 계정**: [vercel.com](https://vercel.com)에서 계정 생성
3. **Supabase 설정**: 환경 변수 준비

## 🚀 배포 방법

### 방법 1: Vercel 웹 대시보드 사용 (권장)

#### 1단계: Vercel에 로그인

1. [vercel.com](https://vercel.com) 접속
2. "Sign Up" 또는 "Log In" 클릭
3. GitHub 계정으로 로그인 (권장)

#### 2단계: 새 프로젝트 생성

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 목록에서 `suovj140/moneylog` 선택
3. "Import" 클릭

#### 3단계: 프로젝트 설정

**프레임워크 설정:**
- Framework Preset: **Vite** 선택 (자동 감지될 수 있음)

**루트 디렉토리:**
- Root Directory: `./` (기본값 유지)

**빌드 설정:**
- Build Command: `npm run build` (기본값)
- Output Directory: `dist` (기본값)
- Install Command: `npm install` (기본값)

#### 4단계: 환경 변수 설정

**Environment Variables** 섹션에서 다음 변수들을 추가:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**각 환경별로 설정:**
- Production: 프로덕션용 Supabase URL과 키
- Preview: 프리뷰용 (선택사항)
- Development: 개발용 (선택사항)

**주의사항:**
- 실제 Supabase URL과 키를 입력하세요
- `.env` 파일의 값과 동일하게 설정하세요

#### 5단계: 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 및 배포 진행 상황 확인
3. 완료되면 배포 URL 확인 (예: `moneylog.vercel.app`)

### 방법 2: Vercel CLI 사용

#### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

#### 2단계: Vercel 로그인

```bash
vercel login
```

브라우저가 열리면 GitHub 계정으로 로그인

#### 3단계: 프로젝트 배포

프로젝트 루트 디렉토리에서:

```bash
vercel
```

첫 배포 시:
1. 프로젝트 이름 설정 (기본값: `housebook`)
2. 배포할 디렉토리 확인 (기본값: `./`)
3. 설정 파일 오버라이드 여부 (기본값: `N`)

#### 4단계: 환경 변수 설정

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

각 환경 변수 입력 시:
- Value: 실제 Supabase URL 또는 키 입력
- Environment: Production, Preview, Development 선택

#### 5단계: 프로덕션 배포

```bash
vercel --prod
```

## ⚙️ Vercel 프로젝트 설정

### 자동 배포 설정

Vercel은 기본적으로 GitHub 저장소와 연결되어 자동 배포됩니다:

- **Production**: `main` 브랜치에 푸시 시 자동 배포
- **Preview**: 다른 브랜치에 푸시 시 프리뷰 배포

### 커스텀 도메인 설정

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 설정

### 환경 변수 관리

**대시보드에서:**
1. 프로젝트 → Settings → Environment Variables
2. 변수 추가/수정/삭제
3. 각 환경별로 개별 설정 가능

**CLI에서:**
```bash
# 환경 변수 목록
vercel env ls

# 환경 변수 추가
vercel env add VARIABLE_NAME

# 환경 변수 삭제
vercel env rm VARIABLE_NAME
```

## 🔧 빌드 설정 최적화

### `vercel.json` 파일 생성 (선택사항)

프로젝트 루트에 `vercel.json` 파일을 생성하여 빌드 설정을 커스터마이징할 수 있습니다:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**설명:**
- `rewrites`: React Router를 위한 SPA 라우팅 설정
- 모든 경로를 `index.html`로 리다이렉트하여 클라이언트 사이드 라우팅 지원

## 📱 PWA 설정

Vercel은 PWA를 자동으로 지원합니다. `vite.config.ts`에 이미 PWA 설정이 되어 있으므로 추가 설정이 필요 없습니다.

## 🔍 배포 확인

### 배포 상태 확인

1. Vercel 대시보드 → 프로젝트 → Deployments
2. 각 배포의 상태 확인:
   - ✅ Ready: 배포 완료
   - ⏳ Building: 빌드 중
   - ❌ Error: 오류 발생

### 배포 로그 확인

배포 클릭 → "Build Logs" 탭에서 상세 로그 확인

### 오류 해결

**일반적인 오류:**

1. **빌드 실패**
   - `package.json`의 의존성 확인
   - Node.js 버전 확인 (Vercel은 자동으로 감지)

2. **환경 변수 오류**
   - 환경 변수가 올바르게 설정되었는지 확인
   - 변수 이름이 정확한지 확인 (`VITE_` 접두사 필수)

3. **라우팅 오류**
   - `vercel.json`의 `rewrites` 설정 확인
   - React Router 설정 확인

## 🔄 업데이트 배포

### 자동 배포

GitHub에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "Update: 변경사항"
git push
```

### 수동 재배포

Vercel 대시보드에서:
1. 프로젝트 → Deployments
2. 원하는 배포의 "..." 메뉴 → "Redeploy"

CLI에서:
```bash
vercel --prod
```

## 📊 성능 모니터링

Vercel 대시보드에서 다음 정보를 확인할 수 있습니다:

- **Analytics**: 페이지뷰, 방문자 수
- **Speed Insights**: 페이지 로딩 속도
- **Real User Monitoring**: 실제 사용자 경험 데이터

## 🔐 보안 고려사항

1. **환경 변수 보호**
   - Vercel 대시보드에서만 관리
   - GitHub에 `.env` 파일 커밋하지 않기 (이미 `.gitignore`에 포함됨)

2. **Supabase RLS**
   - Supabase의 Row Level Security 설정 확인
   - 프로덕션 환경에서 적절한 보안 정책 적용

## 📝 체크리스트

배포 전 확인사항:

- [ ] GitHub 저장소에 모든 파일 업로드 완료
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] Supabase 프로젝트 설정 완료
- [ ] 환경 변수 준비 완료
- [ ] `package.json`의 빌드 스크립트 확인
- [ ] `vite.config.ts` 설정 확인

## 🆘 문제 해결

### 빌드가 실패하는 경우

1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```

2. Vercel 빌드 로그 확인
3. Node.js 버전 확인 (Vercel은 자동 감지)

### 환경 변수가 작동하지 않는 경우

1. 변수 이름이 `VITE_`로 시작하는지 확인
2. Vercel 대시보드에서 변수가 올바르게 설정되었는지 확인
3. 배포 후 재배포 필요할 수 있음

### 라우팅이 작동하지 않는 경우

1. `vercel.json` 파일 생성 및 `rewrites` 설정
2. React Router의 `BrowserRouter` 사용 확인

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
- [React Router 배포](https://reactrouter.com/en/main/start/overview#deploying)

## 🎉 배포 완료 후

배포가 완료되면:

1. 배포 URL 확인 (예: `https://moneylog.vercel.app`)
2. 모든 기능이 정상 작동하는지 테스트
3. Supabase 연결 확인
4. 다국어 지원 확인
5. 반응형 디자인 확인

---

**축하합니다!** 머니로그가 성공적으로 배포되었습니다! 🚀

