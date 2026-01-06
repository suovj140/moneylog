import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, parseISO } from 'date-fns'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Sector } from 'recharts'
import { transactionService, Transaction } from '../services/transactionService'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import './Statistics.css'

// hex 색상을 rgba로 변환하는 헬퍼 함수
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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

export default function Statistics() {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedType, setSelectedType] = useState<'expense' | 'income'>('expense')
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
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
      setTransactions([])
    }
  }

  const getMonthTransactions = () => {
    const start = startOfMonth(new Date(selectedMonth + '-01'))
    const end = endOfMonth(new Date(selectedMonth + '-01'))
    
    return transactions.filter(transaction => {
      const date = new Date(transaction.date)
      return date >= start && date <= end && transaction.type === selectedType
    })
  }

  const monthTransactions = getMonthTransactions()

  // 카테고리별 데이터 집계
  const categoryData = monthTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = 0
    }
    acc[transaction.category] += Number(transaction.amount) || 0
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const totalAmount = pieData.reduce((sum, item) => sum + item.value, 0)

  // 일별 합계 데이터
  const dailyData = eachDayOfInterval({
    start: startOfMonth(new Date(selectedMonth + '-01')),
    end: endOfMonth(new Date(selectedMonth + '-01'))
  }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayTransactions = monthTransactions.filter(transaction => transaction.date === dateStr)
    const total = dayTransactions.reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0)
    
    return {
      date: format(date, 'M/d'),
      fullDate: dateStr,
      amount: total
    }
  }).filter(d => d.amount > 0) // 0원인 날짜는 제외

  // 날짜별 내역 (최신순)
  const transactionsByDate = monthTransactions.reduce((acc, transaction) => {
    if (!acc[transaction.date]) {
      acc[transaction.date] = []
    }
    acc[transaction.date].push(transaction)
    return acc
  }, {} as Record<string, Transaction[]>)

  const sortedDates = Object.keys(transactionsByDate)
    .sort((a, b) => {
      const dateA = new Date(a).getTime()
      const dateB = new Date(b).getTime()
      return dateB - dateA // 최신순
    })

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const colors = selectedType === 'expense' ? EXPENSE_COLORS : INCOME_COLORS

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        {!isMobile && (
          <h1 className="page-title" style={{ color: theme.text }}>{t('statistics.title')}</h1>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isMobile && (
            <div className="type-tabs-header">
            <button
              className={`type-tab ${selectedType === 'expense' ? 'active' : ''}`}
              onClick={() => setSelectedType('expense')}
              style={{
                backgroundColor: selectedType === 'expense' ? hexToRgba(theme.primary, 0.5) : theme.surface,
                color: selectedType === 'expense' ? '#FFFFFF' : theme.text
              }}
            >
              {t('common.expense')}
            </button>
            <button
              className={`type-tab ${selectedType === 'income' ? 'active' : ''}`}
              onClick={() => setSelectedType('income')}
              style={{
                backgroundColor: selectedType === 'income' ? hexToRgba(theme.primary, 0.5) : theme.surface,
                color: selectedType === 'income' ? '#FFFFFF' : theme.text
              }}
            >
              {t('common.income')}
            </button>
            </div>
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
      </div>

      {/* 타입 선택 탭 (모바일용) */}
      {isMobile && (
        <div className="type-tabs">
          <button
            className={`type-tab ${selectedType === 'expense' ? 'active' : ''}`}
            onClick={() => setSelectedType('expense')}
            style={{
              backgroundColor: selectedType === 'expense' ? hexToRgba(theme.primary, 0.5) : theme.surface,
              color: selectedType === 'expense' ? '#FFFFFF' : theme.text
            }}
          >
            {t('common.expense')}
          </button>
          <button
            className={`type-tab ${selectedType === 'income' ? 'active' : ''}`}
            onClick={() => setSelectedType('income')}
            style={{
              backgroundColor: selectedType === 'income' ? hexToRgba(theme.primary, 0.5) : theme.surface,
              color: selectedType === 'income' ? '#FFFFFF' : theme.text
            }}
          >
            {t('common.income')}
          </button>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="statistics-content">
        {/* 왼쪽 영역: 원형 그래프 + 카테고리 리스트 */}
        <div className="statistics-left">
          <div className="chart-card card" style={{ backgroundColor: theme.surface }}>
            <h2 className="chart-title" style={{ color: theme.text }}>{selectedType === 'expense' ? t('common.expense') : t('common.income')}</h2>
            {pieData.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart 
                  onClick={() => {
                    setActiveIndex(undefined)
                  }}
                  style={{ cursor: 'default', userSelect: 'none' }}
                >
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    activeIndex={activeIndex}
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
                    onMouseEnter={(_data, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    onClick={() => {
                      setActiveIndex(undefined)
                    }}
                    isAnimationActive={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]}
                        opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.3}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload
                        const percent = ((data.value / totalAmount) * 100).toFixed(2)
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
                    formatter={(value: string, _entry: any) => (
                      <span style={{ color: theme.text }}>{translateCategory(value)}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-empty" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
                {t('statistics.noTransactionsForType', { type: selectedType === 'expense' ? t('common.expense') : t('common.income') })}
              </div>
            )}
          </div>

          {/* 카테고리별 리스트 */}
          <div className="category-list card" style={{ backgroundColor: theme.surface }}>
            <h3 className="list-title" style={{ color: theme.text }}>{t('statistics.categoryByType', { type: selectedType === 'expense' ? t('common.expense') : t('common.income') })}</h3>
            {pieData.length > 0 ? (
              <div className="category-items">
                {pieData.map((item, index) => {
                  const percent = ((item.value / totalAmount) * 100).toFixed(1)
                  return (
                    <div 
                      key={item.name} 
                      className="category-item"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.isDark 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.03)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <div className="category-info">
                        <div 
                          className="category-color" 
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="category-name" style={{ color: theme.text }}>{translateCategory(item.name)}</span>
                      </div>
                      <div className="category-amount">
                        <span className="category-percent" style={{ color: theme.textSecondary }}>
                          {percent}%
                        </span>
                        <span className="category-value" style={{ color: theme.text }}>
                          {item.value.toLocaleString()}{t('common.currency')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-message" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
                {t('statistics.noTransactions')}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 영역: 일별 합계 + 날짜별 내역 */}
        <div className="statistics-right">
          {/* 일별 합계 차트 */}
          <div className="daily-chart card" style={{ backgroundColor: theme.surface }}>
            <h3 className="chart-title" style={{ color: theme.text }}>{t('statistics.dailyTotal')}</h3>
            {dailyData.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
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
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload
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
                              fontSize: '0.875rem'
                            }}>
                              {data.date} : {data.amount.toLocaleString()}{t('common.currency')}
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill={selectedType === 'expense' ? theme.expense : theme.income}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-empty" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
                {t('statistics.noDailyData')}
              </div>
            )}
          </div>

          {/* 날짜별 내역 리스트 */}
          <div className="transactions-list card" style={{ backgroundColor: theme.surface }}>
            <h3 className="list-title" style={{ color: theme.text }}>{t('statistics.transactions')}</h3>
            {sortedDates.length > 0 ? (
              <div className="transactions-items">
                {sortedDates.map(date => {
                  const dateTransactions = transactionsByDate[date]
                  const dateTotal = dateTransactions.reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0)
                  
                  return (
                    <div key={date} className="date-group" style={{ borderBottomColor: theme.divider }}>
                      <div className="date-header">
                        <span className="date-text" style={{ color: theme.text }}>
                          {format(parseISO(date), 'yyyy.MM.dd')}
                        </span>
                        <span 
                          className="date-total" 
                          style={{ 
                            color: selectedType === 'expense' ? theme.expense : theme.income,
                            fontWeight: 600
                          }}
                        >
                          {dateTotal.toLocaleString()}{t('common.currency')}
                        </span>
                      </div>
                      <div className="transaction-items">
                        {dateTransactions.map(transaction => (
                          <div key={transaction.id} className="transaction-item">
                            <div className="transaction-info">
                              <span className="transaction-category" style={{ color: theme.text }}>
                                {translateCategory(transaction.category)}
                              </span>
                              {transaction.description && (
                                <span className="transaction-description" style={{ color: theme.textSecondary }}>
                                  {transaction.description}
                                </span>
                              )}
                            </div>
                            <span 
                              className="transaction-amount"
                              style={{ 
                                color: selectedType === 'expense' ? theme.expense : theme.income
                              }}
                            >
                              {Number(transaction.amount || 0).toLocaleString()}{t('common.currency')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-message" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
                {t('statistics.noTransactions')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}