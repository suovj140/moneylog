# 머니로그 (MoneyLog) 💰

개인 금융 관리를 위한 스마트 가계부 서비스 - 수입/지출 기록, 예산 관리, 통계 분석을 한 곳에서

## 📝 프로젝트 소개

**머니로그**는 수입과 지출을 쉽게 기록하고 관리할 수 있는 현대적인 가계부 웹 애플리케이션입니다. 직관적인 UI와 강력한 분석 기능을 통해 소비 습관을 파악하고 개선할 수 있도록 도와줍니다. Supabase를 활용한 안전한 클라우드 저장과 6개국어 지원으로 전 세계 사용자가 이용할 수 있습니다.

### 한 줄 소개
```
머니로그는 수입·지출 기록, 카테고리별 예산 관리, 월별 통계 분석을 제공하는 스마트 가계부입니다. 
반복 거래, 자동 분류, 거래 사진 첨부 등 편리한 기능과 6개국어 지원으로 전 세계 사용자가 
손쉽게 가계를 관리할 수 있습니다.
```

## ✨ 주요 기능

### 📊 거래 관리
- **수입/지출 기록**: 날짜, 금액, 카테고리, 결제수단, 메모를 포함한 상세 거래 내역 관리
- **거래 수정/삭제**: 더블클릭으로 빠른 수정, 일괄 삭제 기능
- **거래 사진 첨부**: 거래당 최대 5장의 사진 첨부 및 관리 (Supabase Storage)
- **이미지 압축**: 클라이언트 사이드 자동 이미지 압축으로 저장 공간 최적화
- **카테고리 분류**: 식비, 교통비, 쇼핑, 문화생활, 의료비, 통신비, 생활비, 교육, 기타 등
- **결제 수단 관리**: 현금, 체크카드, 신용카드, 계좌이체, 기타

### 📈 분석 및 보고서
- **월별 요약 대시보드**: 수입, 지출, 잔액을 한눈에 파악
- **카테고리별 파이 차트**: 지출/수입 카테고리별 비중 시각화 (Recharts)
- **일별 추이 그래프**: 월별 지출/수입 패턴을 라인 차트로 분석
- **월평균 기준선**: 월평균 지출/수입 라인 표시로 추세 파악
- **통계 화면**: 카테고리별 통계, 일별 합계 바 차트, 날짜별 거래 내역 리스트

### 💼 예산 관리
- **카테고리별 예산 설정**: 각 카테고리별 월 예산 설정 및 관리
- **실시간 사용률**: 예산 사용률을 진행바로 시각화
- **예산 초과 알림**: 예산 초과 시 시각적 경고 표시
- **월별 예산 추적**: 선택한 월의 예산 대비 실제 지출 비교

### 🔄 자동화 기능
- **반복 거래**: 구독, 월세, 급여 등 정기 거래 자동 생성
  - 주기 설정: 매일, 매주, 매달, 매년, 커스텀 주기
  - 시작일/종료일 설정
  - 요일별 필터링 (평일만, 주말만 등)
  - 자동 생성 및 수동 생성 옵션
- **자동 분류 규칙**: 거래 자동 분류를 위한 스마트 규칙
  - 키워드 기반 분류 (메모 내용 매칭)
  - 가맹점 패턴 매칭
  - 금액 범위 기반 분류
  - 복합 조건 (AND/OR 연산자)
  - 우선순위 설정

### 🎨 사용자 경험
- **다국어 지원**: 한국어, 영어, 일본어, 중국어, 베트남어, 필리핀어 (react-i18next)
- **테마 시스템**: 밝은 테마 / 어두운 테마 (실시간 전환)
- **반응형 디자인**: PC, 태블릿, 모바일 최적화 (Mobile First)
- **PWA 지원**: 오프라인 사용 및 홈 화면 설치 가능
- **직관적인 UI**: 사이드바 네비게이션, 플로팅 액션 버튼, 모달 기반 입력

### 👤 사용자 관리
- **회원가입/로그인**: 이메일 기반 인증 시스템
- **비밀번호 보안**: bcrypt 해싱, 강력한 비밀번호 검증
- **계정 보안**: 로그인 시도 제한, 계정 잠금 기능
- **프로필 관리**: 프로필 사진 업로드/삭제 (Supabase Storage)
- **사용자별 데이터 격리**: 각 사용자의 거래 내역 완전 분리

