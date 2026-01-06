import { useState, useEffect, useRef, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { transactionService, Transaction } from '../services/transactionService'
import { transactionPhotoService, TransactionPhoto } from '../services/transactionPhotoService'
import { autoClassificationRuleService } from '../services/autoClassificationRuleService'
import { compressImage, validateImageFile } from '../utils/imageCompression'
import { format } from 'date-fns'
import DatePicker from './DatePicker'
import './TransactionModal.css'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: Transaction | null // 수정 모드일 때 전달
}

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction }: TransactionModalProps) {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation()
  
  // 언어 변경 감지를 위한 state (강제 리렌더링을 위해)
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)
  
  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng)
    }
    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])
  
  // 언어가 변경될 때마다 카테고리와 결제수단을 다시 로드
  // i18n.language를 직접 사용하여 언어 변경 시 즉시 반영
  const categories = useMemo(() => ({
    expense: t('common.categories.expense', { returnObjects: true }) as string[],
    income: t('common.categories.income', { returnObjects: true }) as string[]
  }), [i18n.language, currentLanguage])

  const paymentMethods = useMemo(() => 
    t('common.paymentMethods', { returnObjects: true }) as string[],
    [i18n.language, currentLanguage]
  )
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    amountDisplay: '', // 표시용 (천 단위 구분 포함)
    type: 'income' as 'income' | 'expense',
    category: '',
    paymentMethod: '',
    memo: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<TransactionPhoto[]>([])
  const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(new Map()) // 임시 파일 저장 (id -> File)
  const [uploadingPhotos, setUploadingPhotos] = useState<string[]>([]) // 업로드 중인 파일명
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [selectedPhoto, setSelectedPhoto] = useState<TransactionPhoto | null>(null) // 선택된 이미지 (큰 이미지 모달용)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 언어별 로케일 매핑
  const getLocale = () => {
    const language = i18n.language || 'ko'
    const localeMap: Record<string, string> = {
      'ko': 'ko-KR',
      'en': 'en-US',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'vi': 'vi-VN',
      'fil': 'en-US' // 필리핀어는 영어 로케일 사용
    }
    return localeMap[language] || 'en-US'
  }

  // 숫자 포맷팅 함수 (천 단위 구분)
  const formatNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '')
    if (!numbers) return ''
    // 천 단위 구분 추가 (현재 언어에 맞게)
    return parseInt(numbers, 10).toLocaleString(getLocale())
  }

  // 숫자 추출 함수 (표시용 -> 실제 값)
  const parseNumber = (value: string): string => {
    return value.replace(/[^0-9]/g, '')
  }

  // 금액 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numbersOnly = parseNumber(inputValue)
    const formatted = formatNumber(inputValue)
    
    setFormData({
      ...formData,
      amount: numbersOnly, // 실제 값 (숫자만)
      amountDisplay: formatted // 표시용 (천 단위 구분)
    })
  }

  // 화면 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 모달이 열릴 때마다 폼 초기화 또는 수정 모드 데이터 로드
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        // 수정 모드
        const amountValue = String(transaction.amount || '')
        const transactionType = transaction.type || 'income'
        const categoryValue = transaction.category || ''
        const paymentMethodValue = transaction.paymentMethod || ''
        const memoValue = transaction.memo || ''
        
        console.log('Loading transaction for edit:', {
          id: transaction.id,
          type: transactionType,
          category: categoryValue,
          paymentMethod: paymentMethodValue,
          memo: memoValue,
          fullTransaction: transaction
        })
        
        // 타입을 먼저 설정하고, 그 다음에 나머지 데이터 설정
        setFormData(prev => ({
          ...prev,
          date: transaction.date || format(new Date(), 'yyyy-MM-dd'),
          amount: amountValue,
          amountDisplay: formatNumber(amountValue),
          type: transactionType,
          category: categoryValue,
          paymentMethod: paymentMethodValue,
          memo: memoValue
        }))
        // 기존 사진 로드
        if (transaction.id) {
          // ID를 문자열로 변환 (숫자일 수 있음)
          const transactionId = String(transaction.id)
          console.log('Loading photos for transaction ID:', transactionId)
          loadTransactionPhotos(transactionId)
        } else {
          console.warn('Transaction ID is missing, cannot load photos')
          setPhotos([])
        }
      } else {
        // 추가 모드
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          amountDisplay: '',
          type: 'income',
          category: '',
          paymentMethod: '',
          memo: ''
        })
        setPhotos([])
      }
      setError(null)
    } else {
      // 모달이 닫힐 때 임시 파일 정리
      photos.forEach(photo => {
        if (photo.url && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url)
        }
      })
      setPhotos([])
      setPendingFiles(new Map())
    }
  }, [isOpen, transaction])

  // 거래 내역의 사진 로드
  const loadTransactionPhotos = async (transactionId: string) => {
    try {
      console.log('Loading photos for transaction:', transactionId)
      const loadedPhotos = await transactionPhotoService.getByTransactionId(transactionId)
      console.log('Loaded photos:', loadedPhotos)
      setPhotos(loadedPhotos)
    } catch (error) {
      console.error('Failed to load photos:', error)
      setPhotos([]) // 에러 발생 시 빈 배열로 설정
    }
  }

  // 카테고리 선택 옵션 (현재 타입에 따라 결정)
  // useMemo로 감싸서 언어 변경 시 업데이트되도록 함
  const currentCategories = useMemo(() => 
    formData.type === 'expense' ? categories.expense : categories.income,
    [formData.type, categories, currentLanguage]
  )
    
  // 결제수단 선택 옵션
  // useMemo로 감싸서 언어 변경 시 업데이트되도록 함
  const currentPaymentMethods = useMemo(() => 
    paymentMethods,
    [paymentMethods, currentLanguage]
  )

  // 자동 분류 규칙 적용
  useEffect(() => {
    const applyAutoClassification = async () => {
      // 메모와 금액이 모두 입력되었을 때만 자동 분류 적용
      if (formData.memo && formData.amount) {
        try {
          const amountValue = parseNumber(formData.amount || formData.amountDisplay)
          if (amountValue && Number(amountValue) > 0) {
            const result = await autoClassificationRuleService.applyRules(
              formData.memo,
              Number(amountValue),
              formData.type
            )
            
            // 카테고리가 비어있을 때만 자동 분류 적용
            if (result.category && !formData.category) {
              setFormData(prev => ({
                ...prev,
                category: result.category || prev.category
              }))
            }
            
            // 결제수단이 비어있을 때만 자동 분류 적용
            if (result.paymentMethod && !formData.paymentMethod) {
              setFormData(prev => ({
                ...prev,
                paymentMethod: result.paymentMethod || prev.paymentMethod
              }))
            }
          }
        } catch (error) {
          console.error('Failed to apply auto classification:', error)
          // 에러가 발생해도 계속 진행
        }
      }
    }

    // 디바운스: 500ms 후에 적용
    const timeoutId = setTimeout(() => {
      applyAutoClassification()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.memo, formData.amount, formData.type])

  // 사진 파일 선택 핸들러
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 최대 5장 제한 확인
    if (photos.length + files.length > 5) {
      setError(t('transactionModal.maxPhotosExceeded', { max: 5 }))
      return
    }

    setError(null)

    // 각 파일 처리
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 파일 검증
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || t('transactionModal.invalidImageFile'))
        continue
      }

      // 이미지 압축
      try {
        const compressedFile = await compressImage(file)
        
        // 임시로 미리보기용 URL 생성
        const previewUrl = URL.createObjectURL(compressedFile)
        const tempId = `temp_${Date.now()}_${i}`
        const tempPhoto: TransactionPhoto = {
          id: tempId,
          transactionId: transaction?.id || 'temp',
          userId: transactionPhotoService.getCurrentUserId(),
          filePath: '',
          fileName: file.name,
          fileSize: compressedFile.size,
          mimeType: compressedFile.type,
          displayOrder: photos.length + i,
          url: previewUrl
        }

        // 파일 객체 저장
        setPendingFiles(prev => new Map(prev).set(tempId, compressedFile))
        setPhotos(prev => [...prev, tempPhoto])
      } catch (error) {
        console.error('Failed to process image:', error)
        setError(t('transactionModal.imageProcessingFailed'))
      }
    }

    // 입력 필드 초기화
    if (e.target) {
      e.target.value = ''
    }
  }

  // 사진 삭제 핸들러
  const handlePhotoDelete = async (photoId: string) => {
    try {
      // 임시 사진인 경우 (아직 업로드 안 된 경우)
      if (photoId.startsWith('temp_')) {
        setPhotos(prev => {
          const updated = prev.filter(p => p.id !== photoId)
          // URL 해제
          const photo = prev.find(p => p.id === photoId)
          if (photo?.url && photo.url.startsWith('blob:')) {
            URL.revokeObjectURL(photo.url)
          }
          return updated
        })
        // 파일 객체 제거
        setPendingFiles(prev => {
          const newMap = new Map(prev)
          newMap.delete(photoId)
          return newMap
        })
        return
      }

      // 기존 사진 삭제
      await transactionPhotoService.delete(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (error) {
      console.error('Failed to delete photo:', error)
      setError(t('transactionModal.deletePhotoFailed'))
    }
  }

  // 모바일: 카메라 또는 갤러리 선택
  const handleMobilePhotoSelect = (source: 'camera' | 'gallery') => {
    if (source === 'camera' && cameraInputRef.current) {
      cameraInputRef.current.setAttribute('capture', 'environment')
      cameraInputRef.current.click()
    } else if (source === 'gallery' && fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 유효성 검증
    const amountValue = parseNumber(formData.amount || formData.amountDisplay)
    if (!amountValue || Number(amountValue) <= 0) {
      setError(t('transactionModal.enterAmount'))
      return
    }

    if (!formData.category) {
      setError(t('transactionModal.selectCategory'))
      return
    }

    if (!formData.paymentMethod) {
      setError(t('transactionModal.selectPaymentMethod'))
      return
    }

    setIsLoading(true)

    try {
      const amountValue = parseNumber(formData.amount || formData.amountDisplay)
      const transactionData: Transaction = {
        id: transaction?.id || '',
        date: formData.date,
        amount: Number(amountValue),
        type: formData.type,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        memo: formData.memo
      }

      let savedTransaction: Transaction

      if (transaction?.id) {
        // 수정 모드
        savedTransaction = await transactionService.update(transaction.id, transactionData)
      } else {
        // 추가 모드
        savedTransaction = await transactionService.create(transactionData)
      }

      // 새로 추가된 사진 업로드
      const tempPhotos = photos.filter(p => p.id.startsWith('temp_'))
      console.log('Photos to upload:', {
        totalPhotos: photos.length,
        tempPhotos: tempPhotos.length,
        savedTransactionId: savedTransaction.id,
        pendingFilesSize: pendingFiles.size
      })
      
      if (tempPhotos.length > 0) {
        try {
          for (let i = 0; i < tempPhotos.length; i++) {
            const tempPhoto = tempPhotos[i]
            const file = pendingFiles.get(tempPhoto.id)
            
            console.log(`Processing photo ${i + 1}/${tempPhotos.length}:`, {
              photoId: tempPhoto.id,
              hasFile: !!file,
              fileName: tempPhoto.fileName,
              displayOrder: tempPhoto.displayOrder
            })
            
            if (!file) {
              console.error('File not found for photo:', tempPhoto.id, 'Available files:', Array.from(pendingFiles.keys()))
              continue
            }

            setUploadingPhotos(prev => [...prev, tempPhoto.id])
            
            try {
              console.log('Uploading photo to transaction:', savedTransaction.id)
              const uploadedPhoto = await transactionPhotoService.upload(
                String(savedTransaction.id), 
                file, 
                tempPhoto.displayOrder
              )
              console.log('Photo uploaded successfully:', uploadedPhoto)
              
              // URL 해제
              if (tempPhoto.url && tempPhoto.url.startsWith('blob:')) {
                URL.revokeObjectURL(tempPhoto.url)
              }
            } catch (photoError) {
              console.error('Failed to upload photo:', photoError)
              setError(t('transactionModal.photoUploadFailed', { 
                fileName: tempPhoto.fileName,
                error: photoError instanceof Error ? photoError.message : String(photoError)
              }))
              // 개별 사진 업로드 실패해도 계속 진행
            } finally {
              setUploadingPhotos(prev => prev.filter(id => id !== tempPhoto.id))
            }
          }
          
          // 업로드 완료 후 임시 파일 정리
          setPendingFiles(new Map())
          console.log('All photos uploaded successfully')
        } catch (photoError) {
          console.error('Failed to upload photos:', photoError)
          setError(t('transactionModal.photoUploadFailed', { 
            fileName: 'multiple',
            error: photoError instanceof Error ? photoError.message : String(photoError)
          }))
          // 사진 업로드 실패해도 거래는 저장됨
        }
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(`Failed to ${transaction?.id ? 'update' : 'create'} transaction:`, err)
      setError(err?.message || (transaction?.id ? t('transactionModal.updateFailed') : t('transactionModal.createFailed')))
    } finally {
      setIsLoading(false)
      setUploadingPhotos([])
    }
  }

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({
      ...formData,
      type,
      category: '', // 타입 변경 시 카테고리 초기화
      paymentMethod: formData.paymentMethod
    })
  }

  if (!isOpen) return null

  return (
    <div className="transaction-modal-overlay" onClick={onClose}>
      <div 
        className="transaction-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: theme.surface }}
      >
        <div className="transaction-modal-header">
          <h2 style={{ color: theme.text }}>{transaction?.id ? t('transactionModal.editTransaction') : t('transactionModal.addTransaction')}</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
            style={{ color: theme.textSecondary }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-modal-form">
          {/* 거래 유형 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.type')}
            </label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-button ${formData.type === 'income' ? 'active' : ''}`}
                onClick={() => handleTypeChange('income')}
                style={{
                  backgroundColor: formData.type === 'income' ? theme.income : theme.inputBg,
                  color: formData.type === 'income' ? '#FFFFFF' : theme.text
                }}
              >
                {t('common.income')}
              </button>
              <button
                type="button"
                className={`type-button ${formData.type === 'expense' ? 'active' : ''}`}
                onClick={() => handleTypeChange('expense')}
                style={{
                  backgroundColor: formData.type === 'expense' ? theme.error : theme.inputBg,
                  color: formData.type === 'expense' ? '#FFFFFF' : theme.text
                }}
              >
                {t('common.expense')}
              </button>
            </div>
          </div>

          {/* 날짜 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.date')}
            </label>
            <DatePicker
              value={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
            />
          </div>

          {/* 금액 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.amount')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t('transactionModal.amountPlaceholder', '0')}
                value={formData.amountDisplay}
                onChange={handleAmountChange}
                required
                inputMode="numeric"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                  paddingRight: '2.5rem'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.textSecondary,
                  fontSize: '0.875rem',
                  pointerEvents: 'none'
                }}
              >
                {t('common.currency')}
              </span>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.category')}
            </label>
            <select
              className="form-input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
              }}
            >
              <option value="">{t('common.selectItem')}</option>
              {currentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {/* 현재 선택된 카테고리가 목록에 없으면 추가 (DB에 저장된 값이 언어 변경으로 매칭 안될 때) */}
              {formData.category && !currentCategories.includes(formData.category) && (
                <option key={formData.category} value={formData.category}>{formData.category}</option>
              )}
            </select>
          </div>

          {/* 결제 수단 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.paymentMethod')}
            </label>
            <select
              className="form-input"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
              }}
            >
              <option value="">{t('common.selectItem')}</option>
              {currentPaymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
              {/* 현재 선택된 결제수단이 목록에 없으면 추가 (DB에 저장된 값이 언어 변경으로 매칭 안될 때) */}
              {formData.paymentMethod && !currentPaymentMethods.includes(formData.paymentMethod) && (
                <option key={formData.paymentMethod} value={formData.paymentMethod}>{formData.paymentMethod}</option>
              )}
            </select>
          </div>

          {/* 메모 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.memo')}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder={t('transactionModal.memoPlaceholder')}
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
              }}
            />
          </div>

          {/* 사진 첨부 */}
          <div className="form-group">
            <label className="form-label" style={{ color: theme.text }}>
              {t('transactionModal.photos')} ({photos.length}/5)
            </label>
            
            {/* 사진 미리보기 */}
            {photos.length > 0 && (
              <div className="photo-preview-grid" style={{ marginBottom: '1rem' }}>
                {photos.map((photo, _index) => (
                  <div
                    key={photo.id}
                    className="photo-preview-item"
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: theme.inputBg,
                      border: `1px solid ${theme.inputBorder}`
                    }}
                  >
                    {photo.url || photo.thumbnailUrl ? (
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.fileName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedPhoto(photo)}
                        onError={(e) => {
                          console.error('Failed to load image:', photo.url || photo.thumbnailUrl)
                          // 이미지 로드 실패 시 대체 표시
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.textSecondary,
                        fontSize: '0.75rem'
                      }}>
                        {t('common.imageLoadFailed')}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePhotoDelete(photo.id)}
                      className="photo-delete-btn"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        lineHeight: '1'
                      }}
                      aria-label={t('common.delete')}
                    >
                      ✕
                    </button>
                    {uploadingPhotos.includes(photo.id) && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '4px',
                          textAlign: 'center'
                        }}
                      >
                        {t('transactionModal.uploading')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 사진 추가 버튼 */}
            {photos.length < 5 && (
              <div>
                {isMobile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleMobilePhotoSelect('camera')}
                      className="photo-add-btn"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        backgroundColor: theme.inputBg,
                        border: `1px dashed ${theme.inputBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📷 {t('transactionModal.takePhoto')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMobilePhotoSelect('gallery')}
                      className="photo-add-btn"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: theme.inputBg,
                        border: `1px dashed ${theme.inputBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      🖼️ {t('transactionModal.selectFromGallery')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="photo-add-btn"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: theme.inputBg,
                      border: `1px dashed ${theme.inputBorder}`,
                      borderRadius: '8px',
                      color: theme.text,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    📷 {t('transactionModal.addPhoto')}
                  </button>
                )}
              </div>
            )}

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div 
              className="error-message"
              style={{ 
                color: theme.error,
                backgroundColor: theme.isDark ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)'
              }}
            >
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              style={{
                backgroundColor: theme.inputBg,
                color: theme.text
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
              style={{
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? t('common.loading') : transaction?.id ? t('common.edit') : t('common.add')}
            </button>
          </div>
        </form>
      </div>

      {/* 이미지 확대 모달 */}
      {selectedPhoto && (
        <div 
          className="image-viewer-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '1rem' : '2rem'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url || selectedPhoto.thumbnailUrl}
              alt={selectedPhoto.fileName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: isMobile ? '1rem' : '2rem',
                right: isMobile ? '1rem' : '2rem',
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '20px' : '24px',
                lineHeight: '1',
                zIndex: 10001
              }}
              aria-label={t('common.cancel')}
            >
              ✕
            </button>

            {/* 다운로드 버튼 */}
            <button
              type="button"
              onClick={async () => {
                try {
                  const imageUrl = selectedPhoto.url || selectedPhoto.thumbnailUrl
                  if (!imageUrl) return

                  // 이미지를 fetch하여 Blob으로 변환
                  const response = await fetch(imageUrl)
                  const blob = await response.blob()
                  const url = window.URL.createObjectURL(blob)
                  
                  // 다운로드 링크 생성
                  const link = document.createElement('a')
                  link.href = url
                  link.download = selectedPhoto.fileName || `photo_${selectedPhoto.id}.jpg`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  
                  // URL 해제
                  window.URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Failed to download image:', error)
                  alert(t('common.imageDownloadFailed'))
                }
              }}
              style={{
                position: 'absolute',
                top: isMobile ? '1rem' : '2rem',
                right: isMobile ? '5rem' : '6rem',
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '20px' : '24px',
                lineHeight: '1',
                zIndex: 10001
              }}
              aria-label={t('common.download')}
            >
              ⬇
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

