# 거래 내역 (Transaction) 스키마 설계 문서

## 📋 목차
1. [거래 내역 개요](#거래-내역-개요)
2. [필드 상세](#필드-상세)
3. [데이터 모델](#데이터-모델)
4. [DB 테이블 구조](#db-테이블-구조)
5. [제약 조건 및 인덱스](#제약-조건-및-인덱스)

---

## 📊 거래 내역 개요

거래 내역(Transaction)은 사용자의 수입/지출/이체를 기록하는 핵심 데이터입니다.

### 주요 기능
- **수입 기록**: 급여, 부수입, 용돈 등
- **지출 기록**: 식비, 교통비, 쇼핑 등
- **이체 기록**: 계좌 간 이체 등

---

## 📝 필드 상세

### 필수 필드

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `id` | BIGSERIAL | 거래 고유 ID (PK) | 1, 2, 3... |
| `user_id` | BIGINT | 사용자 ID (FK) | 1 |
| `date` | DATE | 거래 날짜 | '2024-01-15' |
| `type` | VARCHAR(20) | 거래 유형 | 'income', 'expense', 'transfer' |
| `amount` | DECIMAL(12,2) | 거래 금액 | 50000.00 |
| `category` | VARCHAR(100) | 카테고리 | '식비', '급여' 등 |

### 선택 필드

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `description` | TEXT | 설명 (결제수단 + 메모) | '결제수단: 신용카드 \| 점심 식사' |
| `payment_method` | VARCHAR(50) | 결제 수단 | '현금', '체크카드', '신용카드' 등 |
| `memo` | TEXT | 메모 | '점심 식사' |

### 시스템 필드

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `created_at` | TIMESTAMP | 생성 일시 | '2024-01-15 10:30:00' |
| `updated_at` | TIMESTAMP | 수정 일시 | '2024-01-15 10:30:00' |

---

## 🔤 데이터 모델

### 거래 유형 (type)

1. **income** (수입)
   - 급여, 부수입, 용돈 등
   - 금액 표시: `+50,000원`

2. **expense** (지출)
   - 식비, 교통비, 쇼핑 등
   - 금액 표시: `-30,000원`

3. **transfer** (이체)
   - 계좌 간 이체
   - 순수익에는 영향 없음

### 카테고리 (category)

#### 수입 카테고리
- 급여
- 부수입
- 용돈
- 기타

#### 지출 카테고리
- 식비
- 교통비
- 쇼핑
- 문화생활
- 의료비
- 통신비
- 생활비
- 기타

### 결제 수단 (payment_method)

- 현금
- 체크카드
- 신용카드
- 계좌이체
- 기타

---

## 🗄️ DB 테이블 구조

### PostgreSQL (Supabase) DDL

```sql
-- Transactions 테이블 생성
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT transactions_amount_check CHECK (amount >= 0),
  CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer')),
  CONSTRAINT transactions_date_check CHECK (date >= '2000-01-01' AND date <= '2100-12-31')
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_transactions_updated_at 
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE transactions IS '거래 내역 테이블';
COMMENT ON COLUMN transactions.id IS '거래 고유 식별자';
COMMENT ON COLUMN transactions.user_id IS '사용자 ID (FK)';
COMMENT ON COLUMN transactions.date IS '거래 날짜';
COMMENT ON COLUMN transactions.type IS '거래 유형 (income/expense/transfer)';
COMMENT ON COLUMN transactions.amount IS '거래 금액';
COMMENT ON COLUMN transactions.category IS '카테고리';
COMMENT ON COLUMN transactions.description IS '설명 (결제수단 + 메모)';
COMMENT ON COLUMN transactions.created_at IS '생성 일시';
COMMENT ON COLUMN transactions.updated_at IS '수정 일시';
```

### 데이터 저장 형식

#### description 필드 구조
- 형식: `결제수단: {payment_method} | {memo}`
- 예시: `결제수단: 신용카드 | 점심 식사`
- 예시: `결제수단: 현금 | 편의점`
- 결제수단만 있는 경우: `결제수단: 체크카드`
- 메모만 있는 경우: `점심 식사`

#### 이유
- 기존 코드와의 호환성 유지
- 단일 필드에 결제수단과 메모 저장
- 파싱 로직은 `transactionService.ts`에 구현됨

---

## 🔐 제약 조건 및 인덱스

### 제약 조건

1. **transactions_type_check**
   - `type`은 'income', 'expense', 'transfer'만 허용

2. **transactions_amount_check**
   - `amount`는 0 이상만 허용

3. **transactions_date_check**
   - `date`는 2000-01-01 ~ 2100-12-31 범위만 허용

4. **Foreign Key**
   - `user_id`는 `users.id` 참조
   - CASCADE 삭제: 사용자 삭제 시 거래 내역 자동 삭제

### 인덱스

1. **idx_transactions_user_id**
   - 사용자별 거래 조회 성능 향상

2. **idx_transactions_date**
   - 날짜별 조회 성능 향상

3. **idx_transactions_user_date**
   - 사용자 + 날짜 복합 조회 (가장 빈번한 쿼리)

4. **idx_transactions_type**
   - 유형별 필터링 성능 향상

5. **idx_transactions_category**
   - 카테고리별 필터링 성능 향상

---

## 📊 예시 데이터

```sql
-- 수입 예시
INSERT INTO transactions (user_id, date, type, amount, category, description)
VALUES (
  1,
  '2024-01-15',
  'income',
  3000000.00,
  '급여',
  '1월 급여'
);

-- 지출 예시
INSERT INTO transactions (user_id, date, type, amount, category, description)
VALUES (
  1,
  '2024-01-15',
  'expense',
  12000.00,
  '식비',
  '결제수단: 신용카드 | 점심 식사'
);

-- 이체 예시
INSERT INTO transactions (user_id, date, type, amount, category, description)
VALUES (
  1,
  '2024-01-15',
  'transfer',
  500000.00,
  '기타',
  '결제수단: 계좌이체 | 저축 계좌 이체'
);
```

---

## 🔄 API 인터페이스

### Transaction Interface (TypeScript)

```typescript
export interface Transaction {
  id: string
  date: string  // ISO date format: 'YYYY-MM-DD'
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string
  paymentMethod?: string
  memo?: string
  description?: string  // DB에 저장되는 원본 필드
  userId?: number
}
```

---

## ✅ 유효성 검증

### 애플리케이션 레벨 검증

1. **금액 (amount)**
   - 필수 필드
   - 0 이상의 숫자
   - 최대 999,999,999,999.99

2. **날짜 (date)**
   - 필수 필드
   - 유효한 날짜 형식 (YYYY-MM-DD)
   - 2000-01-01 ~ 2100-12-31

3. **카테고리 (category)**
   - 필수 필드
   - 최대 100자

4. **결제 수단 (payment_method)**
   - 선택 필드
   - 최대 50자

5. **메모 (memo)**
   - 선택 필드
   - 텍스트 (제한 없음)

---

## 🔧 유지보수 쿼리

```sql
-- 사용자별 월별 거래 통계
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  type,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
WHERE user_id = 1
GROUP BY user_id, DATE_TRUNC('month', date), type
ORDER BY month DESC, type;

-- 카테고리별 지출 통계
SELECT 
  category,
  COUNT(*) as count,
  SUM(amount) as total
FROM transactions
WHERE user_id = 1 
  AND type = 'expense'
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category
ORDER BY total DESC;
```

---

이 스키마를 기반으로 거래 내역 추가/수정/삭제 기능을 구현하세요!

