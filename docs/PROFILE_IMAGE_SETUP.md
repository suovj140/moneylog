# 프로필 이미지 Supabase Storage 설정 가이드

프로필 이미지를 Supabase Storage에 저장하도록 전환되었습니다. 다음 단계를 따라 설정하세요.

## 1. users 테이블에 컬럼 추가

Supabase SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- users 테이블에 profile_image_url 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 코멘트 추가
COMMENT ON COLUMN users.profile_image_url IS '프로필 이미지 URL (Supabase Storage 경로)';
```

또는 `add_profile_image_column.sql` 파일의 내용을 실행하세요.

## 2. Supabase Storage Bucket 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **Storage** 클릭
4. **Create a new bucket** 버튼 클릭
5. 다음 정보 입력:
   - **Name**: `profile-images`
   - **Public bucket**: ✅ 체크 (공개 버킷으로 설정)
   - **File size limit**: `5 MB` (또는 원하는 크기)
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
6. **Create bucket** 버튼 클릭

## 3. Storage 정책 설정

Storage 버킷을 생성한 후, 사용자가 자신의 프로필 이미지를 업로드/삭제할 수 있도록 정책을 설정해야 합니다.

### 3.1 Storage 정책 설정 (선택사항)

**현재 프로젝트는 Supabase Auth를 사용하지 않으므로**, Public 버킷으로 설정했다면 별도의 정책 설정 없이 사용할 수 있습니다.

만약 정책을 설정하려면 (권장하지 않음, Public 버킷 사용 권장):

```sql
-- 모든 사용자가 프로필 이미지를 읽을 수 있도록 정책 생성 (Public bucket)
CREATE POLICY "Public can read profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- 모든 사용자가 프로필 이미지를 업로드할 수 있도록 정책 생성 (개발용)
-- ⚠️ 프로덕션에서는 더 엄격한 정책이 필요합니다
CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile-images');

-- 모든 사용자가 프로필 이미지를 삭제할 수 있도록 정책 생성 (개발용)
-- ⚠️ 프로덕션에서는 더 엄격한 정책이 필요합니다
CREATE POLICY "Anyone can delete profile images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'profile-images');
```

**권장 사항**: Public 버킷으로 설정하고, 애플리케이션 레벨에서 권한 체크를 수행하는 것이 더 간단합니다. 
- 버킷을 Public으로 설정
- 정책은 설정하지 않음 (또는 Public 읽기만 허용)
- 업로드/삭제 권한은 애플리케이션 코드에서 사용자 인증 확인 후 처리

## 4. 개발 환경에서 테스트

현재 프로젝트는 localStorage 기반 인증을 사용하므로, Storage 정책은 Public 버킷으로 설정하면 바로 사용할 수 있습니다.

## 5. 확인

설정이 완료되었는지 확인:

1. 애플리케이션에서 프로필 이미지 업로드 테스트
2. Supabase Storage에서 파일이 업로드되었는지 확인
3. users 테이블에서 `profile_image_url` 컬럼에 URL이 저장되었는지 확인

## 주의사항

- 프로덕션 환경에서는 반드시 적절한 RLS 정책을 설정하세요
- 파일 크기 제한과 MIME 타입 제한을 설정하여 보안을 강화하세요
- 기존 localStorage에 저장된 프로필 이미지는 마이그레이션이 필요합니다 (선택사항)

