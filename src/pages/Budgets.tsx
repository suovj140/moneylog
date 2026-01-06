import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { budgetService } from '../services/budgetService'
import { transactionService } from '../services/transactionService'
import './Budgets.css'

interface Budget {
  id: string
  month: string
  categoryId: string | null
  categoryName: string
  amount: number
}

interface Transaction {
  id: string
  date: string
  amount: number
  type: 'expense'
  category: string
}

export default function Budgets() {
  const { t } = useTranslation()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    categoryName: '',
    amount: ''
  })

  const categories = t('budgets.categories', { returnObjects: true }) as string[]
  const allCategoryText = categories[7] // '전체' 또는 'All'

  useEffect(() => {
    loadBudgets()
    loadTransactions()
  }, [])

  const loadBudgets = async () => {
    try {
      const data = await budgetService.getByMonth(selectedMonth)
      setBudgets(data)
    } catch (error) {
      console.error('Failed to load budgets:', error)
      // 폴백: 로컬 스토리지에서 가져오기
      const stored = localStorage.getItem(`budgets_${selectedMonth}`)
      if (stored) {
        setBudgets(JSON.parse(stored))
      } else {
        setBudgets([])
      }
    }
  }

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAll()
      setTransactions(data.filter(t => t.type === 'expense') as Transaction[])
    } catch (error) {
      console.error('Failed to load transactions:', error)
      // 폴백: 로컬 스토리지에서 가져오기
      const stored = localStorage.getItem('transactions')
      if (stored) {
        setTransactions(JSON.parse(stored).filter((t: Transaction) => t.type === 'expense'))
      }
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [selectedMonth])

  const getMonthExpenses = (categoryName: string | null) => {
    const start = startOfMonth(new Date(selectedMonth + '-01'))
    const end = endOfMonth(new Date(selectedMonth + '-01'))
    
    return transactions
      .filter(t => {
        const date = new Date(t.date)
        return date >= start && date <= end && 
          t.type === 'expense' &&
          (categoryName === allCategoryText || categoryName === null || t.category === categoryName)
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.categoryName) {
      alert(t('budgets.enterRequired'))
      return
    }

    const budget: Budget = {
      id: editingId || '',
      month: selectedMonth,
      categoryId: formData.categoryName === allCategoryText ? null : formData.categoryName,
      categoryName: formData.categoryName,
      amount: Number(formData.amount)
    }

    try {
      if (editingId) {
        // 중복 체크
        const exists = budgets.find(b => 
          b.categoryName === budget.categoryName && 
          b.month === budget.month &&
          b.id !== editingId
        )
        if (exists) {
          alert(t('budgets.budgetExists'))
          return
        }
        await budgetService.update(editingId, budget)
      } else {
        // 중복 체크
        const exists = budgets.find(b => 
          b.categoryName === budget.categoryName && b.month === budget.month
        )
        if (exists) {
          alert(t('budgets.budgetExists'))
          return
        }
        await budgetService.save(budget)
      }
      await loadBudgets()
      resetForm()
    } catch (error) {
      console.error('Failed to save budget:', error)
      alert(t('budgets.saveFailed'))
    }
  }

  const resetForm = () => {
    setFormData({
      categoryName: '',
      amount: ''
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleEdit = (budget: Budget) => {
    setFormData({
      categoryName: budget.categoryName,
      amount: budget.amount.toString()
    })
    setEditingId(budget.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('budgets.deleteConfirm'))) {
      try {
        await budgetService.delete(id, selectedMonth)
        await loadBudgets()
      } catch (error) {
        console.error('Failed to delete budget:', error)
        alert(t('budgets.deleteFailed'))
      }
    }
  }


  return (
    <div className="budgets">
      <div className="page-header">
        <h1>{t('budgets.budgetManagement')}</h1>
        <div className="header-controls">
          <select
            className="input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - i)
              return (
                <option key={i} value={format(date, 'yyyy-MM')}>
                  {format(date, 'yyyy년 M월')}
                </option>
              )
            })}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm)
              if (showForm) resetForm()
            }}
          >
            {showForm ? t('common.cancel') : `➕ ${t('common.add')}`}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="budget-form card" onSubmit={handleSubmit}>
          <h2>{editingId ? t('budgets.editBudget') : t('budgets.newBudget')}</h2>
          
          <div className="input-group">
            <label className="input-label">{t('common.category')}</label>
            <select 
              className="input"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              required
            >
              <option value="">{t('common.selectItem')}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">{t('budgets.budgetAmount')}</label>
            <input
              type="number"
              className="input"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            {editingId ? t('common.edit') : t('common.add')}
          </button>
        </form>
      )}

      <div className="budget-list">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const spent = getMonthExpenses(budget.categoryName === allCategoryText ? null : budget.categoryName)
            const percentage = (spent / budget.amount) * 100
            const isOver = spent > budget.amount
            const remaining = budget.amount - spent

            return (
              <div key={budget.id} className={`budget-card card ${isOver ? 'over-budget' : ''}`}>
                <div className="budget-card-header">
                  <div>
                    <h3 className="budget-category">{budget.categoryName}</h3>
                    <div className="budget-amount-info">
                      <span className="spent">{t('budgets.spent')}: {spent.toLocaleString()}원</span>
                      <span className="budget-amount">{t('budgets.budget')}: {budget.amount.toLocaleString()}원</span>
                    </div>
                  </div>
                  {isOver && <span className="alert-badge">{t('budgets.over')}</span>}
                </div>

                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${isOver ? 'over' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="budget-stats">
                  <div className="stat-item">
                    <span className="stat-label">{t('budgets.usageRate')}</span>
                    <span className={`stat-value ${isOver ? 'over' : ''}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t('budgets.remaining')}</span>
                    <span className={`stat-value ${isOver ? 'negative' : ''}`}>
                      {remaining >= 0 ? remaining.toLocaleString() : (Math.abs(remaining).toLocaleString())}원
                      {remaining < 0 && ` ${t('budgets.overAmount')}`}
                    </span>
                  </div>
                </div>

                <div className="budget-card-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEdit(budget)}
                  >
                    {t('common.edit')}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(budget.id)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state card">
            <p>{t('budgets.noBudgets')}</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              {t('budgets.firstBudget')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
