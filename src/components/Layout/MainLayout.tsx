import { ReactNode, useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useSidebar } from '../../contexts/SidebarContext'
import Sidebar from './Sidebar'
import TopNavigation from './TopNavigation'
import './MainLayout.css'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { theme } = useTheme()
  const { isCollapsed } = useSidebar()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      className="main-layout"
      style={{ 
        backgroundColor: theme.background,
        color: theme.text
      }}
    >
      {isMobile ? <TopNavigation /> : <Sidebar />}
      <main className={`main-content ${isMobile ? 'mobile' : ''} ${!isMobile && isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </main>
    </div>
  )
}

