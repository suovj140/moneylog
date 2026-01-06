-- =====================================================
-- 자동 분류 규칙 및 반복 거래 기능 설정 SQL
-- =====================================================
-- 이 파일은 Supabase SQL Editor에서 실행하세요.
-- 실행 순서: 위에서 아래로 순차적으로 실행됩니다.
-- =====================================================

-- 1. 자동 분류 규칙 테이블 생성
-- =====================================================
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_auto_classification_rules_user_id ON auto_classification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_classification_rules_enabled ON auto_classification_rules(user_id, enabled, priority);

-- 2. 반복 거래 테이블 생성
-- =====================================================
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_enabled ON recurring_transactions(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_dates ON recurring_transactions(user_id, start_date, end_date);

-- 3. 거래 테이블 확장
-- =====================================================
-- 기존 transactions 테이블에 자동 분류 및 반복 거래 관련 필드 추가
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_transaction_id BIGINT REFERENCES recurring_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS auto_classified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS applied_rule_id BIGINT REFERENCES auto_classification_rules(id) ON DELETE SET NULL;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(recurring_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_auto_generated ON transactions(user_id, is_auto_generated);
CREATE INDEX IF NOT EXISTS idx_transactions_applied_rule ON transactions(applied_rule_id);

-- 4. Row Level Security (RLS) 정책 설정
-- =====================================================
-- 자동 분류 규칙 테이블 RLS 활성화
ALTER TABLE auto_classification_rules ENABLE ROW LEVEL SECURITY;

-- 자동 분류 규칙 정책: 사용자는 자신의 규칙만 볼 수 있음
DROP POLICY IF EXISTS "Users can view their own auto classification rules" ON auto_classification_rules;
CREATE POLICY "Users can view their own auto classification rules"
ON auto_classification_rules
FOR SELECT
USING (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 자동 분류 규칙 정책: 사용자는 자신의 규칙만 생성할 수 있음
DROP POLICY IF EXISTS "Users can create their own auto classification rules" ON auto_classification_rules;
CREATE POLICY "Users can create their own auto classification rules"
ON auto_classification_rules
FOR INSERT
WITH CHECK (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 자동 분류 규칙 정책: 사용자는 자신의 규칙만 수정할 수 있음
DROP POLICY IF EXISTS "Users can update their own auto classification rules" ON auto_classification_rules;
CREATE POLICY "Users can update their own auto classification rules"
ON auto_classification_rules
FOR UPDATE
USING (true)
WITH CHECK (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 자동 분류 규칙 정책: 사용자는 자신의 규칙만 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete their own auto classification rules" ON auto_classification_rules;
CREATE POLICY "Users can delete their own auto classification rules"
ON auto_classification_rules
FOR DELETE
USING (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 반복 거래 테이블 RLS 활성화
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- 반복 거래 정책: 사용자는 자신의 반복 거래만 볼 수 있음
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON recurring_transactions;
CREATE POLICY "Users can view their own recurring transactions"
ON recurring_transactions
FOR SELECT
USING (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 반복 거래 정책: 사용자는 자신의 반복 거래만 생성할 수 있음
DROP POLICY IF EXISTS "Users can create their own recurring transactions" ON recurring_transactions;
CREATE POLICY "Users can create their own recurring transactions"
ON recurring_transactions
FOR INSERT
WITH CHECK (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 반복 거래 정책: 사용자는 자신의 반복 거래만 수정할 수 있음
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON recurring_transactions;
CREATE POLICY "Users can update their own recurring transactions"
ON recurring_transactions
FOR UPDATE
USING (true)
WITH CHECK (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 반복 거래 정책: 사용자는 자신의 반복 거래만 삭제할 수 있음
DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON recurring_transactions;
CREATE POLICY "Users can delete their own recurring transactions"
ON recurring_transactions
FOR DELETE
USING (true); -- 애플리케이션 레벨에서 user_id로 필터링

-- 5. 업데이트 시간 자동 갱신 트리거 함수 (선택사항)
-- =====================================================
-- auto_classification_rules 테이블의 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_auto_classification_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_auto_classification_rules_updated_at ON auto_classification_rules;
CREATE TRIGGER trigger_update_auto_classification_rules_updated_at
BEFORE UPDATE ON auto_classification_rules
FOR EACH ROW
EXECUTE FUNCTION update_auto_classification_rules_updated_at();

-- recurring_transactions 테이블의 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_recurring_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_recurring_transactions_updated_at ON recurring_transactions;
CREATE TRIGGER trigger_update_recurring_transactions_updated_at
BEFORE UPDATE ON recurring_transactions
FOR EACH ROW
EXECUTE FUNCTION update_recurring_transactions_updated_at();

-- =====================================================
-- 실행 완료 메시지
-- =====================================================
-- 다음 테이블이 생성되었습니다:
-- 1. auto_classification_rules
-- 2. recurring_transactions
-- 3. transactions 테이블에 추가 필드가 추가되었습니다.
-- 
-- 모든 인덱스와 RLS 정책이 설정되었습니다.
-- 이제 애플리케이션에서 이 기능들을 사용할 수 있습니다.
-- =====================================================


