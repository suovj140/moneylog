import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Home from './pages/Home'
import Transactions from './pages/Transactions'
import Statistics from './pages/Statistics'
import Budgets from './pages/Budgets'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AutoClassificationRules from './pages/AutoClassificationRules'
import RecurringTransactions from './pages/RecurringTransactions'
import { recurringTransactionService } from './services/recurringTransactionService'
import './App.css'

function App() {
  const { theme } = useTheme()
  
  // 로그인 상태 체크
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  })

  // 페이지 로드 시 인증 상태 확인 및 반복 거래 자동 생성
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true'
      if (authStatus) {
        // 사용자 정보 확인
        const userId = localStorage.getItem('current_user_id')
        if (!userId) {
          localStorage.removeItem('isAuthenticated')
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
          
          // 반복 거래 자동 생성 (백그라운드에서 실행)
          try {
            await recurringTransactionService.generateDueTransactions()
          } catch (error) {
            console.error('Failed to generate recurring transactions:', error)
            // 에러가 발생해도 앱은 정상 작동
          }
        }
      } else {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  return (
    <Router>
      <div className="app" style={{ backgroundColor: theme.background, color: theme.text }}>
        <Routes>
          {/* 인증이 필요 없는 페이지 */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* 인증이 필요한 페이지 */}
          <Route
            element={<ProtectedRoute isAuthenticated={isAuthenticated} />}
          >
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/calendar" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/auto-classification" element={<AutoClassificationRules />} />
            <Route path="/settings/recurring-transactions" element={<RecurringTransactions />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
