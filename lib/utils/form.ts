import { format } from 'date-fns'
import type { RegistrationFormData, RegistrationSubmissionData } from '@/lib/types/registration'
import { calculateAge, formatDateForAPI } from '@/lib/utils/date'

/**
 * Transform form data to submission data with calculated age
 * @param formData - The form data
 * @returns Submission data with age and formatted date
 */
export const transformFormDataToSubmission = (formData: RegistrationFormData): RegistrationSubmissionData => {
  const age = calculateAge(formData.dateOfBirth)
  
  return {
    ...formData,
    age,
    dateOfBirth: formatDateForAPI(formData.dateOfBirth),
  }
}

/**
 * Generate batch years array
 * @param startYear - Starting year (default: 2010)
 * @param endYear - Ending year (default: current year)
 * @returns Array of batch years
 */
export const generateBatchYears = (startYear: number = 2010, endYear: number = new Date().getFullYear()): number[] => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse()
}

/**
 * Format form data for logging/debugging
 * @param data - The form data
 * @returns Formatted string for logging
 */
export const formatFormDataForLogging = (data: RegistrationSubmissionData): string => {
  return `
Registration Data:
- Name: ${data.fullName}
- Email: ${data.email}
- Phone: ${data.phoneNumber}
- Date of Birth: ${data.dateOfBirth}
- Age: ${data.age} years
- Batch: ${data.batch}
- Image: ${data.image ? 'Uploaded' : 'Not uploaded'}
  `.trim()
}

/**
 * Validate form completeness
 * @param data - The form data
 * @returns Validation result
 */
export const validateFormCompleteness = (data: Partial<RegistrationFormData>): { isComplete: boolean; missingFields: string[] } => {
  const requiredFields: (keyof RegistrationFormData)[] = ['fullName', 'dateOfBirth', 'batch', 'email', 'phoneNumber']
  const missingFields: string[] = []
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      missingFields.push(field)
    }
  })
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
  }
}
