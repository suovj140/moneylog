// 다크모드/라이트모드 테마 설정

export const darkTheme = {
  // 배경색
  background: '#1A1A1A',
  surface: '#2D2D2D',
  surfaceLight: '#3A3A3A',
  sidebar: '#000000',
  
  // 텍스트
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textDisabled: '#666666',
  
  // 테마 정보
  isDark: true,
  
  // 강조색 (채도 낮은 붉은 계열)
  primary: '#D84315',  // Deep Orange 800 (톤다운된 붉은색, 지출 색상과 구분)
  primaryHover: '#E64A19',
  primaryLight: '#FF7043',
  
  // 수입/지출
  income: '#4CAF50',
  incomeLight: '#66BB6A',
  expense: '#F44336',
  expenseLight: '#EF5350',
  
  // 상태
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // 테두리
  border: '#404040',
  divider: '#333333',
  
  // 입력 필드
  inputBg: '#262626',
  inputBorder: '#404040',
  inputFocus: '#D84315',
  
  // 그림자
  shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  shadowHover: '0 4px 12px rgba(0, 0, 0, 0.4)',
}

export const lightTheme = {
  // 배경색
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceLight: '#FFFFFF',
  sidebar: '#F5F5F5',
  
  // 텍스트
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  textDisabled: '#ADB5BD',
  
  // 테마 정보
  isDark: false,
  
  // 강조색 (채도 낮은 붉은 계열)
  primary: '#E64A19',  // Deep Orange 700 (톤다운된 붉은색, 지출 색상과 구분)
  primaryHover: '#D84315',
  primaryLight: '#FF7043',
  
  // 수입/지출
  income: '#28A745',
  incomeLight: '#34CE57',
  expense: '#DC3545',
  expenseLight: '#E4606D',
  
  // 상태
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#2196F3',
  
  // 테두리
  border: '#E0E0E0',
  divider: '#F0F0F0',
  
  // 입력 필드
  inputBg: '#FFFFFF',
  inputBorder: '#D0D0D0',
  inputFocus: '#E64A19',
  
  // 그림자
  shadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  shadowHover: '0 4px 12px rgba(0, 0, 0, 0.12)',
}

export type Theme = typeof darkTheme

export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme
}
