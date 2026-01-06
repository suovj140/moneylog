import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { authService } from '../../services/authService'
import { validatePassword, validateEmail } from '../../utils/passwordValidation'
import './Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreePrivacy: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    if (password) {
      const validation = validatePassword(password, formData.email, formData.name)
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPasswordErrors([])

    // 이메일 형식 검증
    if (!validateEmail(formData.email)) {
      setError(t('auth.invalidEmail'))
      return
    }

    // 비밀번호 일치 확인
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    // 비밀번호 검증
    const passwordValidation = validatePassword(formData.password, formData.email, formData.name)
    if (!passwordValidation.isValid) {
      setError(t('auth.passwordRequirements'))
      setPasswordErrors(passwordValidation.errors)
      return
    }

    // 약관 동의 확인
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      setError(t('auth.agreeTermsRequired'))
      return
    }

    setIsLoading(true)

    try {
      const { user, error: signupError } = await authService.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name
      })

      if (signupError || !user) {
        setError(signupError || t('auth.signupFailed'))
        setIsLoading(false)
        return
      }

      // 회원가입 성공
      alert(t('auth.signupSuccess'))
      navigate('/login')
    } catch (err: any) {
      setError(err.message || t('auth.signupFailed'))
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{ backgroundColor: theme.background }}>
      <div className="auth-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/login" className="back-button" style={{ color: theme.text }}>
            {t('auth.back')}
          </Link>
          <div className="auth-logo" style={{ color: theme.text }}>
            <div className="logo-icon-wrapper" style={{ backgroundColor: theme.primary }}>
              <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="logo-text">머니로그</span>
          </div>
        </div>
      </div>

      <div className="auth-card" style={{ 
        backgroundColor: theme.surface,
        boxShadow: theme.shadow
      }}>
        <h1 className="auth-title" style={{ color: theme.text }}>{t('auth.signup')}</h1>
        <p className="auth-subtitle" style={{ color: theme.textSecondary }}>
          {t('auth.signupDesc')}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" style={{ color: theme.text }}>
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {t('auth.name')}
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder={t('auth.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
              }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: theme.text }}>
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {t('auth.emailAddress')}
            </label>
            <input
              type="email"
              className="auth-input"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
              }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: theme.text }}>
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {t('auth.password')}
            </label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder={t('auth.passwordPlaceholderWithRequirements')}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                minLength={8}
                maxLength={64}
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: passwordErrors.length > 0 ? theme.error : theme.inputBorder,
                  color: theme.text
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: theme.textSecondary }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <div className="password-errors" style={{ 
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: theme.error
              }}>
                {passwordErrors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" style={{ color: theme.text }}>
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {t('auth.confirmPassword')}
            </label>
            <div className="input-with-icon">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ color: theme.textSecondary }}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label" style={{ color: theme.text }}>
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              />
              <span>{t('auth.agreeTerms')}</span>
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label" style={{ color: theme.text }}>
              <input
                type="checkbox"
                checked={formData.agreePrivacy}
                onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
              />
              <span>{t('auth.agreePrivacy')}</span>
            </label>
          </div>

          {error && (
            <div className="error-message" style={{ 
              color: theme.error,
              backgroundColor: theme.isDark ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              whiteSpace: 'pre-line'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? theme.textDisabled : theme.primary,
              color: '#FFFFFF',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? t('auth.signingUp') : t('auth.signupButton')}
          </button>

          <div className="auth-links">
            <span style={{ color: theme.textSecondary }}>{t('auth.haveAccount')} </span>
            <Link to="/login" style={{ color: theme.primary }}>
              {t('auth.login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
