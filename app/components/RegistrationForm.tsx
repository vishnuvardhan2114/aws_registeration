"use client"

import { Button } from '@/app/components/ui/button'
import { Calendar as CalendarComponent } from '@/app/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, CalendarIcon, Camera, GraduationCap, Mail, Phone, RotateCcw, Upload, User, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types and validators
import { useImageUpload } from '@/lib/hooks/useImageUpload'
import type { RegistrationFormData, RegistrationFormProps } from '@/lib/types/registration'
import { calculateAge, formatDateForDisplay } from '@/lib/utils/date'
import { batchYears, registrationSchema } from '@/lib/validators/registration'

export default function RegistrationForm({
  onSubmit,
  isLoading = false,
  className,
  disabled = false,
  initialValues,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string>('')
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { imageState, handleImageUpload: handleImageState, removeImage } = useImageUpload()

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      dateOfBirth: initialValues?.dateOfBirth ? new Date(initialValues.dateOfBirth + 'T00:00:00') : undefined,
      batch: initialValues?.batch || undefined,
      email: initialValues?.email || '',
      phoneNumber: initialValues?.phoneNumber || '',
      image: null
    }
  })

  const handleImageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const result = await handleImageState(file)
    if (result.success) {
      form.setValue('image', file)
      form.clearErrors('image')
    } else {
      form.setError('image', { message: result.error || 'Invalid file' })
    }
  }

  const startCamera = async (useFrontCamera = false) => {
    try {
      setCameraError('')
      setIsVideoReady(false)
      setShowCamera(true)
      setIsFrontCamera(useFrontCamera)

      // Small delay to ensure modal is rendered
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: useFrontCamera ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            streamRef.current = stream

            // Ensure video plays
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  setIsVideoReady(true)
                }).catch(console.error)
              }
            }
          }
        } catch (error) {
          console.error('Camera error:', error)
          setCameraError('Unable to access camera. Please check permissions.')
        }
      }, 100)
    } catch (error) {
      console.error('Camera error:', error)
      setCameraError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    setCameraError('')
    setIsVideoReady(false)
  }

  const switchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsVideoReady(false)
    await startCamera(!isFrontCamera)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            const result = await handleImageState(file)
            if (result.success) {
              form.setValue('image', file)
              form.clearErrors('image')
              stopCamera()
            } else {
              form.setError('image', { message: result.error || 'Failed to process photo' })
            }
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const handleSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
          AGM 2025 Registration
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Sunday - Sep 28,2025
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Mobile-first single column, responsive grid on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Full Name */}
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="w-full h-11"
                        disabled={disabled || isLoading || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <div className="lg:col-span-2">
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Photo <span className="text-destructive">*</span>
                    </FormLabel>
                    <div className="space-y-4">
                      {!imageState.preview ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={disabled || isLoading || isSubmitting}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageFileUpload}
                            className="hidden"
                            id="camera-capture"
                            disabled={disabled || isLoading || isSubmitting}
                          />

                          <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-3">
                              <label
                                htmlFor="image-upload"
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                              >
                                <Upload className="h-4 w-4" />
                                Upload Photo
                              </label>
                              <button
                                type="button"
                                onClick={() => startCamera(false)}
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                                disabled={disabled || isLoading || isSubmitting}
                              >
                                <Camera className="h-4 w-4" />
                                Take Photo
                              </button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              All image formats up to 5MB
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          <Image
                            src={imageState.preview}
                            alt="Preview"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                            disabled={disabled || isLoading || isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {imageState.error && (
                        <p className="text-destructive text-sm">{imageState.error}</p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth <span className="text-destructive">*</span>
                      {field.value && (
                        <span className="text-sm text-muted-foreground ml-auto">
                          Age: {calculateAge(field.value)} years
                        </span>
                      )}
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start h-11 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={disabled || isLoading || isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? formatDateForDisplay(field.value) : "Select your date of birth"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Create a new date with local timezone to avoid day shift
                              const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                              field.onChange(localDate);
                            } else {
                              field.onChange(date);
                            }
                          }}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Batch/Year */}
            <div>
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Batch/Year <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                      disabled={isLoading || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select your batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batchYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                        className="w-full h-11"
                        disabled={disabled || isLoading || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone Number */}
            <div>
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                        className="w-full h-11"
                        disabled={disabled || isLoading || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button - Sticky on mobile */}
          <div className="sticky bottom-0 bg-background border-t border-border p-4 -mx-4 sm:-mx-6 lg:mx-0 lg:border-t-0 lg:p-0 lg:static">
            <Button
              type="submit"
              disabled={disabled || isSubmitting || isLoading}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                'Register For Event'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Take Photo</h3>
                <p className="text-sm text-gray-600">
                  {isFrontCamera ? 'Front Camera' : 'Back Camera'}
                </p>
              </div>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{cameraError}</p>
                <button
                  onClick={() => startCamera(isFrontCamera)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    style={{ transform: isFrontCamera ? 'scaleX(-1)' : 'none' }} // Mirror only front camera
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    disabled={!isVideoReady}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVideoReady ? 'Capture Photo' : 'Loading...'}
                  </button>
                  <button
                    onClick={switchCamera}
                    disabled={!isVideoReady}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Switch to ${isFrontCamera ? 'back' : 'front'} camera`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}