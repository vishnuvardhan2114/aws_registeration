"use client";

import { Button } from '@/app/components/ui/button';
import { CheckCircle, CreditCard, Loader2, Shield, Sparkles } from 'lucide-react';

interface PaymentConfirmationProps {
  eventName: string;
  amount: number;
  onPaymentClick: () => void;
  isRazorpayLoading: boolean;
  isRegistrationOpen: boolean;
  isLoading?: boolean;
}

export default function PaymentConfirmation({
  eventName,
  amount,
  onPaymentClick,
  isRazorpayLoading,
  isRegistrationOpen,
  isLoading = false
}: PaymentConfirmationProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Success Header */}
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Registration Complete!
          </h2>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            You&apos;re all set for <span className="font-medium text-slate-900">{eventName}</span>. 
            Complete your payment to secure your spot.
          </p>

          {/* Event Details */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-slate-500 mb-1">Event Fee</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(amount)}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-slate-600">
            <Shield className="w-4 h-4" />
            <span>Secure payment powered by Razorpay</span>
          </div>

          {/* Payment Button */}
          <Button
            onClick={onPaymentClick}
            disabled={!isRegistrationOpen || isRazorpayLoading || isLoading}
            className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isRazorpayLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading Payment...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <span>Pay {formatCurrency(amount)}</span>
              </div>
            )}
          </Button>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              Your payment is processed securely. You&apos;ll receive a confirmation email 
              and receipt after successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
