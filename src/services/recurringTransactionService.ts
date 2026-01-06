import { supabase } from '../lib/supabase'
import { userHelper } from '../utils/userHelper'
import { transactionService, Transaction } from './transactionService'
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, isSameDay, getDay, startOfDay } from 'date-fns'

export interface RecurringTransaction {
  id: string
  userId: number
  name: string
  type: 'income' | 'expense'
  amount: number
  category: string
  paymentMethod?: string
  memo?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  frequencyOptions: {
    dayOfMonth?: number
    dayOfWeek?: number
    weekdaysOnly?: boolean
    interval?: number
    unit?: 'days' | 'weeks' | 'months'
  }
  startDate: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  enabled: boolean
  lastGeneratedDate?: string // YYYY-MM-DD
  createdAt: Date
  updatedAt: Date
}

export interface UpcomingRecurringTransaction {
  date: string
  transactions: RecurringTransaction[]
}

export const recurringTransactionService = {
  // 현재 사용자 ID 가져오기
  getCurrentUserId: (): number => {
    return userHelper.getCurrentUserId()
  },

  // 모든 반복 거래 조회
  getAll: async (): Promise<RecurringTransaction[]> => {
    try {
      const userId = recurringTransactionService.getCurrentUserId()
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch recurring transactions:', error)
        throw error
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map(rt => ({
        id: rt.id.toString(),
        userId: rt.user_id,
        name: rt.name,
        type: rt.type,
        amount: Number(rt.amount),
        category: rt.category,
        paymentMethod: rt.payment_method || undefined,
        memo: rt.memo || undefined,
        frequency: rt.frequency,
        frequencyOptions: rt.frequency_options,
        startDate: rt.start_date,
        endDate: rt.end_date || undefined,
        enabled: rt.enabled,
        lastGeneratedDate: rt.last_generated_date || undefined,
        createdAt: new Date(rt.created_at),
        updatedAt: new Date(rt.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
      return []
    }
  },

  // 반복 거래 생성
  create: async (recurringTransaction: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<RecurringTransaction> => {
    try {
      const userId = recurringTransactionService.getCurrentUserId()
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: userId,
          name: recurringTransaction.name,
          type: recurringTransaction.type,
          amount: recurringTransaction.amount,
          category: recurringTransaction.category,
          payment_method: recurringTransaction.paymentMethod || null,
          memo: recurringTransaction.memo || null,
          frequency: recurringTransaction.frequency,
          frequency_options: recurringTransaction.frequencyOptions,
          start_date: recurringTransaction.startDate,
          end_date: recurringTransaction.endDate || null,
          enabled: recurringTransaction.enabled,
          last_generated_date: recurringTransaction.lastGeneratedDate || null
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id.toString(),
        userId: data.user_id,
        name: data.name,
        type: data.type,
        amount: Number(data.amount),
        category: data.category,
        paymentMethod: data.payment_method || undefined,
        memo: data.memo || undefined,
        frequency: data.frequency,
        frequencyOptions: data.frequency_options,
        startDate: data.start_date,
        endDate: data.end_date || undefined,
        enabled: data.enabled,
        lastGeneratedDate: data.last_generated_date || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating recurring transaction:', error)
      throw error
    }
  },

  // 반복 거래 수정
  update: async (id: string, recurringTransaction: Partial<RecurringTransaction>): Promise<RecurringTransaction> => {
    try {
      const userId = recurringTransactionService.getCurrentUserId()
      
      const updateData: any = {}
      if (recurringTransaction.name !== undefined) updateData.name = recurringTransaction.name
      if (recurringTransaction.type !== undefined) updateData.type = recurringTransaction.type
      if (recurringTransaction.amount !== undefined) updateData.amount = recurringTransaction.amount
      if (recurringTransaction.category !== undefined) updateData.category = recurringTransaction.category
      if (recurringTransaction.paymentMethod !== undefined) updateData.payment_method = recurringTransaction.paymentMethod
      if (recurringTransaction.memo !== undefined) updateData.memo = recurringTransaction.memo
      if (recurringTransaction.frequency !== undefined) updateData.frequency = recurringTransaction.frequency
      if (recurringTransaction.frequencyOptions !== undefined) updateData.frequency_options = recurringTransaction.frequencyOptions
      if (recurringTransaction.startDate !== undefined) updateData.start_date = recurringTransaction.startDate
      if (recurringTransaction.endDate !== undefined) updateData.end_date = recurringTransaction.endDate
      if (recurringTransaction.enabled !== undefined) updateData.enabled = recurringTransaction.enabled
      if (recurringTransaction.lastGeneratedDate !== undefined) updateData.last_generated_date = recurringTransaction.lastGeneratedDate
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id.toString(),
        userId: data.user_id,
        name: data.name,
        type: data.type,
        amount: Number(data.amount),
        category: data.category,
        paymentMethod: data.payment_method || undefined,
        memo: data.memo || undefined,
        frequency: data.frequency,
        frequencyOptions: data.frequency_options,
        startDate: data.start_date,
        endDate: data.end_date || undefined,
        enabled: data.enabled,
        lastGeneratedDate: data.last_generated_date || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating recurring transaction:', error)
      throw error
    }
  },

  // 반복 거래 삭제
  delete: async (id: string): Promise<void> => {
    try {
      const userId = recurringTransactionService.getCurrentUserId()
      
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting recurring transaction:', error)
      throw error
    }
  },

  // 반복 거래 활성화/비활성화
  toggle: async (id: string): Promise<RecurringTransaction> => {
    try {
      const userId = recurringTransactionService.getCurrentUserId()
      
      // 현재 상태 가져오기
      const { data: current, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('enabled')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !current) {
        throw new Error('반복 거래를 찾을 수 없습니다.')
      }

      // 상태 토글
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update({ enabled: !current.enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        id: data.id.toString(),
        userId: data.user_id,
        name: data.name,
        type: data.type,
        amount: Number(data.amount),
        category: data.category,
        paymentMethod: data.payment_method || undefined,
        memo: data.memo || undefined,
        frequency: data.frequency,
        frequencyOptions: data.frequency_options,
        startDate: data.start_date,
        endDate: data.end_date || undefined,
        enabled: data.enabled,
        lastGeneratedDate: data.last_generated_date || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error toggling recurring transaction:', error)
      throw error
    }
  },

  // 반복 거래 수동 생성
  generate: async (id: string, targetDate: string): Promise<Transaction> => {
    try {
      const userId = recurringTransactionService.getCurrentUserId()
      
      // 반복 거래 정보 가져오기
      const { data: recurring, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !recurring) {
        throw new Error('반복 거래를 찾을 수 없습니다.')
      }

      // 거래 생성
      const transaction: Transaction = {
        id: '',
        date: targetDate,
        amount: Number(recurring.amount),
        type: recurring.type,
        category: recurring.category,
        paymentMethod: recurring.payment_method || undefined,
        memo: recurring.memo || undefined,
        userId: userId
      }

      const createdTransaction = await transactionService.create(transaction)

      // 반복 거래의 last_generated_date 업데이트
      await recurringTransactionService.update(id, {
        lastGeneratedDate: targetDate
      })

      // 거래에 반복 거래 ID 연결
      await supabase
        .from('transactions')
        .update({ 
          is_auto_generated: true,
          recurring_transaction_id: parseInt(id)
        })
        .eq('id', createdTransaction.id)

      return createdTransaction
    } catch (error) {
      console.error('Error generating transaction:', error)
      throw error
    }
  },

  // 예정된 반복 거래 조회
  getUpcoming: async (days: number = 7): Promise<UpcomingRecurringTransaction[]> => {
    try {
      const recurringTransactions = await recurringTransactionService.getAll()
      const enabledRecurring = recurringTransactions.filter(rt => rt.enabled)
      
      const today = startOfDay(new Date())
      const endDate = addDays(today, days)
      
      const upcoming: Map<string, RecurringTransaction[]> = new Map()

      for (const rt of enabledRecurring) {
        const dates = recurringTransactionService.getNextDates(rt, today, endDate)
        
        for (const date of dates) {
          const dateStr = date.toISOString().split('T')[0]
          if (!upcoming.has(dateStr)) {
            upcoming.set(dateStr, [])
          }
          upcoming.get(dateStr)!.push(rt)
        }
      }

      // 날짜순으로 정렬
      const sortedDates = Array.from(upcoming.keys()).sort()
      
      return sortedDates.map(date => ({
        date,
        transactions: upcoming.get(date)!
      }))
    } catch (error) {
      console.error('Error getting upcoming transactions:', error)
      return []
    }
  },

  // 다음 생성 날짜 계산
  getNextDates: (recurring: RecurringTransaction, startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = []
    const start = new Date(recurring.startDate)
    const end = recurring.endDate ? new Date(recurring.endDate) : null
    
    // 시작일이 미래인 경우
    if (isAfter(start, endDate)) {
      return dates
    }
    
    // 종료일이 과거인 경우
    if (end && isBefore(end, startDate)) {
      return dates
    }

    let currentDate = isAfter(start, startDate) ? start : startDate
    const lastGenerated = recurring.lastGeneratedDate ? new Date(recurring.lastGeneratedDate) : null

    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
      // 종료일 체크
      if (end && isAfter(currentDate, end)) {
        break
      }

      // 시작일 체크
      if (isBefore(currentDate, start)) {
        currentDate = start
        continue
      }

      // 마지막 생성일 이후인지 체크
      if (lastGenerated && isBefore(currentDate, lastGenerated)) {
        // 다음 날짜로 이동
        currentDate = recurringTransactionService.getNextDate(recurring, currentDate)
        continue
      }

      // 해당 날짜에 생성해야 하는지 확인
      if (recurringTransactionService.shouldGenerateOnDate(recurring, currentDate)) {
        dates.push(new Date(currentDate))
      }

      // 다음 날짜로 이동
      currentDate = recurringTransactionService.getNextDate(recurring, currentDate)
    }

    return dates
  },

  // 다음 날짜 계산
  getNextDate: (recurring: RecurringTransaction, currentDate: Date): Date => {
    const { frequency, frequencyOptions } = recurring

    switch (frequency) {
      case 'daily':
        if (frequencyOptions.weekdaysOnly) {
          // 다음 평일 찾기
          let next = addDays(currentDate, 1)
          while (getDay(next) === 0 || getDay(next) === 6) {
            next = addDays(next, 1)
          }
          return next
        }
        return addDays(currentDate, 1)

      case 'weekly':
        return addWeeks(currentDate, 1)

      case 'monthly':
        return addMonths(currentDate, 1)

      case 'yearly':
        return addYears(currentDate, 1)

      case 'custom':
        if (frequencyOptions.interval && frequencyOptions.unit) {
          switch (frequencyOptions.unit) {
            case 'days':
              return addDays(currentDate, frequencyOptions.interval)
            case 'weeks':
              return addWeeks(currentDate, frequencyOptions.interval)
            case 'months':
              return addMonths(currentDate, frequencyOptions.interval)
            default:
              return addDays(currentDate, 1)
          }
        }
        return addDays(currentDate, 1)

      default:
        return addDays(currentDate, 1)
    }
  },

  // 특정 날짜에 생성해야 하는지 확인
  shouldGenerateOnDate: (recurring: RecurringTransaction, date: Date): boolean => {
    const { frequency, frequencyOptions } = recurring

    switch (frequency) {
      case 'daily':
        if (frequencyOptions.weekdaysOnly) {
          const day = getDay(date)
          return day !== 0 && day !== 6 // 일요일(0)과 토요일(6) 제외
        }
        return true

      case 'weekly':
        if (frequencyOptions.dayOfWeek !== undefined) {
          return getDay(date) === frequencyOptions.dayOfWeek
        }
        return true

      case 'monthly':
        if (frequencyOptions.dayOfMonth !== undefined) {
          return date.getDate() === frequencyOptions.dayOfMonth
        }
        return true

      case 'yearly':
        // 월/일 체크는 frequencyOptions에 추가 필요
        return true

      case 'custom':
        // 사용자 정의 로직
        return true

      default:
        return true
    }
  },

  // 자동 생성 (일일 배치 처리용)
  generateDueTransactions: async (): Promise<Transaction[]> => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const upcoming = await recurringTransactionService.getUpcoming(1)
      
      const generated: Transaction[] = []

      for (const item of upcoming) {
        if (item.date === today) {
          for (const rt of item.transactions) {
            // 이미 생성되었는지 확인
            const lastGenerated = rt.lastGeneratedDate
            if (lastGenerated && lastGenerated === today) {
              continue
            }

            try {
              const transaction = await recurringTransactionService.generate(rt.id, today)
              generated.push(transaction)
            } catch (error) {
              console.error(`Failed to generate transaction for ${rt.name}:`, error)
            }
          }
        }
      }

      return generated
    } catch (error) {
      console.error('Error generating due transactions:', error)
      return []
    }
  }
}


