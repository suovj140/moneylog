/**
 * Supabase 테이블 생성 안내 스크립트
 * 
 * 참고: Supabase REST API로는 DDL(테이블 생성)을 직접 실행할 수 없습니다.
 * 이 스크립트는 SQL을 준비하고 안내만 제공합니다.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Supabase 테이블 생성 준비 중...\n');

// SQL 파일 읽기
const sqlFile = path.join(__dirname, 'CREATE_TRANSACTIONS_TABLE.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

console.log('✅ SQL 파일을 읽었습니다.\n');
console.log('📋 아래 단계를 따라 Supabase에 테이블을 생성하세요:\n');
console.log('━'.repeat(60));
console.log('1단계: https://supabase.com/dashboard 접속');
console.log('2단계: 프로젝트 선택');
console.log('3단계: 좌측 메뉴에서 "SQL Editor" 클릭');
console.log('4단계: "New query" 클릭 (또는 새 쿼리 창 열기)');
console.log('5단계: 아래 SQL을 복사하여 붙여넣기');
console.log('6단계: "RUN" 버튼 클릭 (또는 Ctrl+Enter)');
console.log('━'.repeat(60));
console.log('\n📝 SQL 코드:\n');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('\n✅ 실행 후 Table Editor에서 transactions 테이블이 생성되었는지 확인하세요!\n');

