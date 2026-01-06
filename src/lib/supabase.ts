import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL과 Anon Key가 설정되지 않았습니다.\n' +
    '.env 파일을 생성하고 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정해주세요.\n' +
    '.env.example 파일을 참고하세요.'
  )
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
// 테이블이 재생성되면 여기에 타입을 다시 정의하세요
export interface Database {
  public: {
    Tables: {
      // 테이블이 삭제되었으므로 타입 정의 제거
      // 새 테이블을 생성하면 여기에 타입을 추가하세요
    }
  }
}
