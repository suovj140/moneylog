import { supabase } from '../lib/supabase'
import { userHelper } from '../utils/userHelper'

export interface Transaction {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  paymentMethod?: string
  memo?: string
  description?: string
  userId?: number
}

// Supabase에서 로컬 스토리지로 변환 (임시 호환성)
const toLocalFormat = (dbTransaction: any): Transaction => {
  const description = dbTransaction.description || ''
  
  // description에서 결제수단과 메모 추출 (형식: "결제수단: XXX | 메모내용")
  let paymentMethod = ''
  let memo = ''
  
  if (description) {
    const parts = description.split('|').map(p => p.trim())
    for (const part of parts) {
      if (part.startsWith('결제수단:')) {
        paymentMethod = part.replace('결제수단:', '').trim()
      } else {
        memo = part
      }
    }
  }

  return {
    id: dbTransaction.id.toString(),
    date: dbTransaction.date,
    amount: Number(dbTransaction.amount),
    type: dbTransaction.type as 'income' | 'expense',
    category: dbTransaction.category,
    paymentMethod: paymentMethod,
    memo: memo,
    userId: dbTransaction.user_id
  }
}

// 로컬 스토리지 형식에서 Supabase 형식으로 변환
const toDbFormat = (transaction: Transaction, userId: number) => {
  // description에 결제수단과 메모를 JSON 형식으로 저장
  const descriptionParts: string[] = []
  if (transaction.paymentMethod) {
    descriptionParts.push(`결제수단: ${transaction.paymentMethod}`)
  }
  if (transaction.memo) {
    descriptionParts.push(transaction.memo)
  }
  
  // type 값 명시적 변환 및 검증
  let dbType: string = String(transaction.type).trim().toLowerCase()
  if (dbType !== 'income' && dbType !== 'expense') {
    console.warn(`Invalid type detected: "${transaction.type}", defaulting to "expense"`)
    dbType = 'expense'
  }
  
  const dbData = {
    type: dbType, // 명시적으로 문자열로 변환
    amount: Number(transaction.amount),
    category: String(transaction.category),
    description: descriptionParts.length > 0 ? descriptionParts.join(' | ') : null,
    date: String(transaction.date),
    user_id: Number(userId)
  }
  
  console.log('toDbFormat output:', dbData)
  console.log('type value:', typeof dbData.type, '=', JSON.stringify(dbData.type))
  
  return dbData
}

export const transactionService = {
  // 현재 사용자 ID 가져오기
  getCurrentUserId: (): number => {
    return userHelper.getCurrentUserId()
  },

  // 모든 거래 가져오기
  getAll: async (): Promise<Transaction[]> => {
    try {
      const userId = transactionService.getCurrentUserId()
      
      if (!userId) {
        console.warn('사용자 ID가 없습니다. 빈 배열을 반환합니다.')
        return []
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Supabase 에러:', error)
        throw error
      }

      // 데이터가 null이거나 undefined인 경우 빈 배열 반환
      if (!data) {
        return []
      }

      // 빈 배열인 경우 빈 배열 반환
      if (data.length === 0) {
        return []
      }

      return data.map(toLocalFormat)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // 에러 발생 시 빈 배열 반환 (로컬 스토리지 폴백 제거)
      return []
    }
  },

  // 거래 추가
  create: async (transaction: Transaction): Promise<Transaction> => {
    try {
      const userId = transactionService.getCurrentUserId()
      
      if (!userId) {
        throw new Error('사용자 ID가 설정되지 않았습니다. localStorage에 current_user_id를 설정해주세요.')
      }

      // type 값 검증
      const validTypes = ['income', 'expense']
      if (!validTypes.includes(transaction.type)) {
        throw new Error(`유효하지 않은 거래 유형입니다: ${transaction.type}. 허용된 값: ${validTypes.join(', ')}`)
      }

      const dbData = toDbFormat(transaction, userId)
      
      // 데이터 검증
      if (!dbData.type || !dbData.amount || !dbData.category || !dbData.date || !dbData.user_id) {
        throw new Error('필수 필드가 누락되었습니다.')
      }

      console.log('Inserting transaction to Supabase:', dbData)
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        console.error('Data being inserted:', dbData)
        console.error('Original transaction:', transaction)
        
        // 체크 제약 조건 에러에 대한 친절한 메시지
        if (error.code === '23514' || error.message?.includes('check constraint')) {
          throw new Error(
            `데이터베이스 제약 조건 오류가 발생했습니다.\n\n` +
            `에러 코드: ${error.code}\n` +
            `상세 메시지: ${error.message}\n\n` +
            `Supabase SQL Editor에서 다음 SQL을 실행하세요:\n\n` +
            `ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;\n` +
            `ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense'));`
          )
        }
        
        // 다른 에러의 경우 원본 메시지 포함
        throw new Error(`데이터베이스 오류: ${error.message}${error.hint ? '\n' + error.hint : ''}`)
      }
      
      console.log('Transaction created successfully:', data)
      return toLocalFormat(data)
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      
      // 에러 메시지 표시
      const errorMessage = error?.message || '거래 추가에 실패했습니다.'
      console.error('Error details:', errorMessage)
      
      // 에러를 다시 throw하여 UI에서 처리할 수 있도록 (localStorage 폴백 제거)
      throw new Error(errorMessage)
    }
  },

  // 거래 수정
  update: async (id: string, transaction: Transaction): Promise<Transaction> => {
    try {
      const userId = transactionService.getCurrentUserId()
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...toDbFormat(transaction, userId),
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(id, 10))
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return toLocalFormat(data)
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  },

  // 거래 삭제
  delete: async (id: string): Promise<void> => {
    try {
      const userId = transactionService.getCurrentUserId()
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', parseInt(id, 10))
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }
}