### ⚙️ 데이터 관리
- **클라우드 저장**: Supabase PostgreSQL 데이터베이스
- **실시간 동기화**: 모든 기기에서 실시간 데이터 동기화
- **데이터 백업**: 자동 클라우드 백업으로 데이터 손실 방지
- **사진 저장**: Supabase Storage를 통한 안전한 이미지 저장

## 🚀 기술 스택

### Frontend
- **React 18** + **TypeScript**: 타입 안정성과 최신 React 기능 활용
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **React Router v6**: 클라이언트 사이드 라우팅 및 보호된 라우트
- **Recharts**: 데이터 시각화 차트 라이브러리 (파이 차트, 라인 차트, 바 차트)
- **date-fns**: 날짜 처리 및 포맷팅

### Backend & Database
- **Supabase**: 
  - PostgreSQL 데이터베이스 (거래 내역, 사용자, 예산, 반복 거래, 자동 분류 규칙)
  - 인증 시스템 (이메일/비밀번호 기반)
  - 스토리지 (프로필 이미지, 거래 사진)
  - Row Level Security (RLS)를 통한 데이터 보안

### UI/UX 라이브러리
- **react-i18next**: 다국어 지원 (6개 언어)
- **browser-image-compression**: 클라이언트 사이드 이미지 압축
- **bcryptjs**: 비밀번호 해싱

### 개발 도구
- **TypeScript**: 타입 안정성
- **ESLint**: 코드 품질 관리
- **Vite PWA Plugin**: PWA 기능 지원

## 📦 설치 및 실행

### 필요 조건
- **Node.js**: 18 이상
- **npm** 또는 **yarn**
- **Supabase 프로젝트**: 백엔드 서비스 (환경 변수 설정 필요)

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd housebook

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Supabase 프로젝트 설정은 `docs/` 폴더의 문서를 참고하세요:
- `SETUP_INSTRUCTIONS.md`: 기본 설정 가이드
- `SUPABASE_SETUP.md`: Supabase 초기 설정
- `DATABASE_SCHEMA.md`: 데이터베이스 스키마 정보

### 데이터베이스 설정

Supabase SQL Editor에서 다음 스크립트를 순서대로 실행하세요:

1. `sql/CREATE_USERS_TABLE_SIMPLE.sql` - 사용자 테이블 생성
2. `sql/CREATE_TRANSACTIONS_TABLE.sql` - 거래 내역 테이블 생성
3. `sql/setup_transaction_photos.sql` - 거래 사진 테이블 및 스토리지 설정
4. `sql/setup_profile_storage_simple.sql` - 프로필 이미지 스토리지 설정
5. `sql/setup_auto_classification_and_recurring.sql` - 반복 거래 및 자동 분류 테이블 설정

자세한 내용은 `docs/` 폴더의 문서를 참고하세요.

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
# TypeScript 타입 체크 및 빌드
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 빌드 미리보기

```bash
npm run preview
```

## 📂 프로젝트 구조

