# Supabase 연동 완료 ✅

## 📋 완료된 작업

1. ✅ Supabase 클라이언트 설정 (`src/lib/supabase.ts`)
2. ✅ Transaction 서비스 레이어 생성 (`src/services/transactionService.ts`)
3. ✅ Budget 서비스 레이어 생성 (`src/services/budgetService.ts`)
4. ✅ 모든 페이지를 Supabase와 연동 (Home, Transactions, Reports, Budgets)

## 🚀 다음 단계

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하세요:

**방법 1: 파일 직접 생성**
- 프로젝트 루트(`d:\housebook`)에 `.env` 파일 생성
- 다음 내용을 복사하여 붙여넣기:

```
VITE_SUPABASE_URL=https://nxwdchadptzwplzhudvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2RjaGFkcHR6d3Bsemh1ZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzQ3NzgsImV4cCI6MjA4MjYxMDc3OH0.GQqumEcm6MMd5ZmXjSRdZL4jcc-uzlKMdKr2KpkbaCk
```

**방법 2: PowerShell 명령어**
```powershell
New-Item -Path .env -ItemType File -Force
Add-Content -Path .env -Value "VITE_SUPABASE_URL=https://nxwdchadptzwplzhudvn.supabase.co"
Add-Content -Path .env -Value "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2RjaGFkcHR6d3Bsemh1ZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzQ3NzgsImV4cCI6MjA4MjYxMDc3OH0.GQqumEcm6MMd5ZmXjSRdZL4jcc-uzlKMdKr2KpkbaCk"
```

### 2. 데이터베이스 테이블 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. `supabase_schema.sql` 파일의 내용을 복사하여 실행

또는 아래 SQL을 직접 실행:

```sql
-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories 테이블
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets 테이블
CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  month VARCHAR(7) NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  category_name VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, category_name)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
```

### 3. 테스트 사용자 생성 (선택사항)

SQL Editor에서 실행:

```sql
-- 테스트 사용자 생성
INSERT INTO users (email, password, name) 
VALUES ('test@example.com', 'hashed_password_here', '테스트 사용자')
ON CONFLICT (email) DO NOTHING;

-- 사용자 ID 확인 후 (예: 1), 기본 카테고리 추가
INSERT INTO categories (name, type, user_id, is_default) 
VALUES 
  ('식비', 'expense', 1, true),
  ('교통비', 'expense', 1, true),
  ('쇼핑', 'expense', 1, true),
  ('문화생활', 'expense', 1, true),
  ('의료비', 'expense', 1, true),
  ('통신비', 'expense', 1, true),
  ('생활비', 'expense', 1, true),
  ('기타', 'expense', 1, true),
  ('급여', 'income', 1, true),
  ('부수입', 'income', 1, true),
  ('용돈', 'income', 1, true),
  ('기타', 'income', 1, true)
ON CONFLICT DO NOTHING;
```

### 4. 현재 사용자 ID 설정

현재는 임시로 `localStorage`에 사용자 ID를 저장합니다.

브라우저 콘솔에서 실행하거나, 코드에서 설정:

```javascript
// 브라우저 콘솔에서 실행
localStorage.setItem('current_user_id', '1'); // 실제 사용자 ID로 변경
```

### 5. 개발 서버 재시작

`.env` 파일 생성 후 반드시 개발 서버를 재시작하세요:

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
npm run dev
```

## 🔍 확인 사항

1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수가 올바르게 설정되었는지 확인
3. Supabase 테이블이 생성되었는지 확인 (Table Editor에서)
4. 개발 서버가 정상적으로 시작되는지 확인

## ⚠️ 주의사항

1. **RLS (Row Level Security)**: 현재는 비활성화되어 있습니다. 프로덕션 환경에서는 활성화하고 적절한 정책을 설정하세요.
2. **비밀번호**: 실제 사용 시 비밀번호는 해시화되어야 합니다.
3. **사용자 ID**: 현재는 localStorage에 저장하는 임시 방식입니다. 인증 시스템 구현 시 변경 필요합니다.

## 🐛 문제 해결

### "Supabase URL과 Anon Key가 설정되지 않았습니다" 에러
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버를 재시작했는지 확인

### 데이터가 표시되지 않음
- Supabase 테이블이 생성되었는지 확인
- `current_user_id`가 localStorage에 설정되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### CORS 에러
- Supabase Dashboard → Settings → API → CORS 설정 확인
- 로컬 개발 도메인(`http://localhost:3000`)이 허용되어 있는지 확인

---

모든 설정이 완료되면 앱이 Supabase와 연동되어 동작합니다! 🎉

