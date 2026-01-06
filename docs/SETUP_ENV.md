# 환경 변수 설정 가이드

`.env` 파일이 자동 생성되지 않았으므로, 수동으로 생성해주세요.

## 방법 1: 파일 직접 생성 (권장)

프로젝트 루트 디렉토리(`d:\housebook`)에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```
VITE_SUPABASE_URL=https://nxwdchadptzwplzhudvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2RjaGFkcHR6d3Bsemh1ZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzQ3NzgsImV4cCI6MjA4MjYxMDc3OH0.GQqumEcm6MMd5ZmXjSRdZL4jcc-uzlKMdKr2KpkbaCk
```

## 방법 2: PowerShell 명령어로 생성

PowerShell에서 다음 명령어를 실행하세요:

```powershell
@"
VITE_SUPABASE_URL=https://nxwdchadptzwplzhudvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2RjaGFkcHR6d3Bsemh1ZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzQ3NzgsImV4cCI6MjA4MjYxMDc3OH0.GQqumEcm6MMd5ZmXjSRdZL4jcc-uzlKMdKr2KpkbaCk
"@ | Out-File -FilePath .env -Encoding utf8
```

## 확인

`.env` 파일이 생성되었는지 확인하고, 개발 서버를 재시작하세요:

```bash
npm run dev
```

환경 변수 변경 후에는 반드시 개발 서버를 재시작해야 합니다!

