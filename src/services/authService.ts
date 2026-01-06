import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'
import { validatePassword, validateEmail } from '../utils/passwordValidation'

export interface User {
  id: number
  email: string
  name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
  profile_image_url?: string | null
}

export interface SignupData {
  email: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  /**
   * 회원가입
   */
  signup: async (data: SignupData): Promise<{ user: User; error: string | null }> => {
    try {
      // 이메일 형식 검증
      if (!validateEmail(data.email)) {
        return { user: null as any, error: '올바른 이메일 형식이 아닙니다.' }
      }

      // 비밀번호 검증
      const passwordValidation = validatePassword(data.password, data.email, data.name)
      if (!passwordValidation.isValid) {
        return { user: null as any, error: passwordValidation.errors.join('\n') }
      }

      // 이메일 중복 체크
      const { data: existingUser, error: _checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email.toLowerCase().trim())
        .single()

      if (existingUser) {
        return { user: null as any, error: '이미 사용 중인 이메일입니다.' }
      }

      // 비밀번호 해싱
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(data.password, saltRounds)

      // 사용자 생성
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: data.email.toLowerCase().trim(),
          password: hashedPassword,
          name: data.name.trim(),
          created_by: null, // 자기 자신이 생성하므로 null (또는 나중에 설정)
          is_active: true,
          login_attempts: 0
        })
        .select()
        .single()

      if (insertError) {
        console.error('Signup error:', insertError)
        return { user: null as any, error: '회원가입에 실패했습니다. 다시 시도해주세요.' }
      }

      // 비밀번호 필드 제거 후 반환
      const { password: _, ...userWithoutPassword } = newUser
      return { user: userWithoutPassword as User, error: null }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { user: null as any, error: error.message || '회원가입에 실패했습니다.' }
    }
  },

  /**
   * 로그인
   */
  login: async (data: LoginData): Promise<{ user: User | null; error: string | null }> => {
    try {
      // 이메일 형식 검증
      if (!validateEmail(data.email)) {
        return { user: null, error: '올바른 이메일 형식이 아닙니다.' }
      }

      // 사용자 조회
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', data.email.toLowerCase().trim())
        .single()

      if (fetchError || !user) {
        return { user: null, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      }

      // 계정 활성화 확인
      if (!user.is_active) {
        return { user: null, error: '비활성화된 계정입니다. 관리자에게 문의하세요.' }
      }

      // 계정 잠금 확인
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        const unlockTime = new Date(user.locked_until).toLocaleString('ko-KR')
        return { user: null, error: `계정이 잠금되었습니다. ${unlockTime} 이후에 다시 시도해주세요.` }
      }

      // 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(data.password, user.password)
      
      if (!isPasswordValid) {
        // 로그인 실패 횟수 증가
        const newAttempts = (user.login_attempts || 0) + 1
        const updateData: any = { login_attempts: newAttempts }

        // 5회 이상 실패 시 계정 잠금 (30분)
        if (newAttempts >= 5) {
          const lockUntil = new Date()
          lockUntil.setMinutes(lockUntil.getMinutes() + 30)
          updateData.locked_until = lockUntil.toISOString()
        }

        await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id)

        if (newAttempts >= 5) {
          return { user: null, error: '로그인 실패 횟수가 초과되었습니다. 30분 후에 다시 시도해주세요.' }
        }

        return { user: null, error: `이메일 또는 비밀번호가 올바르지 않습니다. (${newAttempts}/5)` }
      }

      // 로그인 성공
      // last_login_at 업데이트, login_attempts 초기화, locked_until 해제
      await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          login_attempts: 0,
          locked_until: null
        })
        .eq('id', user.id)

      // 비밀번호 필드 제거 후 반환
      const { password: _, ...userWithoutPassword } = user
      return { user: userWithoutPassword as User, error: null }
    } catch (error: any) {
      console.error('Login error:', error)
      return { user: null, error: error.message || '로그인에 실패했습니다.' }
    }
  },

  /**
   * 현재 로그인한 사용자 정보 가져오기
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userId = localStorage.getItem('current_user_id')
      if (!userId) return null

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, is_active, created_at, updated_at, last_login_at, profile_image_url')
        .eq('id', parseInt(userId, 10))
        .eq('is_active', true)
        .single()

      if (error || !user) return null
      return user as User
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  },

  /**
   * 로그아웃
   */
  logout: (): void => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('current_user_id')
    localStorage.removeItem('current_user')
  },

  /**
   * 프로필 이미지 업로드 및 업데이트
   */
  updateProfileImage: async (file: File): Promise<{ url: string | null; error: string | null }> => {
    try {
      const userId = localStorage.getItem('current_user_id')
      if (!userId) {
        return { url: null, error: '로그인이 필요합니다.' }
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: '이미지 크기는 5MB 이하여야 합니다.' }
      }

      // 파일 확장자 검증
      const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validExtensions.includes(file.type)) {
        return { url: null, error: '지원하는 이미지 형식이 아닙니다. (JPEG, PNG, GIF, WebP)' }
      }

      // 기존 프로필 이미지 삭제 (있다면)
      const currentUser = await authService.getCurrentUser()
      if (currentUser?.profile_image_url) {
        const oldPath = currentUser.profile_image_url.replace(/^.*\/storage\/v1\/object\/public\//, '')
        if (oldPath) {
          await supabase.storage.from('profile-images').remove([oldPath.split('/').pop() || ''])
        }
      }

      // Supabase Storage에 업로드
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { url: null, error: '이미지 업로드에 실패했습니다.' }
      }

      // Public URL 가져오기
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // users 테이블에 URL 저장
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', parseInt(userId, 10))

      if (updateError) {
        console.error('Update error:', updateError)
        // 업로드는 성공했지만 DB 업데이트 실패 시 업로드된 파일 삭제
        await supabase.storage.from('profile-images').remove([filePath])
        return { url: null, error: '프로필 이미지 업데이트에 실패했습니다.' }
      }

      return { url: publicUrl, error: null }
    } catch (error: any) {
      console.error('Update profile image error:', error)
      return { url: null, error: error.message || '프로필 이미지 업데이트에 실패했습니다.' }
    }
  },

  /**
   * 프로필 이미지 삭제
   */
  deleteProfileImage: async (): Promise<{ error: string | null }> => {
    try {
      const userId = localStorage.getItem('current_user_id')
      if (!userId) {
        return { error: '로그인이 필요합니다.' }
      }

      // 현재 프로필 이미지 URL 가져오기
      const currentUser = await authService.getCurrentUser()
      if (!currentUser?.profile_image_url) {
        return { error: null } // 이미 삭제된 상태
      }

      // Storage에서 파일 삭제
      const imagePath = currentUser.profile_image_url.replace(/^.*\/storage\/v1\/object\/public\/profile-images\//, '')
      if (imagePath) {
        const { error: deleteError } = await supabase.storage
          .from('profile-images')
          .remove([imagePath])

        if (deleteError) {
          console.error('Delete storage error:', deleteError)
          // Storage 삭제 실패해도 DB는 업데이트
        }
      }

      // users 테이블에서 URL 제거
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: null })
        .eq('id', parseInt(userId, 10))

      if (updateError) {
        console.error('Update error:', updateError)
        return { error: '프로필 이미지 삭제에 실패했습니다.' }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Delete profile image error:', error)
      return { error: error.message || '프로필 이미지 삭제에 실패했습니다.' }
    }
  }
}