```
housebook/
├── docs/                      # 문서 파일
│   ├── SETUP_INSTRUCTIONS.md  # 설치 가이드
│   ├── SUPABASE_SETUP.md      # Supabase 설정
│   ├── DATABASE_SCHEMA.md     # 데이터베이스 스키마
│   ├── DEPLOYMENT.md          # 배포 가이드
│   ├── AUTO_CLASSIFICATION_AND_RECURRING_TRANSACTIONS.md
│   ├── PREMIUM_FEATURES.md    # 향후 프리미엄 기능
│   └── ...
├── sql/                       # SQL 스크립트
│   ├── CREATE_USERS_TABLE_SIMPLE.sql
│   ├── CREATE_TRANSACTIONS_TABLE.sql
│   ├── setup_transaction_photos.sql
│   ├── setup_profile_storage_simple.sql
│   ├── setup_auto_classification_and_recurring.sql
│   └── ...
├── scripts/                   # 유틸리티 스크립트
│   └── create-transactions-table.js
├── public/                    # 정적 파일
│   └── app-icon.png
├── src/
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── auth/              # 인증 페이지
│   │   │   ├── Login.tsx       # 로그인
│   │   │   └── Signup.tsx      # 회원가입
│   │   ├── Calendar.tsx        # 홈 화면 (달력)
│   │   ├── Transactions.tsx    # 거래 내역
│   │   ├── Reports.tsx         # 보고서
│   │   ├── Statistics.tsx     # 통계
│   │   ├── Budgets.tsx         # 예산 관리
│   │   ├── Settings.tsx        # 설정
│   │   ├── RecurringTransactions.tsx  # 반복 거래
│   │   └── AutoClassificationRules.tsx # 자동 분류 규칙
│   ├── components/            # 재사용 컴포넌트
│   │   ├── Layout/            # 레이아웃 컴포넌트
│   │   │   ├── MainLayout.tsx  # 메인 레이아웃
│   │   │   ├── Sidebar.tsx     # 사이드바
│   │   │   └── TopNavigation.tsx
│   │   ├── TransactionModal.tsx    # 거래 추가/수정 모달
│   │   ├── DatePicker.tsx      # 날짜 선택기
│   │   ├── FloatingActionButton.tsx # 플로팅 액션 버튼
│   │   └── ProtectedRoute.tsx  # 보호된 라우트
│   ├── services/              # API 서비스
│   │   ├── authService.ts      # 인증 서비스
│   │   ├── transactionService.ts      # 거래 내역 서비스
│   │   ├── transactionPhotoService.ts   # 거래 사진 서비스
│   │   ├── budgetService.ts            # 예산 서비스
│   │   ├── recurringTransactionService.ts  # 반복 거래 서비스
│   │   └── autoClassificationRuleService.ts # 자동 분류 서비스
│   ├── contexts/              # React Context
│   │   ├── ThemeContext.tsx    # 테마 관리
│   │   └── SidebarContext.tsx # 사이드바 상태 관리
│   ├── i18n/                  # 다국어 설정
│   │   ├── config.ts          # i18n 설정
│   │   └── locales/           # 번역 파일
│   │       ├── ko.json        # 한국어
│   │       ├── en.json        # 영어
│   │       ├── ja.json        # 일본어
│   │       ├── zh.json        # 중국어
│   │       ├── vi.json        # 베트남어
│   │       └── fil.json       # 필리핀어
│   ├── lib/                   # 라이브러리 설정
│   │   └── supabase.ts        # Supabase 클라이언트
│   ├── utils/                 # 유틸리티 함수
│   │   ├── imageCompression.ts    # 이미지 압축
│   │   ├── passwordValidation.ts  # 비밀번호 검증
│   │   └── userHelper.ts          # 사용자 헬퍼
│   ├── styles/                # 스타일
│   │   └── theme.ts            # 테마 설정
│   ├── App.tsx                 # 메인 앱 컴포넌트
│   ├── main.tsx               # 진입점
│   └── index.css               # 전역 스타일
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts             # Vite 설정 (PWA 포함)
└── README.md
```

## 🎨 주요 화면

### 1. 홈 (Calendar)
- **월별 달력 표시**: 날짜별 수입/지출 합계를 달력에 표시
- **월별 요약**: 수입, 지출, 잔액을 한눈에 파악
- **날짜 선택**: 날짜 클릭 시 상세 내역 확인
- **모바일 팝업**: 모바일에서 날짜 클릭 시 하단 모달로 상세 내역 표시
- **PC 메모 섹션**: PC에서는 오른쪽에 선택한 날짜의 거래 내역 표시

### 2. 거래 내역 (Transactions)
- **거래 목록**: 날짜별로 그룹화된 거래 내역 표시
- **월별 요약**: 선택한 월의 수입/지출/합계 표시
- **거래 추가/수정/삭제**: 플로팅 버튼으로 거래 추가, 더블클릭으로 수정
- **일괄 삭제**: 체크박스로 여러 거래 선택 후 일괄 삭제
- **필터링**: 날짜별, 카테고리별 필터링

### 3. 보고서 (Reports)
- **월별 요약**: 수입/지출/합계 카드 표시
- **카테고리별 파이 차트**: 지출/수입 카테고리별 비중 시각화
- **일별 추이 그래프**: 월별 지출/수입 패턴을 라인 차트로 표시
- **월평균 기준선**: 월평균 지출/수입 라인 표시
- **2x2 그리드 레이아웃**: PC에서 차트를 그리드로 배치

### 4. 통계 (Statistics)
- **카테고리별 파이 차트**: 선택한 타입(수입/지출)의 카테고리별 비중
- **일별 합계 바 차트**: 일별 거래 금액을 바 차트로 표시
- **날짜별 거래 내역**: 날짜별로 그룹화된 상세 거래 내역 리스트
- **타입 필터링**: 수입/지출 필터링

