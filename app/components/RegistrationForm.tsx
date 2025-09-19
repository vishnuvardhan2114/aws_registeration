"use client"

import { Button } from '@/app/components/ui/button'
import { Calendar as CalendarComponent } from '@/app/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/components/ui/form'
import { Input } from '@/app/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, CalendarIcon, GraduationCap, Mail, Phone, Upload, User, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

// Types and validators
import { useImageUpload } from '@/lib/hooks/useImageUpload'
import type { RegistrationFormData, RegistrationFormProps } from '@/lib/types/registration'
import { calculateAge, formatDateForDisplay } from '@/lib/utils/date'
import { batchYears, registrationSchema } from '@/lib/validators/registration'

export default function RegistrationForm({
  onSubmit,
  isLoading = false,
  className
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { imageState, handleImageUpload: handleImageState, removeImage } = useImageUpload()

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: undefined,
      batch: undefined,
      email: '',
      phoneNumber: '',
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
          Student Registration
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Complete your registration to participate
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
                        disabled={isLoading || isSubmitting}
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
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </FormLabel>
                    <div className="space-y-4">
                      {!imageState.preview ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleImageFileUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={isLoading || isSubmitting}
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm text-muted-foreground">
                              <span className="text-primary font-medium">Click to upload</span> or drag and drop
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PNG, JPG up to 5MB
                            </div>
                          </label>
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
                            disabled={isLoading || isSubmitting}
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
                            disabled={isLoading || isSubmitting}
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
                          onSelect={field.onChange}
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
                        disabled={isLoading || isSubmitting}
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
                        disabled={isLoading || isSubmitting}
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
              disabled={isSubmitting || isLoading}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}