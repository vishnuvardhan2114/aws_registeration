'use client'

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import AdminLoginForm from '@/app/components/AdminLoginForm'
import AdminLoginPanel from '@/app/components/AdminLoginPanel'
import AdminMobileHeader from '@/app/components/AdminMobileHeader'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthActions } from "@convex-dev/auth/react";
import { toast, Toaster } from 'sonner'
import { ConvexError } from 'convex/values'
import { Loader2 } from 'lucide-react'

const INVALID_PASSWORD = "invalid password";

const AdminLoginPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [showLoader, setShowLoader] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { signIn } = useAuthActions();

    const containerRef = useRef<HTMLDivElement>(null)
    const leftPanelRef = useRef<HTMLDivElement>(null)
    const rightPanelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // ...animation code...
        }, containerRef)
        return () => ctx.revert()
    }, [])

    // Handle loading parameter from logout
    useEffect(() => {
        if (searchParams.get('loading') === 'true') {
            setShowLoader(true);
            // Remove the loading parameter from URL after showing loader
            const url = new URL(window.location.href);
            url.searchParams.delete('loading');
            router.replace(url.pathname + url.search);
        }
    }, [searchParams, router])

    // Debug logging for production issues
    useEffect(() => {
        console.log('Admin page loaded:', {
            pathname: window.location.pathname,
            search: window.location.search,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
    }, [])

    // Accepts FormData, not a plain object
    const handleLogin = async (formData: FormData) => {
        setIsLoading(true)
        try {
            const data = await signIn("password", formData);
            if (data.signingIn) {
                toast.success("Logged in successfully");
                router.push('/admin/dashboard')
            }
        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "Invalid email or password";
            if (error instanceof ConvexError && error.data === INVALID_PASSWORD) {
                errorMessage = "Invalid password - check the requirements and try again.";
            } else if (error instanceof Error && error.message) {
                if (error.message.includes("InvalidSecret")) {
                    errorMessage = "Incorrect password";
                } else if (error.message.includes("InvalidAccountId")) {
                    errorMessage = "Account not found";
                }
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false)
        }
    }

    // Show loader if logout was triggered
    if (showLoader) {
        return <div className='flex justify-center items-center h-screen'>
            <Loader2 className='animate-spin' /> Loading...
        </div>
    }

    return (
        <>
            <div
                ref={containerRef}
                className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-blue-50"
            >
                <AdminLoginPanel ref={leftPanelRef} />
                <AdminMobileHeader />
                <div
                    ref={rightPanelRef}
                    className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white"
                >
                    <AdminLoginForm onSubmit={handleLogin} isLoading={isLoading} />
                </div>
            </div>
            <Toaster position="top-center" richColors />
        </>
    )
}

export default AdminLoginPage