-- ============================================
-- Supabase SQL Editor에서 바로 실행하세요!
-- 전체 복사 후 붙여넣기하면 됩니다.
-- ============================================

-- 1. 함수 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. 테이블 생성 (없으면 생성, 있으면 건너뛰기)
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. 제약 조건 추가 (없으면 추가)
DO $$
BEGIN
  -- amount 제약 조건
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_amount_check'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_amount_check CHECK (amount >= 0);
  END IF;

  -- type 제약 조건
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_type_check'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer'));
  END IF;

  -- date 제약 조건
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_date_check'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_date_check CHECK (date >= '2000-01-01' AND date <= '2100-12-31');
  END IF;
END $$;

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 6. 트리거 생성
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS 비활성화
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- 8. 테이블 생성 확인
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;



