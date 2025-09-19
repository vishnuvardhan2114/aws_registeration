'use client'

import React from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/app/components/ui/sidebar'
import AdminSidebar from '@/app/components/AdminSidebar'
import { Toaster } from '@/app/components/ui/sonner'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

export default AdminLayout