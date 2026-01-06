# 거래 사진 기능 설정 가이드

거래 내역에 사진을 첨부하는 기능을 사용하기 위해 다음 단계를 수행해야 합니다.

## 1. 데이터베이스 테이블 생성

Supabase Dashboard의 SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- 거래 사진 테이블 생성
CREATE TABLE IF NOT EXISTS transaction_photos (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  thumbnail_path VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_transaction_photo_order UNIQUE (transaction_id, display_order)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transaction_photos_transaction_id ON transaction_photos(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_photos_user_id ON transaction_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_photos_created_at ON transaction_photos(created_at DESC);

-- 거래 테이블에 사진 개수 필드 추가 (선택사항)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_transactions_photo_count ON transactions(user_id, photo_count) WHERE photo_count > 0;
```

또는 `sql/setup_transaction_photos.sql` 파일의 내용을 복사하여 실행하세요.

## 2. Storage 버킷 생성

### Supabase Dashboard에서 버킷 생성

1. Supabase Dashboard 접속
2. 좌측 메뉴에서 **Storage** 클릭
3. **New bucket** 버튼 클릭
4. 다음 설정 입력:
   - **Name**: `transaction-photos`
   - **Public bucket**: **비활성화** (Private로 설정)
5. **Create bucket** 클릭

### 버킷 설정 확인

버킷이 생성된 후:

1. `transaction-photos` 버킷 클릭
2. **Settings** 탭 확인
3. 다음 설정 확인/변경:
   - **File size limit**: 10MB (또는 원하는 크기)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/jpg`

## 3. Storage 정책 설정

Supabase Dashboard의 SQL Editor에서 다음 SQL을 실행하세요:

```sql
-- Storage 정책: 사용자는 자신의 사진만 업로드 가능
CREATE POLICY IF NOT EXISTS "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-photos' AND
  (storage.foldername(name))[1]::bigint = auth.uid()::bigint
);

-- Storage 정책: 사용자는 자신의 사진만 조회 가능
CREATE POLICY IF NOT EXISTS "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transaction-photos' AND
  (storage.foldername(name))[1]::bigint = auth.uid()::bigint
);

-- Storage 정책: 사용자는 자신의 사진만 삭제 가능
CREATE POLICY IF NOT EXISTS "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'transaction-photos' AND
  (storage.foldername(name))[1]::bigint = auth.uid()::bigint
);
```

## 4. 확인 사항

설정이 완료되었는지 확인:

1. ✅ `transaction_photos` 테이블이 존재하는지 확인
2. ✅ `transaction-photos` Storage 버킷이 존재하는지 확인
3. ✅ Storage 정책이 제대로 설정되었는지 확인

## 5. 문제 해결

### "Bucket not found" 에러

- Supabase Dashboard > Storage에서 `transaction-photos` 버킷이 생성되었는지 확인
- 버킷 이름이 정확히 `transaction-photos`인지 확인 (대소문자 구분)

### "Permission denied" 에러

- Storage 정책이 제대로 설정되었는지 확인
- 사용자가 로그인되어 있는지 확인
- RLS (Row Level Security)가 활성화되어 있는지 확인

### "File too large" 에러

- 버킷 설정에서 파일 크기 제한을 확인
- 업로드하려는 이미지 파일이 10MB 이하인지 확인

## 참고

- 사진은 자동으로 압축되어 업로드됩니다
- 거래당 최대 5장까지 첨부 가능합니다
- 사진은 Private 버킷에 저장되며, 서명된 URL을 통해 접근합니다


