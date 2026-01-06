import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getTheme, Theme } from '../styles/theme'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setThemeMode: (mode: 'dark' | 'light' | 'system') => void
  themeMode: 'dark' | 'light' | 'system'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<'dark' | 'light' | 'system'>(() => {
    const saved = localStorage.getItem('themeMode')
    return (saved as 'dark' | 'light' | 'system') || 'dark'
  })

  const getSystemTheme = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const [isDark, setIsDark] = useState(() => {
    if (themeMode === 'system') {
      return getSystemTheme()
    }
    return themeMode === 'dark'
  })

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => setIsDark(mediaQuery.matches)
      mediaQuery.addEventListener('change', handleChange)
      setIsDark(mediaQuery.matches)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      setIsDark(themeMode === 'dark')
    }
  }, [themeMode])

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  const toggleTheme = () => {
    setThemeModeState(isDark ? 'light' : 'dark')
  }

  const setThemeMode = (mode: 'dark' | 'light' | 'system') => {
    setThemeModeState(mode)
  }

  const theme = getTheme(isDark)

  // body와 html의 배경색을 테마에 맞게 설정
  useEffect(() => {
    document.body.style.backgroundColor = theme.background
    document.body.style.color = theme.text
    document.documentElement.style.backgroundColor = theme.background
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode, themeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}



