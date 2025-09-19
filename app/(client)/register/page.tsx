"use client"

import React from 'react'
import RegistrationForm from '@/app/components/RegistrationForm'
import type { RegistrationSubmissionData } from '@/lib/types/registration'

const RegistrationPage = () => {
  const handleRegistrationSubmit = (data: RegistrationSubmissionData) => {
    console.log('Registration submitted:', data)
    console.log(`Student age: ${data.age} years`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <RegistrationForm onSubmit={handleRegistrationSubmit} />
      </div>
    </div>
  )
}

export default RegistrationPage