// Supabase 테이블 생성 스크립트
// 이 스크립트는 직접 실행할 수 없지만, Supabase Dashboard에서 SQL을 실행하는 대신
// Node.js 환경에서 실행 가능한 형태로 제공합니다.

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nxwdchadptzwplzhudvn.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2RjaGFkcHR6d3Bsemh1ZHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzQ3NzgsImV4cCI6MjA4MjYxMDc3OH0.GQqumEcm6MMd5ZmXjSRdZL4jcc-uzlKMdKr2KpkbaCk';

const supabase = createClient(supabaseUrl, supabaseKey);

// 참고: Supabase REST API로는 DDL (CREATE TABLE 등)을 직접 실행할 수 없습니다.
// 이 스크립트는 참고용이며, 실제로는 Supabase Dashboard의 SQL Editor에서 실행해야 합니다.

console.log('⚠️  참고: Supabase REST API로는 테이블 생성(DDL)을 직접 실행할 수 없습니다.');
console.log('📝 아래 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요:\n');
console.log(`
-- Transactions 테이블 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
  
  CONSTRAINT transactions_amount_check CHECK (amount >= 0),
  CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer')),
  CONSTRAINT transactions_date_check CHECK (date >= '2000-01-01' AND date <= '2100-12-31')
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
`);



