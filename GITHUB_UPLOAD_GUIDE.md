# GitHub 업로드 가이드

## 1. Git 저장소 초기화

프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

```bash
git init
```

## 2. 모든 파일 추가 (.env 제외)

```bash
git add .
```

`.gitignore` 파일에 `.env` 파일이 이미 제외되어 있으므로, `.env` 파일은 자동으로 제외됩니다.

## 3. 첫 커밋 생성

```bash
git commit -m "Initial commit: MoneyLog project"
```

## 4. GitHub 저장소 생성

1. GitHub 웹사이트에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `moneylog` 또는 `housebook`)
4. Public 또는 Private 선택
5. **"Initialize this repository with a README" 체크하지 않기** (이미 README.md가 있으므로)
6. "Create repository" 클릭

## 5. 원격 저장소 연결

GitHub에서 생성한 저장소의 URL을 복사한 후:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

예시:
```bash
git remote add origin https://github.com/username/moneylog.git
```

## 6. 파일 업로드

```bash
git push -u origin main
```

또는 브랜치가 `master`인 경우:
```bash
git push -u origin master
```

## 확인 사항

업로드 전에 다음을 확인하세요:

✅ `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
✅ `.env.local`, `.env.production` 등 모든 환경 변수 파일이 제외되는지 확인
✅ `node_modules` 폴더가 제외되는지 확인
✅ `dist` 폴더가 제외되는지 확인

## .env.example 파일 생성 (선택사항)

다른 개발자들이 환경 변수 설정을 쉽게 할 수 있도록 `.env.example` 파일을 생성할 수 있습니다:

```bash
# .env.example 파일 생성
echo "VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" > .env.example
```

이 파일은 `.gitignore`에서 제외되어 있으므로 GitHub에 업로드됩니다.

## 문제 해결

### 이미 Git 저장소가 있는 경우
```bash
git status
```

### 특정 파일이 제외되지 않는 경우
```bash
# .env 파일이 이미 추적되고 있다면
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### 원격 저장소를 변경하는 경우
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
```

