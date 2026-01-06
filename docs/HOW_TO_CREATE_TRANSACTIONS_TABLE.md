# Transactions 테이블 생성 가이드

## 🚀 간단한 3단계로 테이블 생성하기

### 1단계: Supabase Dashboard 접속

1. 브라우저에서 [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 로그인 후 프로젝트 선택 (또는 프로젝트 생성)

### 2단계: SQL Editor 열기

1. 좌측 메뉴에서 **SQL Editor** 클릭 (아이콘: `</>`)
2. **New query** 버튼 클릭 (또는 이미 열려있으면 그대로 사용)

### 3단계: SQL 실행

1. `CREATE_TRANSACTIONS_TABLE.sql` 파일을 열어서 **전체 내용** 복사
2. Supabase SQL Editor에 붙여넣기
3. 오른쪽 하단의 **RUN** 버튼 클릭 (또는 `Ctrl + Enter`)

## ✅ 확인 방법

### 방법 1: Table Editor에서 확인

1. 좌측 메뉴에서 **Table Editor** 클릭
2. `transactions` 테이블이 보이는지 확인
3. 안 보이면 페이지 새로고침 (F5)

### 방법 2: SQL로 확인

SQL Editor에서 다음 쿼리 실행:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'transactions';
```

결과에 `transactions`가 나오면 성공!

## ⚠️ 주의사항

### users 테이블이 없으면?

`transactions` 테이블은 `users` 테이블을 참조합니다. 만약 `users` 테이블이 없다면:

1. 먼저 `supabase_users_table.sql` 파일을 실행하여 `users` 테이블 생성
2. 그 다음 `CREATE_TRANSACTIONS_TABLE.sql` 실행

### 에러가 발생하면?

**에러 1: "relation 'users' does not exist"**
- 해결: `users` 테이블을 먼저 생성하세요

**에러 2: "function update_updated_at_column() does not exist"**
- 해결: SQL 스크립트 상단의 함수 생성 부분이 실행되었는지 확인하세요
- 또는 `CREATE_TRANSACTIONS_TABLE.sql` 파일의 전체 내용을 다시 실행하세요

**에러 3: "permission denied"**
- 해결: Supabase 프로젝트의 관리자 권한이 있는지 확인하세요

## 📝 SQL 파일 위치

- `CREATE_TRANSACTIONS_TABLE.sql` - 이 파일 전체를 실행하세요
- `supabase_transactions_table.sql` - 원본 파일 (함수 포함 안됨)
- `SUPABASE_TRANSACTIONS_SETUP.md` - 상세 가이드

---

**테이블 생성 후 애플리케이션을 새로고침하면 거래 내역 추가가 작동합니다!** 🎉

