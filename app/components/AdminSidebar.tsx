'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Calendar,
    LogOut,
    ChevronRight,
    Settings
} from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/app/components/ui/sidebar'
import { useAuthActions } from '@convex-dev/auth/react'
import { toast } from 'sonner'

const navigationItems = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'Overview & Analytics'
    },
    {
        title: 'Students',
        url: '/admin/register-users',
        icon: Users,
        description: 'Manage Registrations'
    },
    {
        title: 'Transactions',
        url: '/admin/transactions',
        icon: CreditCard,
        description: 'Payment History'
    },
    {
        title: 'Events',
        url: '/admin/manage-event',
        icon: Calendar,
        description: 'Event Management'
    },
]

const AdminSidebar: React.FC = () => {
    const pathname = usePathname()
    const { signOut } = useAuthActions();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutAttempted, setLogoutAttempted] = useState(false);

    const handleLogout = async () => {
        // Prevent multiple logout attempts
        if (logoutAttempted || isLoggingOut) {
            return;
        }
        
        setLogoutAttempted(true);
        setIsLoggingOut(true);
        toast.info("Logging out...");
        
        try {
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Logout timeout')), 5000)
            );
            
            await Promise.race([
                signOut(),
                timeoutPromise
            ]);
            
            toast.success("Logged out successfully");
        } catch (error) {
            console.error('Logout error:', error);
            toast.warning("Logout timeout, forcing redirect...");
            
            // Fallback: Clear any local storage and force redirect
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (storageError) {
                console.error('Storage clear error:', storageError);
            }
        } finally {
            // Always redirect after logout attempt
            setTimeout(() => {
                router.push('/admin?loading=true');
                setIsLoggingOut(false);
                setLogoutAttempted(false);
            }, 500);
        }
    }
    return (
        <Sidebar variant="inset" className="overflow-hidden border-r border-slate-200/60 bg-white">
            <SidebarHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3 px-4 py-4 min-w-0">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 flex-shrink-0">
                        <Image
                            src="/SGA.webp"
                            alt="SGA Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain rounded-lg"
                            priority
                        />
                    </div>
                    <div className="grid flex-1 text-left leading-tight min-w-0">
                        <span className="truncate font-semibold text-slate-900 text-base">
                            Admin Panel
                        </span>
                        <span className="truncate text-sm text-slate-600 font-medium">
                            Event Registration
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="overflow-x-hidden overflow-y-auto scrollbar-hide px-3 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 mb-4 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={`${item.title} - ${item.description}`}
                                            className={`
                                                group my-1 relative flex items-center gap-4 rounded-xl px-4 py-6 text-sm font-medium transition-all duration-300 ease-in-out
                                                ${isActive 
                                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-md shadow-blue-100/50' 
                                                    : 'text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-900 hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            <Link href={item.url} className="flex items-center py-4 px-4 gap-4 w-full min-w-0">
                                                <div className={`
                                                    flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0
                                                    ${isActive 
                                                        ? 'bg-blue-200 text-blue-700 shadow-sm' 
                                                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300 group-hover:text-slate-700 group-hover:shadow-sm'
                                                    }
                                                `}>
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="truncate font-medium text-sm">{item.title}</span>
                                                    <div className="text-xs text-slate-500 truncate mt-0.5">
                                                        {item.description}
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <div className="flex-shrink-0">
                                                        <ChevronRight className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="my-6" />

                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 mb-4 text-xs font-bold text-slate-600 uppercase tracking-widest">
                        Account
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={isLoggingOut ? "Logging out..." : "Sign out of your account"}
                                    className={`
                                        group relative flex items-center gap-4 rounded-xl px-4 py-6 text-sm font-medium transition-all duration-300 ease-in-out
                                        text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                                        ${isLoggingOut ? 'bg-gradient-to-r from-red-50 to-red-100' : ''}
                                    `}
                                    disabled={isLoggingOut || logoutAttempted}
                                >
                                    <div onClick={handleLogout} className="flex items-center gap-4 w-full min-w-0 cursor-pointer">
                                        <div className={`
                                            flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0
                                            ${isLoggingOut 
                                                ? 'bg-red-200 text-red-700 shadow-sm' 
                                                : 'bg-red-200 text-red-600 group-hover:bg-red-300 group-hover:shadow-sm'
                                            }
                                        `}>
                                            {isLoggingOut ? (
                                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <LogOut className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="truncate font-medium text-sm">
                                                {isLoggingOut ? "Signing out..." : "Sign Out"}
                                            </span>
                                            <div className="text-xs text-red-500 truncate mt-0.5">
                                                End your session
                                            </div>
                                        </div>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

                <SidebarFooter className="border-t border-slate-200/60 bg-slate-50/50">
                    <div className="px-4 py-3 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium text-slate-700">
                                System Online
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                            Event Registration System
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                            v1.0.0 • Admin Panel
                        </div>
                    </div>
                </SidebarFooter>
        </Sidebar>
    )
}

export default AdminSidebar
