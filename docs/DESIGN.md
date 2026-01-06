# HouseBook - 설계 문서

## 1. 프로젝트 개요

### 1.1 제품 전략
**단일 백엔드(API) + 2개 클라이언트로 시작 → 확장**

- **Web(PWA) + Admin**: 반응형(Responsive)으로 먼저 MVP 구현
- **Mobile App**: Flutter로 iOS/Android (필요 시 나중에)
- **Windows EXE**: 초기엔 PWA를 데스크톱 웹앱으로 배포하거나, 정 필요 시 Flutter Desktop 또는 Tauri/Electron로 패키징

### 1.2 설계 방향
- **API-First 아키텍처**: 백엔드를 먼저 표준화하여 클라이언트를 순차적으로 확장
- **MVP 우선**: 반응형 웹(PWA)로 빠르게 검증 가능
- **확장성 고려**: 도메인/데이터/서버를 표준화해두면 클라이언트 재작업 최소화

## 2. 사용자 요구사항

### 2.1 페르소나
1. **개인 사용자(기본)**: 빠른 입력, 자동 분류, 월별 리포트 선호
2. **가족/커플(공유)**: 공동 계정/지갑 공유, 권한/가시성 필요
3. **엑셀·회계형(고급)**: CSV 내보내기, 태그/규칙 기반 분류, 상세 필터링

### 2.2 핵심 사용자 시나리오
1. "오늘 커피 4,500원"을 5초 안에 입력
2. 월말에 "이번 달 뭐에 많이 썼지?"를 1분 내 파악
3. 예산 초과 시 즉시 알림 받고 조정
4. 카테고리 분류가 자동으로 맞지 않으면 수정 → 다음부터 자동 개선

## 3. 기능 요구사항

### 3.1 MVP 범위 (1차 출시) ✅

#### 인증/계정
- [x] 로컬 스토리지 기반 데이터 저장
- [ ] 이메일 로그인 (후순위)
- [ ] 소셜 로그인 (후순위)

#### 거래(수입/지출)
- [x] 거래 CRUD (생성/조회/수정/삭제)
- [x] 날짜, 금액, 유형(수입/지출/이체), 카테고리, 결제수단, 메모
- [x] 날짜별 거래 목록 조회
- [ ] 최근 항목 재사용 (준비 중)
- [ ] 즐겨찾기 템플릿 (준비 중)

#### 카테고리/결제수단
- [x] 기본 카테고리 제공
- [x] 기본 결제수단 제공
- [ ] 사용자 커스텀 카테고리 (준비 중)
- [ ] 계정(지갑) 관리 (준비 중)

#### 통계/리포트
- [x] 월간 합계 (수입/지출/잔액)
- [x] 카테고리 비중 (파이 차트)
- [x] 일자별 추이 (바 차트)
- [x] 월 선택 및 필터링
- [ ] 상세 필터 (태그/메모 키워드) (준비 중)

#### 예산
- [x] 월 단위 예산 (카테고리별/전체)
- [x] 예산 초과 알림 (시각적 표시)
- [ ] 웹푸시 알림 (준비 중)
- [ ] 앱푸시 알림 (준비 중)

#### 데이터 관리
- [x] CSV Export
- [ ] CSV Import (준비 중)
- [ ] 자동 백업 (클라우드 저장) (준비 중)

### 3.2 2차(고도화) - 준비 중

- [ ] 자동 분류 규칙 (가맹점/메모 기반 룰, 정규식/키워드)
- [ ] 반복 거래 (구독/월세)
- [ ] 자산/부채 (계좌 잔액, 카드 결제 예정)
- [ ] 영수증 OCR (선택)
- [ ] 가족 공유 (그룹, 권한)
- [ ] 다중 통화, 환율
- [ ] AI 인사이트

### 3.3 제외(초기)

- 은행/카드 자동 연동 (오픈뱅킹) - 법/인증/운영 비용 큼 → 추후 검토
- 세금/회계 신고 기능 - 별도 제품 수준

## 4. 기술 아키텍처

### 4.1 Frontend (현재 구현)

#### 기술 스택
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Routing**: React Router v6
- **PWA**: vite-plugin-pwa
- **Charts**: Recharts
- **Date**: date-fns
- **Styling**: CSS Modules + CSS Variables

#### 아키텍처 패턴
- **Component-based**: 재사용 가능한 컴포넌트 구조
- **Page-based Routing**: 페이지 단위로 라우팅
- **Local State**: useState, useEffect 기반 상태 관리
- **Local Storage**: 클라이언트 사이드 데이터 저장 (임시)

### 4.2 데이터 모델 (현재)

```typescript
interface Transaction {
  id: string
  date: string          // YYYY-MM-DD
  amount: number
  type: 'income' | 'expense' | 'transfer'
  category: string      // 카테고리명
  paymentMethod: string // 결제수단
  memo: string          // 메모
}

interface Budget {
  id: string
  month: string         // YYYY-MM
  categoryId: string | null
  categoryName: string
  amount: number
}
```

### 4.3 향후 백엔드 설계 (API-First)

#### 기술 옵션
- **Option A**: Spring Boot (현업 친화/엔터프라이즈)
- **Option B**: Node.js (NestJS 등) - 빠른 개발/TypeScript 기반
- **Database**: PostgreSQL 권장 (통계/집계에 유리)

