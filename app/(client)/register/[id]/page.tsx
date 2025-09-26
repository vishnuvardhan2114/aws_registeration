/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import RegistrationConfirmation from '@/app/components/RegistrationConfirmation';
import RegistrationForm from '@/app/components/RegistrationForm';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent
} from '@/app/components/ui/card';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import type { RegistrationFormData, RegistrationFormInitialValues } from '@/lib/types/registration';
import { useAction, useMutation, useQuery } from 'convex/react';
import {
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const EventRegistrationPage = () => {
  const params = useParams();
  const eventId = params.id as Id<"events">;
  const router = useRouter();

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [studentId, setStudentId] = useState<Id<"students"> | null>(null);
  const [isNavigatingToReceipt, setIsNavigatingToReceipt] = useState(false);
  const [savedFormData, setSavedFormData] = useState<RegistrationFormInitialValues | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const event = useQuery(api.events.getEvent, { eventId });
  const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl);
  const addOrUpdateStudent = useMutation(api.students.addOrUpdateStudent);
  const createRazorpayOrder = useAction(api.payments.createRazorpayOrder);
  const createTransactions = useAction(api.payments.createTransaction);
  const createToken = useMutation(api.tokens.addToken);
  const sendReceiptEmail = useAction(api.email.sendReceiptEmail)

  const isLoading = event === undefined;

  // Load saved form data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('studentRegistrationData');
      if (savedData) {
        const parsedData = JSON.parse(savedData) as RegistrationFormInitialValues;
        setSavedFormData(parsedData);
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
      // Clear corrupted data
      localStorage.removeItem('studentRegistrationData');
    }
  }, []);

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setRazorpayLoaded(true));
      existingScript.addEventListener('error', () => {
        console.error("Failed to load Razorpay SDK");
        toast.error("Payment system failed to load. Please refresh the page.");
      });
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      toast.error("Payment system failed to load. Please refresh the page.");
      setRazorpayLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      const scriptToRemove = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (scriptToRemove && scriptToRemove === script) {
        document.head.removeChild(scriptToRemove);
      }
      // Restore body scroll when component unmounts
      document.body.classList.remove('razorpay-modal-open');
    };
  }, []);

  const storeFile = async (file: File): Promise<Id<"_storage"> | undefined> => {
    try {
      // Validate file before upload
      if (!file || file.size === 0) {
        throw new Error("Invalid file provided");
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size exceeds 5MB limit");
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG and PNG images are allowed");
      }

      const postUrl = await generateUploadStorageUrl();

      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.storageId) {
        throw new Error("No storage ID returned from upload");
      }

      return result.storageId;
    } catch (error) {
      console.error("File upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
      toast.error(`File upload failed: ${errorMessage}`);
      return undefined;
    }
  };


  const handlePaymentSuccess = async (
    response: any,
  ): Promise<void> => {
    try {
      // Set loading state immediately for better UX
      setIsNavigatingToReceipt(true);

      // Show immediate success message
      toast.success("Payment successful! Processing your registration...");

      // Set a timeout fallback to ensure redirect happens
      const redirectTimeout = setTimeout(() => {
        console.warn("Payment processing timeout - redirecting anyway");
        router.push(`/register/receipt/?paymentId=${response.razorpay_payment_id}`);
      }, 10000); // 10 second timeout

      try {
        // Create transaction
        const transactionId = await createTransactions({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          eventId,
          signature: response.razorpay_signature,
        });

        if (!transactionId) {
          throw new Error("Failed to create transaction");
        }

        if (!studentId) {
          throw new Error("Student ID not found");
        }

        // Create token
        const finalTokenResult = await createToken({
          transactionId,
          eventId,
          studentId,
          isUsed: false,
        });

        // Send receipt email
        if (finalTokenResult && studentId) {
          try {
            const emailResult = await sendReceiptEmail({
              email: "", // Will be fetched from database in the action
              studentName: "", // Will be fetched from database in the action
              eventName: event.name,
              transactionId,
            });

            if (emailResult.success) {
              console.log("Email sent successfully:", emailResult.message);
            } else {
              console.error("Email sending failed:", emailResult.message);
              toast.error(`Payment successful but email failed: ${emailResult.message}`);
            }
          } catch (emailError) {
            console.error("Email sending error:", emailError);
            toast.error("Payment successful but email could not be sent. Please contact support.");
          }
        } else {
          console.warn("Email not sent - missing data:", {
            hasTokenResult: !!finalTokenResult,
            hasStudentId: !!studentId
          });
        }

        // Clear timeout since we succeeded
        clearTimeout(redirectTimeout);

        if (finalTokenResult?.tokenId) {
          // Clear saved form data after successful payment
          localStorage.removeItem('studentRegistrationData');

          // Navigate to receipt page immediately
          router.push(`/register/receipt/?token=${finalTokenResult.tokenId}`);
        } else {
          throw new Error("Failed to create token - no tokenId returned");
        }
      } catch (processingError) {
        // Clear timeout on error
        clearTimeout(redirectTimeout);
        throw processingError;
      }
    } catch (error) {
      // Reset loading state on error
      setIsNavigatingToReceipt(false);

      console.error("Payment success processing error:", error);
      toast.error(
        `Payment successful but registration failed. Please contact support with payment ID: ${response.razorpay_payment_id}`
      );
    }
  };

  const handlePaymentFailure = (error: any): void => {
    console.error("Payment failed:", error);
    toast.error("Payment failed. Please try again or use a different payment method.");
  };

  const handleModalDismiss = (): void => {
    // Optional: Handle modal dismissal
  };


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePayment = async (): Promise<void> => {
    if (!event) {
      toast.error("Event not found. Please refresh the page and try again.");
      return;
    }

    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please wait a moment and try again.");
      return;
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKeyId) {
      toast.error("Payment configuration error. Please contact support.");
      console.error("Razorpay key ID not configured");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderData = await createRazorpayOrder({ eventId });

      if (!orderData?.id) {
        throw new Error("Failed to create payment order - no order ID returned");
      }

      const razorpayOptions = {
        key: razorpayKeyId,
        amount: event.amount * 100,
        currency: "INR",
        name: "SGA Registration",
        description: `Registration for ${event.name}`,
        order_id: orderData.id,
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#2563eb" },
        // Fix touch and scroll issues
        readonly: {
          email: false,
          contact: false,
          name: false,
        },
        // Improve mobile experience
        image: 'https://registration.stgermainalumni.com/_next/image?url=%2FSGA.webp&w=1080&q=75',
        // Disable auto-focus to prevent scroll issues
        auto_focus: false,
        handler: (response: any) => {
          setIsProcessingPayment(false);
          // Handle payment success immediately
          handlePaymentSuccess(response);
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            handleModalDismiss();
          },
          escape: true,
          backdropclose: true,
        },
      };

      // Initialize and open Razorpay
      const rzp = new window.Razorpay(razorpayOptions);

      // Prevent body scroll when modal opens
      document.body.classList.add('razorpay-modal-open');

      // Listen for modal close to restore scroll
      const originalOndismiss = razorpayOptions.modal.ondismiss;
      razorpayOptions.modal.ondismiss = () => {
        document.body.classList.remove('razorpay-modal-open');
        if (originalOndismiss) originalOndismiss();
      };

      rzp.on("payment.failed", (error: any) => {
        setIsProcessingPayment(false);
        document.body.classList.remove('razorpay-modal-open');
        handlePaymentFailure(error);
      });
      rzp.open();

    } catch (error) {
      setIsProcessingPayment(false);
      const errorMessage =
        error instanceof Error
          ? `Payment error: ${error.message}`
          : "Failed to initialize payment. Please try again.";
      toast.error(errorMessage);
    }
  };


  const handleRegistrationSubmit = async (data: RegistrationFormData) => {
    if (!event) {
      toast.error("Event not found");
      return;
    }

    // Get the storage id after uploading the file to convex storage
    let storageId: undefined | Id<"_storage"> = undefined;
    if (data.image) {
      storageId = await storeFile(data.image);
    }

    const formatedData = {
      name: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: `${data.dateOfBirth.getFullYear()}-${String(data.dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(data.dateOfBirth.getDate()).padStart(2, '0')}`,
      imageStorageId: storageId,
      batchYear: data.batch,
    };

    try {
      const studentId = await addOrUpdateStudent(formatedData);
      setStudentId(studentId);
      setRegistrationCompleted(true);

      // Save student data to local storage for auto-fill
      const studentDataForStorage = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: `${data.dateOfBirth.getFullYear()}-${String(data.dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(data.dateOfBirth.getDate()).padStart(2, '0')}`,
        batch: data.batch,
        // Note: We don't store the image file in localStorage as it's too large
        // The image will need to be re-uploaded if the user returns
      };

      localStorage.setItem('studentRegistrationData', JSON.stringify(studentDataForStorage));

      toast.success("Registration successful! Please proceed to payment.");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };


  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: 'upcoming', label: 'Upcoming', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
    } else if (now >= start && now <= end) {
      return { status: 'active', label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
    } else {
      return { status: 'ended', label: 'Ended', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' };
    }
  };

  const clearSavedFormData = () => {
    localStorage.removeItem('studentRegistrationData');
    setSavedFormData(null);
    toast.success("Form data cleared. You can now fill in new information.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center mx-auto">
        <Loader2 className='animate-spin' /> Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className=" mx-auto text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/register">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full page loader while navigating to receipt
  if (isNavigatingToReceipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 mb-3">
            Payment Successful!
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Your registration is being processed. Redirecting to your receipt...
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus(event.StartDate, event.EndDate);
  const isRegistrationOpen = eventStatus.status !== 'ended';

  return (
    <div className="min-h-screen">
      {/* Logo Header */}
      <div className="w-full px-4 pt-4 lg:py-4">
        <div className="flex justify-center lg:justify-start">
          <Link href="/register" className="inline-block">
            <Image
              src="/SGA.webp"
              alt="SGA Logo"
              width={500}
              height={500}
              className="h-20 w-auto object-contain lg:h-16"
              priority
            />
          </Link>
        </div>
      </div>

      <div className="container mx-auto pb-8 ">
        <div className="">
          {registrationCompleted && studentId ? (
            // <PaymentConfirmation
            //     eventName={event.name}
            //     amount={event.amount}
            //     onPaymentClick={handlePayment}
            //     isRazorpayLoading={!razorpayLoaded}
            //     isRegistrationOpen={isRegistrationOpen}
            //     isLoading={isProcessingPayment}
            // /> 
            <RegistrationConfirmation />

          ) : (
            <div>
              {savedFormData && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Form Auto-Filled</h4>
                        <p className="text-sm text-blue-700">Your previous registration data has been loaded. You can edit or clear it.</p>
                      </div>
                    </div>
                    <button
                      onClick={clearSavedFormData}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              <RegistrationForm
                onSubmit={handleRegistrationSubmit}
                disabled={!isRegistrationOpen}
                initialValues={savedFormData || undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;
