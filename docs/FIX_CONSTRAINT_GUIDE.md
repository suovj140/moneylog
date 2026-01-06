# 체크 제약 조건 오류 수정 가이드

## 🔴 발생한 오류
```
new row for relation "transactions" violates check constraint "transactions_type_check"
```

## 🔧 해결 방법

### 1. Supabase SQL Editor에서 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 아래 SQL을 복사하여 실행:

```sql
-- 기존 체크 제약 조건이 있다면 삭제
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 새로운 체크 제약 조건 추가 (income, expense, transfer 허용)
ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'transfer'));
```

### 2. 또는 `fix_transactions_constraint.sql` 파일 실행

프로젝트에 있는 `fix_transactions_constraint.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

### 3. 확인

제약 조건이 제대로 설정되었는지 확인:

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'transactions'::regclass
AND conname = 'transactions_type_check';
```

결과가 다음과 같이 나와야 합니다:
- `constraint_name`: `transactions_type_check`
- `constraint_definition`: `CHECK ((type = ANY (ARRAY['income'::character varying, 'expense'::character varying, 'transfer'::character varying])))`

## ✅ 해결 후

SQL 실행 후 앱에서 거래를 다시 추가해보세요. 이제 정상적으로 작동해야 합니다.

## 📝 추가 개선 사항

코드에서도 에러 처리를 개선했습니다:
- Type 값 검증 추가
- 더 명확한 에러 메시지
- 체크 제약 조건 에러에 대한 친절한 안내

---

**참고**: 이 제약 조건은 `transactions` 테이블의 `type` 컬럼이 'income', 'expense', 'transfer' 중 하나만 허용하도록 보장합니다.

