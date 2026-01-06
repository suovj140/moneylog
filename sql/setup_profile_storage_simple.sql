-- 프로필 이미지 Storage 설정 (간단한 버전)
-- Supabase SQL Editor에서 실행하세요
-- 
-- ⚠️ 이 스크립트는 Public 버킷을 사용하는 경우를 위한 것입니다.
-- 버킷을 Public으로 설정했다면 이 정책만으로 충분합니다.

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public can read profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete profile images" ON storage.objects;

-- Public 버킷: 모든 사용자가 프로필 이미지를 읽을 수 있음
CREATE POLICY "Public can read profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- 개발/테스트 환경: 업로드 및 삭제 허용 (프로덕션에서는 더 엄격한 정책 필요)
-- ⚠️ 프로덕션에서는 사용자별 권한 검사를 추가해야 합니다
CREATE POLICY "Public can upload profile images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Public can delete profile images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'profile-images');



