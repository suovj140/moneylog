-- 자동 분류 규칙 및 반복 거래 기능을 위한 데이터베이스 스키마

-- 1. 자동 분류 규칙 테이블
CREATE TABLE IF NOT EXISTS auto_classification_rules (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('keyword', 'merchant', 'amount_range', 'composite')),
  priority INTEGER NOT NULL DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- 조건 (JSONB)
  conditions JSONB NOT NULL,
  
  -- 적용할 액션 (JSONB)
  actions JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_rule_priority UNIQUE (user_id, priority)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_auto_classification_rules_user_id ON auto_classification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_classification_rules_enabled ON auto_classification_rules(user_id, enabled, priority);

-- 2. 반복 거래 테이블
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  payment_method VARCHAR(100),
  memo TEXT,
  
  -- 반복 설정
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  frequency_options JSONB NOT NULL, -- 주기별 세부 옵션
  
  -- 기간 설정
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- 상태
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_generated_date DATE, -- 마지막 생성일
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_enabled ON recurring_transactions(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_dates ON recurring_transactions(user_id, start_date, end_date);

-- 3. 거래 테이블 확장
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_transaction_id BIGINT REFERENCES recurring_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS auto_classified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS applied_rule_id BIGINT REFERENCES auto_classification_rules(id) ON DELETE SET NULL;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(recurring_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_auto_generated ON transactions(user_id, is_auto_generated);

-- 4. 트리거: 거래당 최대 5장 제한 확인 (이미 transaction_photos 테이블이 있다면)
-- 이 부분은 transaction_photos 테이블이 있을 때만 필요합니다.


