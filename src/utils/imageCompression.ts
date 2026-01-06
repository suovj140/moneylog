import imageCompression from 'browser-image-compression'

/**
 * 이미지 압축 옵션
 */
const compressionOptions = {
  maxSizeMB: 1, // 최대 1MB로 압축
  maxWidthOrHeight: 1920, // 최대 해상도
  useWebWorker: true, // 웹 워커 사용으로 UI 블로킹 방지
  fileType: undefined as string | undefined // 원본 형식 유지
}

/**
 * 이미지 파일 압축
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // 이미지 파일만 압축
    if (!file.type.startsWith('image/')) {
      return file
    }

    // 1MB 미만이면 압축하지 않음
    if (file.size < 1024 * 1024) {
      return file
    }

    const compressedFile = await imageCompression(file, compressionOptions)
    return compressedFile
  } catch (error) {
    console.error('이미지 압축 실패:', error)
    // 압축 실패 시 원본 파일 반환
    return file
  }
}

/**
 * 썸네일 생성
 */
export async function generateThumbnail(file: File, maxWidth: number = 200): Promise<File> {
  try {
    const options = {
      maxSizeMB: 0.1, // 썸네일은 100KB 이하
      maxWidthOrHeight: maxWidth,
      useWebWorker: true,
      fileType: 'image/jpeg' as const
    }

    const thumbnailFile = await imageCompression(file, options)
    return thumbnailFile
  } catch (error) {
    console.error('썸네일 생성 실패:', error)
    throw new Error('썸네일 생성에 실패했습니다.')
  }
}

/**
 * 파일 형식 검증
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '파일 크기는 10MB를 초과할 수 없습니다.'
    }
  }

  return { valid: true }
}


