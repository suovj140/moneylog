import { supabase } from '../lib/supabase'

export interface Budget {
  id: string
  month: string
  categoryId: string | null
  categoryName: string
  amount: number
}

// 로컬 스토리지 형식에서 Supabase 형식으로 변환
const toDbFormat = (budget: Budget, userId: number) => ({
  month: budget.month,
  category_id: budget.categoryId ? parseInt(budget.categoryId, 10) : null,
  category_name: budget.categoryName,
  amount: budget.amount,
  user_id: userId
})

export const budgetService = {
  // 현재 사용자 ID 가져오기
  getCurrentUserId: (): number => {
    const userId = localStorage.getItem('current_user_id')
    return userId ? parseInt(userId, 10) : 1
  },

  // 월별 예산 가져오기
  getByMonth: async (month: string): Promise<Budget[]> => {
    try {
      const userId = budgetService.getCurrentUserId()
      // Supabase에 budgets 테이블이 있다고 가정
      // 없으면 로컬 스토리지 사용
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)

      if (error) {
        // budgets 테이블이 없을 수 있으므로 로컬 스토리지 사용
        const stored = localStorage.getItem(`budgets_${month}`)
        return stored ? JSON.parse(stored) : []
      }

      return (data || []).map((b: any) => ({
        id: b.id.toString(),
        month: b.month,
        categoryId: b.category_id?.toString() || null,
        categoryName: b.category_name,
        amount: Number(b.amount)
      }))
    } catch (error) {
      console.error('Error fetching budgets:', error)
      const stored = localStorage.getItem(`budgets_${month}`)
      return stored ? JSON.parse(stored) : []
    }
  },

  // 예산 저장
  save: async (budget: Budget): Promise<Budget> => {
    try {
      const userId = budgetService.getCurrentUserId()
      const { data, error } = await supabase
        .from('budgets')
        .insert(toDbFormat(budget, userId))
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id.toString(),
        month: data.month,
        categoryId: data.category_id?.toString() || null,
        categoryName: data.category_name,
        amount: Number(data.amount)
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      // 로컬 스토리지에 저장 (폴백)
      const stored = localStorage.getItem(`budgets_${budget.month}`)
      const budgets = stored ? JSON.parse(stored) : []
      const newBudget = { ...budget, id: budget.id || `b_${Date.now()}` }
      budgets.push(newBudget)
      localStorage.setItem(`budgets_${budget.month}`, JSON.stringify(budgets))
      return newBudget
    }
  },

  // 예산 업데이트
  update: async (id: string, budget: Budget): Promise<Budget> => {
    try {
      const userId = budgetService.getCurrentUserId()
      const { data, error } = await supabase
        .from('budgets')
        .update(toDbFormat(budget, userId))
        .eq('id', parseInt(id, 10))
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id.toString(),
        month: data.month,
        categoryId: data.category_id?.toString() || null,
        categoryName: data.category_name,
        amount: Number(data.amount)
      }
    } catch (error) {
      console.error('Error updating budget:', error)
      // 로컬 스토리지에서 업데이트 (폴백)
      const stored = localStorage.getItem(`budgets_${budget.month}`)
      const budgets = stored ? JSON.parse(stored) : []
      const index = budgets.findIndex((b: Budget) => b.id === id)
      if (index !== -1) {
        budgets[index] = { ...budget, id }
        localStorage.setItem(`budgets_${budget.month}`, JSON.stringify(budgets))
      }
      return budget
    }
  },

  // 예산 삭제
  delete: async (id: string, month: string): Promise<void> => {
    try {
      const userId = budgetService.getCurrentUserId()
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', parseInt(id, 10))
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting budget:', error)
      // 로컬 스토리지에서 삭제 (폴백)
      const stored = localStorage.getItem(`budgets_${month}`)
      const budgets = stored ? JSON.parse(stored) : []
      const filtered = budgets.filter((b: Budget) => b.id !== id)
      localStorage.setItem(`budgets_${month}`, JSON.stringify(filtered))
    }
  }
}