#### API 엔드포인트 설계 예시
```
POST   /auth/login
GET    /transactions?month=2026-01
POST   /transactions
PUT    /transactions/:id
DELETE /transactions/:id
GET    /reports/monthly?month=2026-01
GET    /reports/category?month=2026-01
GET    /categories
POST   /categories
GET    /budgets?month=2026-01
POST   /budgets
PUT    /budgets/:id
DELETE /budgets/:id
GET    /export/csv
POST   /import/csv
```

## 5. UI/UX 설계

### 5.1 디자인 원칙
- **Mobile First**: 모바일 우선 반응형 디자인
- **직관적 네비게이션**: 하단 탭 네비게이션
- **빠른 입력**: 최소한의 클릭으로 거래 추가
- **시각적 피드백**: 색상 및 아이콘을 통한 즉각적인 정보 전달

### 5.2 화면 구조

```
┌─────────────────┐
│   Header        │  (앱 타이틀)
├─────────────────┤
│                 │
│   Main Content  │  (페이지별 컨텐츠)
│                 │
│                 │
├─────────────────┤
│  [홈][거래][리포트]  │  (하단 네비게이션)
│  [예산][설정]      │
└─────────────────┘
```

### 5.3 컬러 시스템
- **Primary**: `#4F46E5` (인디고) - 주요 액션, 브랜드 컬러
- **Secondary**: `#10B981` (그린) - 수입, 긍정적 상태
- **Danger**: `#EF4444` (레드) - 지출, 예산 초과, 경고
- **Warning**: `#F59E0B` (앰버) - 주의사항
- **Neutral**: `#6B7280` (그레이) - 보조 텍스트

### 5.4 반응형 브레이크포인트
- **Mobile**: ~768px (기본)
- **Tablet**: 768px ~ 1024px
- **Desktop**: 1024px ~

## 6. 데이터 플로우

### 6.1 현재 (LocalStorage)
```
User Input → React Component → LocalStorage
                              ↓
                    Read from LocalStorage
                              ↓
                    Display in UI
```

### 6.2 향후 (API 기반)
```
User Input → React Component → API Call → Backend → Database
                                                      ↓
                                            Response
                                                      ↓
                                            React Component → UI Update
```

## 7. PWA 설정

### 7.1 매니페스트
- **이름**: HouseBook - 가계부
- **짧은 이름**: HouseBook
- **테마 컬러**: `#4F46E5`
- **디스플레이 모드**: `standalone` (앱처럼 동작)
- **아이콘**: 192x192, 512x512

### 7.2 Service Worker
- Vite PWA 플러그인이 자동 생성
- 오프라인 캐싱 (정적 파일)
- 업데이트 자동 감지

## 8. 성능 최적화

### 8.1 현재
- **코드 스플리팅**: Vite 기본 지원
- **이미지 최적화**: SVG 사용
- **번들 크기**: Tree-shaking 자동

### 8.2 향후
- **데이터 가상화**: 대량 거래 목록 표시 시
- **지연 로딩**: 차트 라이브러리
- **캐싱 전략**: API 응답 캐싱

## 9. 보안 고려사항

### 9.1 현재 (클라이언트만)
- 클라이언트 사이드 데이터 저장 (로컬 스토리지)
- 브라우저 보안 정책 준수

### 9.2 향후 (백엔드 연동 시)
- **인증**: JWT 기반 인증
- **데이터 암호화**: 전송 시 TLS, 저장 시 민감 필드 암호화
- **입력 검증**: 서버 사이드 검증 필수
- **CSRF 방지**: 토큰 기반 보호

## 10. 릴리즈 계획

### Phase 1: MVP (현재) ✅
- [x] 반응형 웹 UI
- [x] 거래 CRUD
- [x] 월 리포트
- [x] 예산 관리
- [x] CSV Export
- [x] PWA 기본 설정

### Phase 2: 지속사용 강화 (준비 중)
- [ ] 반복 거래
- [ ] 규칙 기반 자동 분류
- [ ] 웹푸시 알림
- [ ] CSV Import
- [ ] 사용자 커스텀 카테고리

### Phase 3: 모바일/EXE 확장 (예정)
- [ ] Flutter 앱 (iOS/Android)
- [ ] Windows 패키징 (PWA/Flutter Desktop/Tauri 중 선택)
- [ ] 앱 푸시 알림
- [ ] 위젯 지원

## 11. 리스크 & 의사결정 포인트

### 11.1 리스크
1. **데이터 손실**: 로컬 스토리지만 사용 → 정기적 백업 필요
2. **브라우저 호환성**: PWA 기능 지원 확인 필요
3. **확장성**: API-First 설계로 미리 대비

### 11.2 의사결정
- **EXE 요구**: PWA 설치형으로 먼저 만족 → 진짜 EXE 필요 시 Flutter Desktop/Tauri 고려
- **자동분류**: 초기에는 룰 기반이 ROI 좋음 (AI는 데이터 축적 후)
- **오프라인**: MVP에서 부분 오프라인(조회/임시저장) 정도로 시작

## 12. 향후 개발 가이드

### 12.1 백엔드 API 연동 시
1. API 클라이언트 모듈 생성 (`src/api/`)
2. 상태 관리 라이브러리 도입 (React Query, Zustand 등)
3. 로딩/에러 상태 처리
4. 오프라인 동기화 전략 수립

### 12.2 모바일 앱 개발 시
- Flutter 프로젝트 생성
- 백엔드 API 재사용
- 네이티브 기능 활용 (푸시, 위젯 등)
- 공유 UI 컴포넌트 라이브러리 고려

---

**문서 버전**: 1.0.0 (MVP 기준)  
**최종 업데이트**: 2024년

