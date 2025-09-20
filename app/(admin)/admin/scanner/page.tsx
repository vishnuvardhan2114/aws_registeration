"use client";

import React, { useState, useEffect } from 'react';
import Scanner from "@/app/components/BarcodeScanner";
import ScannerLoginForm from "@/app/components/ScannerLoginForm";
import { Button } from "@/app/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

const ScannerPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem('scanner_logged_in');
      const email = localStorage.getItem('scanner_user_email');
      
      if (isLoggedIn === 'true' && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = () => {
    const email = localStorage.getItem('scanner_user_email') || '';
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('scanner_logged_in');
    localStorage.removeItem('scanner_user_email');
    localStorage.removeItem('scanner_login_time');
    
    // Reset state
    setIsAuthenticated(false);
    setUserEmail('');
    
    toast.success('Logged out successfully');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <ScannerLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Show scanner with logout option if authenticated
  return (
    <div className="min-h-screen">
      {/* Header with logout */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {userEmail}
                </p>
                <p className="text-xs text-slate-500">
                  Scanner Access
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Scanner Component */}
      <Scanner />
    </div>
  );
};

export default ScannerPage;