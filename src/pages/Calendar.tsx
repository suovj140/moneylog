import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns'
import { transactionService, Transaction } from '../services/transactionService'
import './Calendar.css'

export default function Calendar() {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()) // 초기값을 오늘 날짜로 설정
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [_isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [isInitialMount, setIsInitialMount] = useState(false)
  const dragStartYRef = useRef(0)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 거래 내역 로드
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true)
        
        // localStorage에 저장된 이전 데이터 삭제 (Supabase 사용)
        if (localStorage.getItem('transactions')) {
          console.log('로컬 스토리지의 이전 거래 데이터를 삭제합니다.')
          localStorage.removeItem('transactions')
        }
        
        const data = await transactionService.getAll()
        console.log('로드된 거래 내역:', data)
        console.log('거래 내역 개수:', data.length)
        // 데이터가 배열이 아니거나 null인 경우 빈 배열로 설정
        setTransactions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('거래 내역 로드 실패:', error)
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }
    loadTransactions()
  }, [currentDate])

  // 월별 거래 내역 계산
  const monthlyTransactions = Array.isArray(transactions) 
    ? transactions.filter(t => {
        try {
          if (!t || !t.date) return false
          const transactionDate = parseISO(t.date)
          return transactionDate >= monthStart && transactionDate <= monthEnd
        } catch (error) {
          console.error('날짜 파싱 오류:', error, t)
          return false
        }
      })
    : []

  const monthlySummary = monthlyTransactions.reduce(
    (acc, transaction) => {
      if (!transaction) return acc
      const amount = Number(transaction.amount) || 0
      if (transaction.type === 'income') {
        acc.income += amount
      } else if (transaction.type === 'expense') {
        acc.expense += amount
      }
      return acc
    },
    { income: 0, expense: 0, balance: 0 }
  )
  monthlySummary.balance = monthlySummary.income - monthlySummary.expense

  // 디버깅: 합계 값 확인
  console.log('월별 거래 내역:', monthlyTransactions.length)
  console.log('월별 요약:', monthlySummary)

  // 날짜별 거래 내역 가져오기
  const getTransactionsForDate = (date: Date) => {
    return monthlyTransactions.filter(t => {
      const transactionDate = parseISO(t.date)
      return isSameDay(transactionDate, date)
    })
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  // 날짜별로 그룹화 (모바일 리스트용)
  const transactionsByDate = monthlyTransactions.reduce((acc, transaction) => {
    const date = transaction.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transaction)
    return acc
  }, {} as Record<string, Transaction[]>)

  // 날짜별로 정렬 (최신순: 큰 숫자부터 작은 숫자로)
  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  // 각 날짜별 내역도 시간순으로 정렬 (최신순)
  sortedDates.forEach(date => {
    transactionsByDate[date].sort((a, b) => {
      // ID를 기준으로 정렬 (최신순, 큰 ID가 최신)
      const idA = parseInt(a.id) || 0
      const idB = parseInt(b.id) || 0
      return idB - idA
    })
  })

  const weekDays = t('common.weekDays', { returnObjects: true }) as string[]


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
      '식료': ['Groceries', '식료품', '食料品', 'Thực phẩm', '食品', 'Groseri'], // 식료품의 줄임말
      '교통비': ['Transport', '교통비', '交通費', 'Giao thông', '交通', 'Transportasyon'],
      '쇼핑': ['Shopping', '쇼핑', 'ショッピング', 'Mua sắm', '购物', 'Pamimili'],
      '문화생활': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      '의료비': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
      '통신비': ['Communication', '통신비', '通信費', 'Viễn thông', '通信', 'Komunikasyon'],
      '생활비': ['Living', '생활비', '生活費', 'Sinh hoạt', '生活费', 'Pamumuhay'],
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
    
    // 일본어 카테고리명도 매핑에 추가
    const japaneseMap: Record<string, string[]> = {
      '食費': ['Food', '식비', '食費', 'Ăn uống', '餐饮', 'Pagkain'],
      '外食': ['Dining Out', '외식', '外食', 'Ăn ngoài', '外食', 'Kumain sa labas'],
      '食料品': ['Groceries', '식료품', '食料品', 'Thực phẩm', '食品', 'Groseri'],
      '交通費': ['Transport', '교통비', '交通費', 'Giao thông', '交通', 'Transportasyon'],
      'ショッピング': ['Shopping', '쇼핑', 'ショッピング', 'Mua sắm', '购物', 'Pamimili'],
      '文化・娯楽': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      '医療費': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
      '通信費': ['Communication', '통신비', '通信費', 'Viễn thông', '通信', 'Komunikasyon'],
      '生活費': ['Living', '생활비', '生活費', 'Sinh hoạt', '生活费', 'Pamumuhay'],
      '住居': ['Housing', '주거', '住居', 'Nhà ở', '住房', 'Pabahay'],
      '教育': ['Education', '교육', '教育', 'Giáo dục', '教育', 'Edukasyon'],
      'その他': ['Other', '기타', 'その他', 'Khác', '其他', 'Iba pa'],
      '給与': ['Salary', '급여', '給与', 'Lương', '工资', 'Sahod'],
      '副収入': ['Extra Income', '부수입', '副収入', 'Thu nhập phụ', '额外收入', 'Dagdag na Kita'],
      'お小遣い': ['Allowance', '용돈', 'お小遣い', 'Tiền tiêu vặt', '零花钱', 'Allowance']
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
    
    // 일본어 카테고리명으로 매핑 시도
    if (japaneseMap[category]) {
      return japaneseMap[category][langIndex] || category
    }
    
    // 현재 언어의 카테고리 목록에 있으면 그대로 반환
    if ([...expenseCategories, ...incomeCategories].includes(category)) {
      return category
    }
    
    // 매핑되지 않은 경우 원본 반환
    return category
  }

  // 결제수단 번역 함수 (저장된 값 -> 현재 언어로 변환)
  const translatePaymentMethod = (paymentMethod: string): string => {
    const paymentMethods = t('common.paymentMethods', { returnObjects: true }) as string[]
    
    // 모든 언어의 결제수단명 매핑 (한국어를 기준으로 다른 언어로 매핑)
    const paymentMethodMap: Record<string, string[]> = {
      '현금': ['Cash', '현금', '現金', 'Tiền mặt', '现金', 'Cash'],
      '체크카드': ['Check Card', '체크카드', 'デビットカード', 'Thẻ ghi nợ', '借记卡', 'Debit Card'],
      '신용카드': ['Credit Card', '신용카드', 'クレジットカード', 'Thẻ tín dụng', '信用卡', 'Credit Card'],
      '계좌이체': ['Bank Transfer', '계좌이체', '銀行振込', 'Chuyển khoản', '银行转账', 'Bank Transfer'],
      '기타': ['Other', '기타', 'その他', 'Khác', '其他', 'Iba pa']
    }
    
    // 영어 결제수단명도 매핑에 추가
    const englishMap: Record<string, string[]> = {
      'Cash': ['Cash', '현금', '現金', 'Tiền mặt', '现金', 'Cash'],
      'Check Card': ['Check Card', '체크카드', 'デビットカード', 'Thẻ ghi nợ', '借记卡', 'Debit Card'],
      'Card': ['Card', '카드', 'カード', 'Thẻ', '卡', 'Card'],
      'Credit Card': ['Credit Card', '신용카드', 'クレジットカード', 'Thẻ tín dụng', '信用卡', 'Credit Card'],
      'Bank Transfer': ['Bank Transfer', '계좌이체', '銀行振込', 'Chuyển khoản', '银行转账', 'Bank Transfer'],
      'Other': ['Other', '기타', 'その他', 'Khác', '其他', 'Iba pa']
    }
    
    // 일본어 결제수단명도 매핑에 추가
    const japaneseMap: Record<string, string[]> = {
      '現金': ['Cash', '현금', '現金', 'Tiền mặt', '现金', 'Cash'],
      'デビットカード': ['Check Card', '체크카드', 'デビットカード', 'Thẻ ghi nợ', '借记卡', 'Debit Card'],
      'カード': ['Card', '카드', 'カード', 'Thẻ', '卡', 'Card'],
      'クレジットカード': ['Credit Card', '신용카드', 'クレジットカード', 'Thẻ tín dụng', '信用卡', 'Credit Card'],
      '銀行振込': ['Bank Transfer', '계좌이체', '銀行振込', 'Chuyển khoản', '银行转账', 'Bank Transfer'],
      'その他': ['Other', '기타', 'その他', 'Khác', '其他', 'Iba pa']
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
    
    // 한국어 결제수단명으로 매핑 시도
    if (paymentMethodMap[paymentMethod]) {
      return paymentMethodMap[paymentMethod][langIndex] || paymentMethod
    }
    
    // 영어 결제수단명으로 매핑 시도
    if (englishMap[paymentMethod]) {
      return englishMap[paymentMethod][langIndex] || paymentMethod
    }
    
    // 일본어 결제수단명으로 매핑 시도
    if (japaneseMap[paymentMethod]) {
      return japaneseMap[paymentMethod][langIndex] || paymentMethod
    }
    
    // 현재 언어의 결제수단 목록에 있으면 그대로 반환
    if (paymentMethods.includes(paymentMethod)) {
      return paymentMethod
    }
    
    // 매핑되지 않은 경우 원본 반환
    return paymentMethod
  }

  // 선택된 날짜의 거래 내역 가져오기
  const selectedDateTransactions = selectedDate 
    ? getTransactionsForDate(selectedDate)
    : []

  // 데스크톱 달력 뷰
  return (
    <div className="calendar-page">
      <div className="calendar-header">
        {!isMobile && (
          <h1 className="page-title" style={{ color: theme.text }}>{t('home.title')}</h1>
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

      <div className="monthly-summary" style={{ backgroundColor: theme.surface }}>
        <div className="summary-item">
          <span className="summary-label" style={{ color: theme.textSecondary }}>{t('common.income')}</span>
          <span className="summary-value income" style={{ color: theme.income }}>
            {monthlySummary.income > 0 ? '+' : ''}{monthlySummary.income.toLocaleString()}{t('common.currency')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label" style={{ color: theme.textSecondary }}>{t('common.expense')}</span>
          <span className="summary-value expense" style={{ color: theme.expense }}>
            {monthlySummary.expense > 0 ? '-' : ''}{monthlySummary.expense.toLocaleString()}{t('common.currency')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label" style={{ color: theme.textSecondary }}>{t('common.sum')}</span>
          <span className="summary-value balance" style={{ 
            color: monthlySummary.balance >= 0 ? theme.income : theme.expense 
          }}>
            {monthlySummary.balance >= 0 ? '+' : ''}{monthlySummary.balance.toLocaleString()}{t('common.currency')}
          </span>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-grid" style={{ backgroundColor: theme.surface }}>
        <div className="weekday-header" style={{ borderBottom: isMobile ? `1px dashed ${theme.textSecondary}30` : 'none', paddingBottom: isMobile ? '0.5rem' : '0' }}>
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className="weekday" 
              style={{ 
                color: theme.textSecondary,
                borderRight: isMobile && index < weekDays.length - 1 ? `1px dashed ${theme.textSecondary}30` : 'none'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {Array(getDay(monthStart)).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}
          
          {daysInMonth.map(day => {
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isTodayDate = isToday(day)
            
            const handleDoubleClick = () => {
              const dateString = format(day, 'yyyy-MM-dd')
              const monthString = format(day, 'yyyy-MM')
              navigate(`/transactions?month=${monthString}&date=${dateString}`)
            }
            
            const dayIndex = daysInMonth.findIndex(d => isSameDay(d, day))
            const isLastInRow = (dayIndex + Array(getDay(monthStart)).fill(null).length + 1) % 7 === 0
            
            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDate(day)
                  if (isMobile) {
                    // 해당 날짜의 거래 내역이 있을 때만 팝업 열기
                    const dayTransactions = getTransactionsForDate(day)
                    if (dayTransactions.length > 0) {
                      setIsDetailModalOpen(true)
                      setDragY(0)
                      setIsDragging(false)
                      setIsClosing(false)
                      setIsInitialMount(true)
                      // 애니메이션 후 초기 마운트 상태 해제
                      setTimeout(() => setIsInitialMount(false), 300)
                    }
                  }
                }}
                onDoubleClick={handleDoubleClick}
                style={{
                  backgroundColor: isSelected ? `${theme.primary}30` : 'transparent', // 30% 투명도 적용
                  borderColor: isTodayDate ? theme.primary : 'transparent',
                  borderRight: isMobile && !isLastInRow ? `1px dashed ${theme.textSecondary}30` : 'none',
                  borderBottom: isMobile ? `1px dashed ${theme.textSecondary}30` : 'none'
                }}
              >
                <div className="day-number" style={{ 
                  color: theme.text,  // 선택된 날짜도 원래 텍스트 색상 유지 (배경이 투명하므로)
                  fontWeight: isSelected ? 700 : 600  // 선택된 날짜는 약간 더 굵게
                }}>
                  {format(day, 'd')}
                </div>
                <div className="day-transactions">
                  {(() => {
                    const dayTransactions = getTransactionsForDate(day)
                    if (dayTransactions.length === 0) return null
                    
                    const daySummary = dayTransactions.reduce(
                      (acc, t) => {
                        const amount = Number(t.amount) || 0
                        if (t.type === 'income') {
                          acc.income += amount
                        } else if (t.type === 'expense') {
                          acc.expense += amount
                        }
                        return acc
                      },
                      { income: 0, expense: 0 }
                    )
                    
                    return (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: isMobile ? '0.125rem' : '0.25rem', 
                        flexWrap: 'nowrap', 
                        alignItems: 'flex-end', 
                        justifyContent: 'flex-end', 
                        width: '100%', 
                        overflow: 'visible' 
                      }}>
                        {daySummary.income > 0 && (
                          <span
                            className="transaction-summary income"
                            style={{
                              color: theme.income,
                              fontSize: isMobile ? '0.5625rem' : '0.875rem',
                              fontWeight: isMobile ? 400 : 700,
                              whiteSpace: 'nowrap',
                              lineHeight: '1.1',
                              overflow: 'visible',
                              textOverflow: 'clip',
                              maxWidth: 'none',
                              width: 'auto',
                              textAlign: 'right'
                            }}
                          >
                            {isMobile ? '' : `${t('common.income')} : `}{isMobile ? '' : '+'}{daySummary.income.toLocaleString()}{isMobile ? '' : t('common.currency')}
                          </span>
                        )}
                        {daySummary.expense > 0 && (
                          <span
                            className="transaction-summary expense"
                            style={{
                              color: theme.expense,
                              fontSize: isMobile ? '0.5625rem' : '0.875rem',
                              fontWeight: isMobile ? 400 : 700,
                              whiteSpace: 'nowrap',
                              lineHeight: '1.1',
                              overflow: 'visible',
                              textOverflow: 'clip',
                              maxWidth: 'none',
                              width: 'auto',
                              textAlign: 'right'
                            }}
                          >
                            {isMobile ? '' : `${t('common.expense')} : `}{isMobile ? '' : '-'}{daySummary.expense.toLocaleString()}{isMobile ? '' : t('common.currency')}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

        {/* 데스크톱: 오른쪽 메모 섹션 */}
        {!isMobile && (
          <div className="memo-section" style={{ backgroundColor: theme.surface }}>
            <div className="memo-header">
              <h2 className="memo-title" style={{ color: theme.text }}>
                {selectedDate ? format(selectedDate, 'yyyy.MM.dd') : t('home.selectDate')}
              </h2>
            </div>
            <div className="memo-content">
              {selectedDate ? (
                selectedDateTransactions.length > 0 ? (
                  <div className="memo-list">
                    {selectedDateTransactions.map((transaction, idx) => (
                      <div key={transaction.id || idx} className="memo-item">
                        <div className="memo-amount" style={{
                          color: transaction.type === 'income' ? theme.income : theme.expense,
                          fontWeight: 600,
                          marginBottom: '0.5rem'
                        }}>
                          {t('common.amount')}: {transaction.type === 'income' ? '+' : '-'}
                          {Number(transaction.amount).toLocaleString()}{t('common.currency')}
                        </div>
                        {transaction.category && (
                          <div className="memo-text" style={{ color: theme.text, marginBottom: '0.25rem' }}>
                            {translateCategory(transaction.category)}
                          </div>
                        )}
                        {transaction.memo && (
                          <div className="memo-text" style={{ color: theme.textSecondary }}>
                            {transaction.memo}
                          </div>
                        )}
                        {!transaction.memo && (
                          <div className="memo-empty" style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                            {t('home.noMemo')}
                          </div>
                        )}
                        {idx < selectedDateTransactions.length - 1 && (
                          <div className="memo-divider" style={{ 
                            borderBottom: `1px solid ${theme.inputBorder}`, 
                            margin: '1rem 0' 
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="memo-empty-state" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
                    {t('home.noTransactionsForDate')}
                  </div>
                )
              ) : (
                <div className="memo-empty-state" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
                  {t('home.selectDateForMemo')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 모바일: 날짜별 내역 하단 모달 */}
      {isMobile && isDetailModalOpen && selectedDate && (
        <div 
          className="mobile-date-detail-modal-overlay"
          onClick={() => {
            if (!isDragging && !isClosing) {
              setIsClosing(true)
              setTimeout(() => {
                setIsDetailModalOpen(false)
                setDragY(0)
                setIsClosing(false)
                setIsInitialMount(false)
              }, 300)
            }
          }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isInitialMount ? 'rgba(0, 0, 0, 0)' : `rgba(0, 0, 0, ${0.5 - Math.min(dragY / 1000, 0.3)})`,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              transition: isDragging ? 'none' : isInitialMount ? 'background-color 0.3s ease-out' : 'background-color 0.2s ease-out',
              animation: isInitialMount ? 'fadeIn 0.3s ease-out' : 'none'
            }}
        >
          <div 
            className="mobile-date-detail-modal"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              setIsDragging(true)
              const startY = e.touches[0].clientY
              setDragStartY(startY)
              dragStartYRef.current = startY
            }}
            onTouchMove={(e) => {
              const currentY = e.touches[0].clientY
              const deltaY = currentY - dragStartYRef.current
              if (deltaY > 0) {
                setDragY(deltaY)
              }
            }}
            onTouchEnd={() => {
              if (dragY > 100) {
                // 드래그 거리가 100px 이상이면 닫기
                setIsClosing(true)
                setTimeout(() => {
                  setIsDetailModalOpen(false)
                  setDragY(0)
                  setIsClosing(false)
                  setIsInitialMount(false)
                }, 300)
              } else {
                // 그렇지 않으면 원위치로 (부드럽게)
                setIsDragging(false)
                // 약간의 지연을 두어 transition이 자연스럽게 작동하도록
                setTimeout(() => {
                  setDragY(0)
                }, 10)
              }
            }}
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: dragY > 0 ? 'hidden' : 'auto',
              padding: '1.5rem 1.5rem 0.5rem 1.5rem',
              transform: isClosing ? 'translateY(100%)' : isInitialMount ? 'translateY(100%)' : `translateY(${Math.max(dragY, 0)}px)`,
              transition: isDragging ? 'none' : isClosing ? 'transform 0.3s ease-out' : isInitialMount ? 'transform 0.3s ease-out' : (dragY > 0 && !isDragging) ? 'transform 0.2s ease-out' : 'none',
              animation: isInitialMount ? 'slideUp 0.3s ease-out' : 'none'
            }}
          >
            <div 
              onTouchStart={(e) => {
                e.stopPropagation()
                setIsDragging(true)
                const startY = e.touches[0].clientY
                setDragStartY(startY)
                dragStartYRef.current = startY
              }}
              onTouchMove={(e) => {
                e.stopPropagation()
                const currentY = e.touches[0].clientY
                const deltaY = currentY - dragStartY
                if (deltaY > 0) {
                  setDragY(deltaY)
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation()
                if (dragY > 100) {
                  setIsClosing(true)
                  setTimeout(() => {
                    setIsDetailModalOpen(false)
                    setDragY(0)
                    setIsClosing(false)
                    setIsInitialMount(false)
                  }, 300)
                } else {
                  setIsDragging(false)
                  setTimeout(() => {
                    setDragY(0)
                  }, 10)
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                setIsClosing(true)
                setTimeout(() => {
                  setIsDetailModalOpen(false)
                  setDragY(0)
                  setIsClosing(false)
                  setIsInitialMount(false)
                }, 300)
              }}
              style={{ 
                width: '40px', 
                height: '4px', 
                backgroundColor: theme.textSecondary, 
                borderRadius: '2px',
                margin: '0 auto 1rem auto',
                opacity: 0.3,
                cursor: 'pointer',
                touchAction: 'none'
              }} 
            />
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ 
                color: theme.text, 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                marginBottom: '0.5rem'
              }}>
                {format(selectedDate, 'yyyy.MM.dd')} {weekDays[getDay(selectedDate)]}요일
              </h2>
              {selectedDateTransactions.length > 0 && (() => {
                const daySummary = selectedDateTransactions.reduce(
                  (acc, t) => {
                    const amount = Number(t.amount) || 0
                    if (t.type === 'income') {
                      acc.income += amount
                    } else if (t.type === 'expense') {
                      acc.expense += amount
                    }
                    return acc
                  },
                  { income: 0, expense: 0 }
                )
                return (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.25rem', 
                    fontSize: '0.875rem', 
                    color: theme.textSecondary, 
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end' 
                  }}>
                    {daySummary.income > 0 && (
                      <span style={{ color: theme.income, textAlign: 'right' }}>
                        {t('common.income')} : +{daySummary.income.toLocaleString()}{t('common.currency')}
                      </span>
                    )}
                    {daySummary.expense > 0 && (
                      <span style={{ color: theme.expense, textAlign: 'right' }}>
                        {t('common.expense')} : -{daySummary.expense.toLocaleString()}{t('common.currency')}
                      </span>
                    )}
                  </div>
                )
              })()}
            </div>
            {selectedDateTransactions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {selectedDateTransactions.map((transaction, idx) => (
                  <div 
                    key={transaction.id || idx} 
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: theme.surfaceLight,
                      borderLeft: `4px solid ${transaction.type === 'income' ? theme.income : theme.expense}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    {/* 메모와 금액 (같은 줄) */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {transaction.memo ? (
                        <div style={{ 
                          color: theme.text, 
                          fontSize: '0.9375rem', 
                          fontWeight: 500,
                          flex: 1,
                          minWidth: 0
                        }}>
                          {transaction.memo}
                        </div>
                      ) : (
                        <div style={{ flex: 1 }}></div>
                      )}
                      <div style={{ 
                        color: transaction.type === 'income' ? theme.income : theme.expense,
                        fontWeight: 700,
                        fontSize: '1rem',
                        flexShrink: 0,
                        marginLeft: 'auto'
                      }}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {Number(transaction.amount).toLocaleString()}{t('common.currency')}
                      </div>
                    </div>
                    
                    {/* 카테고리와 결제수단 (사용구분) */}
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: theme.textSecondary }}>
                      {transaction.category && (
                        <span>{translateCategory(transaction.category)}</span>
                      )}
                      {transaction.paymentMethod && (
                        <>
                          {transaction.category && <span>·</span>}
                          <span>{translatePaymentMethod(transaction.paymentMethod)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                color: theme.textSecondary, 
                textAlign: 'center', 
                padding: '2rem',
                fontSize: '0.9375rem'
              }}>
                {t('home.noTransactionsForDate')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
