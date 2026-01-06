# 자동 분류 규칙 및 반복 거래 기능 설계 문서

## 📋 목차
1. [기능 개요](#기능-개요)
2. [자동 분류 규칙](#자동-분류-규칙)
3. [반복 거래](#반복-거래)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [API 설계](#api-설계)
6. [UI/UX 설계](#uiux-설계)
7. [구현 단계](#구현-단계)

---

## 기능 개요

### 자동 분류 규칙
거래 내역을 입력할 때, 가맹점명, 메모 키워드, 금액 범위 등을 기반으로 자동으로 카테고리와 결제수단을 분류하는 기능입니다.

**주요 기능:**
- 키워드 기반 자동 분류
- 가맹점명 패턴 매칭
- 금액 범위 조건 설정
- 우선순위 규칙 관리
- 규칙 활성화/비활성화

### 반복 거래
정기적으로 발생하는 거래(월세, 구독료, 급여 등)를 미리 설정하여 자동으로 거래 내역을 생성하는 기능입니다.

**주요 기능:**
- 반복 주기 설정 (매일, 매주, 매월, 매년)
- 시작일/종료일 설정
- 자동 거래 생성
- 수동 거래와 구분
- 반복 거래 일시정지/재개

---

## 자동 분류 규칙

### 1. 규칙 타입

#### 1.1 키워드 기반 규칙
- **대상**: `description` 필드 (메모)
- **조건**: 특정 키워드 포함 여부
- **예시**: "스타벅스" 포함 → 카테고리: "외식", 결제수단: "카드"

#### 1.2 가맹점명 규칙
- **대상**: `description` 필드에서 가맹점명 추출
- **조건**: 정확히 일치 또는 부분 일치
- **예시**: "CU편의점" → 카테고리: "생활용품", 결제수단: "카드"

#### 1.3 금액 범위 규칙
- **대상**: `amount` 필드
- **조건**: 최소/최대 금액 범위
- **예시**: 5,000원 이상 50,000원 미만 → 카테고리: "외식"

#### 1.4 복합 규칙
- **조건**: 여러 조건을 AND/OR로 조합
- **예시**: (키워드: "택시" OR "우버") AND (금액: 5,000원 이상) → 카테고리: "교통비"

### 2. 규칙 우선순위
- 규칙에 우선순위 번호 부여 (낮을수록 높은 우선순위)
- 거래 입력 시 우선순위 순서대로 규칙 적용
- 첫 번째 매칭되는 규칙 사용

### 3. 규칙 설정 예시

```typescript
{
  id: 1,
  name: "스타벅스 자동 분류",
  type: "keyword",
  priority: 1,
  enabled: true,
  conditions: {
    keyword: "스타벅스",
    matchType: "contains" // exact, contains, startsWith, endsWith
  },
  actions: {
    category: "외식",
    paymentMethod: "카드"
  }
}

{
  id: 2,
  name: "대형마트 분류",
  type: "merchant",
  priority: 2,
  enabled: true,
  conditions: {
    merchantPatterns: ["이마트", "롯데마트", "홈플러스"],
    matchType: "contains"
  },
  actions: {
    category: "식료품",
    paymentMethod: "카드"
  }
}

{
  id: 3,
  name: "고액 외식",
  type: "amount_range",
  priority: 3,
  enabled: true,
  conditions: {
    amountMin: 50000,
    amountMax: 500000,
    type: "expense"
  },
  actions: {
    category: "외식",
    paymentMethod: "카드"
  }
}
```

---

## 반복 거래

### 1. 반복 주기 타입

#### 1.1 매일 (Daily)
- 매일 동일한 거래 생성
- 예: 매일 커피 구매 (옵션: 평일만)

#### 1.2 매주 (Weekly)
- 특정 요일마다 거래 생성
- 예: 매주 월요일 점심 식사

#### 1.3 매월 (Monthly)
- 특정 날짜마다 거래 생성
- 예: 매월 1일 월세, 매월 25일 급여

#### 1.4 매년 (Yearly)
- 특정 월/일마다 거래 생성
- 예: 매년 1월 1일 보험료

#### 1.5 사용자 정의
- n일마다, n주마다 등 커스텀 주기
- 예: 15일마다, 2주마다

### 2. 반복 거래 설정 예시

```typescript
{
  id: 1,
  name: "월세",
  type: "expense",
  amount: 500000,
  category: "주거",
  paymentMethod: "계좌이체",
  memo: "월세 납부",
  frequency: "monthly",
  frequencyOptions: {
    dayOfMonth: 1, // 매월 1일
    endDate: null // 무기한
  },
  startDate: "2026-01-01",
  endDate: null,
  enabled: true,
  lastGeneratedDate: "2026-01-01"
}

{
  id: 2,
  name: "급여",
  type: "income",
  amount: 3000000,
  category: "급여",
  paymentMethod: "계좌이체",
  memo: "월급",
  frequency: "monthly",
  frequencyOptions: {
    dayOfMonth: 25 // 매월 25일
  },
  startDate: "2026-01-01",
  endDate: null,
  enabled: true,
  lastGeneratedDate: "2025-12-25"
}

{
  id: 3,
  name: "넷플릭스 구독",
  type: "expense",
  amount: 9900,
  category: "문화",
  paymentMethod: "카드",
  memo: "넷플릭스 월간 구독료",
  frequency: "monthly",
  frequencyOptions: {
    dayOfMonth: 15 // 매월 15일
  },
  startDate: "2025-11-15",
  endDate: null,
  enabled: true,
  lastGeneratedDate: "2025-12-15"
}
```

### 3. 자동 생성 로직

1. **일일 배치 처리**: 매일 자정에 다음 날 기준으로 생성할 거래 확인
2. **생성 조건**:
   - `enabled = true`
   - `startDate <= 생성일`
   - `endDate`가 null이거나 `endDate >= 생성일`
   - `lastGeneratedDate < 생성일`
3. **생성 후**: `lastGeneratedDate` 업데이트

---

## 데이터베이스 스키마

### 1. 자동 분류 규칙 테이블 (`auto_classification_rules`)

```sql
CREATE TABLE auto_classification_rules (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('keyword', 'merchant', 'amount_range', 'composite')),
  priority INTEGER NOT NULL DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- 조건 (JSONB)
  conditions JSONB NOT NULL,
  
  -- 적용할 액션 (JSONB)
  actions JSONB NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_rule_priority UNIQUE (user_id, priority)
);

-- 인덱스
CREATE INDEX idx_auto_classification_rules_user_id ON auto_classification_rules(user_id);
CREATE INDEX idx_auto_classification_rules_enabled ON auto_classification_rules(user_id, enabled, priority);
```

**conditions JSONB 예시:**
```json
// 키워드 규칙
{
  "keyword": "스타벅스",
  "matchType": "contains"
}

// 가맹점 규칙
{
  "merchantPatterns": ["이마트", "롯데마트"],
  "matchType": "contains"
}

// 금액 범위 규칙
{
  "amountMin": 5000,
  "amountMax": 50000,
  "type": "expense"
}

// 복합 규칙
{
  "operator": "AND",
  "conditions": [
    {"keyword": "택시", "matchType": "contains"},
    {"amountMin": 5000}
  ]
}
```

**actions JSONB 예시:**
```json
{
  "category": "외식",
  "paymentMethod": "카드"
}
```

### 2. 반복 거래 테이블 (`recurring_transactions`)

```sql
CREATE TABLE recurring_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  payment_method VARCHAR(100),
  memo TEXT,
  
  -- 반복 설정
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  frequency_options JSONB NOT NULL, -- 주기별 세부 옵션
  
  -- 기간 설정
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- 상태
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_generated_date DATE, -- 마지막 생성일
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_enabled ON recurring_transactions(user_id, enabled);
CREATE INDEX idx_recurring_transactions_dates ON recurring_transactions(user_id, start_date, end_date);
```

**frequency_options JSONB 예시:**
```json
// 매월
{
  "dayOfMonth": 1
}

// 매주
{
  "dayOfWeek": 1 // 0=일요일, 1=월요일, ...
}

// 매일 (평일만)
{
  "weekdaysOnly": true
}

// 사용자 정의
{
  "interval": 15, // 15일마다
  "unit": "days"
}
```

### 3. 거래 테이블 확장

`transactions` 테이블에 필드 추가:

```sql
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_transaction_id BIGINT REFERENCES recurring_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS auto_classified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS applied_rule_id BIGINT REFERENCES auto_classification_rules(id) ON DELETE SET NULL;

-- 인덱스
CREATE INDEX idx_transactions_recurring ON transactions(recurring_transaction_id);
CREATE INDEX idx_transactions_auto_generated ON transactions(user_id, is_auto_generated);
```

---

## API 설계

### 자동 분류 규칙 API

#### 1. 규칙 목록 조회
```
GET /api/auto-classification-rules
Response: AutoClassificationRule[]
```

#### 2. 규칙 생성
```
POST /api/auto-classification-rules
Body: {
  name: string,
  ruleType: 'keyword' | 'merchant' | 'amount_range' | 'composite',
  priority: number,
  conditions: object,
  actions: object
}
Response: AutoClassificationRule
```

#### 3. 규칙 수정
```
PUT /api/auto-classification-rules/:id
Body: { ... }
Response: AutoClassificationRule
```

#### 4. 규칙 삭제
```
DELETE /api/auto-classification-rules/:id
Response: { success: true }
```

#### 5. 규칙 활성화/비활성화
```
PATCH /api/auto-classification-rules/:id/toggle
Response: AutoClassificationRule
```

#### 6. 규칙 적용 테스트
```
POST /api/auto-classification-rules/test
Body: {
  description: string,
  amount: number,
  type: 'income' | 'expense'
}
Response: {
  matchedRule: AutoClassificationRule | null,
  suggestedCategory: string,
  suggestedPaymentMethod: string
}
```

### 반복 거래 API

#### 1. 반복 거래 목록 조회
```
GET /api/recurring-transactions
Response: RecurringTransaction[]
```

#### 2. 반복 거래 생성
```
POST /api/recurring-transactions
Body: {
  name: string,
  type: 'income' | 'expense',
  amount: number,
  category: string,
  paymentMethod?: string,
  memo?: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
  frequencyOptions: object,
  startDate: string,
  endDate?: string
}
Response: RecurringTransaction
```

#### 3. 반복 거래 수정
```
PUT /api/recurring-transactions/:id
Body: { ... }
Response: RecurringTransaction
```

#### 4. 반복 거래 삭제
```
DELETE /api/recurring-transactions/:id
Response: { success: true }
```

#### 5. 반복 거래 활성화/비활성화
```
PATCH /api/recurring-transactions/:id/toggle
Response: RecurringTransaction
```

#### 6. 반복 거래 수동 생성
```
POST /api/recurring-transactions/:id/generate
Body: {
  targetDate: string
}
Response: Transaction
```

#### 7. 예정된 반복 거래 조회
```
GET /api/recurring-transactions/upcoming
Query: ?days=7 (기본값: 7일)
Response: {
  date: string,
  transactions: RecurringTransaction[]
}[]
```

---

## UI/UX 설계

### 자동 분류 규칙 관리 화면

#### 1. 규칙 목록 화면
- 위치: 설정 화면 > 자동 분류 규칙
- 구성:
  - 규칙 목록 (카드 형식)
  - 각 카드: 이름, 타입, 우선순위, 활성화 상태
  - 새 규칙 추가 버튼
  - 규칙 활성화/비활성화 토글
  - 규칙 수정/삭제 버튼

#### 2. 규칙 생성/수정 모달
- **규칙 이름**: 텍스트 입력
- **규칙 타입**: 라디오 버튼 선택
  - 키워드 기반
  - 가맹점명
  - 금액 범위
  - 복합 규칙
- **조건 설정**:
  - 타입별 조건 입력 폼
  - 키워드: 키워드 입력 + 매칭 타입 선택
  - 가맹점: 가맹점명 목록 추가/삭제
  - 금액 범위: 최소/최대 금액 입력
- **적용 액션**:
  - 카테고리 선택
  - 결제수단 선택
- **우선순위**: 숫자 입력 (낮을수록 높은 우선순위)

#### 3. 규칙 테스트 기능
- 거래 입력 모달에서 "규칙 테스트" 버튼
- 입력한 내용으로 자동 분류 결과 미리보기

### 반복 거래 관리 화면

#### 1. 반복 거래 목록 화면
- 위치: 설정 화면 > 반복 거래 또는 별도 메뉴
- 구성:
  - 반복 거래 목록
  - 각 항목: 이름, 금액, 카테고리, 반복 주기, 다음 생성일
  - 새 반복 거래 추가 버튼
  - 활성화/비활성화 토글

#### 2. 반복 거래 생성/수정 모달
- **기본 정보**: 일반 거래 입력 폼과 동일
  - 유형 (수입/지출)
  - 금액
  - 카테고리
  - 결제수단
  - 메모
- **반복 설정**:
  - 반복 주기 선택 (매일/매주/매월/매년/사용자 정의)
  - 주기별 세부 옵션
    - 매일: 평일만 옵션
    - 매주: 요일 선택
    - 매월: 날짜 선택 (1-31)
    - 매년: 월/일 선택
    - 사용자 정의: n일마다, n주마다 등
- **기간 설정**:
  - 시작일
  - 종료일 (선택사항)
- **다음 생성일 미리보기**

#### 3. 반복 거래 상세 화면
- 반복 거래 정보 표시
- 생성된 거래 내역 목록
- 수동 생성 버튼
- 일시정지/재개 버튼
- 수정/삭제 버튼

#### 4. 예정된 반복 거래 위젯
- 홈 화면에 추가 가능
- 다음 7일간 예정된 반복 거래 표시
- 생성된 거래 확인/수정 가능

---

## 구현 단계

### Phase 1: 데이터베이스 및 기본 구조
1. ✅ 데이터베이스 테이블 생성 (`auto_classification_rules`, `recurring_transactions`)
2. ✅ TypeScript 인터페이스 정의
3. ✅ Supabase 서비스 레이어 생성
   - `autoClassificationRuleService.ts`
   - `recurringTransactionService.ts`

### Phase 2: 자동 분류 규칙
1. 규칙 관리 화면 구현
   - 규칙 목록 조회
   - 규칙 생성/수정/삭제
   - 규칙 활성화/비활성화
2. 규칙 적용 로직 구현
   - 거래 입력 시 자동 분류
   - 규칙 매칭 알고리즘
3. 거래 입력 모달 통합
   - 규칙 테스트 기능
   - 자동 분류 결과 미리보기

### Phase 3: 반복 거래
1. 반복 거래 관리 화면 구현
   - 반복 거래 목록
   - 반복 거래 생성/수정/삭제
2. 자동 생성 로직 구현
   - 배치 처리 스케줄러 (서버 측 또는 클라이언트 측)
   - 일일 자동 생성
3. 반복 거래 상세 화면
   - 생성된 거래 목록
   - 수동 생성 기능

### Phase 4: 통합 및 최적화
1. 홈 화면 위젯 추가
   - 예정된 반복 거래 표시
2. 성능 최적화
   - 규칙 매칭 최적화
   - 인덱스 최적화
3. 사용자 가이드
   - 기능 안내 문서
   - 튜토리얼

---

## 기술적 고려사항

### 1. 자동 분류 규칙 매칭 최적화
- 규칙을 우선순위 순으로 정렬하여 첫 매칭에서 중단
- 인덱스를 활용한 빠른 검색
- 키워드 매칭 시 정규식 사용 (필요시)

### 2. 반복 거래 자동 생성
**옵션 A: 클라이언트 측 배치 처리**
- 앱 실행 시 또는 백그라운드에서 처리
- 구현이 간단하지만, 앱을 실행해야 생성됨

**옵션 B: 서버 측 스케줄러**
- Supabase Edge Functions + pg_cron 사용
- 매일 자정에 자동 실행
- 사용자가 앱을 실행하지 않아도 자동 생성

**권장: 옵션 A로 시작 → 옵션 B로 확장**

### 3. 데이터 일관성
- 반복 거래 삭제 시 생성된 거래 처리 방안 결정
  - 옵션 1: `ON DELETE SET NULL` (생성된 거래는 유지)
  - 옵션 2: 생성된 거래도 함께 삭제 (선택적)
- 자동 분류 규칙 삭제 시 적용 이력 보존

### 4. 사용자 경험
- 자동 분류 결과를 사용자가 수정 가능
- 자동 생성된 거래는 명확히 표시 (아이콘, 색상 등)
- 자동 생성 전 확인 옵션 제공

---

## 예상 작업량

- **데이터베이스 설계 및 생성**: 2-3시간
- **자동 분류 규칙 기능**: 8-10시간
- **반복 거래 기능**: 8-10시간
- **UI/UX 구현**: 6-8시간
- **테스트 및 버그 수정**: 4-6시간

**총 예상 시간**: 28-37시간

---

## 참고 자료

- [Supabase Functions 문서](https://supabase.com/docs/guides/functions)
- [PostgreSQL JSONB 문서](https://www.postgresql.org/docs/current/datatype-json.html)
- [date-fns 라이브러리](https://date-fns.org/) - 날짜 처리

---

**작성일**: 2026-01-XX
**버전**: 1.0.0



