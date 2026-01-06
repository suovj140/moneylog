-- Transactions 테이블 생성
-- ⚠️ 주의: 이 SQL을 실행하기 전에 users 테이블이 생성되어 있어야 합니다.
-- ⚠️ 주의: update_updated_at_column() 함수가 있어야 합니다 (users 테이블 생성 시 함께 생성됨)

-- 기존 테이블이 있다면 삭제 (주의: 데이터가 모두 삭제됩니다!)
-- DROP TABLE IF EXISTS transactions CASCADE;

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

