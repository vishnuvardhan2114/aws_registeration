'use client'

import React from 'react'
import { Lock } from 'lucide-react'

const AdminMobileHeader: React.FC = () => {
  return (
    <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
      <p className="text-blue-100">Secure access to your dashboard</p>
    </div>
  )
}

export default AdminMobileHeader
