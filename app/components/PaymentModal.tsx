"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Checkbox } from '@/app/components/ui/checkbox';
import { ReceiptUpload } from './ReceiptUpload';
import { CreditCard, Smartphone, Banknote, AlertTriangle } from 'lucide-react';
import { RegisteredUser, PaymentData } from './RegisteredUsersTable';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegisteredUser;
  onSubmit: (paymentData: PaymentData) => void;
}

type PaymentMethod = 'upi' | 'cash' | 'exception';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isException, setIsException] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method !== 'upi') {
      setReceiptFile(null);
      setCurrentStep(1);
    }
    // For UPI, stay on step 1 and let user click Next to proceed
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setReceiptFile(null);
  };

  const handleSubmit = async () => {
    if (!selectedMethod) return;

    setIsSubmitting(true);
    
    try {
      const paymentData: PaymentData = {
        method: selectedMethod,
        receipt: receiptFile || undefined,
        isException: selectedMethod === 'exception' ? isException : undefined
      };

      await onSubmit(paymentData);
      
      // Reset form
      setSelectedMethod(null);
      setReceiptFile(null);
      setIsException(false);
    } catch (error) {
      console.error('Payment submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setReceiptFile(null);
    setIsException(false);
    setCurrentStep(1);
    onClose();
  };

  const paymentMethods = [
    {
      id: 'upi' as const,
      title: 'UPI Payment',
      description: 'Pay via UPI (Google Pay, PhonePe, Paytm)',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'cash' as const,
      title: 'Cash Payment',
      description: 'Pay in cash at the venue',
      icon: Banknote,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'exception' as const,
      title: 'Exception',
      description: 'Mark as exception with reason',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const canSubmit = selectedMethod && 
    (selectedMethod !== 'upi' || receiptFile) &&
    (selectedMethod !== 'exception' || isException);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment for {user.name}
          </DialogTitle>
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            )}>
              1
            </div>
            <div className={cn(
              "flex-1 h-1 rounded",
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            )} />
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            )}>
              2
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <span className="text-sm text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Contact:</span>
                  <span className="text-sm text-gray-900">{user.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Batch Year:</span>
                  <span className="text-sm text-gray-900">{user.batchYear}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Payment Method Selection */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Select Payment Method</h3>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <Card
                    key={method.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      isSelected 
                        ? `${method.bgColor} ${method.borderColor} border-2` 
                        : "border border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          isSelected ? method.bgColor : "bg-gray-100"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            isSelected ? method.color : "text-gray-600"
                          )} />
                        </div>
                        <div className="flex-1">
                          <h4 className={cn(
                            "font-medium",
                            isSelected ? method.color : "text-gray-900"
                          )}>
                            {method.title}
                          </h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {isSelected && (
                          <div className={cn("w-4 h-4 rounded-full", method.bgColor)}>
                            <div className={cn("w-2 h-2 rounded-full mx-auto mt-1", method.color.replace('text-', 'bg-'))} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Step 2: UPI Receipt Upload */}
          {currentStep === 2 && selectedMethod === 'upi' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToStep1}
                  className="p-1"
                >
                  ← Back
                </Button>
                <h3 className="text-sm font-medium text-gray-900">Upload Payment Receipt</h3>
              </div>
              <ReceiptUpload
                onFileSelect={setReceiptFile}
                selectedFile={receiptFile}
              />
            </div>
          )}

          {/* Exception Checkbox (Step 1) */}
          {currentStep === 1 && selectedMethod === 'exception' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exception"
                  checked={isException}
                  onCheckedChange={(checked) => setIsException(checked as boolean)}
                />
                <label
                  htmlFor="exception"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm this is an exception case
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Please ensure you have proper documentation for this exception.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            {currentStep === 1 && selectedMethod === 'upi' ? (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedMethod}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
