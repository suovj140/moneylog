import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Sector, ReferenceLine } from 'recharts'
import { transactionService } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import './Reports.css'

interface Transaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

// 지출용 다양한 색상 팔레트 (채도 낮춘 버전)
const EXPENSE_COLORS = [
  '#E57373', // 부드러운 빨강 (숙소비)
  '#FFB74D', // 부드러운 다크 오렌지 (식비)
  '#FFCC80', // 부드러운 오렌지 (생활용품)
  '#FFD54F', // 부드러운 노랑 (교통비)
  '#AED581', // 부드러운 라이트 그린 (관광)
  '#81C784', // 부드러운 다크 그린 (선물)
  '#F48FB1', // 부드러운 핑크 (추가)
  '#BA68C8'  // 부드러운 보라 (추가)
]

// 수입용 다양한 색상 팔레트 (채도 낮춘 버전)
const INCOME_COLORS = [
  '#64B5F6', // 부드러운 파랑
  '#4DB6AC', // 부드러운 틸 그린
  '#81D4FA', // 부드러운 스카이 블루
  '#66BB6A', // 부드러운 그린
  '#4DB6AC', // 부드러운 다크 틸
  '#4DD0E1', // 부드러운 시안 블루
  '#4DD0E1', // 부드러운 시안
  '#90CAF9'  // 부드러운 라이트 블루
]

