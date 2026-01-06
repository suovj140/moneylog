import { useState } from 'react'
import Calendar from './Calendar'
import FloatingActionButton from '../components/FloatingActionButton'
import TransactionModal from '../components/TransactionModal'
import { useTheme } from '../contexts/ThemeContext'

// 홈 페이지는 달력 화면을 표시하고 플러스 버튼과 모달 포함
export default function Home() {
  const { theme } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleTransactionSuccess = () => {
    // 거래 추가 성공 시 캘린더 새로고침
    setRefreshKey(prev => prev + 1)
  }

  return (
    <>
      <Calendar key={refreshKey} />
      <FloatingActionButton onClick={handleAddClick} />
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleTransactionSuccess}
      />
    </>
  )
}
