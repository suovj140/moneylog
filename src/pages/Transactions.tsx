import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { format, parseISO, getDay, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, addMonths, eachDayOfInterval } from 'date-fns'
import { transactionService, Transaction } from '../services/transactionService'
import FloatingActionButton from '../components/FloatingActionButton'
import TransactionModal from '../components/TransactionModal'
import './Transactions.css'

export default function Transactions() {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const dateParam = searchParams.get('date')
  const monthParam = searchParams.get('month')
  
  // URL 파라미터에서 날짜를 가져오거나 오늘 날짜 사용
  const initialDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) 
    ? dateParam 
    : format(new Date(), 'yyyy-MM-dd')
  
  // URL 파라미터에서 월을 가져오거나 선택된 날짜의 월 사용
  const initialMonth = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? parseISO(monthParam + '-01')
    : parseISO(initialDate)
  
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const lastTapRef = useRef<{ [key: string]: number }>({})
  
  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // URL 파라미터가 변경되면 날짜 및 월 업데이트
  useEffect(() => {
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setSelectedDate(dateParam)
      // 날짜가 변경되면 해당 월로 이동
      setCurrentMonth(parseISO(dateParam))
    }
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      setCurrentMonth(parseISO(monthParam + '-01'))
    }
  }, [dateParam, monthParam])

  const weekDays = t('common.weekDays', { returnObjects: true }) as string[]
  const selectedDateObj = parseISO(selectedDate)
  const dayStart = startOfDay(selectedDateObj)
  const dayEnd = endOfDay(selectedDateObj)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // 거래 내역 로드
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true)
        const data = await transactionService.getAll()
        setTransactions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('거래 내역 로드 실패:', error)
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }
    loadTransactions()
  }, [refreshKey])

  // 선택한 월의 거래 내역 필터링
  const monthTransactions = Array.isArray(transactions)
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

  // 선택한 날짜의 거래 내역 필터링
  const dayTransactions = monthTransactions.filter(t => {
    try {
      if (!t || !t.date) return false
      const transactionDate = parseISO(t.date)
      return transactionDate >= dayStart && transactionDate <= dayEnd
    } catch (error) {
      console.error('날짜 파싱 오류:', error, t)
      return false
    }
  })

  // 월별 요약
  const monthlySummary = monthTransactions.reduce(
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

  // 날짜별로 그룹화
  const transactionsByDate = monthTransactions.reduce((acc, t) => {
    if (!t || !t.date) return acc
    const dateStr = t.date
    if (!acc[dateStr]) {
      acc[dateStr] = []
    }
    acc[dateStr].push(t)
    return acc
  }, {} as Record<string, Transaction[]>)

  // 날짜순 정렬 (최신순)
  const sortedDates = Object.keys(transactionsByDate).sort((a, b) => {
    const dateA = new Date(a).getTime()
    const dateB = new Date(b).getTime()
    return dateB - dateA
  })

  // 각 날짜별 내역도 최신순 정렬
  sortedDates.forEach(date => {
    transactionsByDate[date].sort((a, b) => {
      const idA = parseInt(a.id) || 0
      const idB = parseInt(b.id) || 0
      return idB - idA
    })
  })

  const daySummary = dayTransactions.reduce(
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
  daySummary.balance = daySummary.income - daySummary.expense

  // 선택한 날짜의 내역들을 시간순으로 정렬 (최신순)
  const sortedTransactions = [...dayTransactions].sort((a, b) => {
    // ID를 기준으로 정렬 (최신순, 큰 ID가 최신)
    const idA = parseInt(a.id) || 0
    const idB = parseInt(b.id) || 0
    return idB - idA
  })

  // 거래 유형 텍스트 변환
  const getTypeText = (type: string) => {
    switch (type) {
      case 'income': return t('common.income')
      case 'expense': return t('common.expense')
      default: return type
    }
  }

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
      '쇼핑': ['Shopping', '쇼핑', 'ショッピング', 'Mua sắm', '购物', 'Pamimili'],
      '문화생활': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      '문화': ['Culture', '문화생활', '文化・娯楽', 'Văn hóa', '文化娱乐', 'Kultura'],
      '의료비': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
      '의료': ['Medical', '의료비', '医療費', 'Y tế', '医疗', 'Medikal'],
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

  // 결제수단 번역 함수 (저장된 값 -> 현재 언어로 변환)
  const translatePaymentMethod = (paymentMethod: string): string => {
    if (!paymentMethod) return '-'
    
    const paymentMethods = t('common.paymentMethods', { returnObjects: true }) as string[]
    
    // 모든 언어의 결제수단명 매핑 (한국어를 기준으로 다른 언어로 매핑)
    const paymentMethodMap: Record<string, string[]> = {
      '현금': ['Cash', '현금', '現金', 'Tiền mặt', '现金', 'Cash'],
      '체크카드': ['Check Card', '체크카드', 'デビットカード', 'Thẻ ghi nợ', '借记卡', 'Debit Card'],
      '카드': ['Card', '카드', 'カード', 'Thẻ', '卡', 'Card'],
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
    
    // 현재 언어의 결제수단 목록에 있으면 그대로 반환
    if (paymentMethods.includes(paymentMethod)) {
      return paymentMethod
    }
    
    // 매핑되지 않은 경우 원본 반환
    return paymentMethod
  }

  const handleAddClick = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const handleTransactionSuccess = () => {
    setRefreshKey(prev => prev + 1)
    setSelectedIds(new Set())
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(monthTransactions.map(t => t.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      alert(t('transactions.selectDeleteItem'))
      return
    }

    if (!confirm(t('transactions.deleteConfirmCount', { count: selectedIds.size }))) {
      return
    }

    try {
      const deletePromises = Array.from(selectedIds).map(id => 
        transactionService.delete(id)
      )
      await Promise.all(deletePromises)
      setSelectedIds(new Set())
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Failed to delete transactions:', error)
      alert(t('transactions.deleteFailed'))
    }
  }

  const goToPreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
  }

  return (
    <>
      <div className="transactions-page">
        <div className="transactions-header">
          {!isMobile && (
            <h1 className="page-title" style={{ color: theme.text, whiteSpace: 'nowrap' }}>{t('transactions.title')}</h1>
          )}
          <div className="month-navigation">
            <button onClick={goToPreviousMonth} style={{ color: theme.text }}>
              <span style={{ lineHeight: '1.125rem', display: 'inline-block', verticalAlign: 'middle' }}>‹</span>
            </button>
            <span style={{ color: theme.text }}>
              {format(currentMonth, 'yyyy.MM')}
            </span>
            <button onClick={goToNextMonth} style={{ color: theme.text }}>
              <span style={{ lineHeight: '1.125rem', display: 'inline-block', verticalAlign: 'middle' }}>›</span>
            </button>
          </div>
          {!isMobile && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="delete-button"
              style={{
                backgroundColor: theme.error,
                color: '#FFFFFF',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                marginLeft: 'auto'
              }}
            >
              {t('common.delete')} ({selectedIds.size})
            </button>
          )}
        </div>

        {/* 월별 요약 */}
        <div className="daily-summary" style={{ backgroundColor: theme.surface }}>
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
            <span className="summary-label" style={{ color: theme.textSecondary }}>{t('common.total')}</span>
            <span className="summary-value balance" style={{ 
              color: monthlySummary.balance >= 0 ? theme.income : theme.expense 
            }}>
              {monthlySummary.balance >= 0 ? '+' : ''}{monthlySummary.balance.toLocaleString()}{t('common.currency')}
            </span>
          </div>
        </div>

        <div className="transaction-list-container" style={{ backgroundColor: theme.background }}>
          {isLoading ? (
            <div className="loading-message" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
              {t('common.loading')}
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="empty-message" style={{ color: theme.textSecondary, textAlign: 'center', padding: '2rem' }}>
              {t('transactions.noTransactions')}
            </div>
          ) : isMobile ? (
            // 모바일: 날짜별 리스트
            sortedDates.map(date => {
              const dateTransactions = transactionsByDate[date]
              const dateObj = parseISO(date)
              const dateTotal = dateTransactions.reduce((sum, t) => {
                const amount = Number(t.amount) || 0
                if (t.type === 'income') return sum + amount
                if (t.type === 'expense') return sum - amount
                return sum
              }, 0)

              return (
                <div key={date} className="date-group" style={{ backgroundColor: theme.surface, marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="date-header" style={{ 
                    padding: '1rem', 
                    borderBottom: `1px solid ${theme.inputBorder}`,
                    backgroundColor: theme.surfaceLight
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0.5rem' : '0.75rem', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text }}>
                          {format(dateObj, 'd')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                            {format(dateObj, 'MM')}
                          </div>
                          <div 
                            style={{ 
                              fontSize: '0.75rem', 
                              color: getDay(dateObj) === 0 ? '#fff' : getDay(dateObj) === 6 ? '#fff' : theme.textSecondary,
                              backgroundColor: getDay(dateObj) === 0 ? '#FF4444' : getDay(dateObj) === 6 ? '#4477FF' : 'transparent',
                              padding: getDay(dateObj) === 0 || getDay(dateObj) === 6 ? '0.125rem 0.375rem' : '0',
                              borderRadius: getDay(dateObj) === 0 || getDay(dateObj) === 6 ? '4px' : '0',
                              display: 'inline-block',
                              width: 'fit-content'
                            }}
                          >
                            {weekDays[getDay(dateObj)]}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: dateTotal >= 0 ? theme.income : theme.expense,
                        textAlign: 'right',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        marginLeft: 'auto'
                      }}>
                        {dateTotal >= 0 ? '+' : ''}{dateTotal.toLocaleString()}{t('common.currency')}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-list">
                    {dateTransactions.map((transaction, idx) => {
                      // 모바일 더블탭 지원
                      const handleTap = (e: React.TouchEvent) => {
                        const transactionId = transaction.id
                        const currentTime = new Date().getTime()
                        const lastTap = lastTapRef.current[transactionId] || 0
                        const tapLength = currentTime - lastTap
                        
                        if (tapLength < 500 && tapLength > 0) {
                          // 더블탭 감지
                          e.preventDefault()
                          handleEditClick(transaction)
                          lastTapRef.current[transactionId] = 0 // 리셋
                        } else {
                          lastTapRef.current[transactionId] = currentTime
                        }
                      }
                      
                      return (
                        <div 
                          key={transaction.id || idx} 
                          className="transaction-item"
                          style={{ 
                            padding: '1rem',
                            borderBottom: idx < dateTransactions.length - 1 ? `1px solid ${theme.inputBorder}` : 'none',
                            cursor: 'pointer'
                          }}
                          onDoubleClick={() => handleEditClick(transaction)}
                          onTouchEnd={handleTap}
                        >
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
                            <div 
                              style={{ flexShrink: 0 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input 
                                type="checkbox"
                                checked={selectedIds.has(transaction.id)}
                                onChange={(e) => handleCheckboxChange(transaction.id, e.target.checked)}
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: transaction.type === 'income' 
                                  ? `${theme.income}20` 
                                  : `${theme.expense}20`,
                                color: transaction.type === 'income' 
                                  ? theme.income 
                                  : theme.expense,
                                fontWeight: 600,
                                flexShrink: 0
                              }}>
                                {getTypeText(transaction.type)}
                              </span>
                              <span style={{ fontSize: '0.9375rem', color: theme.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {translateCategory(transaction.category)}
                              </span>
                            </div>
                            <div style={{ 
                              fontSize: '1rem', 
                              fontWeight: 700, 
                              color: transaction.type === 'income' ? theme.income : theme.expense,
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                              marginLeft: 'auto'
                            }}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {Number(transaction.amount).toLocaleString()}{t('common.currency')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            // PC: 테이블 형식 (날짜별)
            sortedDates.map(date => {
              const dateTransactions = transactionsByDate[date]
              const dateObj = parseISO(date)
              const dateTotal = dateTransactions.reduce((sum, t) => {
                const amount = Number(t.amount) || 0
                if (t.type === 'income') return sum + amount
                if (t.type === 'expense') return sum - amount
                return sum
              }, 0)

              return (
                <div key={date} className="transactions-table-wrapper" style={{ backgroundColor: theme.surface, borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div className="transactions-table-header" style={{ 
                    padding: '1rem', 
                    borderBottom: `1px solid ${theme.inputBorder}`,
                    backgroundColor: theme.surfaceLight
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text }}>
                          {format(dateObj, 'd')}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                          <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                            {format(dateObj, 'MM')}
                          </div>
                          <div 
                            style={{ 
                              fontSize: '0.75rem', 
                              color: getDay(dateObj) === 0 ? '#fff' : getDay(dateObj) === 6 ? '#fff' : theme.textSecondary,
                              backgroundColor: getDay(dateObj) === 0 ? '#FF4444' : getDay(dateObj) === 6 ? '#4477FF' : 'transparent',
                              padding: getDay(dateObj) === 0 || getDay(dateObj) === 6 ? '0.125rem 0.375rem' : '0',
                              borderRadius: getDay(dateObj) === 0 || getDay(dateObj) === 6 ? '4px' : '0',
                              display: 'inline-block',
                              width: 'fit-content'
                            }}
                          >
                            {weekDays[getDay(dateObj)]}
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: 600, 
                        color: dateTotal >= 0 ? theme.income : theme.expense,
                        textAlign: 'right',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        marginLeft: 'auto'
                      }}>
                        {dateTotal >= 0 ? '+' : ''}{dateTotal.toLocaleString()}{t('common.currency')}
                      </div>
                    </div>
                  </div>
                  <table className="transactions-table">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.inputBorder}` }}>
                        <th style={{ width: '40px', color: theme.textSecondary }}>
                          <input 
                            type="checkbox"
                            checked={dateTransactions.length > 0 && dateTransactions.every(t => selectedIds.has(t.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const newSet = new Set(selectedIds)
                                dateTransactions.forEach(t => newSet.add(t.id))
                                setSelectedIds(newSet)
                              } else {
                                const newSet = new Set(selectedIds)
                                dateTransactions.forEach(t => newSet.delete(t.id))
                                setSelectedIds(newSet)
                              }
                            }}
                          />
                        </th>
                        <th style={{ width: '120px', color: theme.textSecondary }}>{t('transactions.type')}</th>
                        <th style={{ width: '150px', color: theme.textSecondary }}>{t('transactions.category')}</th>
                        <th style={{ width: '120px', color: theme.textSecondary }}>{t('transactions.paymentMethod')}</th>
                        <th style={{ minWidth: '200px', color: theme.textSecondary }}>{t('transactions.memo')}</th>
                        <th style={{ width: '150px', textAlign: 'right', color: theme.textSecondary }}>{t('transactions.amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateTransactions.map((transaction, idx) => (
                        <tr 
                          key={transaction.id || idx}
                          className="transaction-row"
                          style={{
                            borderBottom: idx < dateTransactions.length - 1 ? `1px solid ${theme.inputBorder}` : 'none',
                            cursor: 'pointer'
                          }}
                          onDoubleClick={() => handleEditClick(transaction)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={selectedIds.has(transaction.id)}
                              onChange={(e) => handleCheckboxChange(transaction.id, e.target.checked)}
                            />
                          </td>
                          <td>
                            <span style={{ 
                              fontSize: '0.875rem', 
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: transaction.type === 'income' 
                                ? `${theme.income}20` 
                                : `${theme.expense}20`,
                              color: transaction.type === 'income' 
                                ? theme.income 
                                : theme.expense,
                              fontWeight: 600
                            }}>
                              {getTypeText(transaction.type)}
                            </span>
                          </td>
                          <td style={{ color: theme.text, fontWeight: 500 }}>
                            {translateCategory(transaction.category)}
                          </td>
                          <td style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>
                            {translatePaymentMethod(transaction.paymentMethod || '')}
                          </td>
                          <td style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>
                            {transaction.memo || '-'}
                          </td>
                          <td style={{ 
                            textAlign: 'right',
                            fontWeight: 700,
                            color: transaction.type === 'income' ? theme.income : theme.expense
                          }}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {Number(transaction.amount).toLocaleString()}{t('common.currency')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })
          )}
        </div>
      </div>
      
      {/* 모바일 하단 삭제 팝업 */}
      {isMobile && selectedIds.size > 0 && (
        <div
          className="mobile-delete-popup"
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: theme.surface,
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: theme.shadowHover,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: '280px',
            maxWidth: '90vw'
          }}
        >
          <div style={{ color: theme.text, fontWeight: 600, fontSize: '0.9375rem' }}>
            {t('transactions.selectedCount', { count: selectedIds.size })}
          </div>
          <button
            onClick={handleDeleteSelected}
            style={{
              backgroundColor: theme.error,
              color: '#FFFFFF',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
              flex: 1,
              whiteSpace: 'nowrap'
            }}
          >
            {t('common.delete')}
          </button>
        </div>
      )}
      
      <FloatingActionButton onClick={handleAddClick} />
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleTransactionSuccess}
        transaction={editingTransaction}
      />
    </>
  )
}
