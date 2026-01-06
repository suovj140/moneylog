# Supabase Transactions 테이블 설정 가이드

## ⚠️ 에러 해결: "Could not find the table 'public.transactions' in the schema cache"

이 에러는 Supabase에 `transactions` 테이블이 생성되지 않았거나, 생성되었지만 스키마 캐시가 업데이트되지 않았을 때 발생합니다.

## 해결 방법

### 1단계: update_updated_at_column() 함수 확인

먼저 `update_updated_at_column()` 함수가 존재하는지 확인하세요.

**Supabase SQL Editor**에서 다음 SQL을 실행:

```sql
-- 함수가 존재하는지 확인
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';
```

함수가 없으면 다음 SQL을 실행하여 생성:

```sql
-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 2단계: Transactions 테이블 생성

**Supabase SQL Editor**에서 다음 SQL을 실행:

```sql
-- Transactions 테이블 생성
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT transactions_amount_check CHECK (amount >= 0),
  CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer')),
  CONSTRAINT transactions_date_check CHECK (date >= '2000-01-01' AND date <= '2100-12-31')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE transactions IS '거래 내역 테이블';
COMMENT ON COLUMN transactions.id IS '거래 고유 식별자';
COMMENT ON COLUMN transactions.user_id IS '사용자 ID (FK)';
COMMENT ON COLUMN transactions.date IS '거래 날짜';
COMMENT ON COLUMN transactions.type IS '거래 유형 (income/expense/transfer)';
COMMENT ON COLUMN transactions.amount IS '거래 금액';
COMMENT ON COLUMN transactions.category IS '카테고리';
COMMENT ON COLUMN transactions.description IS '설명 (결제수단 + 메모)';
COMMENT ON COLUMN transactions.created_at IS '생성 일시';
COMMENT ON COLUMN transactions.updated_at IS '수정 일시';
```

### 3단계: 테이블 생성 확인

다음 SQL로 테이블이 생성되었는지 확인:

```sql
-- 테이블 확인
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
```

### 4단계: 스키마 캐시 새로고침

Supabase는 자동으로 스키마를 캐싱합니다. 테이블을 생성한 후:

1. **Supabase Dashboard**에서 **Table Editor** 클릭
2. 페이지 새로고침 (F5)
3. 좌측 메뉴에서 `transactions` 테이블이 보이는지 확인

### 5단계: RLS (Row Level Security) 확인 (선택사항)

개발 단계에서는 RLS를 비활성화하는 것을 권장합니다:

```sql
-- RLS 비활성화 (개발용)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

프로덕션 환경에서는 RLS를 활성화하고 정책을 설정해야 합니다:

```sql
-- RLS 활성화
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 거래만 조회/수정/삭제 가능
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

**참고**: 현재 애플리케이션은 Supabase Auth를 사용하지 않고 사용자 ID를 직접 관리하고 있으므로, 개발 단계에서는 RLS를 비활성화하는 것이 좋습니다.

## 문제 해결 체크리스트

- [ ] `update_updated_at_column()` 함수가 생성되었는지 확인
- [ ] `users` 테이블이 존재하는지 확인 (`transactions` 테이블이 `users` 테이블을 참조함)
- [ ] `transactions` 테이블이 생성되었는지 확인
- [ ] 인덱스가 생성되었는지 확인
- [ ] 트리거가 생성되었는지 확인
- [ ] Supabase Dashboard에서 테이블이 보이는지 확인
- [ ] 애플리케이션 재시작 (필요시)

## 추가 확인사항

### Users 테이블 확인

`transactions` 테이블은 `users` 테이블을 참조하므로, 먼저 `users` 테이블이 존재해야 합니다:

```sql
-- users 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'users';
```

테이블이 없으면 `supabase_users_table.sql` 파일을 먼저 실행하세요.

---

테이블 생성 후 애플리케이션을 새로고침하면 정상적으로 작동할 것입니다!

