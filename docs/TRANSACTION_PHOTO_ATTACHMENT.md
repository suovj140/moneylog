# 거래 내역 사진 첨부 기능 설계 문서

## 📋 목차
1. [기능 개요](#기능-개요)
2. [요구사항](#요구사항)
3. [데이터베이스 스키마](#데이터베이스-스키마)
4. [스토리지 설계](#스토리지-설계)
5. [API 설계](#api-설계)
6. [UI/UX 설계](#uiux-설계)
7. [구현 단계](#구현-단계)
8. [기술적 고려사항](#기술적-고려사항)

---

## 기능 개요

거래 내역에 최대 5장의 사진을 첨부할 수 있는 기능입니다. 사진은 거래 내역 생성 시 첨부하거나, 기존 거래 내역을 수정할 때 추가/삭제할 수 있습니다.

### 주요 기능
- ✅ 거래 내역당 최대 5장의 사진 첨부
- ✅ 거래 내역 생성 시 사진 첨부
- ✅ 거래 내역 수정 시 사진 추가/삭제/교체
- ✅ 모바일: 카메라로 사진 촬영 또는 갤러리에서 선택
- ✅ PC: 파일 선택으로 사진 업로드
- ✅ 사진 미리보기 및 삭제
- ✅ 사진 크기 제한 및 압축

---

## 요구사항

### 기능 요구사항
1. **사진 개수 제한**: 거래 내역당 최대 5장
2. **사진 크기 제한**: 개당 최대 10MB (업로드 전 자동 압축)
3. **지원 형식**: JPG, PNG, WEBP
4. **업로드 방식**:
   - 모바일: 카메라 촬영 또는 갤러리 선택
   - PC: 파일 선택 다이얼로그
5. **사진 관리**: 
   - 업로드된 사진 미리보기
   - 개별 사진 삭제
   - 거래 내역 삭제 시 관련 사진도 함께 삭제

### 비기능 요구사항
1. **성능**: 사진 업로드는 비동기 처리, 로딩 인디케이터 표시
2. **보안**: 사용자별 사진 접근 권한 제어
3. **저장소**: Supabase Storage 사용
4. **비용**: 무료 플랜은 최대 5장, 프리미엄 플랜은 무제한

---

## 데이터베이스 스키마

### 1. 거래 사진 테이블 (`transaction_photos`)

```sql
CREATE TABLE transaction_photos (
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
CREATE INDEX idx_transaction_photos_transaction_id ON transaction_photos(transaction_id);
CREATE INDEX idx_transaction_photos_user_id ON transaction_photos(user_id);
CREATE INDEX idx_transaction_photos_created_at ON transaction_photos(created_at DESC);

-- 트리거: 거래당 최대 5장 제한 확인
CREATE OR REPLACE FUNCTION check_photo_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM transaction_photos WHERE transaction_id = NEW.transaction_id) >= 5 THEN
    RAISE EXCEPTION '거래당 최대 5장의 사진만 첨부할 수 있습니다.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_photo_limit
  BEFORE INSERT ON transaction_photos
  FOR EACH ROW
  EXECUTE FUNCTION check_photo_limit();
```

### 2. 거래 테이블 확장 (선택사항)

`transactions` 테이블에 사진 개수 필드 추가 (성능 최적화용):

```sql
ALTER TABLE transactions
ADD COLUMN photo_count INTEGER DEFAULT 0;

-- 인덱스
CREATE INDEX idx_transactions_photo_count ON transactions(user_id, photo_count) WHERE photo_count > 0;
```

---

## 스토리지 설계

### Supabase Storage 구조

```
transaction-photos/
  └── {user_id}/
      └── {transaction_id}/
          ├── {photo_id}_original.jpg
          ├── {photo_id}_thumbnail.jpg (선택사항)
          └── ...
```

### Storage 버킷 생성

```sql
-- Supabase Dashboard에서 수동으로 생성하거나
-- 또는 Storage API를 통해 생성

-- 버킷명: transaction-photos
-- 공개 여부: private (인증된 사용자만 접근)
-- 파일 크기 제한: 10MB
-- 허용된 MIME 타입: image/jpeg, image/png, image/webp
```

### Storage 정책 설정

```sql
-- Storage 정책: 사용자는 자신의 사진만 업로드 가능
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage 정책: 사용자는 자신의 사진만 조회 가능
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'transaction-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage 정책: 사용자는 자신의 사진만 삭제 가능
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'transaction-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## API 설계

### 1. 사진 목록 조회

```
GET /api/transactions/:transactionId/photos
Response: TransactionPhoto[]
```

**응답 예시:**
```json
[
  {
    "id": "1",
    "transactionId": "123",
    "userId": "456",
    "filePath": "transaction-photos/456/123/1_original.jpg",
    "fileName": "receipt.jpg",
    "fileSize": 524288,
    "mimeType": "image/jpeg",
    "thumbnailPath": "transaction-photos/456/123/1_thumbnail.jpg",
    "displayOrder": 0,
    "url": "https://...", // 서명된 URL
    "thumbnailUrl": "https://..." // 서명된 URL
  }
]
```

### 2. 사진 업로드

```
POST /api/transactions/:transactionId/photos
Content-Type: multipart/form-data
Body: {
  file: File,
  displayOrder?: number
}
Response: TransactionPhoto
```

### 3. 사진 삭제

```
DELETE /api/transactions/:transactionId/photos/:photoId
Response: { success: true }
```

### 4. 사진 순서 변경

```
PATCH /api/transactions/:transactionId/photos/:photoId/order
Body: {
  displayOrder: number
}
Response: TransactionPhoto
```

---

## UI/UX 설계

### 거래 내역 추가/수정 모달

#### PC 화면

```
┌─────────────────────────────────────┐
│  거래 내역 추가                     │
├─────────────────────────────────────┤
│  유형: [수입 ▼] [지출 ▼]           │
│  금액: [________] 원                │
│  카테고리: [식품 ▼]                │
│  결제수단: [카드 ▼]                │
│  날짜: [2026-01-15]                │
│  메모: [________________]           │
│                                     │
│  첨부 사진 (최대 5장)               │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ [X] │ │ [X] │ │ [+] │          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  [취소] [저장]                     │
└─────────────────────────────────────┘
```

#### 모바일 화면

```
┌─────────────────────────────────────┐
│  거래 내역 추가                     │
├─────────────────────────────────────┤
│  유형: [수입 ▼] [지출 ▼]           │
│  금액: [________] 원                │
│  카테고리: [식품 ▼]                │
│  결제수단: [카드 ▼]                │
│  날짜: [2026-01-15]                │
│  메모: [________________]           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 첨부 사진 (0/5)                │ │
│  │                               │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐      │ │
│  │ │ [X] │ │ [X] │ │     │      │ │
│  │ └─────┘ └─────┘ └─────┘      │ │
│  │                               │ │
│  │     ┌───────────────┐        │ │
│  │     │  📷 사진 추가  │        │ │
│  │     └───────────────┘        │ │
│  └───────────────────────────────┘ │
│                                     │
│  [취소]           [저장]           │
└─────────────────────────────────────┘
```

### 사진 추가 버튼 클릭 시 (모바일)

```
┌─────────────────────────────────────┐
│  사진 추가 방법 선택                │
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────┐              │
│     │  📷 카메라로   │              │
│     │    촬영하기    │              │
│     └───────────────┘              │
│                                     │
│     ┌───────────────┐              │
│     │  🖼️ 갤러리에서 │              │
│     │    선택하기    │              │
│     └───────────────┘              │
│                                     │
│         [취소]                      │
└─────────────────────────────────────┘
```

### 사진 미리보기 컴포넌트

```typescript
interface PhotoPreviewProps {
  photo: TransactionPhoto;
  onDelete: (photoId: string) => void;
  onReorder?: (photoId: string, newOrder: number) => void;
  isDeletable?: boolean;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  onDelete,
  isDeletable = true
}) => {
  return (
    <div className="photo-preview">
      <img src={photo.thumbnailUrl || photo.url} alt={photo.fileName} />
      {isDeletable && (
        <button 
          className="photo-delete-btn"
          onClick={() => onDelete(photo.id)}
          aria-label="사진 삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
};
```

---

## 구현 단계

### Phase 1: 데이터베이스 및 스토리지 설정 (1주)

1. ✅ `transaction_photos` 테이블 생성
2. ✅ Supabase Storage 버킷 생성 및 정책 설정
3. ✅ TypeScript 인터페이스 정의
4. ✅ 사진 개수 제한 트리거 생성

### Phase 2: 서비스 레이어 구현 (1주)

1. ✅ `transactionPhotoService.ts` 생성
   - 사진 업로드 함수
   - 사진 목록 조회 함수
   - 사진 삭제 함수
   - 사진 순서 변경 함수
   - 서명된 URL 생성 함수

2. ✅ 사진 업로드 유틸리티
   - 이미지 압축 함수 (browser-image-compression 라이브러리)
   - 파일 형식 검증
   - 파일 크기 검증

### Phase 3: UI 컴포넌트 구현 (1주)

1. ✅ `PhotoUpload` 컴포넌트
   - PC: 파일 선택
   - 모바일: 카메라/갤러리 선택

2. ✅ `PhotoPreviewList` 컴포넌트
   - 사진 그리드 표시
   - 삭제 버튼
   - 드래그 앤 드롭으로 순서 변경 (선택사항)

3. ✅ `TransactionModal` 통합
   - 사진 업로드 UI 추가
   - 사진 목록 표시
   - 거래 저장 시 사진 업로드 처리

### Phase 4: 거래 상세 화면 통합 (3일)

1. ✅ 거래 내역 상세 보기에서 사진 표시
2. ✅ 거래 내역 수정 시 사진 추가/삭제
3. ✅ 거래 내역 삭제 시 관련 사진 자동 삭제

### Phase 5: 최적화 및 테스트 (3일)

1. ✅ 이미지 압축 최적화
2. ✅ 업로드 진행률 표시
3. ✅ 에러 처리 및 사용자 피드백
4. ✅ 모바일 성능 최적화

**총 예상 개발 기간**: 약 3-4주

---

## 기술적 고려사항

### 1. 이미지 압축

#### 라이브러리 선택
- **browser-image-compression**: 브라우저에서 이미지 압축 (권장)
- 클라이언트 측 압축으로 서버 부하 감소
- 업로드 시간 단축

```typescript
import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // 최대 1MB로 압축
    maxWidthOrHeight: 1920, // 최대 해상도
    useWebWorker: true, // 웹 워커 사용으로 UI 블로킹 방지
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('이미지 압축 실패:', error);
    throw error;
  }
}
```

### 2. 썸네일 생성

#### 옵션 A: 클라이언트 측 썸네일 생성 (권장)
- 브라우저에서 썸네일 생성 후 업로드
- 서버 리소스 절약
- 즉시 미리보기 가능

```typescript
async function generateThumbnail(file: File, maxWidth: number = 200): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `thumbnail_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(thumbnailFile);
          } else {
            reject(new Error('썸네일 생성 실패'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

#### 옵션 B: 서버 측 썸네일 생성
- Supabase Edge Function 또는 외부 서비스 사용
- 더 많은 서버 리소스 필요

### 3. 업로드 진행률 표시

```typescript
const uploadPhoto = async (file: File, transactionId: string) => {
  const compressedFile = await compressImage(file);
  const thumbnailFile = await generateThumbnail(compressedFile);

  // 업로드 진행률 추적
  const uploadProgress = { loaded: 0, total: compressedFile.size };
  
  const { data, error } = await supabase.storage
    .from('transaction-photos')
    .upload(`${userId}/${transactionId}/${photoId}_original.jpg`, compressedFile, {
      cacheControl: '3600',
      upsert: false,
      onUploadProgress: (progress) => {
        uploadProgress.loaded = progress.loaded;
        uploadProgress.total = progress.total;
        // 진행률 업데이트 (상태 관리 라이브러리 사용)
        setUploadProgress((progress.loaded / progress.total) * 100);
      },
    });

  // 썸네일 업로드
  await supabase.storage
    .from('transaction-photos')
    .upload(`${userId}/${transactionId}/${photoId}_thumbnail.jpg`, thumbnailFile);
};
```

### 4. 모바일 카메라 접근

```typescript
// React Native 또는 PWA에서 카메라 접근
const handleCameraCapture = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // 카메라 스트림 처리
  } catch (error) {
    console.error('카메라 접근 실패:', error);
    alert('카메라 접근 권한이 필요합니다.');
  }
};

// 또는 파일 입력으로 카메라 접근
<input
  type="file"
  accept="image/*"
  capture="environment" // 후면 카메라 (모바일)
  onChange={handleFileSelect}
/>
```

### 5. 서명된 URL 생성 및 캐싱

```typescript
// 서명된 URL 생성 (1시간 유효)
const getSignedUrl = async (filePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('transaction-photos')
    .createSignedUrl(filePath, 3600); // 1시간

  if (error) throw error;
  return data.signedUrl;
};

// URL 캐싱 (메모리 또는 localStorage)
const photoUrlCache = new Map<string, { url: string; expiresAt: number }>();

const getCachedSignedUrl = async (filePath: string): Promise<string> => {
  const cached = photoUrlCache.get(filePath);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const url = await getSignedUrl(filePath);
  photoUrlCache.set(filePath, {
    url,
    expiresAt: Date.now() + 3600000, // 1시간
  });

  return url;
};
```

### 6. 성능 최적화

- **지연 로딩**: 사진 목록은 스크롤 시 로드
- **이미지 최적화**: WebP 형식 지원, 적절한 해상도
- **캐싱**: 서명된 URL 캐싱으로 API 호출 감소
- **배치 업로드**: 여러 사진을 동시에 업로드 (Promise.all)

### 7. 에러 처리

```typescript
const handlePhotoUpload = async (file: File) => {
  try {
    // 파일 검증
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('이미지 파일만 업로드할 수 있습니다.');
    }

    // 업로드
    await uploadPhoto(file, transactionId);
  } catch (error) {
    console.error('사진 업로드 실패:', error);
    
    // 사용자 친화적인 에러 메시지
    if (error.message.includes('5장')) {
      alert('거래당 최대 5장의 사진만 첨부할 수 있습니다.');
    } else if (error.message.includes('크기')) {
      alert('파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.');
    } else {
      alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
    }
  }
};
```

---

## 예상 비용 분석

### Supabase Storage 비용

#### 무료 플랜
- 저장 용량: 1GB
- 전송량: 2GB/월

#### 사용자당 예상 사용량
- 사진당 평균 크기: 1MB (압축 후)
- 사용자당 평균 거래 수: 50건/월
- 거래당 평균 사진 수: 2장
- 사용자당 월간 사용량: 50 × 2 × 1MB = 100MB

#### 100명 기준
- 월간 저장 용량: 100명 × 100MB = 10GB
- 월간 전송량: 약 5GB (조회 시)

**결론**: 초기에는 무료 플랜으로 충분하나, 사용자 증가 시 유료 플랜 필요 (1GB 추가당 $0.021/월)

---

## 보안 고려사항

1. **접근 권한**: 사용자는 자신의 사진만 접근 가능 (Storage 정책으로 제어)
2. **파일 검증**: 업로드 전 파일 형식 및 크기 검증
3. **악성 코드 방지**: 이미지 파일만 허용, 실행 파일 차단
4. **CORS 설정**: 허용된 도메인에서만 접근 가능하도록 설정

---

## 참고 자료

- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [browser-image-compression 라이브러리](https://www.npmjs.com/package/browser-image-compression)
- [File API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MediaDevices.getUserMedia (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

---

**작성일**: 2026-01-XX  
**버전**: 1.0.0


