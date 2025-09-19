import { useState, useCallback } from 'react'
import { validateImageFile, createImagePreview } from '@/lib/utils/image'
import type { ImageUploadState } from '@/lib/types/registration'

/**
 * Custom hook for handling image upload functionality
 * @returns Image upload state and handlers
 */
export const useImageUpload = () => {
  const [imageState, setImageState] = useState<ImageUploadState>({
    preview: null,
    file: null,
    error: null,
  })

  const handleImageUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setImageState(prev => ({
        ...prev,
        error: validation.error || 'Invalid file',
      }))
      return { success: false, error: validation.error }
    }

    try {
      // Create preview
      const preview = await createImagePreview(file)
      
      setImageState({
        preview,
        file,
        error: null,
      })
      
      return { success: true }
    } catch {
      const errorMessage = 'Failed to process image'
      setImageState(prev => ({
        ...prev,
        error: errorMessage,
      }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const removeImage = useCallback(() => {
    setImageState({
      preview: null,
      file: null,
      error: null,
    })
  }, [])

  const clearError = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  return {
    imageState,
    handleImageUpload,
    removeImage,
    clearError,
  }
}
