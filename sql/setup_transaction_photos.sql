-- 거래 사진 기능을 위한 테이블 및 Storage 설정

-- 1. 거래 사진 테이블 생성
CREATE TABLE IF NOT EXISTS transaction_photos (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL, -- Supabase Storage 경로
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- 파일 크기 (bytes)
  mime_type VARCHAR(100) NOT NULL, -- image/jpeg, image/png 등
  thumbnail_path VARCHAR(500), -- 썸네일 경로 (선택사항)
  display_order INTEGER NOT NULL DEFAULT 0, -- 사진 표시 순서
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_transaction_photo_order UNIQUE (transaction_id, display_order)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_transaction_photos_transaction_id ON transaction_photos(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_photos_user_id ON transaction_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_photos_created_at ON transaction_photos(created_at DESC);

-- 2. 거래 테이블에 사진 개수 필드 추가 (선택사항)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_transactions_photo_count ON transactions(user_id, photo_count) WHERE photo_count > 0;

-- 3. Storage 버킷 생성 (수동으로 Supabase Dashboard에서 생성 필요)
-- 버킷명: transaction-photos
-- 공개 여부: private
-- 파일 크기 제한: 10MB
-- 허용된 MIME 타입: image/jpeg, image/png, image/webp

-- 4. Storage 정책 설정
-- 기존 정책이 있으면 삭제 후 재생성
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Storage 정책 설정
-- 주의: 현재 앱은 자체 인증 시스템을 사용하므로, 
--       Storage 정책은 기본적인 보안만 제공하고 실제 권한 검사는 앱 코드에서 처리합니다.
--       RLS가 활성화되어 있으면 정책이 필요합니다.

-- Storage 정책: transaction-photos 버킷에 대한 모든 작업 허용
-- (실제 권한 검사는 앱 코드에서 user_id를 확인하여 처리)
CREATE POLICY "Allow all operations on transaction-photos bucket"
ON storage.objects
FOR ALL
USING (bucket_id = 'transaction-photos')
WITH CHECK (bucket_id = 'transaction-photos');

-- 참고: 
-- 1. Supabase Dashboard > Storage에서 'transaction-photos' 버킷을 수동으로 생성해야 합니다.
-- 2. 버킷 설정:
--    - 공개 여부: Private
--    - 파일 크기 제한: 10MB
--    - 허용된 MIME 타입: image/jpeg, image/png, image/webp
-- 3. RLS 정책이 자동으로 적용됩니다.

