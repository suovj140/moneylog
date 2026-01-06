# 영수증 OCR 자동 등록 기능 설계 문서

## 📋 목차
1. [기능 개요](#기능-개요)
2. [요구사항](#요구사항)
3. [OCR 서비스 비교](#ocr-서비스-비교)
4. [권장 솔루션](#권장-솔루션)
5. [기술 스택](#기술-스택)
6. [데이터 파싱 로직](#데이터-파싱-로직)
7. [API 설계](#api-설계)
8. [UI/UX 설계](#uiux-설계)
9. [구현 단계](#구현-단계)
10. [비용 분석](#비용-분석)
11. [보안 고려사항](#보안-고려사항)

---

## 기능 개요

영수증 사진을 찍거나 업로드하면 OCR(Optical Character Recognition) 기술을 사용하여 자동으로 거래 내역 정보를 추출하고 거래 내역을 자동으로 등록하는 기능입니다.

### 주요 기능
- 📸 영수증 사진 촬영 또는 업로드
- 🔍 OCR을 통한 영수증 텍스트 추출
- 🤖 AI 기반 정보 파싱 (날짜, 가맹점, 금액, 카테고리 등)
- ✅ 자동 거래 내역 생성 (사용자 확인 후 저장)
- ✏️ 추출된 정보 수정 가능
- 💾 영수증 사진 자동 첨부

---

## 요구사항

### 기능 요구사항
1. **영수증 인식**: 
   - 가맹점명 추출
   - 날짜/시간 추출
   - 총 금액 추출
   - 상품 목록 추출 (선택사항)
   - 결제수단 추출 (카드, 현금 등)

2. **자동 분류**:
   - 가맹점명 기반 카테고리 자동 분류
   - 금액 범위 기반 카테고리 추천
   - 기존 자동 분류 규칙 활용

3. **사용자 확인**:
   - 추출된 정보 확인 및 수정 가능
   - 저장 전 최종 확인

4. **에러 처리**:
   - OCR 실패 시 재시도 옵션
   - 추출 실패 시 수동 입력 유도

### 비기능 요구사항
1. **성능**: OCR 처리 시간 3-5초 이내
2. **정확도**: 주요 정보(금액, 날짜, 가맹점) 추출 정확도 90% 이상
3. **보안**: 영수증 이미지는 암호화되어 전송 및 저장
4. **비용**: 초기에는 무료 플랜 활용, 이후 사용량에 따라 유료 전환

---

## OCR 서비스 비교

### 1. Naver Clova OCR (권장 ⭐)

**장점:**
- ✅ 한국어 영수증에 최적화
- ✅ 한국 가맹점명 인식 성능 우수
- ✅ 국내 서비스로 응답 속도 빠름
- ✅ 합리적인 가격
- ✅ 무료 플랜 제공 (월 1,000건)

**단점:**
- ❌ 한국어 중심 (다국어 지원 제한적)
- ❌ 글로벌 서비스 확장 시 제한적

**가격:**
- 무료: 월 1,000건
- 유료: 1,000건 초과 시 건당 15원

**API 문서**: [Naver Clova OCR](https://www.ncloud.com/product/aiService/ocr)

### 2. Google Cloud Vision API

**장점:**
- ✅ 다양한 언어 지원
- ✅ 높은 정확도
- ✅ 글로벌 서비스에 적합

**단점:**
- ❌ 한국어 영수증 특화 기능 부족
- ❌ 비용이 상대적으로 높음
- ❌ 국내 응답 속도 느릴 수 있음

**가격:**
- 월 1,000건까지 무료
- 이후 1,000-5,000,000건: $1.50 per 1,000 requests

### 3. AWS Textract

**장점:**
- ✅ 강력한 문서 분석 기능
- ✅ 표 형식 데이터 추출 우수
- ✅ 글로벌 서비스에 적합

**단점:**
- ❌ 한국어 영수증 특화 기능 부족
- ❌ 설정 및 통합 복잡도 높음
- ❌ 비용이 높음

**가격:**
- 첫 1,000건: 무료
- 이후 1,000-1,000,000건: $1.50 per 1,000 pages

### 4. Tesseract OCR (오픈소스)

**장점:**
- ✅ 무료 (오픈소스)
- ✅ 자체 서버에서 실행 가능
- ✅ 데이터 프라이버시 보장

**단점:**
- ❌ 설정 및 유지보수 복잡
- ❌ 정확도가 상용 서비스 대비 낮음
- ❌ 한국어 영수증 인식 성능 제한적
- ❌ 서버 리소스 필요

### 5. Kakao OCR (Kakao i Cloud)

**장점:**
- ✅ 한국어 최적화
- ✅ 국내 서비스
- ✅ 합리적인 가격

**단점:**
- ❌ 문서화가 상대적으로 부족
- ❌ 지원 범위 제한적

**가격:**
- 무료: 월 1,000건
- 유료: 건당 10-15원

---

## 권장 솔루션

### 🏆 1순위: Naver Clova OCR

**선택 이유:**
1. **한국어 최적화**: 한국 가맹점명, 날짜 형식 등에 특화
2. **비용 효율성**: 무료 플랜(월 1,000건) + 저렴한 유료 플랜
3. **빠른 응답**: 국내 서버로 응답 속도 빠름
4. **사용 편의성**: API 사용이 간단하고 문서화 잘 되어 있음

**적용 시나리오:**
- 초기 런칭: 무료 플랜으로 시작 (월 1,000건)
- 사용자 증가 시: 유료 플랜 전환 또는 하이브리드 방식

### 2순위: Google Cloud Vision API (글로벌 확장 시)

**선택 이유:**
- 다국어 지원이 필요한 경우
- 글로벌 서비스 확장 시

---

## 기술 스택

### 프론트엔드
- **React**: 기존 프레임워크 활용
- **File API**: 이미지 파일 처리
- **Camera API**: 모바일 카메라 접근

### 백엔드
- **Supabase Edge Functions**: 서버리스 함수로 OCR API 호출
  - API 키 보안 (클라이언트에 노출 방지)
  - 이미지 전처리 (리사이징, 압축)
  - OCR 결과 후처리

### OCR 서비스
- **Naver Clova OCR**: 영수증 텍스트 추출

### 추가 라이브러리
- **browser-image-compression**: 이미지 압축 (OCR 전)
- **date-fns**: 날짜 파싱 및 포맷팅
- **정규식 (RegExp)**: 텍스트 패턴 매칭

---

## 데이터 파싱 로직

### OCR 결과 예시

```json
{
  "images": [
    {
      "receipt": {
        "result": {
          "storeInfo": {
            "name": "스타벅스 강남점",
            "subName": "TEL: 02-1234-5678",
            "addresses": []
          },
          "paymentInfo": {
            "date": "2026.01.15",
            "time": "14:30",
            "cardInfo": {
              "type": "신용카드",
              "number": "1234-****-****-5678"
            },
            "totalPrice": {
              "price": "15000"
            }
          },
          "subResults": [
            {
              "items": [
                {"name": "아메리카노", "count": "2", "price": "9000"},
                {"name": "카페라떼", "count": "1", "price": "6000"}
              ]
            }
          ]
        }
      }
    }
  ]
}
```

### 파싱 로직

#### 1. 가맹점명 추출
```typescript
function extractMerchantName(ocrResult: any): string {
  const storeInfo = ocrResult.images[0]?.receipt?.result?.storeInfo;
  return storeInfo?.name?.value || '';
}
```

#### 2. 날짜 추출
```typescript
import { parse, format } from 'date-fns';

function extractDate(ocrResult: any): string {
  const paymentInfo = ocrResult.images[0]?.receipt?.result?.paymentInfo;
  const dateStr = paymentInfo?.date?.value || '';
  const timeStr = paymentInfo?.time?.value || '';
  
  // "2026.01.15" 형식을 "2026-01-15"로 변환
  try {
    const date = parse(dateStr, 'yyyy.MM.dd', new Date());
    // 시간 정보가 있으면 추가
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));
    }
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('날짜 파싱 실패:', error);
    return new Date().toISOString().split('T')[0]; // 오늘 날짜 반환
  }
}
```

#### 3. 금액 추출
```typescript
function extractAmount(ocrResult: any): number {
  const paymentInfo = ocrResult.images[0]?.receipt?.result?.paymentInfo;
  const totalPrice = paymentInfo?.totalPrice?.price?.value || '';
  
  // 숫자만 추출 (쉼표, 공백 제거)
  const amount = parseInt(totalPrice.replace(/[,\s]/g, ''));
  return isNaN(amount) ? 0 : amount;
}
```

#### 4. 결제수단 추출
```typescript
function extractPaymentMethod(ocrResult: any): string {
  const paymentInfo = ocrResult.images[0]?.receipt?.result?.paymentInfo;
  const cardInfo = paymentInfo?.cardInfo;
  
  if (cardInfo?.type?.value) {
    const type = cardInfo.type.value;
    if (type.includes('신용') || type.includes('카드')) {
      return '카드';
    } else if (type.includes('현금')) {
      return '현금';
    }
  }
  
  // 기본값: 카드
  return '카드';
}
```

#### 5. 카테고리 자동 분류
```typescript
// 기존 자동 분류 규칙 활용
async function classifyCategory(
  merchantName: string,
  amount: number
): Promise<string> {
  // 1. 가맹점명 기반 분류
  const merchantCategoryMap: Record<string, string> = {
    '스타벅스': '외식',
    '맥도날드': '외식',
    'GS25': '생활용품',
    'CU': '생활용품',
    '이마트': '식료품',
    '롯데마트': '식료품',
    // ... 더 많은 매핑
  };
  
  for (const [keyword, category] of Object.entries(merchantCategoryMap)) {
    if (merchantName.includes(keyword)) {
      return category;
    }
  }
  
  // 2. 자동 분류 규칙 API 호출 (구현된 경우)
  // const rule = await autoClassificationRuleService.test({
  //   description: merchantName,
  //   amount,
  //   type: 'expense'
  // });
  // if (rule.matchedRule) {
  //   return rule.suggestedCategory;
  // }
  
  // 3. 기본 카테고리 (사용자가 선택하도록)
  return '기타';
}
```

#### 6. 통합 파싱 함수
```typescript
interface ParsedReceipt {
  merchantName: string;
  date: string;
  amount: number;
  category: string;
  paymentMethod: string;
  items?: Array<{ name: string; price: number }>;
}

async function parseReceipt(ocrResult: any): Promise<ParsedReceipt> {
  const merchantName = extractMerchantName(ocrResult);
  const date = extractDate(ocrResult);
  const amount = extractAmount(ocrResult);
  const paymentMethod = extractPaymentMethod(ocrResult);
  const category = await classifyCategory(merchantName, amount);
  
  // 상품 목록 추출 (선택사항)
  const items = extractItems(ocrResult);
  
  return {
    merchantName,
    date,
    amount,
    category,
    paymentMethod,
    items,
  };
}
```

---

## API 설계

### 1. 영수증 OCR 처리 (Edge Function)

```
POST /api/receipt/ocr
Content-Type: multipart/form-data
Body: {
  image: File
}
Response: {
  ocrResult: ClovaOCRResponse,
  parsedData: ParsedReceipt,
  confidence: number // 신뢰도 (0-1)
}
```

### 2. 거래 내역 생성 (OCR 결과 기반)

```
POST /api/transactions/from-receipt
Body: {
  parsedData: ParsedReceipt,
  receiptImageId?: string, // 업로드된 영수증 사진 ID
  confirm: boolean // 사용자 확인 여부
}
Response: Transaction
```

### 3. OCR 재시도

```
POST /api/receipt/ocr/retry
Body: {
  imageId: string // 이전에 업로드된 이미지 ID
}
Response: {
  ocrResult: ClovaOCRResponse,
  parsedData: ParsedReceipt
}
```

---

## UI/UX 설계

### 영수증 등록 플로우

```
1. 거래 내역 추가 모달
   └─ "📸 영수증으로 추가하기" 버튼 클릭
   
2. 영수증 촬영/선택 화면
   └─ [카메라] 또는 [갤러리 선택]
   
3. OCR 처리 중
   └─ 로딩 인디케이터 + "영수증을 분석하고 있습니다..."
   
4. 추출 결과 확인 화면
   └─ 추출된 정보 표시
   └─ 수정 가능한 필드
   └─ [수정하기] [저장하기] 버튼
   
5. 저장 완료
   └─ "거래 내역이 등록되었습니다!" 알림
```

### 영수증 촬영 화면 (모바일)

```
┌─────────────────────────────────────┐
│  ← 영수증 촬영                      │
├─────────────────────────────────────┤
│                                     │
│         [카메라 뷰파인더]            │
│                                     │
│    ┌─────────────────────┐         │
│    │                     │         │
│    │   영수증을 촬영하세요  │         │
│    │                     │         │
│    └─────────────────────┘         │
│                                     │
│         ┌──────────────┐           │
│         │  📷 촬영하기  │           │
│         └──────────────┘           │
│                                     │
│  [갤러리에서 선택]                  │
└─────────────────────────────────────┘
```

### OCR 처리 중 화면

```
┌─────────────────────────────────────┐
│  ← 영수증 분석 중                   │
├─────────────────────────────────────┤
│                                     │
│         ⏳                          │
│                                     │
│   영수증을 분석하고 있습니다...      │
│                                     │
│   잠시만 기다려주세요.              │
│                                     │
│   [취소]                            │
└─────────────────────────────────────┘
```

### 추출 결과 확인 화면

```
┌─────────────────────────────────────┐
│  ← 추출된 정보 확인                 │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📸 영수증 미리보기             │ │
│  │ [사진]                        │ │
│  └───────────────────────────────┘ │
│                                     │
│  가맹점: [스타벅스 강남점      ] ✏️│
│  날짜:   [2026-01-15          ] ✏️│
│  금액:   [15,000원            ] ✏️│
│  카테고리: [외식 ▼             ]  │
│  결제수단: [카드 ▼             ]  │
│                                     │
│  메모: [________________]           │
│                                     │
│  ℹ️ 정보가 정확하지 않으면 수정해주세요│
│                                     │
│  [취소]              [저장하기]     │
└─────────────────────────────────────┘
```

---

## 구현 단계

### Phase 1: Naver Clova OCR 설정 (3일)

1. ✅ Naver Cloud Platform 계정 생성
2. ✅ Clova OCR 서비스 신청
3. ✅ API 키 발급 및 환경 변수 설정
4. ✅ OCR API 테스트 (Postman 또는 curl)

### Phase 2: Supabase Edge Function 구현 (1주)

1. ✅ Edge Function 생성: `/api/receipt/ocr`
2. ✅ 이미지 업로드 처리 (Supabase Storage)
3. ✅ Clova OCR API 통합
4. ✅ OCR 결과 파싱 로직 구현
5. ✅ 에러 처리 및 로깅

### Phase 3: 데이터 파싱 로직 (1주)

1. ✅ 가맹점명, 날짜, 금액 추출 함수
2. ✅ 결제수단 추출 함수
3. ✅ 카테고리 자동 분류 로직
4. ✅ 정규식 패턴 매칭 최적화
5. ✅ 파싱 정확도 테스트

### Phase 4: 프론트엔드 UI 구현 (1주)

1. ✅ "영수증으로 추가하기" 버튼 추가
2. ✅ 영수증 촬영/선택 화면
3. ✅ OCR 처리 중 로딩 화면
4. ✅ 추출 결과 확인 및 수정 화면
5. ✅ 거래 내역 자동 생성 통합

### Phase 5: 통합 및 최적화 (3일)

1. ✅ 에러 처리 개선
2. ✅ OCR 재시도 기능
3. ✅ 이미지 전처리 (압축, 리사이징)
4. ✅ 사용자 피드백 수집
5. ✅ 성능 최적화

**총 예상 개발 기간**: 약 4-5주

---

## 비용 분석

### Naver Clova OCR 비용

#### 무료 플랜
- 월 1,000건 무료

#### 유료 플랜
- 1,000건 초과: 건당 15원

#### 예상 사용량 (사용자 100명 기준)
- 사용자당 월 평균 영수증 등록: 10건
- 총 월간 OCR 요청: 100명 × 10건 = 1,000건
- **초기 무료 플랜으로 충분**

#### 사용자 증가 시 (1,000명 기준)
- 총 월간 OCR 요청: 1,000명 × 10건 = 10,000건
- 무료: 1,000건
- 유료: 9,000건 × 15원 = **135,000원/월**

### Supabase Storage 비용
- 영수증 이미지 저장 (이미 거래 사진 기능에 포함)

### 결론
- 초기 런칭: **무료**
- 사용자 1,000명 이상: **월 135,000원** (약 $100)

---

## 보안 고려사항

### 1. API 키 보안
- OCR API 키는 **절대 클라이언트에 노출하지 않음**
- Supabase Edge Function의 환경 변수로 관리
- Edge Function에서만 OCR API 호출

### 2. 이미지 보안
- 업로드된 영수증 이미지는 암호화되어 저장
- 사용자별 접근 권한 제어 (Storage 정책)
- 일정 기간 후 자동 삭제 옵션 (GDPR 준수)

### 3. 개인정보 보호
- 영수증에 포함된 개인정보(카드 번호 등)는 마스킹 처리
- OCR 결과는 사용자에게만 제공
- 서버 로그에는 민감 정보 저장하지 않음

---

## 에러 처리 시나리오

### 시나리오 1: OCR 실패
```
사용자 액션: 영수증 촬영 → OCR 처리 실패
대응: 
- "영수증을 인식할 수 없습니다. 다시 시도해주세요." 메시지
- [재시도] 버튼 제공
- [수동 입력] 버튼으로 일반 입력 모달로 전환
```

### 시나리오 2: 정보 추출 실패
```
사용자 액션: OCR 성공, 하지만 일부 정보 추출 실패
대응:
- 추출된 정보만 표시
- 실패한 필드는 빈 값으로 표시 (사용자가 직접 입력)
- 경고 아이콘과 함께 "이 정보는 수동으로 입력해주세요" 안내
```

### 시나리오 3: 네트워크 오류
```
사용자 액션: OCR 요청 중 네트워크 오류
대응:
- "연결에 실패했습니다. 네트워크를 확인해주세요." 메시지
- [재시도] 버튼 제공
- 이미지 캐시하여 재시도 시 다시 업로드하지 않도록 처리
```

---

## 향후 개선 사항

### 1. AI 기반 개선
- 영수증 품질 평가 (흐림, 조명 등)
- 자동 재촬영 권장
- 가맹점명 정규화 (예: "스벅" → "스타벅스")

### 2. 상품 목록 추출
- OCR 결과에서 개별 상품 및 가격 추출
- 상품별 카테고리 분류
- 여러 거래 내역으로 분할 저장 옵션

### 3. 배치 처리
- 여러 영수증을 한 번에 업로드하여 일괄 처리
- 갤러리에서 여러 사진 선택하여 한 번에 등록

### 4. 오프라인 지원
- OCR 실패 시 오프라인에서 수동 입력
- 온라인 복귀 시 자동 재시도

---

## 참고 자료

- [Naver Clova OCR 공식 문서](https://www.ncloud.com/product/aiService/ocr)
- [Supabase Edge Functions 문서](https://supabase.com/docs/guides/functions)
- [browser-image-compression 라이브러리](https://www.npmjs.com/package/browser-image-compression)
- [date-fns 문서](https://date-fns.org/)

---

**작성일**: 2026-01-XX  
**버전**: 1.0.0

**참고**: 이 기능은 AI(OCR)를 활용하지만, 별도의 AI 모델 학습은 필요하지 않습니다. Naver Clova OCR과 같은 상용 OCR 서비스를 활용하여 구현합니다.


