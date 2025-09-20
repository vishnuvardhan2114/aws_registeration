'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Calendar,
    Settings,
    LogOut
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
    },
    {
        title: 'Registered Students',
        url: '/admin/register-users',
        icon: Users,
    },
    {
        title: 'Transactions',
        url: '/admin/transactions',
        icon: CreditCard,
    },
    {
        title: 'Manage Events',
        url: '/admin/manage-event',
        icon: Calendar,
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
        <Sidebar variant="inset" className="overflow-hidden">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
                        <Settings className="h-4 w-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                        <span className="truncate font-semibold">Admin Panel</span>
                        <span className="truncate text-xs text-muted-foreground">
                            AWS Registration
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="overflow-x-hidden">
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.url
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.url} className="min-w-0">
                                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={isLoggingOut ? "Logging out..." : "Logout"}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                                    disabled={isLoggingOut || logoutAttempted}
                                >
                                    <div onClick={handleLogout} className="min-w-0 cursor-pointer">
                                        {isLoggingOut ? (
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                        ) : (
                                            <LogOut className="h-4 w-4 flex-shrink-0" />
                                        )}
                                        <span className="truncate">
                                            {isLoggingOut ? "Logging out..." : "Logout"}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="overflow-x-hidden">
                <div className="px-2 py-2 min-w-0">
                    <div className="text-xs text-muted-foreground truncate">
                        AWS Registration
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                        v1.0.0
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AdminSidebar
