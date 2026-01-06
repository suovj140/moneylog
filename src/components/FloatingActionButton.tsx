import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../contexts/ThemeContext'
import './FloatingActionButton.css'

interface FloatingActionButtonProps {
  onClick: () => void
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const button = (
    <button
      className="fab"
      onClick={onClick}
      style={{
        backgroundColor: theme.primary,
        color: '#FFFFFF',
        boxShadow: `0 4px 12px ${theme.primary}40`
      }}
      aria-label="거래 내역 추가"
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  )

  if (!mounted) return null

  return createPortal(button, document.body)
}



