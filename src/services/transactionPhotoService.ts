import { supabase } from '../lib/supabase'
import { userHelper } from '../utils/userHelper'

export interface TransactionPhoto {
  id: string
  transactionId: string
  userId: number
  filePath: string
  fileName: string
  fileSize: number
  mimeType: string
  thumbnailPath?: string
  displayOrder: number
  url?: string // 서명된 URL
  thumbnailUrl?: string // 서명된 URL
}

const BUCKET_NAME = 'transaction-photos'
const MAX_PHOTOS_PER_TRANSACTION = 5

export const transactionPhotoService = {
  // 현재 사용자 ID 가져오기
  getCurrentUserId: (): number => {
    return userHelper.getCurrentUserId()
  },

  // 거래 내역의 사진 목록 조회
  getByTransactionId: async (transactionId: string): Promise<TransactionPhoto[]> => {
    try {
      const userId = transactionPhotoService.getCurrentUserId()
      
      // transactionId를 숫자로 변환 시도 (Supabase에서 숫자로 저장되었을 수 있음)
      const numericId = parseInt(transactionId, 10)
      const isNumeric = !isNaN(numericId)
      
      console.log('Fetching photos for transaction ID:', transactionId, 'numeric:', isNumeric ? numericId : 'N/A')
      
      const { data, error } = await supabase
        .from('transaction_photos')
        .select('*')
        .eq('transaction_id', isNumeric ? numericId : transactionId)
        .eq('user_id', userId)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Failed to fetch photos:', error)
        throw error
      }

      if (!data || data.length === 0) {
        return []
      }

      // 서명된 URL 생성 (에러가 발생해도 계속 진행)
      const photosWithUrls = await Promise.all(
        data.map(async (photo) => {
          let url: string | undefined = undefined
          let thumbnailUrl: string | undefined = undefined

          try {
            url = await transactionPhotoService.getSignedUrl(photo.file_path)
          } catch (error) {
            console.error(`Failed to get signed URL for ${photo.file_path}:`, error)
            // URL 생성 실패해도 계속 진행
          }

          // 썸네일은 아직 구현되지 않았으므로 생성하지 않음
          // thumbnail_path가 DB에 저장되어 있어도 실제 파일이 없을 수 있음
          thumbnailUrl = undefined

          return {
            id: photo.id.toString(),
            transactionId: photo.transaction_id.toString(),
            userId: photo.user_id,
            filePath: photo.file_path,
            fileName: photo.file_name,
            fileSize: photo.file_size,
            mimeType: photo.mime_type,
            thumbnailPath: photo.thumbnail_path || undefined,
            displayOrder: photo.display_order,
            url,
            thumbnailUrl
          }
        })
      )

      return photosWithUrls
    } catch (error) {
      console.error('Error fetching transaction photos:', error)
      return []
    }
  },

  // 사진 업로드
  upload: async (
    transactionId: string,
    file: File,
    displayOrder: number
  ): Promise<TransactionPhoto> => {
    try {
      const userId = transactionPhotoService.getCurrentUserId()
      
      console.log('Starting photo upload:', {
        transactionId,
        userId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        displayOrder
      })
      
      if (!userId) {
        throw new Error('사용자 ID가 설정되지 않았습니다.')
      }

      // 기존 사진 개수 확인 (5장 제한)
      const existingPhotos = await transactionPhotoService.getByTransactionId(transactionId)
      console.log('Existing photos count:', existingPhotos.length)
      
      if (existingPhotos.length >= MAX_PHOTOS_PER_TRANSACTION) {
        throw new Error(`거래당 최대 ${MAX_PHOTOS_PER_TRANSACTION}장의 사진만 첨부할 수 있습니다.`)
      }

      // 파일 경로 생성
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${userId}/${transactionId}/${fileName}`
      const thumbnailPath = `${userId}/${transactionId}/thumb_${fileName}`

      console.log('Uploading to Storage:', {
        bucket: BUCKET_NAME,
        filePath,
        fileSize: file.size
      })

      // Storage 버킷 존재 여부 확인 (에러 발생 시 조용히 무시)
      // 버킷이 이미 수동으로 생성되어 있으므로 목록 조회만 시도
      // 버킷 생성은 Supabase Dashboard에서 수동으로 수행되어야 하므로
      // 자동 생성 시도는 하지 않음 (권한 문제로 인한 에러 방지)
      try {
        const { data: buckets } = await supabase.storage.listBuckets()
        const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME) ?? false
        
        if (!bucketExists) {
          // 버킷이 없으면 사용자에게 수동 생성 안내
          console.debug(`Bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard.`)
          // 업로드 시도는 계속 진행 (버킷이 존재할 수 있음)
        }
      } catch (error) {
        // 목록 조회 실패 시 조용히 무시 (버킷이 존재할 수 있음)
        // 업로드 시도는 계속 진행
      }
      
      // 버킷 존재 여부와 관계없이 업로드 시도
      // (버킷이 존재하는데 목록 조회에 실패했을 수 있음)

      // Storage에 원본 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        let errorMessage = uploadError.message
        
        if (uploadError.message.includes('Bucket not found')) {
          errorMessage = `Storage 버킷 '${BUCKET_NAME}'이(가) 존재하지 않습니다. Supabase Dashboard > Storage에서 버킷을 생성해주세요.`
        }
        
        throw new Error(`사진 업로드 실패: ${errorMessage}`)
      }
      
      console.log('Storage upload successful:', uploadData)

      // 썸네일 생성 및 업로드 (선택사항)
      // TODO: 썸네일 생성 로직 추가

      // transaction_id를 숫자로 변환 (문자열일 수 있음)
      const numericTransactionId = parseInt(transactionId, 10)
      if (isNaN(numericTransactionId)) {
        // 업로드한 파일 삭제
        await supabase.storage.from(BUCKET_NAME).remove([filePath])
        throw new Error(`잘못된 거래 ID: ${transactionId}`)
      }
      
      console.log('Inserting into database:', {
        transaction_id: numericTransactionId,
        user_id: userId,
        file_path: filePath,
        display_order: displayOrder
      })

      // 데이터베이스에 기록
      const { data, error: dbError } = await supabase
        .from('transaction_photos')
        .insert({
          transaction_id: numericTransactionId,
          user_id: userId,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          thumbnail_path: thumbnailPath,
          display_order: displayOrder
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        // 업로드한 파일 삭제
        await supabase.storage.from(BUCKET_NAME).remove([filePath])
        throw new Error(`데이터베이스 저장 실패: ${dbError.message}`)
      }
      
      console.log('Database insert successful:', data)

      // 서명된 URL 생성
      const url = await transactionPhotoService.getSignedUrl(filePath)
      
      // 썸네일 URL 생성 (썸네일이 실제로 생성된 경우에만)
      // 현재는 썸네일 생성 기능이 구현되지 않았으므로 undefined 반환
      let thumbnailUrl: string | undefined = undefined
      
      // TODO: 썸네일 생성 기능이 구현되면 아래 주석을 해제하세요
      // try {
      //   // 썸네일 파일 존재 여부 확인
      //   const { data: thumbnailExists } = await supabase.storage
      //     .from(BUCKET_NAME)
      //     .list(`${userId}/${transactionId}`, {
      //       search: `thumb_${fileName}`
      //     })
      //   
      //   if (thumbnailExists && thumbnailExists.length > 0) {
      //     thumbnailUrl = await transactionPhotoService.getSignedUrl(thumbnailPath)
      //   }
      // } catch (error) {
      //   // 썸네일이 없으면 무시
      // }

      return {
        id: data.id.toString(),
        transactionId: data.transaction_id.toString(),
        userId: data.user_id,
        filePath: data.file_path,
        fileName: data.file_name,
        fileSize: data.file_size,
        mimeType: data.mime_type,
        thumbnailPath: data.thumbnail_path || undefined,
        displayOrder: data.display_order,
        url,
        thumbnailUrl
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  },

  // 사진 삭제
  delete: async (photoId: string): Promise<void> => {
    try {
      const userId = transactionPhotoService.getCurrentUserId()

      // 데이터베이스에서 사진 정보 가져오기
      const { data: photo, error: fetchError } = await supabase
        .from('transaction_photos')
        .select('*')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !photo) {
        throw new Error('사진을 찾을 수 없습니다.')
      }

      // Storage에서 파일 삭제
      const filesToDelete = [photo.file_path]
      if (photo.thumbnail_path) {
        filesToDelete.push(photo.thumbnail_path)
      }

      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete)

      if (deleteError) {
        console.error('Failed to delete files from storage:', deleteError)
        // Storage 삭제 실패해도 DB 삭제는 진행
      }

      // 데이터베이스에서 삭제
      const { error: dbError } = await supabase
        .from('transaction_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId)

      if (dbError) {
        throw dbError
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      throw error
    }
  },

  // 서명된 URL 생성 (1시간 유효)
  getSignedUrl: async (filePath: string, silent: boolean = false): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600) // 1시간

      if (error) {
        if (!silent) {
          console.error('Error creating signed URL:', error)
        }
        throw error
      }

      return data.signedUrl
    } catch (error: any) {
      if (!silent) {
        console.error('Error creating signed URL:', error)
      }
      throw error
    }
  },

  // 사진 순서 변경
  updateOrder: async (photoId: string, newOrder: number): Promise<void> => {
    try {
      const userId = transactionPhotoService.getCurrentUserId()

      const { error } = await supabase
        .from('transaction_photos')
        .update({ display_order: newOrder })
        .eq('id', photoId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating photo order:', error)
      throw error
    }
  }
}

