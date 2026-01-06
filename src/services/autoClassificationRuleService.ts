import { supabase } from '../lib/supabase'
import { userHelper } from '../utils/userHelper'

export interface AutoClassificationRule {
  id: string
  userId: number
  name: string
  ruleType: 'keyword' | 'merchant' | 'amount_range' | 'composite'
  priority: number
  enabled: boolean
  conditions: {
    keyword?: string
    merchantPatterns?: string[]
    amountMin?: number
    amountMax?: number
    type?: 'income' | 'expense'
    matchType?: 'exact' | 'contains' | 'startsWith' | 'endsWith'
    operator?: 'AND' | 'OR'
    conditions?: any[]
  }
  actions: {
    category: string
    paymentMethod?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface ClassificationTestResult {
  matchedRule: AutoClassificationRule | null
  suggestedCategory: string
  suggestedPaymentMethod?: string
}

export const autoClassificationRuleService = {
  // 현재 사용자 ID 가져오기
  getCurrentUserId: (): number => {
    return userHelper.getCurrentUserId()
  },

  // 모든 규칙 조회
  getAll: async (): Promise<AutoClassificationRule[]> => {
    try {
      const userId = autoClassificationRuleService.getCurrentUserId()
      
      const { data, error } = await supabase
        .from('auto_classification_rules')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: true })

      if (error) {
        console.error('Failed to fetch rules:', error)
        throw error
      }

      if (!data || data.length === 0) {
        return []
      }

      return data.map(rule => ({
        id: rule.id.toString(),
        userId: rule.user_id,
        name: rule.name,
        ruleType: rule.rule_type,
        priority: rule.priority,
        enabled: rule.enabled,
        conditions: rule.conditions,
        actions: rule.actions,
        createdAt: new Date(rule.created_at),
        updatedAt: new Date(rule.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching auto classification rules:', error)
      return []
    }
  },

  // 규칙 생성
  create: async (rule: Omit<AutoClassificationRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<AutoClassificationRule> => {
    try {
      const userId = autoClassificationRuleService.getCurrentUserId()
      
      const { data, error } = await supabase
        .from('auto_classification_rules')
        .insert({
          user_id: userId,
          name: rule.name,
          rule_type: rule.ruleType,
          priority: rule.priority,
          enabled: rule.enabled,
          conditions: rule.conditions,
          actions: rule.actions
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
        ruleType: data.rule_type,
        priority: data.priority,
        enabled: data.enabled,
        conditions: data.conditions,
        actions: data.actions,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error creating rule:', error)
      throw error
    }
  },

  // 규칙 수정
  update: async (id: string, rule: Partial<AutoClassificationRule>): Promise<AutoClassificationRule> => {
    try {
      const userId = autoClassificationRuleService.getCurrentUserId()
      
      const updateData: any = {}
      if (rule.name !== undefined) updateData.name = rule.name
      if (rule.ruleType !== undefined) updateData.rule_type = rule.ruleType
      if (rule.priority !== undefined) updateData.priority = rule.priority
      if (rule.enabled !== undefined) updateData.enabled = rule.enabled
      if (rule.conditions !== undefined) updateData.conditions = rule.conditions
      if (rule.actions !== undefined) updateData.actions = rule.actions
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('auto_classification_rules')
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
        ruleType: data.rule_type,
        priority: data.priority,
        enabled: data.enabled,
        conditions: data.conditions,
        actions: data.actions,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error updating rule:', error)
      throw error
    }
  },

  // 규칙 삭제
  delete: async (id: string): Promise<void> => {
    try {
      const userId = autoClassificationRuleService.getCurrentUserId()
      
      const { error } = await supabase
        .from('auto_classification_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
      throw error
    }
  },

  // 규칙 활성화/비활성화
  toggle: async (id: string): Promise<AutoClassificationRule> => {
    try {
      const userId = autoClassificationRuleService.getCurrentUserId()
      
      // 현재 상태 가져오기
      const { data: current, error: fetchError } = await supabase
        .from('auto_classification_rules')
        .select('enabled')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !current) {
        throw new Error('규칙을 찾을 수 없습니다.')
      }

      // 상태 토글
      const { data, error } = await supabase
        .from('auto_classification_rules')
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
        ruleType: data.rule_type,
        priority: data.priority,
        enabled: data.enabled,
        conditions: data.conditions,
        actions: data.actions,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error toggling rule:', error)
      throw error
    }
  },

  // 규칙 적용 테스트
  test: async (description: string, amount: number, type: 'income' | 'expense'): Promise<ClassificationTestResult> => {
    try {
      const rules = await autoClassificationRuleService.getAll()
      const enabledRules = rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority)

      for (const rule of enabledRules) {
        if (autoClassificationRuleService.matchRule(rule, description, amount, type)) {
          return {
            matchedRule: rule,
            suggestedCategory: rule.actions.category,
            suggestedPaymentMethod: rule.actions.paymentMethod
          }
        }
      }

      return {
        matchedRule: null,
        suggestedCategory: '',
        suggestedPaymentMethod: undefined
      }
    } catch (error) {
      console.error('Error testing rules:', error)
      return {
        matchedRule: null,
        suggestedCategory: '',
        suggestedPaymentMethod: undefined
      }
    }
  },

  // 규칙 매칭 로직
  matchRule: (rule: AutoClassificationRule, description: string, amount: number, type: 'income' | 'expense'): boolean => {
    const { conditions } = rule

    switch (rule.ruleType) {
      case 'keyword':
        if (!conditions.keyword) return false
        const keyword = conditions.keyword.toLowerCase()
        const desc = description.toLowerCase()
        const matchType = conditions.matchType || 'contains'
        
        switch (matchType) {
          case 'exact':
            return desc === keyword
          case 'contains':
            return desc.includes(keyword)
          case 'startsWith':
            return desc.startsWith(keyword)
          case 'endsWith':
            return desc.endsWith(keyword)
          default:
            return desc.includes(keyword)
        }

      case 'merchant':
        if (!conditions.merchantPatterns || conditions.merchantPatterns.length === 0) return false
        const descLower = description.toLowerCase()
        const matchTypeMerchant = conditions.matchType || 'contains'
        
        return conditions.merchantPatterns.some(pattern => {
          const patternLower = pattern.toLowerCase()
          switch (matchTypeMerchant) {
            case 'exact':
              return descLower === patternLower
            case 'contains':
              return descLower.includes(patternLower)
            case 'startsWith':
              return descLower.startsWith(patternLower)
            case 'endsWith':
              return descLower.endsWith(patternLower)
            default:
              return descLower.includes(patternLower)
          }
        })

      case 'amount_range':
        if (conditions.type && conditions.type !== type) return false
        if (conditions.amountMin !== undefined && amount < conditions.amountMin) return false
        if (conditions.amountMax !== undefined && amount >= conditions.amountMax) return false
        return true

      case 'composite':
        if (!conditions.conditions || conditions.conditions.length === 0) return false
        const operator = conditions.operator || 'AND'
        
        const results = conditions.conditions.map(condition => {
          // 각 조건을 재귀적으로 평가
          const tempRule: AutoClassificationRule = {
            ...rule,
            ruleType: condition.type || 'keyword',
            conditions: condition
          }
          return autoClassificationRuleService.matchRule(tempRule, description, amount, type)
        })

        return operator === 'AND' 
          ? results.every(r => r)
          : results.some(r => r)

      default:
        return false
    }
  },

  // 거래에 규칙 적용
  applyRules: async (description: string, amount: number, type: 'income' | 'expense'): Promise<{ category?: string; paymentMethod?: string; appliedRuleId?: string }> => {
    try {
      const result = await autoClassificationRuleService.test(description, amount, type)
      
      if (result.matchedRule) {
        return {
          category: result.suggestedCategory,
          paymentMethod: result.suggestedPaymentMethod,
          appliedRuleId: result.matchedRule.id
        }
      }

      return {}
    } catch (error) {
      console.error('Error applying rules:', error)
      return {}
    }
  }
}


