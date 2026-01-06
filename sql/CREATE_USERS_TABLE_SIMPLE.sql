-- Users 테이블 생성 (간단 버전)
-- Supabase SQL Editor에서 이 스크립트를 실행하세요

-- 1단계: 기존 테이블이 있으면 삭제 (주의: 데이터가 모두 삭제됩니다)
DROP TABLE IF EXISTS users CASCADE;

-- 2단계: Users 테이블 생성
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0 NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- 제약 조건
  CONSTRAINT email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT password_length_check CHECK (LENGTH(password) >= 60),
  CONSTRAINT login_attempts_check CHECK (login_attempts >= 0 AND login_attempts <= 10)
);

-- 3단계: 인덱스 생성
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_login_at ON users(last_login_at);

-- 4단계: updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5단계: updated_at 트리거
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6단계: 권한 설정 (익명 사용자가 접근할 수 있도록)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 개발 단계: 모든 사용자가 접근 가능하도록 정책 설정
-- (프로덕션에서는 더 엄격한 정책이 필요합니다)
CREATE POLICY "Enable insert for authenticated users only" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for users based on email" ON users
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on email" ON users
    FOR UPDATE USING (true);

-- 확인: 테이블 생성 확인
SELECT 'Users 테이블이 성공적으로 생성되었습니다!' as message;
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

