import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { authService } from '../../services/authService'
import './Auth.css'

export default function Login() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { user, error: loginError } = await authService.login({
        email: formData.email,
        password: formData.password
      })

      if (loginError || !user) {
        setError(loginError || '로그인에 실패했습니다.')
        setIsLoading(false)
        return
      }

      // 로그인 성공
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('current_user_id', user.id.toString())
      localStorage.setItem('current_user', JSON.stringify(user))

      // 자동 로그인 설정
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      // 페이지 새로고침하여 인증 상태 업데이트
      window.location.href = '/home'
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed'))
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{ backgroundColor: theme.background }}>
      <div className="auth-header">
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

      <div className="auth-card" style={{ 
        backgroundColor: theme.surface,
        boxShadow: theme.shadow
      }}>
        <h1 className="auth-title" style={{ color: theme.text }}>{t('auth.login')}</h1>
        <p className="auth-subtitle" style={{ color: theme.textSecondary }}>
          {t('auth.loginDesc')}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder={t('auth.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label" style={{ color: theme.text }}>
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <span>{t('auth.rememberMe')}</span>
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
            {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>

          <div className="auth-divider">
            <span style={{ color: theme.textSecondary }}>{t('auth.or')}</span>
          </div>

          <div className="social-login">
            <button
              type="button"
              className="social-button google"
              style={{ backgroundColor: '#FFFFFF', color: '#000000' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button
              type="button"
              className="social-button kakao"
              style={{ backgroundColor: '#FEE500', color: '#000000' }}
            >
              <img src="/kakao-logo.svg" alt="Kakao" width="24" height="24" />
            </button>
            <button
              type="button"
              className="social-button apple"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </button>
          </div>

          <div className="auth-links">
            <Link to="/signup" style={{ color: theme.primary }}>
              {t('auth.signup')}
            </Link>
          </div>

          <div className="auth-footer">
            <Link to="/terms" style={{ color: theme.textSecondary }}>
              {t('auth.termsOfService')}
            </Link>
            <span style={{ color: theme.textSecondary }}> | </span>
            <Link to="/privacy" style={{ color: theme.textSecondary }}>
              {t('auth.privacyPolicy')}
            </Link>
          </div>
        </form>
      </div>

      <div className="auth-version" style={{ color: theme.textSecondary }}>
        {t('auth.version')}
      </div>
    </div>
  )
}
