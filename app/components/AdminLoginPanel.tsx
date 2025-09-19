'use client'

import React, { forwardRef } from 'react'
import { Lock } from 'lucide-react'

interface AdminLoginPanelProps {
  className?: string
}

const AdminLoginPanel = forwardRef<HTMLDivElement, AdminLoginPanelProps>(
  ({ className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" />
        <div className="relative z-10 w-full h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-xl text-blue-100 max-w-md mx-auto">
                Access your admin dashboard with secure authentication
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-20 left-20 w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/5 rounded-full blur-lg" />
          </div>
        </div>
      </div>
    )
  }
)

AdminLoginPanel.displayName = 'AdminLoginPanel'

export default AdminLoginPanel
