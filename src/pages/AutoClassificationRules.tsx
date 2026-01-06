import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { autoClassificationRuleService, AutoClassificationRule } from '../services/autoClassificationRuleService'
import './AutoClassificationRules.css'

export default function AutoClassificationRules() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [rules, setRules] = useState<AutoClassificationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutoClassificationRule | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      setIsLoading(true)
      const data = await autoClassificationRuleService.getAll()
      setRules(data)
    } catch (error) {
      console.error('Failed to load rules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await autoClassificationRuleService.toggle(id)
      await loadRules()
    } catch (error) {
      console.error('Failed to toggle rule:', error)
      alert(t('autoClassification.toggleFailed'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('autoClassification.deleteConfirm'))) {
      return
    }

    try {
      await autoClassificationRuleService.delete(id)
      await loadRules()
    } catch (error) {
      console.error('Failed to delete rule:', error)
      alert(t('autoClassification.deleteFailed'))
    }
  }

  const handleEdit = (rule: AutoClassificationRule) => {
    setEditingRule(rule)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRule(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingRule(null)
  }

  const handleModalSuccess = () => {
    loadRules()
    handleModalClose()
  }

  if (isLoading) {
    return (
      <div className="auto-classification-rules-page" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: theme.text }}>{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="auto-classification-rules-page">
      <div className="page-header">
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
        <h1 style={{ color: theme.text }}>{t('autoClassification.title')}</h1>
        <button
          className="btn btn-primary"
          onClick={handleAdd}
          style={{ marginLeft: 'auto' }}
        >
          ➕ {t('common.add')}
        </button>
      </div>

      <div className="rules-list">
        {rules.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: theme.textSecondary }}>
            <p>{t('autoClassification.noRules')}</p>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ marginTop: '1rem' }}
            >
              {t('autoClassification.createFirstRule')}
            </button>
          </div>
        ) : (
          rules.map(rule => (
            <div
              key={rule.id}
              className="rule-card card"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.inputBorder}`,
                opacity: rule.enabled ? 1 : 0.6
              }}
            >
              <div className="rule-header">
                <div className="rule-info">
                  <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>{rule.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      className="rule-badge"
                      style={{
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {t(`autoClassification.ruleTypes.${rule.ruleType}`)}
                    </span>
                    <span
                      className="rule-badge"
                      style={{
                        backgroundColor: theme.inputBg,
                        color: theme.text,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {t('autoClassification.priority')}: {rule.priority}
                    </span>
                  </div>
                </div>
                <div className="rule-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleToggle(rule.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {rule.enabled ? t('autoClassification.disable') : t('autoClassification.enable')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(rule)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(rule.id)}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
              <div className="rule-details" style={{ marginTop: '1rem', color: theme.textSecondary, fontSize: '0.875rem' }}>
                <p><strong>{t('autoClassification.actions')}:</strong> {rule.actions.category}</p>
                {rule.actions.paymentMethod && (
                  <p><strong>{t('autoClassification.paymentMethod')}:</strong> {rule.actions.paymentMethod}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <AutoClassificationRuleModal
          rule={editingRule}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}

// 규칙 생성/수정 모달
function AutoClassificationRuleModal({
  rule,
  onClose,
  onSuccess
}: {
  rule: AutoClassificationRule | null
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'keyword' as 'keyword' | 'merchant' | 'amount_range' | 'composite',
    priority: 100,
    enabled: true,
    conditions: {} as any,
    actions: {
      category: '',
      paymentMethod: ''
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        ruleType: rule.ruleType,
        priority: rule.priority,
        enabled: rule.enabled,
        conditions: rule.conditions,
        actions: rule.actions
      })
    }
  }, [rule])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name) {
      setError(t('autoClassification.enterName'))
      return
    }

    if (!formData.actions.category) {
      setError(t('autoClassification.selectCategory'))
      return
    }

    setIsLoading(true)

    try {
      if (rule?.id) {
        await autoClassificationRuleService.update(rule.id, formData)
      } else {
        await autoClassificationRuleService.create(formData)
      }
      onSuccess()
    } catch (err: any) {
      console.error('Failed to save rule:', err)
      setError(err?.message || t('autoClassification.saveFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: theme.surface }}>
        <div className="modal-header">
          <h2 style={{ color: theme.text }}>
            {rule ? t('autoClassification.editRule') : t('autoClassification.createRule')}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.text, fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* 규칙 이름 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('autoClassification.ruleName')}</label>
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

          {/* 규칙 타입 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('autoClassification.ruleType')}</label>
            <select
              className="form-input"
              value={formData.ruleType}
              onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
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
              <option value="keyword">{t('autoClassification.ruleTypes.keyword')}</option>
              <option value="merchant">{t('autoClassification.ruleTypes.merchant')}</option>
              <option value="amount_range">{t('autoClassification.ruleTypes.amount_range')}</option>
              <option value="composite">{t('autoClassification.ruleTypes.composite')}</option>
            </select>
          </div>

          {/* 조건 설정 (간단한 버전) */}
          {formData.ruleType === 'keyword' && (
            <div className="form-group">
              <label style={{ color: theme.text }}>{t('autoClassification.keyword')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.conditions.keyword || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  conditions: { ...formData.conditions, keyword: e.target.value, matchType: 'contains' }
                })}
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
                placeholder={t('autoClassification.keywordPlaceholder')}
              />
            </div>
          )}

          {/* 액션: 카테고리 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('autoClassification.category')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.actions.category}
              onChange={(e) => setFormData({
                ...formData,
                actions: { ...formData.actions, category: e.target.value }
              })}
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

          {/* 액션: 결제수단 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('autoClassification.paymentMethod')} ({t('common.optional')})</label>
            <input
              type="text"
              className="form-input"
              value={formData.actions.paymentMethod || ''}
              onChange={(e) => setFormData({
                ...formData,
                actions: { ...formData.actions, paymentMethod: e.target.value }
              })}
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
            />
          </div>

          {/* 우선순위 */}
          <div className="form-group">
            <label style={{ color: theme.text }}>{t('autoClassification.priority')}</label>
            <input
              type="number"
              className="form-input"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
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
              min="1"
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

