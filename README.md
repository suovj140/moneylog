# 머니로그 (MoneyLog) 💰

개인 금융 관리를 위한 스마트 가계부 서비스 - 수입/지출 기록, 예산 관리, 통계 분석을 한 곳에서

## 📝 프로젝트 소개

**머니로그**는 수입과 지출을 쉽게 기록하고 관리할 수 있는 현대적인 가계부 애플리케이션입니다. 직관적인 UI와 강력한 분석 기능을 통해 소비 습관을 파악하고 개선할 수 있도록 도와줍니다.

### 한 줄 소개 (200자 이내)
```
머니로그는 수입·지출 기록, 카테고리별 예산 관리, 월별 통계 분석을 제공하는 스마트 가계부입니다. 
반복 거래, 자동 분류, 거래 사진 첨부 등 편리한 기능과 6개국어 지원으로 전 세계 사용자가 
손쉽게 가계를 관리할 수 있습니다.
```

## ✨ 주요 기능

### 📊 핵심 기능
- **거래 관리**: 수입/지출 내역 추가, 수정, 삭제
- **카테고리 분류**: 식비, 교통비, 쇼핑 등 카테고리별 관리
- **결제 수단 관리**: 현금, 체크카드, 신용카드, 계좌이체 등
- **거래 사진 첨부**: 거래당 최대 5장의 사진 첨부 가능

### 📈 분석 및 보고서
- **월별 요약**: 수입, 지출, 잔액 한눈에 파악
- **카테고리별 통계**: 파이 차트로 지출 비중 시각화
- **일별 추이 그래프**: 월별 지출 패턴 분석
- **월평균 기준선**: 월평균 지출/수입 라인 표시

### 💼 예산 관리
- **카테고리별 예산 설정**: 각 카테고리별 월 예산 설정
- **실시간 사용률**: 예산 사용률을 진행바로 표시
- **예산 초과 알림**: 예산 초과 시 시각적 경고

### 🔄 자동화 기능
- **반복 거래**: 구독, 월세 등 정기 거래 자동 생성
- **자동 분류 규칙**: 키워드, 가맹점, 금액 범위 기반 자동 분류
- **반복 주기 설정**: 매일, 매주, 매달, 매년, 커스텀 주기

### 🎨 사용자 경험
- **다국어 지원**: 한국어, 영어, 일본어, 중국어, 베트남어, 필리핀어
- **테마 선택**: 밝은 테마 / 어두운 테마
- **반응형 디자인**: PC, 태블릿, 모바일 최적화
- **PWA 지원**: 오프라인 사용 및 홈 화면 설치

### ⚙️ 데이터 관리
- **CSV 내보내기**: 모든 거래 내역을 CSV 파일로 다운로드
- **프로필 관리**: 프로필 사진 업로드 및 관리
- **데이터 백업**: Supabase 클라우드 저장

## 🚀 기술 스택

### Frontend
- **React 18** + **TypeScript**: 타입 안정성과 최신 React 기능 활용
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **React Router v6**: 클라이언트 사이드 라우팅
- **Recharts**: 데이터 시각화 차트 라이브러리
- **date-fns**: 날짜 처리 및 포맷팅

### Backend & Database
- **Supabase**: 
  - PostgreSQL 데이터베이스
  - 인증 시스템
  - 스토리지 (프로필 이미지, 거래 사진)

### UI/UX
- **반응형 디자인**: Mobile First 접근 방식
- **PWA (Progressive Web App)**: 오프라인 지원
- **다국어 (i18n)**: react-i18next
- **테마 시스템**: 다크/라이트 모드

### 이미지 처리
- **browser-image-compression**: 클라이언트 사이드 이미지 압축

## 📦 설치 및 실행

### 필요 조건
- **Node.js**: 18 이상
- **npm** 또는 **yarn**
- **Supabase 프로젝트**: 백엔드 서비스 (환경 변수 설정 필요)

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 Supabase 설정을 추가하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드

