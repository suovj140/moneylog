/**
 * 사용자 ID 관리 유틸리티
 * Supabase 연동을 위한 사용자 ID 설정 및 가져오기
 */

export const userHelper = {
  /**
   * 현재 사용자 ID 가져오기
   * localStorage에서 가져오거나 기본값 반환
   */
  getCurrentUserId: (): number => {
    const userId = localStorage.getItem('current_user_id')
    if (userId) {
      return parseInt(userId, 10)
    }
    
    // 기본값이 없으면 콘솔에 경고
    console.warn(
      '사용자 ID가 설정되지 않았습니다.\n' +
      '브라우저 콘솔에서 다음 명령어를 실행하세요:\n' +
      'localStorage.setItem("current_user_id", "1");'
    )
    
    // 임시로 1 반환 (실제로는 사용자 인증 후 설정해야 함)
    return 1
  },

  /**
   * 사용자 ID 설정
   */
  setCurrentUserId: (userId: number): void => {
    localStorage.setItem('current_user_id', userId.toString())
    console.log(`사용자 ID가 ${userId}로 설정되었습니다.`)
  },

  /**
   * 사용자 ID 확인 및 설정 안내
   */
  ensureUserId: (): number => {
    const userId = userHelper.getCurrentUserId()
    
    if (!localStorage.getItem('current_user_id')) {
      console.warn(
        '⚠️ 사용자 ID가 설정되지 않았습니다.\n' +
        'Supabase에서 사용자를 생성한 후 다음 명령어로 설정하세요:\n' +
        `localStorage.setItem('current_user_id', '사용자ID');`
      )
    }
    
    return userId
  }
}