### 5. 예산 (Budgets)
- **카테고리별 예산 설정**: 각 카테고리별 월 예산 설정
- **예산 사용률**: 예산 대비 실제 지출 비율을 진행바로 표시
- **예산 초과 알림**: 예산 초과 시 시각적 경고
- **월별 예산 관리**: 선택한 월의 예산 설정 및 추적

### 6. 반복 거래 (Recurring Transactions)
- **반복 거래 목록**: 등록된 모든 반복 거래 표시
- **반복 거래 추가**: 주기, 시작일, 종료일 설정
- **자동 생성**: 설정된 주기에 따라 자동으로 거래 생성
- **수동 생성**: 필요 시 수동으로 거래 생성
- **다가오는 거래**: 향후 생성될 거래 미리보기

### 7. 자동 분류 규칙 (Auto Classification Rules)
- **규칙 목록**: 등록된 모든 자동 분류 규칙 표시
- **규칙 추가/수정**: 키워드, 가맹점, 금액 범위 기반 규칙 설정
- **복합 조건**: AND/OR 연산자를 사용한 복합 조건 설정
- **우선순위 관리**: 규칙 우선순위 설정으로 매칭 순서 제어
- **테스트 기능**: 규칙이 올바르게 작동하는지 테스트

### 8. 설정 (Settings)
- **프로필 관리**: 프로필 사진 업로드/삭제
- **테마 선택**: 밝은 테마 / 어두운 테마 전환
- **언어 설정**: 6개 언어 중 선택 (한국어, 영어, 일본어, 중국어, 베트남어, 필리핀어)
- **데이터 내보내기**: 거래 내역 CSV 다운로드 (예정)
- **기능 안내**: 각 기능에 대한 설명

## 🔐 보안 기능

- **비밀번호 해싱**: bcrypt를 사용한 안전한 비밀번호 저장
- **강력한 비밀번호 검증**: 최소 길이, 특수문자, 대소문자 요구사항
- **계정 잠금**: 로그인 실패 시도 제한
- **Row Level Security**: Supabase RLS를 통한 사용자별 데이터 격리
- **세션 관리**: 로컬 스토리지를 통한 사용자 세션 관리

## 🌐 다국어 지원

머니로그는 다음 6개 언어를 지원합니다:
- 🇰🇷 한국어 (Korean)
- 🇺🇸 영어 (English)
- 🇯🇵 일본어 (Japanese)
- 🇨🇳 중국어 (Chinese)
- 🇻🇳 베트남어 (Vietnamese)
- 🇵🇭 필리핀어 (Filipino)

모든 UI 텍스트, 카테고리명, 결제수단명이 각 언어로 번역되어 제공됩니다.

## 📱 PWA (Progressive Web App)

머니로그는 PWA로 제작되어 다음과 같은 기능을 제공합니다:
- **오프라인 지원**: 서비스 워커를 통한 오프라인 사용
- **홈 화면 설치**: 모바일/데스크톱 홈 화면에 앱으로 설치 가능
- **앱 아이콘**: 커스텀 앱 아이콘 지원

## 🔮 향후 계획

### 프리미엄 기능 (예정)
- 🤖 **AI 금융 관리 어시스턴트**: 소비 패턴 분석 및 맞춤형 절약 조언
- 📊 **심층 데이터 분석**: 다양한 관점에서의 지출 분석 및 예측
- 🧾 **영수증 OCR**: 영수증 사진으로 자동 거래 등록
- 🔔 **푸시 알림**: 예산 초과, 반복 거래 생성 알림
- 👨‍👩‍👧‍👦 **가족 공유 기능**: 가족 구성원과 가계부 공유

### 기타 개선 사항
- [ ] CSV 데이터 가져오기 (Import)
- [ ] 다중 통화 지원
- [ ] 웹 푸시 알림
- [ ] 모바일 앱 (React Native)
- [ ] 데이터 백업/복원 기능 강화

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

## 🤝 기여

이슈 및 개선 사항은 이슈 트래커를 통해 제안해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

## 🙏 감사의 말

이 프로젝트는 다음과 같은 오픈소스 라이브러리를 사용합니다:
- React
- Supabase
- Recharts
- date-fns
- react-i18next
- 그리고 많은 다른 오픈소스 프로젝트들

---

**머니로그 (MoneyLog)** - 소비 습관 개선을 위한 스마트 가계부 📊💰
