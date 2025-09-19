import { format } from 'date-fns'

/**
 * Calculate age from birth date
 * @param birthDate - The birth date
 * @returns The calculated age in years
 */
export const calculateAge = (birthDate: Date): number => {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format date for API submission (YYYY-MM-DD)
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format date for display (e.g., "January 1, 2000")
 * @param date - The date to format
 * @returns Formatted date string for display
 */
export const formatDateForDisplay = (date: Date): string => {
  return format(date, 'PPP')
}

/**
 * Check if date is in the past
 * @param date - The date to check
 * @returns True if date is in the past
 */
export const isDateInPast = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Check if date is valid for birth date (not in future, not too old)
 * @param date - The date to validate
 * @returns True if date is valid for birth date
 */
export const isValidBirthDate = (date: Date): boolean => {
  const today = new Date()
  const minDate = new Date('1900-01-01')
  return date <= today && date >= minDate
}
