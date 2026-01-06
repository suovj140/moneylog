import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'
import { authService } from '../../services/authService'
import './TopNavigation.css'

// hex 색상을 rgba로 변환하는 헬퍼 함수
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function TopNavigation() {
  const location = useLocation()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const menuItems = [
    { 
      path: '/home', 
      label: t('common.home'), 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    { 
      path: '/transactions', 
      label: t('common.transactions'), 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="8" y1="10" x2="16" y2="10"/>
          <line x1="8" y1="14" x2="16" y2="14"/>
          <line x1="8" y1="18" x2="16" y2="18"/>
        </svg>
      )
    },
    { 
      path: '/reports', 
      label: t('common.reports'), 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    { 
      path: '/statistics', 
      label: t('common.statistics'), 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    },
    { 
      path: '/settings', 
      label: t('common.settings'), 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    },
  ]

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = await authService.getCurrentUser()
      if (user && user.profile_image_url) {
        setProfileImage(user.profile_image_url)
      }
    }
    loadUserProfile()

    const handleProfileUpdate = async () => {
      const user = await authService.getCurrentUser()
      if (user && user.profile_image_url) {
        setProfileImage(user.profile_image_url)
      }
    }
    window.addEventListener('profileImageUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileUpdate)
    }
  }, [])

  return (
    <nav className="top-navigation" style={{ backgroundColor: theme.surface }}>
      <div className="top-nav-header" style={{ backgroundColor: theme.surface }}>
        <div className="top-nav-logo" style={{ color: theme.text }}>
          <div className="logo-icon-wrapper">
            <img 
              src="/app-icon.png" 
              alt="머니로그" 
              className="logo-icon"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          </div>
          <span className="logo-text" style={{ color: theme.text }}>머니로그</span>
        </div>
        {profileImage && (
          <div 
            className="top-nav-profile"
            style={{
              backgroundImage: `url(${profileImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `2px solid ${theme.inputBorder}`
            }}
          />
        )}
      </div>
      <div className="top-nav-menu">
        {menuItems.map(item => {
          const isActive = location.pathname === item.path || 
                          (item.path === '/home' && (location.pathname === '/' || location.pathname === '/calendar'))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`top-nav-item ${isActive ? 'active' : ''}`}
              style={{
                backgroundColor: isActive 
                  ? hexToRgba(theme.primary, 0.5) // 50% 투명도로 채도 낮춤
                  : 'transparent',
                color: isActive ? '#FFFFFF' : theme.text
              }}
            >
              <span className="top-nav-icon">
                {item.icon(isActive)}
              </span>
              <span className="top-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

