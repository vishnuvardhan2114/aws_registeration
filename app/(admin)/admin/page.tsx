'use client'

import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import AdminLoginForm from '@/app/components/AdminLoginForm'
import AdminLoginPanel from '@/app/components/AdminLoginPanel'
import AdminMobileHeader from '@/app/components/AdminMobileHeader'
import { useRouter } from 'next/navigation'

const AdminLoginPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    
    const containerRef = useRef<HTMLDivElement>(null)
    const leftPanelRef = useRef<HTMLDivElement>(null)
    const rightPanelRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial setup - hide elements
            gsap.set([leftPanelRef.current, rightPanelRef.current], {
                opacity: 0,
                y: 50
            })

            gsap.set(imageRef.current, {
                scale: 1.1,
                opacity: 0
            })

            const formChildren = rightPanelRef.current?.querySelector('form')?.children
            if (formChildren) {
                gsap.set(formChildren, { 
                    opacity: 0,
                    y: 30 
                })
            }

            // Timeline for entrance animation
            const tl = gsap.timeline()

            tl.to(containerRef.current, {
                duration: 0.5,
                ease: "power2.out"
            })
                .to(leftPanelRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                }, 0.2)
                .to(rightPanelRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                }, 0.4)
                .to(imageRef.current, {
                    scale: 1,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power2.out"
                }, 0.6)
            const formChildrenAnimate = rightPanelRef.current?.querySelector('form')?.children
            if (formChildrenAnimate) {
                tl.to(formChildrenAnimate, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out"
                }, 0.8)
            }

        }, containerRef)

        return () => ctx.revert()
    }, [])

    const handleLogin = async (formData: { email: string; password: string }) => {
        setIsLoading(true)
        
        try {
            // TODO: Implement actual login logic
            console.log('Login attempt:', formData)
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Handle successful login
            router.push('/admin/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
            // Handle login error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-blue-50"
        >
            {/* Left Panel - Image (Hidden on mobile, shown on desktop) */}
            <AdminLoginPanel ref={leftPanelRef} />

            {/* Mobile Header (Only visible on mobile) */}
            <AdminMobileHeader />

            {/* Right Panel - Login Form */}
            <div
                ref={rightPanelRef}
                className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-white"
            >
                <AdminLoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </div>
        </div>
    )
}

export default AdminLoginPage