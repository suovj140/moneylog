import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import './DatePicker.css'

interface DatePickerProps {
  value: string // YYYY-MM-DD 형식
  onChange: (date: string) => void
  onClose?: () => void
  required?: boolean
}

export default function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? new Date(value) : new Date()
  })
  const pickerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const weekDays = t('common.weekDays', { returnObjects: true }) as string[]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleDateClick = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setIsOpen(false)
    onClose?.()
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    onChange(format(today, 'yyyy-MM-dd'))
    setIsOpen(false)
    onClose?.()
  }

  const dateFormat = t('common.dateFormat')
  const displayValue = value ? format(new Date(value), dateFormat) : t('common.selectDate')

  return (
    <div className="date-picker-container" ref={pickerRef}>
      <button
        type="button"
        className="date-picker-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: theme.inputBg,
          borderColor: theme.inputBorder,
          color: theme.text
        }}
      >
        <span>{displayValue}</span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={theme.isDark ? '#E0E0E0' : '#757575'}
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="date-picker-dropdown"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.inputBorder,
            boxShadow: theme.isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
              : '0 8px 32px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* 헤더 */}
          <div className="date-picker-header">
            <button
              type="button"
              className="date-picker-nav-button"
              onClick={goToPreviousMonth}
              style={{ color: theme.text }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="date-picker-month-year" style={{ color: theme.text }}>
              {format(currentMonth, t('common.monthFormat'))}
            </div>
            <button
              type="button"
              className="date-picker-nav-button"
              onClick={goToNextMonth}
              style={{ color: theme.text }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="date-picker-weekdays">
            {weekDays.map(day => (
              <div key={day} className="date-picker-weekday" style={{ color: theme.textSecondary }}>
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="date-picker-days">
            {Array(getDay(monthStart)).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="date-picker-day empty"></div>
            ))}
            
            {daysInMonth.map(day => {
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={`date-picker-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                  onClick={() => handleDateClick(day)}
                  style={{
                    backgroundColor: isSelected ? `${theme.primary}30` : 'transparent', // 30% 투명도
                    color: theme.text,  // 선택된 날짜도 원래 텍스트 색상 유지
                    fontWeight: isSelected ? 700 : 400,  // 선택된 날짜는 더 굵게
                    borderColor: isTodayDate && !isSelected ? theme.primary : 'transparent'
                  }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {/* 오늘 버튼 */}
          <div className="date-picker-footer">
            <button
              type="button"
              className="date-picker-today-button"
              onClick={goToToday}
              style={{
                backgroundColor: theme.inputBg,
                color: theme.primary,
                borderColor: theme.inputBorder
              }}
            >
              {t('common.today')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

