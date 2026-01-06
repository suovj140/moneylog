# Supabase 설정 가이드

## 📋 Supabase 설정에 필요한 정보

Supabase를 설정하기 위해서는 다음 정보가 필요합니다:

### 1. Supabase 프로젝트 정보

Supabase 대시보드에서 다음 정보를 가져와야 합니다:

1. **Project URL** (예: `https://xxxxxxxxxxxxx.supabase.co`)
2. **API Key (anon/public)** (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. 정보 찾는 방법

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 (또는 새 프로젝트 생성)
3. 좌측 메뉴에서 **Settings** → **API** 클릭
4. 다음 정보를 확인:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public** 키: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **주의**: `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 4. 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 SQL을 실행하여 테이블을 생성하세요:

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
  type VARCHAR(50) NOT NULL, -- 'income' or 'expense'
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'income', 'expense', 'transfer'
  amount NUMERIC(15, 2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

⚠️ **참고**: RLS 정책은 Supabase Auth를 사용할 때 적용됩니다. 현재는 단순 인증을 사용하므로, RLS를 비활성화하거나 다른 방식으로 권한을 관리해야 할 수 있습니다.

### 5. 테이블 생성 확인

Supabase 대시보드에서:
1. **Table Editor** 메뉴 클릭
2. `users`, `categories`, `transactions` 테이블이 생성되었는지 확인

## 🔧 추가 설정 사항

### 데이터베이스 스키마 확인

현재 ERD에 따르면:
- `transactions.category`는 `varchar`로 직접 저장됩니다
- 향후 `categories` 테이블과 관계를 맺으려면 `category_id` 컬럼을 추가할 수 있습니다

### 기본 카테고리 데이터 삽입 (선택사항)

```sql
-- 기본 카테고리 데이터를 삽입하려면 (user_id는 실제 사용자 ID로 변경)
INSERT INTO categories (name, type, user_id, is_default) VALUES
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
  ('기타', 'income', 1, true);
```

## 📝 다음 단계

1. `.env` 파일 생성 및 설정
2. 데이터베이스 테이블 생성
3. 개발 서버 재시작 (`npm run dev`)
4. 앱에서 Supabase 연결 확인

## 🆘 문제 해결

### 환경 변수가 인식되지 않을 때
- Vite를 재시작하세요 (환경 변수 변경 후 서버 재시작 필요)
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 변수명이 `VITE_`로 시작하는지 확인

### CORS 오류가 발생할 때
- Supabase 대시보드에서 **Settings** → **API** → **CORS** 설정 확인
- 로컬 개발 도메인(`http://localhost:3000`)이 허용되어 있는지 확인

---

설정이 완료되면 이 정보를 알려주시면 코드 연동을 진행하겠습니다!

