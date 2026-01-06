-- ============================================
-- Transactions 테이블 생성 스크립트
-- ============================================
-- Supabase SQL Editor에서 이 전체 스크립트를 복사하여 실행하세요
-- ============================================

-- 1. update_updated_at_column() 함수 생성 (없는 경우)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. 기존 제약 조건 삭제 (있는 경우)
DO $$ 
BEGIN
  -- 테이블이 존재하면 제약 조건 삭제
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_amount_check;
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_date_check;
    ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check2;
  END IF;
END $$;

-- 3. Transactions 테이블 생성 (없으면 생성, 있으면 건너뛰기)
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
    AND conrelid = 'transactions'::regclass
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_amount_check CHECK (amount >= 0);
  END IF;

  -- type 제약 조건
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_type_check' 
    AND conrelid = 'transactions'::regclass
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer'));
  END IF;

  -- date 제약 조건
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_date_check' 
    AND conrelid = 'transactions'::regclass
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

-- 6. 트리거 생성 (기존 트리거 삭제 후 재생성)
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 7. 코멘트 추가
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

-- 8. RLS 비활성화 (개발용 - 필요시 활성화)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 테이블 생성 확인 (실행 후 결과 확인)
-- ============================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

