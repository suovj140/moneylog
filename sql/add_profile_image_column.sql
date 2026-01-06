-- users 테이블에 profile_image_url 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 코멘트 추가
COMMENT ON COLUMN users.profile_image_url IS '프로필 이미지 URL (Supabase Storage 경로)';



