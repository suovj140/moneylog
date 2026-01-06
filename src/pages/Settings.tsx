import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { authService } from '../services/authService'
import { transactionService } from '../services/transactionService'
import './Settings.css'

// hex 색상을 rgba로 변환하는 헬퍼 함수
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function Settings() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { theme, setThemeMode, themeMode } = useTheme()
  const [exportSuccess, setExportSuccess] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)
  
  const currentLanguage = i18n.language || 'ko'
  
  const languages = [
    { code: 'ko', name: t('settings.korean') },
    { code: 'en', name: t('settings.english') },
    { code: 'ja', name: t('settings.japanese') },
    { code: 'zh', name: t('settings.chinese') },
    { code: 'vi', name: t('settings.vietnamese') },
    { code: 'fil', name: t('settings.filipino') }
  ]
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('i18nextLng', langCode)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = await authService.getCurrentUser()
      if (user) {
        setUserName(user.name || '')
        // Supabase에서 프로필 이미지 가져오기
        if (user.profile_image_url) {
          setProfileImage(user.profile_image_url)
        }
      }
    }
    loadUserProfile()
  }, [])

  const handleExport = async () => {
    try {
      // Supabase에서 모든 거래 데이터 가져오기
      const transactions = await transactionService.getAll()
      
      if (!transactions || transactions.length === 0) {
        alert(t('settings.exportNoData'))
        return
      }

      const headers = [
        t('settings.exportHeaders.date'),
        t('settings.exportHeaders.type'),
        t('settings.exportHeaders.amount'),
        t('settings.exportHeaders.category'),
        t('settings.exportHeaders.paymentMethod'),
        t('settings.exportHeaders.memo')
      ]
      const rows = transactions.map((transaction) => [
        transaction.date,
        transaction.type === 'income' ? t('common.income') : t('common.expense'),
        transaction.amount.toString(),
        transaction.category,
        transaction.paymentMethod || '',
        transaction.memo || '' // 메모는 사용자가 입력한 그대로 유지
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `housebook_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('데이터 내보내기 오류:', error)
      alert(t('settings.exportFailed', { defaultValue: '데이터 내보내기에 실패했습니다. 다시 시도해주세요.' }))
    }
  }

  const handleClearAll = () => {
    if (confirm(t('settings.clearConfirm'))) {
      if (confirm(t('settings.clearConfirmFinal'))) {
        localStorage.clear()
        alert(t('settings.clearSuccess'))
        window.location.reload()
      }
    }
  }

  const handleLogout = () => {
    if (confirm(t('settings.logoutConfirm'))) {
      authService.logout()
      navigate('/login')
      // 페이지 새로고침하여 인증 상태 완전히 초기화
      window.location.href = '/login'
    }
  }

  return (
    <div className="settings-page">
      <div className="settings">
      {!isMobile && (
        <div className="page-header">
          <h1>{t('settings.title')}</h1>
        </div>
      )}

      <div className="settings-section card">
        <h2 className="section-title">{t('settings.dataManagement')}</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">{t('settings.exportData')}</h3>
            <p className="setting-desc">{t('settings.exportDesc')}</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleExport}
          >
            {t('settings.exportButton')}
          </button>
        </div>

        {exportSuccess && (
          <div className="success-message">
            ✅ {t('settings.exportSuccess')}
          </div>
        )}

        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">{t('settings.clearAllData')}</h3>
            <p className="setting-desc">{t('settings.clearAllDesc')}</p>
          </div>
          <button 
            className="btn btn-danger"
            onClick={handleClearAll}
          >
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="settings-section card">
        <h2 className="section-title">{t('settings.profile')}</h2>
        
        <div className="setting-item profile-item">
          <div className="setting-info">
            <h3 className="setting-name">{t('settings.profilePhoto')}</h3>
            <p className="setting-desc">{t('settings.profilePhotoDesc')}</p>
          </div>
          <div className="profile-image-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: isMobile ? '100%' : 'auto', flex: isMobile ? 1 : 'none' }}>
            <div 
              className="profile-image-preview"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundImage: profileImage ? `url(${profileImage})` : undefined,
                backgroundColor: profileImage ? 'transparent' : theme.surfaceLight,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${theme.inputBorder}`,
                flexShrink: 0
              }}
            >
              {!profileImage && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', flex: isMobile ? 1 : 'none', alignItems: 'center', flexWrap: 'nowrap' }}>
              <input
                type="file"
                accept="image/*"
                id="profile-image-input"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setIsUploading(true)
                    try {
                      const result = await authService.updateProfileImage(file)
                      if (result.error) {
                        alert(result.error)
                        setIsUploading(false)
                        return
                      }
                      if (result.url) {
                        setProfileImage(result.url)
                        // 사이드바 업데이트를 위한 이벤트 발생
                        window.dispatchEvent(new Event('profileImageUpdated'))
                      }
                    } catch (error) {
                      console.error('Profile image upload error:', error)
                      alert(t('settings.uploadFailed', { defaultValue: '프로필 이미지 업로드에 실패했습니다.' }))
                    } finally {
                      setIsUploading(false)
                    }
                  }
                }}
              />
              <label htmlFor="profile-image-input" style={{ cursor: 'pointer', flex: isMobile ? '1 1 50%' : 'none', display: isMobile ? 'flex' : 'inline-block', minWidth: 0 }}>
                <span 
                  className="btn btn-primary"
                  style={{
                    backgroundColor: theme.primary,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    opacity: isUploading ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: isUploading ? 'none' : 'auto',
                    width: isMobile ? '100%' : 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isUploading ? t('settings.uploading') : t('settings.changePhoto')}
                </span>
              </label>
              {profileImage && (
                <button
                  className="btn btn-secondary"
                  style={{
                    backgroundColor: theme.surface,
                    color: theme.text,
                    border: `1px solid ${theme.inputBorder}`,
                    flex: isMobile ? '1 1 50%' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                    marginLeft: isMobile ? 0 : '0.5rem',
                    minWidth: 0
                  }}
                  onClick={async () => {
                    if (confirm(t('settings.deletePhoto'))) {
                      try {
                        const result = await authService.deleteProfileImage()
                        if (result.error) {
                          alert(result.error)
                          return
                        }
                        setProfileImage(null)
                        // 사이드바 업데이트를 위한 이벤트 발생
                        window.dispatchEvent(new Event('profileImageUpdated'))
                      } catch (error) {
                        console.error('Profile image delete error:', error)
                        alert(t('settings.deletePhotoFailed', { defaultValue: '프로필 이미지 삭제에 실패했습니다.' }))
                      }
                    }
                  }}
                >
                  {t('common.delete')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section card">
        <h2 className="section-title">{t('settings.screenSettings')}</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">{t('settings.language')}</h3>
            <p className="setting-desc">{t('settings.languageDesc')}</p>
          </div>
          <div className="language-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                className="btn language-btn"
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  backgroundColor: currentLanguage === lang.code ? hexToRgba(theme.primary, 0.5) : theme.surface,
                  color: currentLanguage === lang.code ? '#FFFFFF' : theme.text,
                  border: `1px solid ${currentLanguage === lang.code ? theme.primary : theme.inputBorder}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: currentLanguage === lang.code ? 600 : 400,
                  transition: 'all 0.2s',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  textAlign: 'center'
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">{t('settings.theme')}</h3>
            <p className="setting-desc">{t('settings.themeDesc')}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => setThemeMode('light')}
              style={{
                backgroundColor: themeMode === 'light' ? hexToRgba(theme.primary, 0.5) : theme.surface,
                color: themeMode === 'light' ? '#FFFFFF' : theme.text,
                border: `1px solid ${themeMode === 'light' ? theme.primary : theme.inputBorder}`,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: themeMode === 'light' ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {t('settings.whiteTheme')}
            </button>
            <button
              className="btn"
              onClick={() => setThemeMode('dark')}
              style={{
                backgroundColor: themeMode === 'dark' ? hexToRgba(theme.primary, 0.5) : theme.surface,
                color: themeMode === 'dark' ? '#FFFFFF' : theme.text,
                border: `1px solid ${themeMode === 'dark' ? theme.primary : theme.inputBorder}`,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: themeMode === 'dark' ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {t('settings.darkTheme')}
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section card">
        <h2 className="section-title">{t('settings.account')}</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <h3 className="setting-name">{t('settings.logout')}</h3>
            <p className="setting-desc">{t('settings.logoutDesc')}</p>
          </div>
          <button 
            className="btn btn-danger"
            onClick={handleLogout}
            style={{
              backgroundColor: theme.error,
              color: '#FFFFFF'
            }}
          >
            {t('settings.logoutButton')}
          </button>
        </div>
      </div>

      <div className="settings-section card">
        <h2 className="section-title">{t('settings.appInfo')}</h2>
        
        <div className="info-item">
          <span className="info-label">{t('settings.version')}</span>
          <span className="info-value">{t('settings.versionValue')}</span>
        </div>
        <div className="info-item">
          <span className="info-label">{t('settings.platform')}</span>
          <span className="info-value">{t('settings.platformValue')}</span>
        </div>
      </div>

      <div className="settings-section card">
        <h2 className="section-title">{t('settings.features')}</h2>
        
        <div className="feature-list">
          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'transactions' ? null : 'transactions')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.transactionManagement')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'transactions' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'transactions' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.transactionManagementDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'home' ? null : 'home')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.homeCalendar')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'home' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'home' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.homeCalendarDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'reports' ? null : 'reports')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.reportsStats')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'reports' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'reports' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.reportsStatsDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'budgets' ? null : 'budgets')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.budgetManagement')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'budgets' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'budgets' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.budgetManagementDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'export' ? null : 'export')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.dataManagement')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'export' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'export' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.dataManagementDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'profile' ? null : 'profile')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.profileManagement')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'profile' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'profile' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.profileManagementDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div 
            className="feature-item"
            onClick={() => setExpandedFeature(expandedFeature === 'theme' ? null : 'theme')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.themeSettings')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>
                {expandedFeature === 'theme' ? '▼' : '▶'}
              </span>
            </div>
            {expandedFeature === 'theme' && (
              <div className="feature-detail" style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: theme.surface,
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {t('settings.themeSettingsDesc').split('\\n').map((line: string, idx: number) => (
                  <span key={idx}>{line}<br/></span>
                ))}
              </div>
            )}
          </div>

          <div className="feature-item" style={{ opacity: 0.6 }}>
            <span className="feature-icon">🚧</span>
            <span>{t('settings.dataImport')}</span>
          </div>
          <div 
            className="feature-item"
            onClick={() => navigate('/settings/auto-classification')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.autoClassification')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>▶</span>
            </div>
          </div>

          <div 
            className="feature-item"
            onClick={() => navigate('/settings/recurring-transactions')}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <span className="feature-icon">✅</span>
              <span style={{ flex: 1 }}>{t('settings.recurringTransactions')}</span>
              <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>▶</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
