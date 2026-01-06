import { Navigate, Outlet } from 'react-router-dom'
import MainLayout from './Layout/MainLayout'
import { SidebarProvider } from '../contexts/SidebarContext'

interface ProtectedRouteProps {
  isAuthenticated: boolean
}

export default function ProtectedRoute({ isAuthenticated }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </SidebarProvider>
  )
}