```bash
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
│   ├── AUTO_CLASSIFICATION_AND_RECURRING_TRANSACTIONS.md
│   ├── PREMIUM_FEATURES.md
│   ├── DEPLOYMENT.md
│   └── ...
├── sql/                       # SQL 스크립트
│   ├── setup_transaction_photos.sql
│   ├── setup_auto_classification_and_recurring.sql
│   └── ...
├── scripts/                   # 유틸리티 스크립트
├── public/                    # 정적 파일
├── src/
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── auth/              # 인증 페이지 (로그인, 회원가입)
│   │   ├── Calendar.tsx       # 홈 화면 (달력)
│   │   ├── Transactions.tsx   # 거래 내역
│   │   ├── Reports.tsx        # 보고서
│   │   ├── Statistics.tsx     # 통계
│   │   ├── Budgets.tsx        # 예산 관리
│   │   ├── Settings.tsx       # 설정
│   │   ├── RecurringTransactions.tsx  # 반복 거래
│   │   └── AutoClassificationRules.tsx # 자동 분류 규칙
│   ├── components/            # 재사용 컴포넌트
│   │   ├── Layout/            # 레이아웃 컴포넌트
│   │   ├── TransactionModal.tsx
│   │   ├── DatePicker.tsx
│   │   └── FloatingActionButton.tsx
│   ├── services/              # API 서비스
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── transactionPhotoService.ts
│   │   ├── recurringTransactionService.ts
│   │   └── ...
│   ├── contexts/              # React Context
│   │   ├── ThemeContext.tsx
│   │   └── SidebarContext.tsx
│   ├── i18n/                  # 다국어 설정
│   │   ├── locales/
│   │   │   ├── ko.json        # 한국어
│   │   │   ├── en.json        # 영어
│   │   │   ├── ja.json        # 일본어
│   │   │   ├── zh.json        # 중국어
│   │   │   ├── vi.json        # 베트남어
│   │   │   └── fil.json       # 필리핀어
│   │   └── index.ts
│   ├── utils/                 # 유틸리티 함수
│   │   ├── imageCompression.ts
│   │   └── ...
│   ├── App.tsx                # 메인 앱 컴포넌트
│   ├── main.tsx               # 진입점
│   └── index.css              # 전역 스타일
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts             # Vite 설정 (PWA 포함)
└── README.md
```

## 🎨 주요 화면

### 1. 홈 (Calendar)
- 월별 달력 표시
- 날짜별 수입/지출 합계
- 날짜 클릭 시 상세 내역 팝업 (모바일)
- 오른쪽 메모 섹션 (PC)

### 2. 거래 내역 (Transactions)
- 거래 내역 추가/수정/삭제
- 날짜별 거래 목록
- 월별 요약 (수입/지출/합계)
- 더블클릭으로 수정 (PC/모바일)

### 3. 보고서 (Reports)
- 월별 수입/지출 요약
- 카테고리별 파이 차트 (지출/수입)
- 일별 추이 그래프 (라인 차트)
- 월평균 기준선 표시

### 4. 통계 (Statistics)
- 카테고리별 비중 차트
- 일별 합계 바 차트
- 날짜별 거래 내역 리스트
- 수입/지출 필터링

### 5. 예산 (Budgets)
- 카테고리별 월 예산 설정
- 예산 사용률 표시
- 예산 초과 알림
- 예산 수정/삭제

### 6. 설정 (Settings)
- 프로필 관리 (사진 업로드/삭제)
- 테마 선택 (밝은 테마/어두운 테마)
- 언어 설정 (6개 언어)
- 데이터 내보내기 (CSV)
- 기능 안내

## 🔮 향후 계획

### 프리미엄 기능 (예정)
- 🤖 **AI 금융 관리 어시스턴트**: 소비 패턴 분석 및 맞춤형 절약 조언
- 📊 **심층 데이터 분석**: 다양한 관점에서의 지출 분석 및 예측
- 🧾 **영수증 OCR**: 영수증 사진으로 자동 거래 등록
- 🔔 **푸시 알림**: 예산 초과, 반복 거래 생성 알림
- 👨‍👩‍👧‍👦 **가족 공유 기능**: 가족 구성원과 가계부 공유

### 기타 개선 사항
- [ ] 데이터 가져오기 (CSV Import)
- [ ] 다중 통화 지원
- [ ] 웹 푸시 알림
- [ ] 모바일 앱 (React Native)

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

## 🤝 기여

이슈 및 개선 사항은 이슈 트래커를 통해 제안해주세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**머니로그 (MoneyLog)** - 소비 습관 개선을 위한 스마트 가계부 📊💰