export default function Reports() {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeExpenseIndex, setActiveExpenseIndex] = useState<number | undefined>(undefined)
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number | undefined>(undefined)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const selectedMonth = format(currentDate, 'yyyy-MM')

  // 카테고리명 번역 함수 (저장된 값 -> 현재 언어로 변환)
  const translateCategory = (category: string): string => {
    const expenseCategories = t('common.categories.expense', { returnObjects: true }) as string[]
    const incomeCategories = t('common.categories.income', { returnObjects: true }) as string[]
    
    // 모든 언어의 카테고리명 매핑 (한국어를 기준으로 다른 언어로 매핑)
    const categoryMap: Record<string, string[]> = {
      // 지출 카테고리
      '식비': ['Food', '식비', '食費', 'Ăn uống', '餐饮', 'Pagkain'],
      '외식': ['Dining Out', '외식', '外食', 'Ăn ngoài', '外食', 'Kumain sa labas'],
      '식료품': ['Groceries', '식료품', '食料品', 'Thực phẩm', '食品', 'Groseri'],
      '식료': ['Groceries', '식료품', '食料品', 'Thực phẩm', '食品', 'Groseri'],
      '교통비': ['Transport', '교통비', '交通費', 'Giao thông', '交通', 'Transportasyon'],
      '교통': ['Transport', '교통비', '交通費', 'Giao thông', '交通', 'Transportasyon'],
      '쇼핑': ['Shopping', '쇼핑', 'ショッピング', 'Mua sắm', '购物', 'Pamimili'],
      '문화생활': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      '문화': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      '의료비': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
      '의료': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
      '통신비': ['Communication', '통신비', '通信費', 'Viễn thông', '通信', 'Komunikasyon'],
      '생활비': ['Living', '생활비', '生活費', 'Sinh hoạt', '生活费', 'Pamumuhay'],
      '주거': ['Housing', '주거', '住居', 'Nhà ở', '住房', 'Pabahay'],
      '교육': ['Education', '교육', '教育', 'Giáo dục', '教育', 'Edukasyon'],
      '기타': ['Other', '기타', 'その他', 'Khác', '其他', 'Iba pa'],
      // 수입 카테고리
      '급여': ['Salary', '급여', '給与', 'Lương', '工资', 'Sahod'],
      '부수입': ['Extra Income', '부수입', '副収入', 'Thu nhập phụ', '额外收入', 'Dagdag na Kita'],
      '용돈': ['Allowance', '용돈', 'お小遣い', 'Tiền tiêu vặt', '零花钱', 'Allowance']
    }
    
    // 영어 카테고리명도 매핑에 추가
    const englishMap: Record<string, string[]> = {
      'Food': ['Food', '식비', '食費', 'Ăn uống', '餐饮', 'Pagkain'],
      'Dining Out': ['Dining Out', '외식', '外食', 'Ăn ngoài', '外食', 'Kumain sa labas'],
      'Groceries': ['Groceries', '식료품', '食料品', 'Thực phẩm', '食品', 'Groseri'],
      'Transport': ['Transport', '교통비', '交通費', 'Giao thông', '交通', 'Transportasyon'],
      'Shopping': ['Shopping', '쇼핑', 'ショッピング', 'Mua sắm', '购物', 'Pamimili'],
      'Culture': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      'Medical': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
      'Communication': ['Communication', '통신비', '通信費', 'Viễn thông', '通信', 'Komunikasyon'],
      'Living': ['Living', '생활비', '生活費', 'Sinh hoạt', '生活费', 'Pamumuhay'],
      'Housing': ['Housing', '주거', '住居', 'Nhà ở', '住房', 'Pabahay'],
      'Education': ['Education', '교육', '教育', 'Giáo dục', '教育', 'Edukasyon'],
      'Other': ['Other', '기타', 'その他', 'Khác', '其他', 'Iba pa'],
      'Salary': ['Salary', '급여', '給与', 'Lương', '工资', 'Sahod'],
      'Extra Income': ['Extra Income', '부수입', '副収入', 'Thu nhập phụ', '额外收入', 'Dagdag na Kita'],
      'Allowance': ['Allowance', '용돈', 'お小遣い', 'Tiền tiêu vặt', '零花钱', 'Allowance']
    }
    
    // 언어별 인덱스: en=0, ko=1, ja=2, vi=3, zh=4, fil=5
    const langIndexMap: Record<string, number> = {
      'en': 0,
      'ko': 1,
      'ja': 2,
      'vi': 3,
      'zh': 4,
      'fil': 5
    }
    
    const langIndex = langIndexMap[i18n.language] ?? 0
    
    // 한국어 카테고리명으로 매핑 시도
    if (categoryMap[category]) {
      return categoryMap[category][langIndex] || category
    }
    
    // 영어 카테고리명으로 매핑 시도
    if (englishMap[category]) {
      return englishMap[category][langIndex] || category
    }
    
    // 현재 언어의 카테고리 목록에 있으면 그대로 반환
    if ([...expenseCategories, ...incomeCategories].includes(category)) {
      return category
    }
    
    // 매핑되지 않은 경우 원본 반환
    return category
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [currentDate])

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAll()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
      // 폴백: 로컬 스토리지에서 가져오기
      const stored = localStorage.getItem('transactions')
      if (stored) {
        setTransactions(JSON.parse(stored))
      }
    }
  }

  const getMonthTransactions = () => {
    const start = startOfMonth(new Date(selectedMonth + '-01'))
    const end = endOfMonth(new Date(selectedMonth + '-01'))
    
    return transactions.filter(t => {
      const date = new Date(t.date)
      return date >= start && date <= end
    })
  }

  const monthTransactions = getMonthTransactions()

  // 지출 카테고리 데이터
  const expenseCategoryData = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0
      }
      acc[t.category] += t.amount
      return acc
    }, {} as Record<string, number>)

  const expensePieData = Object.entries(expenseCategoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // 수입 카테고리 데이터
  const incomeCategoryData = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0
      }
      acc[t.category] += t.amount
      return acc
    }, {} as Record<string, number>)

  const incomePieData = Object.entries(incomeCategoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const dailyData = eachDayOfInterval({
    start: startOfMonth(new Date(selectedMonth + '-01')),
    end: endOfMonth(new Date(selectedMonth + '-01'))
  }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayTransactions = monthTransactions.filter(t => t.date === dateStr)
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    return {
      date: format(date, 'M/d'),
      income,
      expense
    }
  })

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // 월 평균 금액 계산
  const daysInMonth = endOfMonth(new Date(selectedMonth + '-01')).getDate()
  const avgExpense = totalExpense / daysInMonth
  const avgIncome = totalIncome / daysInMonth

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  return (
    <div className="reports">
      <div className="reports-header">
        {!isMobile && (
          <h1 className="page-title" style={{ color: theme.text }}>{t('reports.title')}</h1>
        )}
        <div className="month-navigation">
          <button onClick={goToPreviousMonth} style={{ color: theme.text }}>
            <span style={{ lineHeight: '1.125rem', display: 'inline-block', verticalAlign: 'middle' }}>‹</span>
          </button>
          <span style={{ color: theme.text }}>
            {format(currentDate, 'yyyy.MM')}
          </span>
          <button onClick={goToNextMonth} style={{ color: theme.text }}>
            <span style={{ lineHeight: '1.125rem', display: 'inline-block', verticalAlign: 'middle' }}>›</span>
          </button>
        </div>
      </div>

      {/* 요약 바를 상단으로 이동 */}
      <div className="daily-summary card" style={{ backgroundColor: theme.surface }}>
        <div className="summary-item">
          <span className="summary-label" style={{ color: theme.textSecondary }}>{t('common.income')}</span>
          <span className="summary-value income" style={{ color: theme.income }}>
            {totalIncome > 0 ? '+' : ''}{totalIncome.toLocaleString()}{t('common.currency')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label" style={{ color: theme.textSecondary }}>{t('common.expense')}</span>
          <span className="summary-value expense" style={{ color: theme.expense }}>
            {totalExpense > 0 ? '-' : ''}{totalExpense.toLocaleString()}{t('common.currency')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label" style={{ color: theme.textSecondary }}>{t('reports.total')}</span>
          <span className="summary-value" style={{ 
            color: balance >= 0 ? theme.income : theme.expense 
          }}>
            {balance >= 0 ? '+' : ''}{balance.toLocaleString()}{t('common.currency')}
          </span>
        </div>
      </div>

      {/* 2x2 그리드 차트 레이아웃 */}
      <div className="charts-grid">
        {/* 지출 파이 차트 (왼쪽 위) */}
        <div className="chart-card card" style={{ backgroundColor: theme.surface }}>
          <h2 className="chart-title" style={{ color: theme.text }}>{t('common.expense')}</h2>
          {expensePieData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart 
                  onClick={(e) => {
                    if (e && typeof e.preventDefault === 'function') {
                      e.preventDefault()
                    }
                    if (e && typeof e.stopPropagation === 'function') {
                      e.stopPropagation()
                    }
                    setActiveExpenseIndex(undefined)
                  }}
                  onMouseDown={(e) => {
                    if (e && typeof e.preventDefault === 'function') {
                      e.preventDefault()
                    }
                  }}
                  style={{ cursor: 'default', userSelect: 'none' }}
                >
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  activeIndex={activeExpenseIndex}
                  activeShape={(props: any) => {
                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
                    return (
                      <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius + 10}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                        opacity={1}
                      />
                    )
                  }}
                  onMouseEnter={(_, index) => setActiveExpenseIndex(index)}
                  onMouseLeave={() => setActiveExpenseIndex(undefined)}
                  onClick={(data, index, e) => {
                    if (e && typeof e.preventDefault === 'function') {
                      e.preventDefault()
                    }
                    if (e && typeof e.stopPropagation === 'function') {
                      e.stopPropagation()
                    }
                    setActiveExpenseIndex(undefined)
                  }}
                  isAnimationActive={false}
                >
                  {expensePieData.map((entry, index) => (
                    <Cell 
                      key={`expense-cell-${index}`} 
                      fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      opacity={activeExpenseIndex === undefined || activeExpenseIndex === index ? 1 : 0.3}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload
                      const total = expensePieData.reduce((sum, item) => sum + item.value, 0)
                      const percent = ((data.value / total) * 100).toFixed(2)
                      return (
                        <div style={{
                          backgroundColor: theme.isDark ? '#2a2a2a' : '#ffffff',
                          border: `1px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          padding: '8px 12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <div style={{
                            color: theme.isDark ? '#ffffff' : '#1a1a1a',
                            fontWeight: 600,
                            marginBottom: '4px',
                            fontSize: '0.875rem'
                          }}>
                            {translateCategory(data.name)}
                          </div>
                          <div style={{
                            color: theme.isDark ? '#b3b3b3' : '#6c757d',
                            fontSize: '0.8125rem'
                          }}>
                            {percent}% : {data.value.toLocaleString()}{t('common.currency')}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '1rem', fontSize: '0.875rem' }}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: theme.text }}>{translateCategory(value)}</span>
                  )}
                />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
              {t('reports.noExpenseData')}
            </div>
          )}
        </div>

        {/* 지출 라인 그래프 (오른쪽 위) */}
        <div className="chart-card card" style={{ backgroundColor: theme.surface }}>
          <h2 className="chart-title" style={{ color: theme.text }}>{t('common.expense')}</h2>
          {dailyData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.inputBorder} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme.textSecondary}
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  stroke={theme.textSecondary}
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()}${t('common.currency')}`}
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <ReferenceLine 
                  y={avgExpense} 
                  stroke={theme.expense}
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                  label={{ 
                    value: t('reports.averageWithValue', { value: avgExpense.toLocaleString() }), 
                    position: "right",
                    fill: theme.expense,
                    fontSize: 12
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke={theme.expense}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: theme.expense, r: 3 }}
                  name={t('common.expense')}
                />
              </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
              {t('statistics.noTransactionsForType', { type: t('common.expense') })}
            </div>
          )}
        </div>

        {/* 수입 파이 차트 (왼쪽 아래) */}
        <div className="chart-card card" style={{ backgroundColor: theme.surface }}>
          <h2 className="chart-title" style={{ color: theme.text }}>{t('common.income')}</h2>
          {incomePieData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
              <PieChart 
                onClick={(e) => {
                  if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault()
                  }
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation()
                  }
                  setActiveIncomeIndex(undefined)
                }}
                onMouseDown={(e) => {
                  if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault()
                  }
                }}
                style={{ cursor: 'default', userSelect: 'none' }}
              >
                <Pie
                  data={incomePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  activeIndex={activeIncomeIndex}
                  activeShape={(props: any) => {
                    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
                    return (
                      <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius + 10}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                        opacity={1}
                      />
                    )
                  }}
                  onMouseEnter={(_, index) => setActiveIncomeIndex(index)}
                  onMouseLeave={() => setActiveIncomeIndex(undefined)}
                  onClick={(data, index, e) => {
                    if (e && typeof e.preventDefault === 'function') {
                      e.preventDefault()
                    }
                    if (e && typeof e.stopPropagation === 'function') {
                      e.stopPropagation()
                    }
                    setActiveIncomeIndex(undefined)
                  }}
                  isAnimationActive={false}
                >
                  {incomePieData.map((entry, index) => (
                    <Cell 
                      key={`income-cell-${index}`} 
                      fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                      opacity={activeIncomeIndex === undefined || activeIncomeIndex === index ? 1 : 0.3}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload
                      const total = incomePieData.reduce((sum, item) => sum + item.value, 0)
                      const percent = ((data.value / total) * 100).toFixed(2)
                      return (
                        <div style={{
                          backgroundColor: theme.isDark ? '#2a2a2a' : '#ffffff',
                          border: `1px solid ${theme.inputBorder}`,
                          borderRadius: '8px',
                          padding: '8px 12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <div style={{
                            color: theme.isDark ? '#ffffff' : '#1a1a1a',
                            fontWeight: 600,
                            marginBottom: '4px',
                            fontSize: '0.875rem'
                          }}>
                            {translateCategory(data.name)}
                          </div>
                          <div style={{
                            color: theme.isDark ? '#b3b3b3' : '#6c757d',
                            fontSize: '0.8125rem'
                          }}>
                            {percent}% : {data.value.toLocaleString()}{t('common.currency')}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingLeft: '1rem', fontSize: '0.875rem' }}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: theme.text }}>{translateCategory(value)}</span>
                  )}
                />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
              {t('statistics.noTransactionsForType', { type: t('common.income') })}
            </div>
          )}
        </div>

        {/* 수입 라인 그래프 (오른쪽 아래) */}
        <div className="chart-card card" style={{ backgroundColor: theme.surface }}>
          <h2 className="chart-title" style={{ color: theme.text }}>{t('common.income')}</h2>
          {dailyData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.inputBorder} />
                <XAxis 
                  dataKey="date" 
                  stroke={theme.textSecondary}
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis 
                  stroke={theme.textSecondary}
                  style={{ fontSize: '0.75rem' }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()}${t('common.currency')}`}
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <ReferenceLine 
                  y={avgIncome} 
                  stroke={theme.income}
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                  label={{ 
                    value: t('reports.averageWithValue', { value: avgIncome.toLocaleString() }), 
                    position: "right",
                    fill: theme.income,
                    fontSize: 12
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke={theme.income}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: theme.income, r: 3 }}
                  name={t('common.income')}
                />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
              {t('reports.noIncomeData')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
