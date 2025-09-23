/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { 
  Heart, 
  CreditCard, 
  Loader2,
  Info,
  BookOpen,
  Calendar,
  Building,
  MoreHorizontal
} from 'lucide-react';
import { DonationFormData } from '@/lib/types/donation';
import { validateDonationForm } from '@/lib/validators/donation';

interface DonationFormProps {
  prefillData?: {
    donorName?: string;
    donorEmail?: string;
    donorPhone?: string;
  };
  onSuccess?: (donationId: Id<"donations">) => void;
  onCancel?: () => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ 
  prefillData, 
  onSuccess, 
  onCancel 
}) => {
  const router = useRouter();
  
  // State management
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: prefillData?.donorName || '',
    donorEmail: prefillData?.donorEmail || '',
    donorPhone: prefillData?.donorPhone || '',
    amount: 0,
    categoryId: '',
    customPurpose: '',
    isAnonymous: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showCustomPurpose, setShowCustomPurpose] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Convex queries and mutations
  const categories = useQuery(api.donationCategories.getCategoriesForDonation);
  
  // Find the "Others" category
  const othersCategory = categories?.find(cat => cat.name === "Others");
  const createDonation = useMutation(api.donations.createDonation);
  const createRazorpayOrder = useAction(api.donationPayments.createDonationRazorpayOrder);
  const processPayment = useAction(api.donationPayments.processDonationPayment);
  const sendThankYouEmail = useAction(api.donationEmail.sendDonationThankYouEmail);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay().then((loaded) => {
      setRazorpayLoaded(!!loaded);
    });
  }, []);

  // Category icons mapping
  const categoryIcons: Record<string, React.ComponentType<any>> = {
    'General Donation': Heart,
    'Education Support': BookOpen,
    'Event Sponsorship': Calendar,
    'Infrastructure': Building,
    'Others': MoreHorizontal,
  };

  // Handle form input changes
  const handleInputChange = (field: keyof DonationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setFormData(prev => ({ ...prev, categoryId: category._id }));
    setShowCustomPurpose(category.isDefault);
    setErrors(prev => ({ ...prev, categoryId: '' }));
  };

  // Handle "Others" category selection
  const handleOthersCategorySelect = () => {
    setSelectedCategory(othersCategory);
    setFormData(prev => ({ ...prev, categoryId: othersCategory?._id || 'others' }));
    setShowCustomPurpose(true);
    setErrors(prev => ({ ...prev, categoryId: '' }));
  };

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const validation = validateDonationForm(formData);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!razorpayLoaded) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create donation record
      const donationId = await createDonation({
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        amount: formData.amount,
        categoryId: (formData.categoryId === 'others' || formData.categoryId === othersCategory?._id) ? othersCategory?._id : formData.categoryId as Id<"donationCategories">,
        customPurpose: (formData.categoryId === 'others' || formData.categoryId === othersCategory?._id) ? formData.customPurpose : undefined,
        isAnonymous: formData.isAnonymous,
        ipAddress: '', // Will be filled by server
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });

      // Create Razorpay order
      const order = await createRazorpayOrder({
        donationId,
        amount: formData.amount,
      });

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SGA Donations',
        description: `Donation for ${selectedCategory?.name || 'General Donation'}`,
        order_id: order.id,
        prefill: {
          name: formData.donorName,
          email: formData.donorEmail,
          contact: formData.donorPhone || '',
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            toast.info("Payment cancelled");
          },
          escape: true,
          backdropclose: true,
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 900,
        remember_customer: false,
        handler: async (response: any) => {
          try {
            setIsProcessingPayment(true);
            
            // Process payment
            const result = await processPayment({
              donationId,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });

            if (result.success) {
              // Send thank you email
              await sendThankYouEmail({ donationId });
              
              toast.success("Donation successful! Thank you for your generosity.");
              
              if (onSuccess) {
                onSuccess(donationId);
              } else {
                router.push(`/donate/receipt?donationId=${donationId}`);
              }
            } else {
              throw new Error(result.message || 'Payment processing failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            toast.error("Payment processing failed. Please try again.");
            setIsProcessingPayment(false);
          }
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Donation creation error:', error);
      toast.error("Failed to create donation. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Predefined amount options
  const amountOptions = [100, 500, 1000, 2000, 5000, 10000];

  if (!categories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading donation categories...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Donor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
            <div className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor="donorName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="donorName"
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => handleInputChange('donorName', e.target.value)}
                  className={`h-12 ${errors.donorName ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Enter your full name"
                />
                {errors.donorName && (
                  <p className="text-red-500 text-sm mt-1">{errors.donorName}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor="donorEmail" className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                  className={`h-12 ${errors.donorEmail ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Enter your email"
                />
                {errors.donorEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.donorEmail}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor="donorPhone" className="text-sm font-medium text-gray-700">Phone Number (Optional)</Label>
                <Input
                  id="donorPhone"
                  type="tel"
                  value={formData.donorPhone}
                  onChange={(e) => handleInputChange('donorPhone', e.target.value)}
                  className={`h-12 ${errors.donorPhone ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Enter your phone number"
                />
                {errors.donorPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.donorPhone}</p>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isAnonymous" className="text-sm text-gray-600 cursor-pointer">
                  Make this donation anonymous
                </Label>
              </div>
            </div>
          </div>

          {/* Donation Category - Chip Style */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Choose a Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.name] || Heart;
                const isSelected = selectedCategory?._id === category._id;
                
                return (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent 
                      className="h-4 w-4" 
                      style={{ color: isSelected ? '#10b981' : category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                    {category.isPopular && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                        Popular
                      </Badge>
                    )}
                  </button>
                );
              })}
              
              {/* Others Category */}
              <button
                type="button"
                onClick={() => handleOthersCategorySelect()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  showCustomPurpose
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <MoreHorizontal 
                  className="h-4 w-4" 
                  style={{ color: showCustomPurpose ? '#10b981' : '#6b7280' }}
                />
                <span className="text-sm font-medium">Others</span>
              </button>
            </div>
            
            {errors.categoryId && (
              <p className="text-red-500 text-sm">{errors.categoryId}</p>
            )}

            {showCustomPurpose && (
              <div className='space-y-2'>
                <Label htmlFor="customPurpose" className="text-sm font-medium text-gray-700">
                  {formData.categoryId === 'others' ? 'Please specify your donation purpose *' : 'Please specify the purpose *'}
                </Label>
                <Textarea
                  id="customPurpose"
                  value={formData.customPurpose}
                  onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                  className={`min-h-[100px] ${errors.customPurpose ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder={formData.categoryId === 'others' ? 'Describe what you would like to support...' : 'Please describe the purpose of your donation...'}
                  rows={3}
                />
                {errors.customPurpose && (
                  <p className="text-red-500 text-sm mt-1">{errors.customPurpose}</p>
                )}
              </div>
            )}
          </div>

          {/* Donation Amount */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Donation Amount</h3>
            <div className="grid grid-cols-3 gap-3">
              {amountOptions.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={formData.amount === amount ? "default" : "outline"}
                  onClick={() => handleAmountSelect(amount)}
                  className={`h-12 font-medium ${
                    formData.amount === amount 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>

            <div className='space-y-2'>
              <Label htmlFor="customAmount" className="text-sm font-medium text-gray-700">Or enter custom amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <Input
                  id="customAmount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => handleAmountSelect(Number(e.target.value))}
                  className={`h-12 pl-8 ${errors.amount ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="Enter amount"
                  min="1"
                  max="1000000"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {!razorpayLoaded && (
            <div className="text-center text-sm text-gray-500 py-4">
              <Info className="h-4 w-4 inline mr-1" />
              Loading payment system...
            </div>
          )}
        </div>

        {/* Fixed Bottom Button */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
          <Button
            type="submit"
            disabled={isSubmitting || !razorpayLoaded || !formData.amount || !formData.categoryId || ((formData.categoryId === 'others' || formData.categoryId === othersCategory?._id) && !formData.customPurpose)}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Donate Now
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Payment Processing Loader */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Your Donation
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we process your payment and send you a receipt...
            </p>
          </div>
        </div>
      )}

      {/* Razorpay Modal Styles */}
      <style jsx global>{`
        .razorpay-checkout-frame {
          z-index: 9999 !important;
        }
        .razorpay-checkout-modal {
          z-index: 9999 !important;
        }
        .razorpay-checkout-overlay {
          z-index: 9998 !important;
        }
      `}</style>
    </div>
  );
};

export default DonationForm;
