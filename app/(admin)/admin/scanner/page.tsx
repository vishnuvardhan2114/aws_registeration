"use client";

import Scanner from "@/app/components/BarcodeScanner";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const ScannerPage = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after authentication
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterAuth', currentPath);
      
      // Redirect to admin login page
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render scanner if authenticated
  return (
    <div className='flex items-center justify-center h-screen'>
      <Scanner />
    </div>
  );
};

export default ScannerPage;