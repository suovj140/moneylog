# 프리미엄 기능 설계 문서

## 📋 목차
1. [개요](#개요)
2. [무료 vs 프리미엄 기능 비교](#무료-vs-프리미엄-기능-비교)
3. [핵심 프리미엄 기능](#핵심-프리미엄-기능)
4. [가격 전략](#가격-전략)
5. [기술 스택](#기술-스택)
6. [구현 우선순위](#구현-우선순위)
7. [데이터베이스 스키마](#데이터베이스-스키마)
8. [API 설계](#api-설계)
9. [UI/UX 설계](#uiux-설계)
10. [결제 시스템 통합](#결제-시스템-통합)

---

## 개요

편한가계부의 프리미엄 기능은 기본적인 가계부 관리 기능을 넘어서, AI 기반의 지능형 금융 관리와 심층적인 분석 인사이트를 제공합니다. 사용자가 충분히 유료 결제를 하고 싶어할 만한 가치 있는 기능을 중심으로 설계되었습니다.

**프리미엄 기능의 핵심 가치:**
- 🤖 **AI 기반 자동 분석 및 조언**: 사용자의 소비 패턴을 학습하고 맞춤형 절약 조언 제공
- 📊 **심층 데이터 분석**: 다양한 관점에서의 지출 분석 및 예측
- 🎯 **목표 기반 예산 관리**: AI가 추천하는 목표 예산 및 달성 전략
- 🔮 **소비 예측 및 경고**: 이상 지출 패턴 감지 및 사전 경고
- 💡 **맞춤형 절약 팁**: 사용자별 소비 습관에 맞춘 실용적인 절약 제안

---

## 무료 vs 프리미엄 기능 비교

### 무료 기능 (현재 구현된 기능)
✅ 거래 내역 추가/수정/삭제  
✅ 카테고리별 분류  
✅ 월별 보고서 (파이 차트, 그래프)  
✅ 통계 화면 (카테고리별 비중, 일별 합계)  
✅ 예산 관리 (카테고리별 월 예산 설정)  
✅ 데이터 내보내기 (CSV)  
✅ 프로필 관리  
✅ 테마 설정 (밝은 테마/어두운 테마)  
✅ 다국어 지원  

### 프리미엄 기능 (추가될 기능)

#### 🎯 **AI 금융 관리 어시스턴트** (핵심 기능 #1)
- AI 기반 소비 패턴 분석
- 맞춤형 절약 조언 및 목표 추천
- 이상 지출 패턴 자동 감지 및 경고
- 월별/주별 소비 리포트 (AI 인사이트 포함)
- 예산 달성 가능성 예측
- **전용 화면**: "AI 어시스턴트" 페이지

#### 📈 **고급 분석 및 인사이트** (핵심 기능 #2)
- 다차원 소비 분석 (시간대별, 요일별, 계절별)
- 소비 트렌드 예측 (다음 달 예상 지출)
- 카테고리별 상관관계 분석
- 절약 잠재력 분석 (비교 가능한 기간 대비)
- 목표 달성률 시각화 (여러 목표 동시 추적)
- **전용 화면**: "인사이트" 페이지

#### 🔒 **추가 프리미엄 기능**
- 무제한 사진 첨부 (무료: 5장 → 프리미엄: 무제한)
- 자동 분류 규칙 (고급 패턴 매칭)
- 반복 거래 자동 생성 (고급 스케줄링)
- 영수증 OCR 자동 등록
- 클라우드 백업 및 복원
- 다중 계정 관리 (가족 계정)
- 예산 템플릿 (AI 추천 예산 템플릿)
- 알림 설정 (예산 초과, 반복 거래 등)

---

## 핵심 프리미엄 기능

### 1. AI 금융 관리 어시스턴트

#### 1.1 기능 개요
사용자의 거래 내역을 학습하여 개인 맞춤형 금융 관리 조언을 제공하는 AI 기반 기능입니다.

#### 1.2 주요 기능

##### 📊 **소비 패턴 분석**
- 사용자의 과거 거래 내역을 분석하여 소비 습관 파악
- 카테고리별 평균 지출, 최빈 지출 시간대, 요일별 패턴 분석
- 계절별/월별 소비 트렌드 감지

##### 💡 **맞춤형 절약 조언**
- 사용자의 소비 패턴을 기반으로 실용적인 절약 제안
- 예: "이번 달 외식 지출이 평균보다 30% 높습니다. 주 2회로 줄이면 월 10만원 절약 가능합니다."
- 카테고리별 절약 가능 금액 계산

##### 🎯 **목표 기반 예산 추천**
- 사용자의 소비 패턴과 목표를 분석하여 최적의 예산 제안
- 달성 가능한 예산 범위 제시
- 목표 달성을 위한 구체적인 액션 플랜 제시

##### ⚠️ **이상 지출 패턴 감지**
- 평소 패턴과 다른 지출 자동 감지
- 예상치 못한 대액 지출 경고
- 구독료 누적 지출 분석

##### 📈 **월별/주별 AI 리포트**
- AI가 생성한 개인화된 소비 리포트
- 전월 대비 변화율, 목표 달성률, 주요 인사이트
- 시각적 차트와 함께 제공

#### 1.3 UI/UX 설계

**메인 화면: "AI 어시스턴트"**

```
┌─────────────────────────────────────┐
│  AI 금융 관리 어시스턴트            │
│  [프리미엄 배지]                    │
├─────────────────────────────────────┤
│                                     │
│  🤖 안녕하세요! 이번 달 소비 분석   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 이번 달 주요 인사이트          │ │
│  │                               │ │
│  │ • 외식 지출이 평균보다 30% 높음│ │
│  │ • 교통비는 지난달 대비 15% 감소│ │
│  │ • 목표 예산 달성률: 75%        │ │
│  └───────────────────────────────┘ │
│                                     │
│  [절약 조언 보기] [상세 분석 보기]  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 이번 주 절약 제안              │ │
│  │                               │ │
│  │ 💡 주 2회 외식으로 줄이면      │ │
│  │    월 100,000원 절약 가능      │ │
│  │                               │ │
│  │ [제안 적용하기]                │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 이상 지출 경고                  │ │
│  │                               │ │
│  │ ⚠️ 이번 달 총 지출이 평균보다  │ │
│  │    25% 높습니다.               │ │
│  │                               │ │
│  │ [상세 확인하기]                │ │
│  └───────────────────────────────┘ │
│                                     │
│  [AI 리포트 생성하기]               │
└─────────────────────────────────────┘
```

**상세 화면 구성:**
- **AI 인사이트 카드**: 주요 인사이트 요약 (3-5개)
- **절약 조언 섹션**: 실용적인 절약 제안 및 예상 절약 금액
- **목표 추천 섹션**: AI가 추천하는 예산 목표
- **이상 지출 알림**: 평소 패턴과 다른 지출 감지
- **AI 리포트 생성 버튼**: 상세 리포트 PDF/이미지 생성

#### 1.4 데이터 모델

```typescript
interface AIInsight {
  id: string;
  userId: string;
  type: 'saving_advice' | 'budget_recommendation' | 'anomaly_detection' | 'trend_analysis';
  category?: string;
  title: string;
  description: string;
  actionable: boolean;
  estimatedSavings?: number; // 절약 가능 금액
  confidence: number; // AI 신뢰도 (0-1)
  createdAt: Date;
  readAt?: Date;
}

interface AIReport {
  id: string;
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  insights: AIInsight[];
  summary: {
    totalExpense: number;
    totalIncome: number;
    averageDailyExpense: number;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
    budgetAchievementRate: number;
  };
  generatedAt: Date;
}
```

---

### 2. 고급 분석 및 인사이트

#### 2.1 기능 개요
다양한 관점에서의 심층 데이터 분석을 통해 사용자에게 유용한 인사이트를 제공합니다.

#### 2.2 주요 기능

##### 📊 **다차원 소비 분석**
- **시간대별 분석**: 오전/오후/저녁/밤 시간대별 소비 패턴
- **요일별 분석**: 평일 vs 주말 소비 비교
- **계절별 분석**: 계절에 따른 소비 트렌드 변화
- **카테고리 상관관계**: 어떤 카테고리 소비가 함께 증가하는지 분석

##### 🔮 **소비 트렌드 예측**
- 다음 달 예상 지출 예측 (머신러닝 기반)
- 계절성, 트렌드를 고려한 예측
- 예상 지출 범위 (최소/평균/최대) 제시
- 예산 초과 가능성 경고

##### 💰 **절약 잠재력 분석**
- 전년 동기 대비 절약/증가 금액 분석
- 평균 대비 절약 가능 금액 계산
- 카테고리별 절약 목표 달성 가능성 분석

##### 🎯 **목표 달성률 시각화**
- 여러 목표 동시 추적 (예: 외식 줄이기, 저축 목표 등)
- 목표별 진행 상황 시각화
- 목표 달성을 위한 남은 기간 및 필요 행동 제시

##### 📈 **고급 차트 및 시각화**
- 히트맵 (요일별 × 시간대별 소비)
- 트렌드 라인 (장기 추이)
- 산점도 (카테고리 간 상관관계)
- 워드클라우드 (자주 사용하는 키워드)

#### 2.3 UI/UX 설계

**메인 화면: "인사이트"**

```
┌─────────────────────────────────────┐
│  고급 분석 및 인사이트               │
│  [프리미엄 배지]                    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 다음 달 예상 지출              │ │
│  │                               │ │
│  │ 예상: 1,200,000원             │ │
│  │ 범위: 1,000,000 ~ 1,400,000원 │ │
│  │                               │ │
│  │ [차트: 예상 지출 추이]         │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 소비 패턴 히트맵                │ │
│  │                               │ │
│  │ [요일 × 시간대 히트맵 차트]    │ │
│  │                               │ │
│  │ 가장 많이 소비하는 시간:       │ │
│  │ 금요일 저녁 (18:00-21:00)     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 절약 잠재력                    │ │
│  │                               │ │
│  │ 전년 동기 대비: -50,000원     │ │
│  │ 평균 대비 절약 가능: 120,000원│ │
│  │                               │ │
│  │ [상세 분석 보기]               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 목표 달성률                    │ │
│  │                               │ │
│  │ 외식 줄이기: ████████░░ 80%   │ │
│  │ 저축 목표: ██████░░░░ 60%     │ │
│  └───────────────────────────────┘ │
│                                     │
│  [전체 리포트 보기]                 │
└─────────────────────────────────────┘
```

**탭 구성:**
- **예측**: 다음 달 예상 지출 및 트렌드
- **패턴**: 시간대별, 요일별, 계절별 분석
- **비교**: 전년 동기, 평균 대비 비교
- **목표**: 여러 목표 추적 및 달성률

#### 2.4 데이터 모델

```typescript
interface SpendingPattern {
  userId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  category: string;
  averageAmount: number;
  frequency: number;
}

interface SpendingPrediction {
  userId: string;
  targetMonth: string; // YYYY-MM
  predictedAmount: number;
  minAmount: number;
  maxAmount: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number; // -1 to 1
  }>;
}

interface Goal {
  id: string;
  userId: string;
  name: string;
  type: 'reduce_spending' | 'increase_saving' | 'limit_category';
  targetAmount?: number;
  targetCategory?: string;
  startDate: Date;
  endDate: Date;
  currentProgress: number;
  achievementRate: number; // 0-100
}
```

---

## 가격 전략

### 권장 가격

#### 월간 구독 (Monthly)
**₩4,900/월** (약 $3.70)

**이유:**
- 커피 1잔 가격 수준으로 부담 없는 가격
- 연간 구독 유도 (월간 대비 할인)
- 경쟁사 대비 합리적인 가격
  - Toshl Premium: $4.99/월
  - YNAB: $14.99/월
  - PocketGuard: $4.99/월

#### 연간 구독 (Yearly) - **권장**
**₩39,000/년** (약 $29.50)  
**→ 월간 기준 ₩3,250/월 (33% 할인)**

**이용권장 이유:**
- 월간 대비 월 ₩1,650 할인
- 연간 구독 시 추가 혜택 제공 가능
- 사용자 이탈률 감소

#### 평생 구독 (Lifetime) - 옵션
**₩149,000 (약 $112)**

**조건:**
- 초기 런칭 시 한정 제공
- 또는 특별 프로모션 시 제공
- 재정적 안정성 확보 후 중단 가능

### 가격 비교표

| 서비스 | 월간 | 연간 | 특징 |
|--------|------|------|------|
| **편한가계부 프리미엄** | ₩4,900 | ₩39,000 | AI 기반 분석, 한국어 최적화 |
| Toshl Premium | $4.99 | $39.99 | 글로벌 서비스 |
| YNAB | $14.99 | $99.99 | 고가, 강력한 예산 관리 |
| PocketGuard | $4.99 | $34.99 | 간단한 예산 추적 |

### 가격 전략 근거

1. **접근성**: 월 ₩4,900은 대부분의 사용자가 부담 없이 구독 가능한 수준
2. **경쟁력**: 글로벌 서비스 대비 한국 시장에 최적화된 가격
3. **가치 인식**: AI 기반 고급 기능 제공으로 프리미엄 가치 부각
4. **구독 유도**: 연간 구독 시 충분한 할인으로 장기 구독 유도

---

## 기술 스택

### AI/ML 모델

#### 옵션 1: OpenAI GPT-4/GPT-3.5-turbo (권장)
**장점:**
- 빠른 구현 가능
- 고품질 자연어 생성
- 별도 모델 학습 불필요

**사용 사례:**
- 소비 패턴 분석 리포트 생성
- 맞춤형 절약 조언 생성
- 이상 지출 패턴 설명

**비용:**
- GPT-3.5-turbo: 약 $0.0015/1K tokens (입력), $0.002/1K tokens (출력)
- GPT-4: 약 $0.03/1K tokens (입력), $0.06/1K tokens (출력)
- **권장**: GPT-3.5-turbo로 시작 (비용 효율적)

**API 통합:**
```typescript
// 예시: OpenAI API를 사용한 AI 인사이트 생성
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateSpendingInsight(userId: string, transactions: Transaction[]) {
  const prompt = `사용자의 거래 내역을 분석하여 소비 패턴과 절약 조언을 제공하세요.
  
거래 내역:
${JSON.stringify(transactions, null, 2)}

분석 결과를 JSON 형식으로 반환하세요:
{
  "insights": [
    {
      "type": "saving_advice",
      "category": "외식",
      "title": "...",
      "description": "...",
      "estimatedSavings": 100000
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

#### 옵션 2: 자체 머신러닝 모델 (장기)
**장점:**
- 장기적으로 비용 절감 가능
- 데이터 프라이버시 향상
- 커스터마이징 자유도 높음

**단점:**
- 초기 개발 비용 높음
- 모델 학습 및 유지보수 필요
- 충분한 데이터 필요

**권장 접근:**
- **Phase 1**: OpenAI API 사용 (빠른 출시)
- **Phase 2**: 하이브리드 (간단한 분석은 자체 로직, 복잡한 분석은 AI)
- **Phase 3**: 자체 모델 구축 (충분한 데이터 축적 후)

### 예측 모델 (소비 트렌드 예측)

#### 시계열 예측 알고리즘
- **ARIMA (AutoRegressive Integrated Moving Average)**: 계절성을 고려한 시계열 예측
- **Prophet (Facebook)**: 트렌드와 계절성을 자동으로 감지
- **LSTM (Long Short-Term Memory)**: 딥러닝 기반 장기 의존성 학습

**권장: Prophet으로 시작** (구현 간단, 해석 용이)

```typescript
// 예시: Prophet을 사용한 소비 예측
import { Prophet } from 'prophet-js';

async function predictMonthlySpending(userId: string, historicalData: Transaction[]) {
  // Prophet은 Python 라이브러리이므로, 
  // Supabase Edge Function에서 Python 런타임 사용 또는
  // 별도 Python 서버 구축 필요
  
  // 또는 JavaScript 기반 시계열 라이브러리 사용
  // 예: ml-time-series, simple-statistics
}
```

### 데이터 분석 라이브러리

#### 클라이언트 측
- **recharts**: 차트 시각화 (이미 사용 중)
- **d3.js**: 고급 시각화 (히트맵, 워드클라우드)
- **date-fns**: 날짜 처리 (이미 사용 중)
- **simple-statistics**: 통계 계산

#### 서버 측
- **Supabase Edge Functions**: 서버리스 함수 실행
- **Python (Pyodide)**: Edge Function에서 Python 라이브러리 실행 (제한적)
- **Node.js**: JavaScript 기반 분석 라이브러리

---

## 구현 우선순위

### Phase 1: 기본 프리미엄 인프라 (2-3주)
1. ✅ 결제 시스템 통합 (Stripe 또는 토스페이먼츠)
2. ✅ 사용자 구독 상태 관리 (Supabase)
3. ✅ 프리미엄 기능 접근 제어 미들웨어
4. ✅ 프리미엄 배지 및 UI 요소

### Phase 2: AI 금융 관리 어시스턴트 (3-4주)
1. ✅ OpenAI API 통합
2. ✅ 소비 패턴 분석 로직
3. ✅ AI 인사이트 생성 및 저장
4. ✅ "AI 어시스턴트" 페이지 구현
5. ✅ 맞춤형 절약 조언 기능
6. ✅ 이상 지출 패턴 감지
7. ✅ AI 리포트 생성 기능

### Phase 3: 고급 분석 및 인사이트 (2-3주)
1. ✅ 다차원 소비 분석 (시간대별, 요일별, 계절별)
2. ✅ 소비 트렌드 예측 (Prophet 또는 자체 로직)
3. ✅ 절약 잠재력 분석
4. ✅ 목표 달성률 시각화
5. ✅ 고급 차트 및 시각화 (히트맵, 트렌드 라인)
6. ✅ "인사이트" 페이지 구현

### Phase 4: 추가 프리미엄 기능 (2-3주)
1. ✅ 무제한 사진 첨부
2. ✅ 클라우드 백업 및 복원
3. ✅ 예산 템플릿 (AI 추천)
4. ✅ 알림 설정 (예산 초과, 반복 거래)

### Phase 5: 최적화 및 테스트 (1-2주)
1. ✅ 성능 최적화
2. ✅ AI 응답 시간 개선 (캐싱)
3. ✅ 사용자 피드백 수집 및 개선
4. ✅ A/B 테스트 (가격, 기능)

**총 예상 개발 기간**: 10-15주 (약 2.5-4개월)

---

## 데이터베이스 스키마

### 1. 구독 정보 테이블 (`subscriptions`)

```sql
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider VARCHAR(50) NOT NULL, -- 'stripe', 'toss', etc.
  payment_provider_subscription_id VARCHAR(255), -- 외부 결제 시스템의 subscription ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_active_subscription UNIQUE (user_id) WHERE status = 'active'
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, current_period_end);
```

### 2. AI 인사이트 테이블 (`ai_insights`)

```sql
CREATE TABLE ai_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('saving_advice', 'budget_recommendation', 'anomaly_detection', 'trend_analysis')),
  category VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  actionable BOOLEAN DEFAULT false,
  estimated_savings DECIMAL(15, 2),
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id, created_at DESC);
CREATE INDEX idx_ai_insights_type ON ai_insights(user_id, type);
CREATE INDEX idx_ai_insights_unread ON ai_insights(user_id, read_at) WHERE read_at IS NULL;
```

### 3. AI 리포트 테이블 (`ai_reports`)

```sql
CREATE TABLE ai_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(50) NOT NULL CHECK (period IN ('week', 'month', 'quarter', 'year')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  summary JSONB NOT NULL, -- { totalExpense, totalIncome, averageDailyExpense, topCategories, budgetAchievementRate }
  insight_ids BIGINT[] NOT NULL, -- ai_insights 테이블의 ID 배열
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_reports_user_id ON ai_reports(user_id, generated_at DESC);
CREATE INDEX idx_ai_reports_period ON ai_reports(user_id, period, start_date);
```

### 4. 소비 패턴 테이블 (`spending_patterns`)

```sql
CREATE TABLE spending_patterns (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time_of_day VARCHAR(50) CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  category VARCHAR(100),
  average_amount DECIMAL(15, 2) NOT NULL,
  frequency INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, time_of_day, day_of_week, category, period_start, period_end)
);

CREATE INDEX idx_spending_patterns_user_id ON spending_patterns(user_id, period_start DESC);
```

### 5. 소비 예측 테이블 (`spending_predictions`)

```sql
CREATE TABLE spending_predictions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_month VARCHAR(7) NOT NULL, -- YYYY-MM 형식
  predicted_amount DECIMAL(15, 2) NOT NULL,
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  factors JSONB, -- [{ factor, impact }]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, target_month)
);

CREATE INDEX idx_spending_predictions_user_id ON spending_predictions(user_id, target_month DESC);
```

### 6. 목표 테이블 (`goals`)

```sql
CREATE TABLE goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('reduce_spending', 'increase_saving', 'limit_category')),
  target_amount DECIMAL(15, 2),
  target_category VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_progress DECIMAL(15, 2) DEFAULT 0,
  achievement_rate DECIMAL(5, 2) DEFAULT 0 CHECK (achievement_rate >= 0 AND achievement_rate <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id, end_date DESC);
CREATE INDEX idx_goals_active ON goals(user_id, end_date) WHERE end_date >= CURRENT_DATE;
```

---

## API 설계

### 구독 관리 API

#### 1. 구독 상태 조회
```
GET /api/subscription
Response: {
  isPremium: boolean,
  planType?: 'monthly' | 'yearly' | 'lifetime',
  status?: 'active' | 'canceled' | 'expired' | 'past_due',
  currentPeriodEnd?: Date,
  cancelAtPeriodEnd?: boolean
}
```

#### 2. 구독 생성 (결제 완료 후)
```
POST /api/subscription
Body: {
  planType: 'monthly' | 'yearly' | 'lifetime',
  paymentProvider: 'stripe' | 'toss',
  paymentProviderSubscriptionId: string
}
Response: Subscription
```

#### 3. 구독 취소
```
POST /api/subscription/cancel
Response: { success: true, canceledAt: Date }
```

#### 4. 구독 갱신
```
POST /api/subscription/renew
Response: Subscription
```

### AI 어시스턴트 API

#### 1. AI 인사이트 조회
```
GET /api/ai/insights
Query: ?type=saving_advice&limit=10&offset=0
Response: {
  insights: AIInsight[],
  total: number
}
```

#### 2. AI 인사이트 생성 (배치 처리)
```
POST /api/ai/insights/generate
Response: {
  insights: AIInsight[],
  generatedAt: Date
}
```

#### 3. AI 리포트 생성
```
POST /api/ai/reports
Body: {
  period: 'week' | 'month' | 'quarter' | 'year',
  startDate: Date,
  endDate: Date
}
Response: AIReport
```

#### 4. AI 리포트 조회
```
GET /api/ai/reports
Query: ?period=month&limit=10
Response: AIReport[]
```

### 인사이트 API

#### 1. 소비 패턴 조회
```
GET /api/insights/patterns
Query: ?timeOfDay=morning&dayOfWeek=1
Response: SpendingPattern[]
```

#### 2. 소비 예측 조회
```
GET /api/insights/predictions
Query: ?targetMonth=2026-02
Response: SpendingPrediction
```

#### 3. 절약 잠재력 분석
```
GET /api/insights/savings-potential
Query: ?comparePeriod=lastYear
Response: {
  totalSavings: number,
  categorySavings: Array<{ category: string, savings: number }>,
  recommendations: string[]
}
```

#### 4. 목표 목록 조회
```
GET /api/goals
Response: Goal[]
```

#### 5. 목표 생성
```
POST /api/goals
Body: {
  name: string,
  type: 'reduce_spending' | 'increase_saving' | 'limit_category',
  targetAmount?: number,
  targetCategory?: string,
  startDate: Date,
  endDate: Date
}
Response: Goal
```

#### 6. 목표 업데이트
```
PUT /api/goals/:id
Body: { ... }
Response: Goal
```

---

## UI/UX 설계

### 프리미엄 기능 접근 제어

#### 프리미엄 배지
```typescript
// 프리미엄 기능이 있는 곳에 배지 표시
<PremiumBadge />
// 또는
<span className="premium-badge">프리미엄</span>
```

#### 프리미엄 기능 잠금 화면
```typescript
// 프리미엄이 아닌 사용자가 프리미엄 기능 접근 시
<PremiumLockScreen 
  featureName="AI 어시스턴트"
  description="AI 기반 맞춤형 금융 관리 조언을 받으세요."
  onUpgrade={() => navigate('/pricing')}
/>
```

### 네비게이션 메뉴 추가

#### 사이드바 (PC) / 하단 네비게이션 (모바일)
```
- 홈
- 내역
- 보고서
- 통계
- 예산
- 🤖 AI 어시스턴트 [프리미엄]
- 📊 인사이트 [프리미엄]
- 설정
```

### 프리미엄 업그레이드 화면

#### 가격 페이지 (`/pricing`)
```
┌─────────────────────────────────────┐
│  프리미엄으로 업그레이드             │
├─────────────────────────────────────┤
│                                     │
│  무료 플랜                          │
│  • 기본 거래 관리                   │
│  • 보고서 및 통계                   │
│  • 예산 관리                        │
│                                     │
│  [현재 플랜]                        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  프리미엄 플랜                      │
│  • 🤖 AI 금융 관리 어시스턴트       │
│  • 📊 고급 분석 및 인사이트         │
│  • 무제한 사진 첨부                 │
│  • 클라우드 백업                    │
│                                     │
│  [인기] 연간 구독                   │
│  ₩39,000/년 (₩3,250/월)           │
│  33% 할인                           │
│                                     │
│  [구독하기]                         │
│                                     │
│  월간 구독                          │
│  ₩4,900/월                         │
│                                     │
│  [구독하기]                         │
└─────────────────────────────────────┘
```

---

## 결제 시스템 통합

### 옵션 1: Stripe (권장 - 글로벌)

**장점:**
- 글로벌 표준 결제 시스템
- 강력한 보안 및 사기 방지
- 웹훅을 통한 구독 상태 자동 동기화
- 다양한 결제 수단 지원 (카드, Apple Pay, Google Pay 등)

**단점:**
- 한국 신용카드 수수료가 상대적으로 높을 수 있음
- 한국 사용자에게 익숙하지 않을 수 있음

**구현:**
```typescript
// Stripe 결제 세션 생성
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(planType: 'monthly' | 'yearly') {
  const priceId = planType === 'monthly' 
    ? process.env.STRIPE_PRICE_MONTHLY 
    : process.env.STRIPE_PRICE_YEARLY;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
  });

  return session;
}
```

### 옵션 2: 토스페이먼츠 (권장 - 한국)

**장점:**
- 한국 사용자에게 친숙
- 낮은 수수료
- 다양한 한국 결제 수단 지원 (카드, 계좌이체, 가상계좌 등)
- 간편결제 지원 (토스페이, 카카오페이 등)

**단점:**
- 한국 외 지역 지원 제한적
- 글로벌 확장 시 추가 결제 시스템 필요

**구현:**
```typescript
// 토스페이먼츠 결제 요청
import { TossPayments } from '@tosspayments/payment-sdk';

const tossPayments = new TossPayments(process.env.TOSS_CLIENT_KEY);

async function createPayment(planType: 'monthly' | 'yearly') {
  const amount = planType === 'monthly' ? 4900 : 39000;
  
  const payment = await tossPayments.requestPayment('카드', {
    amount: amount,
    orderId: generateOrderId(),
    orderName: `편한가계부 프리미엄 ${planType === 'monthly' ? '월간' : '연간'} 구독`,
    successUrl: `${process.env.APP_URL}/pricing/success`,
    failUrl: `${process.env.APP_URL}/pricing/fail`,
  });

  return payment;
}
```

### 권장 전략: 하이브리드
- **한국 사용자**: 토스페이먼츠 (더 친숙하고 수수료 낮음)
- **해외 사용자**: Stripe (글로벌 표준)
- 사용자 위치에 따라 자동으로 결제 시스템 선택

### 웹훅 처리

#### Stripe 웹훅
```typescript
// Supabase Edge Function: /api/webhooks/stripe
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // 구독 생성
      await createSubscription(event.data.object);
      break;
    case 'customer.subscription.updated':
      // 구독 업데이트
      await updateSubscription(event.data.object);
      break;
    case 'customer.subscription.deleted':
      // 구독 취소
      await cancelSubscription(event.data.object);
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## 보안 및 프라이버시

### 데이터 프라이버시
- AI 분석은 사용자의 데이터를 기반으로 하지만, 데이터는 항상 사용자 소유
- OpenAI API 사용 시 데이터 전송은 암호화됨
- 사용자가 프리미엄을 취소해도 데이터는 유지됨

### 결제 정보 보안
- 결제 정보는 결제 제공업체(Stripe/토스)에만 저장
- 앱 자체에는 결제 정보 저장하지 않음
- PCI DSS 준수 (결제 제공업체가 처리)

---

## 마케팅 및 프로모션

### 런칭 전략
1. **베타 테스터 무료 제공**: 초기 100명에게 3개월 무료 제공
2. **얼리버드 프로모션**: 첫 달 50% 할인
3. **추천인 프로그램**: 추천 시 양쪽 모두 1개월 무료

### 업셀 전략
1. **사용량 기반 제안**: 사진 5장 초과 사용 시 업그레이드 제안
2. **기능 잠금**: AI 기능 클릭 시 업그레이드 유도
3. **기간 한정 프로모션**: 연간 구독 시 추가 혜택

---

## 예상 비용 분석

### 월간 운영 비용 (예상 사용자 1,000명 기준)

#### AI API 비용 (OpenAI GPT-3.5-turbo)
- 사용자당 월 평균 10회 AI 인사이트 생성
- 평균 토큰: 입력 2,000 tokens, 출력 500 tokens
- 비용: $0.0015/1K (입력) + $0.002/1K (출력) = $0.005/회
- 월간 비용: 1,000명 × 10회 × $0.005 = **$50/월**

#### 예측 모델 (자체 로직 또는 Prophet API)
- 월간 예측 생성: 1,000회
- 비용: 자체 로직 시 거의 무료, API 사용 시 $10-20/월
- 예상 비용: **$15/월**

#### 결제 처리 수수료
- Stripe: 2.9% + $0.30/거래
- 토스페이먼츠: 약 2.5-3.0%
- 평균 구독률 5% 가정: 50명 구독
- 월간 수수료: 50명 × ₩4,900 × 3% = **₩7,350/월** (약 $5.50)

#### 총 월간 비용 (1,000명 기준)
- AI API: $50
- 예측 모델: $15
- 결제 수수료: $5.50
- **총계: 약 $70.50/월**

#### 수익 (1,000명, 구독률 5% 가정)
- 구독자: 50명
- 월간 수익: 50명 × ₩4,900 = **₩245,000/월** (약 $185)
- 순이익: $185 - $70.50 = **$114.50/월**

**참고**: 사용자 증가 및 구독률 향상에 따라 수익성 개선 가능

---

## 성공 지표 (KPI)

### 구독 지표
- **구독 전환율**: 무료 사용자 → 프리미엄 사용자 전환 비율 (목표: 5-10%)
- **구독 취소율**: 월간 구독 취소 비율 (목표: <5%)
- **평균 구독 기간**: 평균 구독 유지 기간 (목표: >6개월)

### 사용 지표
- **AI 기능 사용률**: 프리미엄 사용자 중 AI 기능 사용 비율 (목표: >70%)
- **인사이트 조회수**: 사용자당 월간 인사이트 조회 수 (목표: >10회)
- **목표 달성률**: 목표 설정 후 달성 비율 (목표: >60%)

### 수익 지표
- **MRR (Monthly Recurring Revenue)**: 월간 반복 수익
- **ARR (Annual Recurring Revenue)**: 연간 반복 수익
- **CAC (Customer Acquisition Cost)**: 고객 획득 비용
- **LTV (Lifetime Value)**: 고객 생애 가치

---

## 다음 단계

1. ✅ **결제 시스템 선택 및 통합**
   - 토스페이먼츠 또는 Stripe 선택
   - 결제 플로우 구현
   - 웹훅 설정

2. ✅ **프리미엄 인프라 구축**
   - 구독 상태 관리 시스템
   - 프리미엄 기능 접근 제어
   - 가격 페이지 구현

3. ✅ **AI 기능 개발**
   - OpenAI API 통합
   - 소비 패턴 분석 로직
   - AI 어시스턴트 페이지 구현

4. ✅ **인사이트 기능 개발**
   - 다차원 분석 로직
   - 예측 모델 구현
   - 인사이트 페이지 구현

5. ✅ **테스트 및 런칭**
   - 베타 테스터 모집
   - 피드백 수집 및 개선
   - 공식 런칭

---

**작성일**: 2026-01-XX  
**버전**: 1.0.0  
**작성자**: 편한가계부 개발팀


