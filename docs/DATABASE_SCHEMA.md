# 데이터베이스 스키마 설계 문서

## 📋 목차
1. [Users 테이블](#users-테이블)
2. [비밀번호 보안 규정](#비밀번호-보안-규정)
3. [SQL 스크립트](#sql-스크립트)
4. [인덱스 및 제약 조건](#인덱스-및-제약-조건)
5. [RLS (Row Level Security)](#rls-row-level-security)

---

## 👤 Users 테이블

### 테이블 구조

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
|--------|------------|----------|------|
| `id` | BIGSERIAL | PRIMARY KEY | 사용자 고유 식별자 (자동 증가) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | 해시화된 비밀번호 (bcrypt/argon2) |
| `name` | VARCHAR(100) | NULL | 사용자 이름 |
| `is_active` | BOOLEAN | DEFAULT TRUE | 계정 활성화 여부 |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 계정 생성 일시 |
| `updated_at` | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | 정보 수정 일시 |
| `created_by` | BIGINT | NULL | 생성자 ID (자기 자신 또는 관리자) |
| `last_login_at` | TIMESTAMP WITH TIME ZONE | NULL | 마지막 로그인 일시 |
| `login_attempts` | INTEGER | DEFAULT 0 | 로그인 실패 횟수 |
| `locked_until` | TIMESTAMP WITH TIME ZONE | NULL | 계정 잠금 해제 일시 |

### 상세 설명

#### id (PRIMARY KEY)
- **타입**: BIGSERIAL
- **설명**: 사용자 고유 식별자, 자동 증가
- **용도**: 다른 테이블의 외래키 참조

#### email
- **타입**: VARCHAR(255), UNIQUE, NOT NULL
- **설명**: 이메일 주소 (로그인 ID로 사용)
- **유효성 검증**: 이메일 형식 검증 필요
- **인덱스**: 유니크 인덱스 자동 생성

#### password
- **타입**: VARCHAR(255), NOT NULL
- **설명**: 해시화된 비밀번호 저장
- **해시 알고리즘**: bcrypt (권장) 또는 argon2
- **최소 길이**: 60자 (bcrypt 해시 길이)
- **원문 비밀번호**: DB에 저장하지 않음

#### name
- **타입**: VARCHAR(100), NULL
- **설명**: 사용자 표시 이름
- **제약**: 최대 100자

#### is_active
- **타입**: BOOLEAN, DEFAULT TRUE
- **설명**: 계정 활성화/비활성화 상태
- **용도**: 탈퇴 처리, 관리자 제재 등

#### created_at
- **타입**: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()
- **설명**: 계정 생성 일시
- **자동 업데이트**: 생성 시 자동 설정

#### updated_at
- **타입**: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()
- **설명**: 정보 수정 일시
- **자동 업데이트**: UPDATE 트리거 필요

#### created_by
- **타입**: BIGINT, NULL
- **설명**: 계정 생성자 ID
- **참조**: users.id (자기 자신 또는 관리자)
- **용도**: 감사 로그, 관리자 생성 계정 추적

#### last_login_at
- **타입**: TIMESTAMP WITH TIME ZONE, NULL
- **설명**: 마지막 로그인 일시
- **업데이트**: 로그인 성공 시 갱신

#### login_attempts
- **타입**: INTEGER, DEFAULT 0
- **설명**: 연속 로그인 실패 횟수
- **용도**: 계정 잠금 정책 (5회 실패 시 잠금)

#### locked_until
- **타입**: TIMESTAMP WITH TIME ZONE, NULL
- **설명**: 계정 잠금 해제 일시
- **용도**: 일정 시간 후 자동 해제 (예: 30분)

---

## 🔒 비밀번호 보안 규정

### 정부 시큐리티 규정 준수 (개인정보보호법, 정보통신망법)

#### 비밀번호 복잡도 요구사항
1. **최소 길이**: 8자 이상
2. **최대 길이**: 64자
3. **문자 조합**:
   - 영문 대문자 (A-Z) 최소 1개
   - 영문 소문자 (a-z) 최소 1개
   - 숫자 (0-9) 최소 1개
   - 특수문자 (!@#$%^&*()_+-=[]{}|;:,.<>?) 최소 1개

#### 보안 규칙
1. **해시 저장**: 평문 비밀번호는 절대 저장하지 않음
2. **해시 알고리즘**: bcrypt (salt rounds: 10-12) 또는 argon2id
3. **비밀번호 정책**:
   - 연속된 문자 3개 이상 금지 (예: abc, 123)
   - 동일 문자 3개 이상 반복 금지 (예: aaa)
   - 사용자 이름/이메일과 유사한 비밀번호 금지
   - 일반적인 단어/패턴 금지 (예: password, 12345678)

#### 비밀번호 변경 정책
- **주기적 변경**: 90일마다 변경 권장 (선택사항)
- **재사용 방지**: 최근 사용한 비밀번호 5개는 재사용 불가
- **변경 이력**: 비밀번호 변경 이력 저장 (선택사항)

---

## 📝 SQL 스크립트

### Users 테이블 생성

```sql
-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0 NOT NULL,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- 제약 조건
  CONSTRAINT email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT password_length_check CHECK (LENGTH(password) >= 60), -- bcrypt 해시 최소 길이
  CONSTRAINT login_attempts_check CHECK (login_attempts >= 0 AND login_attempts <= 10),
  CONSTRAINT name_length_check CHECK (LENGTH(name) <= 100)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE users IS '사용자 정보 테이블';
COMMENT ON COLUMN users.id IS '사용자 고유 식별자';
COMMENT ON COLUMN users.email IS '이메일 주소 (로그인 ID)';
COMMENT ON COLUMN users.password IS '해시화된 비밀번호 (bcrypt)';
COMMENT ON COLUMN users.name IS '사용자 이름';
COMMENT ON COLUMN users.is_active IS '계정 활성화 여부';
COMMENT ON COLUMN users.created_at IS '계정 생성 일시';
COMMENT ON COLUMN users.updated_at IS '정보 수정 일시';
COMMENT ON COLUMN users.created_by IS '계정 생성자 ID';
COMMENT ON COLUMN users.last_login_at IS '마지막 로그인 일시';
COMMENT ON COLUMN users.login_attempts IS '연속 로그인 실패 횟수';
COMMENT ON COLUMN users.locked_until IS '계정 잠금 해제 일시';
```

---

## 🔐 인덱스 및 제약 조건

### 인덱스

1. **idx_users_email** (UNIQUE)
   - **컬럼**: email
   - **용도**: 이메일 로그인 시 빠른 조회

2. **idx_users_is_active**
   - **컬럼**: is_active
   - **용도**: 활성 사용자 필터링

3. **idx_users_created_at**
   - **컬럼**: created_at
   - **용도**: 가입 통계, 기간별 조회

4. **idx_users_last_login_at**
   - **컬럼**: last_login_at
   - **용도**: 활동 사용자 추적

### 제약 조건

1. **email_format_check**
   - 이메일 형식 검증 (정규식)

2. **password_length_check**
   - 비밀번호 해시 최소 길이 (bcrypt: 60자)

3. **login_attempts_check**
   - 로그인 시도 횟수 범위 제한 (0-10)

4. **name_length_check**
   - 이름 최대 길이 제한 (100자)

---

## 🔐 RLS (Row Level Security)

### RLS 활성화

```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 관리자 정책 (선택사항)
-- CREATE POLICY "Admins can view all users" ON users
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE id = auth.uid()::bigint 
--       AND is_admin = TRUE
--     )
--   );
```

### 초기 설정 (개발 단계)

개발 단계에서는 RLS를 비활성화하여 테스트를 용이하게 할 수 있습니다:

```sql
-- 개발 단계: RLS 비활성화 (프로덕션에서는 활성화 필수)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

---

## 📊 확장 가능한 컬럼 (선택사항)

향후 필요시 추가할 수 있는 컬럼:

```sql
-- 프로필 관련
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 권한 관련
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 알림 설정
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE;

-- 비밀번호 정책 관련
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP WITH TIME ZONE;

-- 감사 로그
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_email_change TIMESTAMP WITH TIME ZONE;
```

---

## 🔄 관계형 설계

### 외래키 관계

```
users
├── id (PK)
└── created_by → users.id (FK, 자기 참조)
    └── 계정을 생성한 사용자 (일반적으로 자기 자신, 관리자가 생성한 경우 관리자 ID)
```

### 다른 테이블과의 관계

```
users (1) ──< (N) transactions
users (1) ──< (N) categories  
users (1) ──< (N) budgets
```

---

## ✅ 데이터 검증 로직 (애플리케이션 레벨)

### 회원가입 시 검증

1. **이메일**
   - 형식 검증 (정규식)
   - 중복 체크 (DB UNIQUE 제약)

2. **비밀번호**
   - 최소 8자, 최대 64자
   - 영문 대소문자, 숫자, 특수문자 포함
   - 연속 문자/반복 문자 체크
   - 사용자 정보와 유사성 체크

3. **이름**
   - 최대 100자
   - 특수문자 제한 (선택사항)

### 로그인 시 검증

1. 이메일 형식 검증
2. 계정 존재 확인
3. 계정 활성화 상태 확인
4. 계정 잠금 상태 확인 (`locked_until`)
5. 비밀번호 일치 확인 (bcrypt.compare)
6. 로그인 성공 시 `last_login_at` 업데이트, `login_attempts` 초기화
7. 로그인 실패 시 `login_attempts` 증가, 5회 이상 시 계정 잠금

---

## 📋 예시 데이터

```sql
-- 테스트 사용자 (비밀번호: Test1234!)
-- 실제 해시값은 애플리케이션에서 생성 필요
INSERT INTO users (email, password, name, created_by) 
VALUES (
  'test@example.com',
  '$2b$10$rK8X8qX8X8X8X8X8X8X8OeK8X8X8X8X8X8X8X8X8X8X8X8X8X', -- 실제 해시값으로 교체
  '테스트 사용자',
  1
);
```

---

## 🔧 유지보수 및 모니터링

### 유용한 쿼리

```sql
-- 활성 사용자 수
SELECT COUNT(*) FROM users WHERE is_active = TRUE;

-- 최근 가입자 (7일)
SELECT * FROM users 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 마지막 로그인 이후 30일 이상 비활성 사용자
SELECT * FROM users 
WHERE last_login_at < NOW() - INTERVAL '30 days'
AND is_active = TRUE;

-- 잠금된 계정
SELECT * FROM users 
WHERE locked_until IS NOT NULL 
AND locked_until > NOW();

-- 로그인 시도 실패가 많은 계정
SELECT * FROM users 
WHERE login_attempts >= 3
ORDER BY login_attempts DESC;
```

---

이 스키마 설계를 기반으로 회원가입 및 로그인 기능을 구현하세요!

