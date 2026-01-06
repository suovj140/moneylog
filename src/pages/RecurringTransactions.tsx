import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { recurringTransactionService, RecurringTransaction } from '../services/recurringTransactionService'
import { format } from 'date-fns'
import DatePicker from '../components/DatePicker'
import FloatingActionButton from '../components/FloatingActionButton'
import './RecurringTransactions.css'

export default function RecurringTransactions() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // frequency 번역 헬퍼 함수 - 현재 언어에 맞게 번역
  const getFrequencyLabel = (frequency: string): string => {
    // 현재 언어 확인
    const currentLanguage = i18n.language || 'ko'
    
    try {
      const key = `recurringTransactions.frequency.${frequency}`
      const translated = t(key)
      // 번역이 키와 다르면 번역된 값 반환
      if (translated && translated !== key && translated.includes(frequency) === false) {
        return translated
      }
    } catch (error) {
      // 번역 실패 시 폴백 사용
    }
    
    // 폴백: 언어별 직접 매핑
    const fallbackMap: { [lang: string]: { [key: string]: string } } = {
      'ko': { 'daily': '매일', 'weekly': '매주', 'monthly': '매달', 'yearly': '매년', 'custom': '사용자 정의' },
      'en': { 'daily': 'Daily', 'weekly': 'Weekly', 'monthly': 'Monthly', 'yearly': 'Yearly', 'custom': 'Custom' },
      'ja': { 'daily': '毎日', 'weekly': '毎週', 'monthly': '毎月', 'yearly': '毎年', 'custom': 'カスタム' },
      'zh': { 'daily': '每天', 'weekly': '每周', 'monthly': '每月', 'yearly': '每年', 'custom': '自定义' },
      'vi': { 'daily': 'Hàng ngày', 'weekly': 'Hàng tuần', 'monthly': 'Hàng tháng', 'yearly': 'Hàng năm', 'custom': 'Tùy chỉnh' },
      'fil': { 'daily': 'Araw-araw', 'weekly': 'Lingguhan', 'monthly': 'Buwanan', 'yearly': 'Taun-taon', 'custom': 'Custom' }
    }
    
    // 현재 언어에 맞는 번역 반환, 없으면 원본 반환
    return fallbackMap[currentLanguage]?.[frequency] || t(`recurringTransactions.frequency.${frequency}`) || frequency
  }

  // 카테고리명 번역 함수 (한국어 -> 현재 언어)
  const translateCategory = (category: string): string => {
    const expenseCategories = t('common.categories.expense', { returnObjects: true }) as string[]
    const incomeCategories = t('common.categories.income', { returnObjects: true }) as string[]
    
    const categoryMap: Record<string, string[]> = {
      '식비': ['Food', '식비'],
      '교통비': ['Transport', '교통비'],
      '쇼핑': ['Shopping', '쇼핑'],
      '문화생활': ['Culture', '문화생활'],
      '의료비': ['Medical', '의료비'],
      '통신비': ['Communication', '통신비'],
      '생활비': ['Living', '생활비'],
      '기타': ['Other', '기타'],
      '급여': ['Salary', '급여'],
      '부수입': ['Extra Income', '부수입'],
      '용돈': ['Allowance', '용돈']
    }
    
    if (categoryMap[category]) {
      const langIndex = i18n.language === 'ko' ? 1 : 0
      return categoryMap[category][langIndex] || category
    }
    
    if ([...expenseCategories, ...incomeCategories].includes(category)) {
      return category
    }
    
    return category
  }

  // 결제수단 번역 함수 (한국어 -> 현재 언어)
  const translatePaymentMethod = (paymentMethod: string): string => {
    const paymentMethods = t('common.paymentMethods', { returnObjects: true }) as string[]
    
    const paymentMethodMap: Record<string, string[]> = {
      '현금': ['Cash', '현금'],
      '체크카드': ['Check Card', '체크카드'],
      '신용카드': ['Credit Card', '신용카드'],
      '계좌이체': ['Bank Transfer', '계좌이체'],
      '기타': ['Other', '기타']
    }
    
    if (paymentMethodMap[paymentMethod]) {
      const langIndex = i18n.language === 'ko' ? 1 : 0
      return paymentMethodMap[paymentMethod][langIndex] || paymentMethod
    }
    
    if (paymentMethods.includes(paymentMethod)) {
      return paymentMethod
    }
    
    return paymentMethod
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadRecurringTransactions()
  }, [])

  // 언어 변경 시 재렌더링
  useEffect(() => {
    // 언어가 변경되면 컴포넌트가 재렌더링되어 번역이 업데이트됨
  }, [i18n.language])

  const loadRecurringTransactions = async () => {
    try {
      setIsLoading(true)
      const data = await recurringTransactionService.getAll()
      setRecurringTransactions(data)
    } catch (error) {
      console.error('Failed to load recurring transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await recurringTransactionService.toggle(id)
      await loadRecurringTransactions()
    } catch (error) {
      console.error('Failed to toggle recurring transaction:', error)
      alert(t('recurringTransactions.toggleFailed'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('recurringTransactions.deleteConfirm'))) {
      return
    }

    try {
      await recurringTransactionService.delete(id)
      await loadRecurringTransactions()
    } catch (error) {
      console.error('Failed to delete recurring transaction:', error)
      alert(t('recurringTransactions.deleteFailed'))
    }
  }

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRecurring(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingRecurring(null)
  }

  const handleModalSuccess = () => {
    loadRecurringTransactions()
    handleModalClose()
  }

  const handleGenerate = async (id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    try {
      await recurringTransactionService.generate(id, today)
      alert(t('recurringTransactions.generateSuccess'))
      await loadRecurringTransactions()
    } catch (error) {
      console.error('Failed to generate transaction:', error)
      alert(t('recurringTransactions.generateFailed'))
    }
  }

  if (isLoading) {
    return (
      <div className="recurring-transactions-page" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: theme.text }}>{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="recurring-transactions-page">
      <div className="page-header">
        {isMobile && (
          <button
            onClick={() => navigate('/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.text,
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            ←
          </button>
        )}
        <h1 style={{ color: theme.text }}>{t('recurringTransactions.title')}</h1>
        {!isMobile && (
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            style={{ marginLeft: '0' }}
          >
            ➕ {t('common.add')}
          </button>
        )}
      </div>

      <div className="recurring-list">
        {recurringTransactions.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: theme.textSecondary }}>
            <p>{t('recurringTransactions.noRecurringTransactions')}</p>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ marginTop: '1rem' }}
            >
              {t('recurringTransactions.createFirst')}
            </button>
          </div>
        ) : (
          recurringTransactions.map(rt => (
            <div
              key={rt.id}
              className="recurring-card card"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.inputBorder}`,
                opacity: rt.enabled ? 1 : 0.6
              }}
            >
              <div className="recurring-header">
                <div className="recurring-info">
                  {isMobile ? (
                    <>
                      <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>{rt.name}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span
                          className="recurring-badge"
                          style={{
                            backgroundColor: rt.type === 'income' ? theme.income : theme.expense,
                            color: '#fff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {rt.type === 'income' ? t('common.income') : t('common.expense')}
                        </span>
                        <span
                          className="recurring-badge"
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.text,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {getFrequencyLabel(rt.frequency)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="recurring-title-row">
                      <h3 style={{ color: theme.text, margin: 0, marginRight: '0.75rem' }}>{rt.name}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span
                          className="recurring-badge"
                          style={{
                            backgroundColor: rt.type === 'income' ? theme.income : theme.expense,
                            color: '#fff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {rt.type === 'income' ? t('common.income') : t('common.expense')}
                        </span>
                        <span
                          className="recurring-badge"
                          style={{
                            backgroundColor: theme.inputBg,
                            color: theme.text,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          {getFrequencyLabel(rt.frequency)}
                        </span>
                      </div>
                    </div>
                  )}
                  {isMobile && (
                    <div style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>
                      <p><strong>{t('recurringTransactions.amount')}:</strong> {rt.amount.toLocaleString()}{t('common.currency')}</p>
                      <p><strong>{t('recurringTransactions.category')}:</strong> {translateCategory(rt.category)}</p>
                      {rt.paymentMethod && (
                        <p><strong>{t('recurringTransactions.paymentMethod')}:</strong> {translatePaymentMethod(rt.paymentMethod)}</p>
                      )}
                      <p><strong>{t('recurringTransactions.startDate')}:</strong> {rt.startDate}</p>
                      {rt.endDate && (
                        <p><strong>{t('recurringTransactions.endDate')}:</strong> {rt.endDate}</p>
                      )}
                    </div>
                  )}
                </div>
                {!isMobile && (
                  <div className="recurring-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleToggle(rt.id)}
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.625rem 1.25rem',
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: '6px',
                        fontWeight: 500
                      }}
                    >
                      {rt.enabled ? t('recurringTransactions.disable') : t('recurringTransactions.enable')}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleGenerate(rt.id)}
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.625rem 1.25rem',
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: '6px',
                        fontWeight: 500
                      }}
                    >
                      {t('recurringTransactions.generateNow')}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(rt)}
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.625rem 1.25rem',
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: '6px',
                        fontWeight: 500
                      }}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(rt.id)}
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.625rem 1.25rem',
                        backgroundColor: theme.error || '#EF4444',
                        color: '#fff',
                        border: `1px solid ${theme.error || '#EF4444'}`,
                        borderRadius: '6px',
                        fontWeight: 500
                      }}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                )}
              </div>
              {!isMobile && (
                <div style={{ color: theme.textSecondary, fontSize: '0.875rem', marginTop: '1rem' }}>
                  <p><strong>{t('recurringTransactions.amount')}:</strong> {rt.amount.toLocaleString()}{t('common.currency')}</p>
                  <p><strong>{t('recurringTransactions.category')}:</strong> {translateCategory(rt.category)}</p>
                  {rt.paymentMethod && (
                    <p><strong>{t('recurringTransactions.paymentMethod')}:</strong> {translatePaymentMethod(rt.paymentMethod)}</p>
                  )}
                  <p><strong>{t('recurringTransactions.startDate')}:</strong> {rt.startDate}</p>
                  {rt.endDate && (
                    <p><strong>{t('recurringTransactions.endDate')}:</strong> {rt.endDate}</p>
                  )}
                </div>
              )}
              {isMobile && (
                <div className="recurring-actions" style={{ borderTopColor: theme.divider }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleToggle(rt.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {rt.enabled ? t('recurringTransactions.disable') : t('recurringTransactions.enable')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleGenerate(rt.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {t('recurringTransactions.generateNow')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(rt)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(rt.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <RecurringTransactionModal
          recurring={editingRecurring}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {isMobile && <FloatingActionButton onClick={handleAdd} />}
    </div>
  )
}

// 반복 거래 생성/수정 모달
function RecurringTransactionModal({
  recurring,
  onClose,
  onSuccess
}: {
  recurring: RecurringTransaction | null
  onClose: () => void
  onSuccess: () => void
}) {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  
  // 현재 언어 확인
  const currentLanguage = i18n.language || 'ko'
  
  const expenseCategories = t('common.categories.expense', { returnObjects: true }) as string[]
  const incomeCategories = t('common.categories.income', { returnObjects: true }) as string[]
  const paymentMethods = t('common.paymentMethods', { returnObjects: true }) as string[]
  
  // 반복주기 옵션 - 현재 언어에 맞게 번역된 label 사용
  const frequencyOptions = useMemo(() => {
    // 현재 언어에 맞는 번역을 강제로 가져오기
    const getFrequencyLabel = (key: string): string => {
      const translationKey = `recurringTransactions.frequency.${key}`
      const translated = t(translationKey)
      // 번역이 키와 같으면 번역이 안 된 것이므로, 직접 번역 시도
      if (translated === translationKey) {
        // 폴백: 언어별 직접 매핑
        const fallbackMap: { [lang: string]: { [key: string]: string } } = {
          'ko': { 'daily': '매일', 'weekly': '매주', 'monthly': '매달', 'yearly': '매년', 'custom': '사용자 정의' },
          'en': { 'daily': 'Daily', 'weekly': 'Weekly', 'monthly': 'Monthly', 'yearly': 'Yearly', 'custom': 'Custom' },
          'ja': { 'daily': '毎日', 'weekly': '毎週', 'monthly': '毎月', 'yearly': '毎年', 'custom': 'カスタム' },
          'zh': { 'daily': '每天', 'weekly': '每周', 'monthly': '每月', 'yearly': '每年', 'custom': '自定义' },
          'vi': { 'daily': 'Hàng ngày', 'weekly': 'Hàng tuần', 'monthly': 'Hàng tháng', 'yearly': 'Hàng năm', 'custom': 'Tùy chỉnh' },
          'fil': { 'daily': 'Araw-araw', 'weekly': 'Lingguhan', 'monthly': 'Buwanan', 'yearly': 'Taun-taon', 'custom': 'Custom' }
        }
        return fallbackMap[currentLanguage]?.[key] || key
      }
      return translated
    }
    
    return [
      { value: 'daily', label: getFrequencyLabel('daily') },
      { value: 'weekly', label: getFrequencyLabel('weekly') },
      { value: 'monthly', label: getFrequencyLabel('monthly') },
      { value: 'yearly', label: getFrequencyLabel('yearly') },
      { value: 'custom', label: getFrequencyLabel('custom') }
    ]
  }, [t, i18n.language, currentLanguage])
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    amountDisplay: '', // 표시용 (천 단위 구분 포함)
    category: '',
    paymentMethod: '',
    memo: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    frequencyOptions: {} as any,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    enabled: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 숫자 포맷팅 함수 (천 단위 구분)
  const formatNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (!numbers) return ''
    return parseInt(numbers, 10).toLocaleString('ko-KR')
  }

  // 숫자 추출 함수 (표시용 -> 실제 값)
  const parseNumber = (value: string): string => {
    return value.replace(/[^0-9]/g, '')
  }

  useEffect(() => {
    if (recurring) {
      const amountValue = recurring.amount.toString()
      setFormData({
        name: recurring.name,
        type: recurring.type,
        amount: amountValue,
        amountDisplay: formatNumber(amountValue),
        category: recurring.category,
        paymentMethod: recurring.paymentMethod || '',
        memo: recurring.memo || '',
        frequency: recurring.frequency,
        frequencyOptions: recurring.frequencyOptions,
        startDate: recurring.startDate,
        endDate: recurring.endDate || '',
        enabled: recurring.enabled
      })
    }
  }, [recurring])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name) {
      setError(t('recurringTransactions.enterName'))
      return
    }

    const amountValue = parseNumber(formData.amount || formData.amountDisplay)
    if (!amountValue || Number(amountValue) <= 0) {
      setError(t('recurringTransactions.enterAmount'))
      return
    }

    if (!formData.category) {
      setError(t('recurringTransactions.selectCategory'))
      return
    }

    setIsLoading(true)

    try {
      const amountValue = parseNumber(formData.amount || formData.amountDisplay)
      const recurringData = {
        name: formData.name,
        type: formData.type,
        amount: Number(amountValue),
        category: formData.category,
        paymentMethod: formData.paymentMethod || undefined,
        memo: formData.memo || undefined,
        frequency: formData.frequency,
        frequencyOptions: formData.frequencyOptions,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        enabled: formData.enabled
      }

      if (recurring?.id) {
        await recurringTransactionService.update(recurring.id, recurringData)
      } else {
        await recurringTransactionService.create(recurringData)
      }
      onSuccess()
    } catch (err: any) {
      console.error('Failed to save recurring transaction:', err)
      setError(err?.message || t('recurringTransactions.saveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.surface }}>
        <div className="modal-header">
          <h2 style={{ color: theme.text }}>
            {recurring ? t('recurringTransactions.editRecurringTransaction') : t('recurringTransactions.createRecurringTransaction')}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* 이름 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.name')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid',
                width: '100%',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* 유형 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.type')}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  // 타입이 변경되면 카테고리도 초기화 (수입 카테고리와 지출 카테고리가 다르므로)
                  const currentCategory = formData.category
                  const newCategories = incomeCategories
                  const isValidCategory = newCategories.includes(currentCategory)
                  setFormData({ 
                    ...formData, 
                    type: 'income',
                    category: isValidCategory ? currentCategory : ''
                  })
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: formData.type === 'income' ? theme.income : theme.inputBg,
                  color: formData.type === 'income' ? '#fff' : theme.text,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {t('common.income')}
              </button>
              <button
                type="button"
                onClick={() => {
                  // 타입이 변경되면 카테고리도 초기화
                  const currentCategory = formData.category
                  const newCategories = expenseCategories
                  const isValidCategory = newCategories.includes(currentCategory)
                  setFormData({ 
                    ...formData, 
                    type: 'expense',
                    category: isValidCategory ? currentCategory : ''
                  })
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: formData.type === 'expense' ? theme.expense : theme.inputBg,
                  color: formData.type === 'expense' ? '#fff' : theme.text,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {t('common.expense')}
              </button>
            </div>
          </div>

          {/* 금액 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.amount')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.amountDisplay || formData.amount}
              onChange={(e) => {
                const inputValue = e.target.value
                const numbersOnly = parseNumber(inputValue)
                const formatted = formatNumber(inputValue)
                setFormData({
                  ...formData,
                  amount: numbersOnly,
                  amountDisplay: formatted
                })
              }}
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid',
                width: '100%',
                boxSizing: 'border-box'
              }}
              required
              placeholder="0"
            />
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.category')}</label>
            <select
              className="form-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid',
                width: '100%',
                boxSizing: 'border-box'
              }}
              required
            >
              <option value="">{t('common.selectItem')}</option>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              {/* 현재 선택된 카테고리가 리스트에 없을 경우를 대비 (언어 변경 후 등) */}
              {formData.category && !(formData.type === 'income' ? incomeCategories : expenseCategories).includes(formData.category) && (
                <option value={formData.category}>{formData.category}</option>
              )}
            </select>
          </div>

          {/* 결제수단 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.paymentMethod')} ({t('common.optional')})</label>
            <select
              className="form-input"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <option value="">{t('common.selectItem')}</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* 반복 주기 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.frequency')}</label>
            <select
              className="form-input"
              value={formData.frequency}
              onChange={(e) => {
                const freq = e.target.value as any
                let options: any = {}
                if (freq === 'monthly') {
                  options.dayOfMonth = new Date().getDate()
                } else if (freq === 'weekly') {
                  options.dayOfWeek = new Date().getDay()
                }
                setFormData({ ...formData, frequency: freq, frequencyOptions: options })
              }}
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 시작일 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.startDate')}</label>
            <DatePicker
              value={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              required
            />
          </div>

          {/* 종료일 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('recurringTransactions.endDate')}</label>
            <DatePicker
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date || '' })}
              required={false}
            />
          </div>

          {error && (
            <div style={{ color: theme.error, marginBottom: '1rem' }}>{error}</div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} style={{ backgroundColor: theme.inputBg, color: theme.text }}>
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} style={{ backgroundColor: theme.primary, color: '#fff' }}>
              {isLoading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

