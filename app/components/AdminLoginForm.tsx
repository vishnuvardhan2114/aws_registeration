'use client'

import React, { useState } from 'react'
import { gsap } from 'gsap'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'

interface AdminLoginFormProps {
  onSubmit: (formData: FormData) => void
  isLoading?: boolean
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    flow: 'signIn'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Animate button (optional)
    const button = e.currentTarget.querySelector('button[type="submit"]')
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      })
    }
    
    // Create FormData with current state values
    const submitFormData = new FormData()
    submitFormData.append('email', formData.email)
    submitFormData.append('password', formData.password)
    submitFormData.append('flow', formData.flow)
    
    console.log('FormData entries:')
    console.log('Email:', formData.email)
    console.log('Password:', formData.password)
    console.log("Flow:", formData.flow)
    
    // Pass FormData to parent
    onSubmit(submitFormData)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    const eyeIcon = document.querySelector('.eye-icon')
    if (eyeIcon) {
      gsap.to(eyeIcon, {
        rotation: showPassword ? 0 : 180,
        duration: 0.3,
        ease: "power2.inOut"
      })
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Login to Dashboard
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Enter your credentials to access the admin panel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 h-12 border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 rounded-lg"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-12 h-12 border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 rounded-lg"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 eye-icon" />
              ) : (
                <Eye className="w-5 h-5 eye-icon" />
              )}
            </button>
          </div>
        </div>

        <Input name="flow" value={formData.flow} type="hidden" />
        {/* Login Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              LOGGING IN...
            </>
          ) : (
            <>
              LOGIN
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

export default AdminLoginForm