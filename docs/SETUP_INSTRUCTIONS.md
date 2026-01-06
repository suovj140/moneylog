# Supabase Users 테이블 설정 가이드

## 🔴 에러 해결 방법

현재 `Could not find the table 'public.users'` 에러가 발생하고 있습니다.
이는 Supabase에 `users` 테이블이 생성되지 않았거나 캐시 문제일 수 있습니다.

## ✅ 해결 단계

### 1단계: Supabase 대시보드 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭

### 2단계: 테이블 확인
`CHECK_TABLE.sql` 파일의 내용을 SQL Editor에 붙여넣고 실행하여 테이블이 존재하는지 확인합니다.

### 3단계: 테이블 생성
`CREATE_USERS_TABLE_SIMPLE.sql` 파일의 내용을 SQL Editor에 붙여넣고 실행합니다.

**중요:**
- 이 스크립트는 기존 `users` 테이블을 삭제하고 새로 생성합니다
- 기존 데이터가 있다면 모두 삭제됩니다
- 프로덕션 환경에서는 주의해서 실행하세요

### 4단계: 실행 확인
실행 후 다음과 같은 메시지가 보이면 성공입니다:
```
Users 테이블이 성공적으로 생성되었습니다!
table_exists: 1
```

### 5단계: Supabase 캐시 새로고침 (필요시)
1. Supabase 대시보드에서 **Settings** → **API** 클릭
2. 페이지를 새로고침하거나 잠시 기다린 후 다시 시도

## 🧪 테스트

테이블이 생성되었는지 확인하려면 다음 쿼리를 실행하세요:

```sql
SELECT * FROM users LIMIT 1;
```

에러가 없으면 테이블이 정상적으로 생성된 것입니다.

## ⚠️ 문제가 계속되면

1. **RLS 정책 확인**: 
   - Table Editor에서 `users` 테이블 선택
   - **RLS** 탭에서 정책이 활성화되어 있는지 확인

2. **API 키 확인**:
   - Settings → API에서 Service Role Key가 올바른지 확인
   - `.env` 파일의 키가 올바른지 확인

3. **스키마 확인**:
   - Settings → Database → Connection string 확인
   - Schema가 `public`인지 확인

## 📝 참고

- 개발 단계에서는 RLS를 완전히 비활성화할 수도 있습니다:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ```
  (프로덕션에서는 보안상 비활성화하지 마세요)

