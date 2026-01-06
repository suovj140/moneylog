/**
 * 비밀번호 검증 유틸리티
 * 정부 시큐리티 규정 준수
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 비밀번호 복잡도 검증
 * - 최소 8자, 최대 64자
 * - 영문 대문자, 소문자, 숫자, 특수문자 각 1개 이상
 * - 연속된 문자 3개 이상 금지
 * - 동일 문자 3개 이상 반복 금지
 */
export const validatePassword = (password: string, email?: string, name?: string): PasswordValidationResult => {
  const errors: string[] = []

  // 최소/최대 길이
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.')
  }
  if (password.length > 64) {
    errors.push('비밀번호는 최대 64자까지 가능합니다.')
  }

  // 영문 대문자
  if (!/[A-Z]/.test(password)) {
    errors.push('영문 대문자를 최소 1개 이상 포함해야 합니다.')
  }

  // 영문 소문자
  if (!/[a-z]/.test(password)) {
    errors.push('영문 소문자를 최소 1개 이상 포함해야 합니다.')
  }

  // 숫자
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 최소 1개 이상 포함해야 합니다.')
  }

  // 특수문자
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('특수문자를 최소 1개 이상 포함해야 합니다.')
  }

  // 연속된 문자 체크 (abc, 123 등)
  for (let i = 0; i < password.length - 2; i++) {
    const char1 = password.charCodeAt(i)
    const char2 = password.charCodeAt(i + 1)
    const char3 = password.charCodeAt(i + 2)
    
    // 연속 증가 (abc, 123)
    if (char2 === char1 + 1 && char3 === char2 + 1) {
      errors.push('연속된 문자 3개 이상을 사용할 수 없습니다.')
      break
    }
    
    // 연속 감소 (cba, 321)
    if (char2 === char1 - 1 && char3 === char2 - 1) {
      errors.push('연속된 문자 3개 이상을 사용할 수 없습니다.')
      break
    }
  }

  // 동일 문자 반복 체크 (aaa, 111)
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      errors.push('동일한 문자를 3개 이상 반복할 수 없습니다.')
      break
    }
  }

  // 이메일/이름과 유사성 체크
  if (email) {
    const emailLocal = email.split('@')[0].toLowerCase()
    if (password.toLowerCase().includes(emailLocal) && emailLocal.length >= 3) {
      errors.push('이메일 주소와 유사한 비밀번호는 사용할 수 없습니다.')
    }
  }

  if (name) {
    const nameLower = name.toLowerCase()
    if (password.toLowerCase().includes(nameLower) && nameLower.length >= 2) {
      errors.push('이름과 유사한 비밀번호는 사용할 수 없습니다.')
    }
  }

  // 일반적인 약한 비밀번호 체크
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'welcome']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('일반적으로 사용되는 비밀번호는 사용할 수 없습니다.')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/
  return emailRegex.test(email)
}



