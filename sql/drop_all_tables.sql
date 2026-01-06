-- Supabase 모든 테이블 삭제
-- ⚠️ 주의: 이 SQL은 모든 데이터를 영구적으로 삭제합니다!
-- Supabase SQL Editor에서 실행하세요

-- 1. 외래키 제약 조건 때문에 순서대로 삭제해야 합니다
-- (참조하는 테이블을 먼저 삭제)

-- Budgets 테이블 삭제 (categories를 참조)
DROP TABLE IF EXISTS budgets CASCADE;

-- Transactions 테이블 삭제 (users를 참조)
DROP TABLE IF EXISTS transactions CASCADE;

-- Categories 테이블 삭제 (users를 참조)
DROP TABLE IF EXISTS categories CASCADE;

-- Users 테이블 삭제
DROP TABLE IF EXISTS users CASCADE;

-- 2. 확인: 모든 테이블이 삭제되었는지 확인
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 결과가 비어있으면 모든 테이블이 삭제된 것입니다.

