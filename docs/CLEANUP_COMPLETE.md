# 데이터베이스 정리 완료

## ✅ 완료된 작업

1. **테이블 삭제 SQL 생성**: `drop_all_tables.sql`
2. **스키마 파일 정리**: `supabase_schema.sql` 초기화
3. **타입 정의 정리**: `src/lib/supabase.ts`에서 테이블 타입 제거
4. **불필요한 파일 삭제**: 제약 조건 관련 SQL 파일 삭제

## 🗑️ 삭제할 테이블

다음 테이블들이 삭제 대상입니다:
- `budgets`
- `transactions`
- `categories`
- `users`

## 📋 다음 단계

### 1. Supabase에서 테이블 삭제

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. `drop_all_tables.sql` 파일의 내용을 복사하여 실행

또는 직접 실행:

```sql
-- 모든 테이블 삭제
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### 2. 확인

다음 SQL로 테이블이 모두 삭제되었는지 확인:

```sql
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

결과가 비어있으면 모든 테이블이 삭제된 것입니다.

### 3. 새 스키마 생성 (필요 시)

새로운 테이블 구조를 만들 때는:
1. `supabase_schema.sql` 파일에 새 SQL 작성
2. Supabase SQL Editor에서 실행

## ⚠️ 주의사항

- **CASCADE 옵션**: 외래키 제약 조건 때문에 `CASCADE`를 사용하여 모든 관련 객체를 함께 삭제합니다.
- **데이터 복구 불가**: 삭제된 데이터는 복구할 수 없습니다.
- **코드 호환성**: 테이블이 삭제되면 현재 코드는 에러를 발생시킬 수 있습니다. 새 테이블을 생성하거나 로컬 스토리지 폴백을 사용합니다.

---

**정리 완료**: 모든 테이블 관련 정보가 코드에서 제거되었습니다.

