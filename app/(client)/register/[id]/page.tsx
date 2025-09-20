/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import RegistrationForm from '@/app/components/RegistrationForm';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader
} from '@/app/components/ui/card';
import {
  Skeleton
} from '@/app/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import type { RegistrationFormData } from '@/lib/types/registration';
import { useAction, useMutation, useQuery } from 'convex/react';
import {
  ArrowLeft
} from 'lucide-react';
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

  const event = useQuery(api.events.getEvent, { eventId });
  const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl);
  const addOrUpdateStudent = useMutation(api.students.addOrUpdateStudent);
  const createRazorpayOrder = useAction(api.payments.createRazorpayOrder);
  const createTransactions = useAction(api.payments.createTransaction);
  const createToken = useMutation(api.tokens.addToken);

  const isLoading = event === undefined;

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
      const transactionId = await createTransactions({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        eventId,
        signature: response.razorpay_signature,
      });
      console.log("Transaction ID:--", transactionId);

      if (!transactionId) {
        throw new Error("Failed to create transaction");
      }

      toast.success("Payment successful! You have been registered for the event.")

      console.log({
        transactionId,
        eventId,
        studentId,
        isUsed: false,
      }, 'token details');

      // Generate token and redirect
      if (!studentId) {
        throw new Error("Student ID not found");
      }
      
      const tokenId = await createToken({
        transactionId,
        eventId,
        studentId,
        isUsed: false,
      });

      console.log(tokenId)





      if (tokenId) {
        toast.success("Token generated successfully! Please check your email for the token details.");
        router.push(`/register/receipt/?token=${tokenId}`);
      }
    } catch (error) {
      console.error("Transaction creation error:", error);
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

    try {
      const orderData = await createRazorpayOrder({ eventId });
      if (!orderData?.id) {
        throw new Error("Failed to create payment order");
      }

      const razorpayOptions = {
        key: razorpayKeyId,
        amount: event.amount * 100,
        currency: "INR",
        name: "Event Registration System",
        description: `Registration for ${event.name}`,
        order_id: orderData.id,
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#2563eb" },
        handler: (response: any) =>
          handlePaymentSuccess(response),
        modal: { ondismiss: handleModalDismiss },
      };

      // ✅ Step 4: Initialize and open Razorpay
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.on("payment.failed", handlePaymentFailure);
      rzp.open();

    } catch (error) {
      console.error("Payment initialization error:", error);
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
      dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
      imageStorageId: storageId,
      batchYear: data.batch,
    };

    try {
      const studentId = await addOrUpdateStudent(formatedData);
      setStudentId(studentId);
      setRegistrationCompleted(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8 ">
          <div className=" mx-auto">
            <div className="">
              {/* Registration Form Skeleton */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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

  const eventStatus = getEventStatus(event.StartDate, event.EndDate);
  const isRegistrationOpen = eventStatus.status !== 'ended';

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 ">
        <div className="">
          {registrationCompleted && studentId ? (
            <Card className="text-center py-12">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Registration Successful!</h3>
                <p className="text-gray-600 mb-6">
                  Your registration has been completed. Please proceed to payment to confirm your spot.
                </p>
                <Button
                  onClick={handlePayment}
                  disabled={!isRegistrationOpen || !razorpayLoaded}
                  className="w-full max-w-md mx-auto"
                  size="lg"
                >
                  {!razorpayLoaded ? "Loading Payment..." : `Pay ₹${event.amount}`}
                </Button>
              </CardHeader>
            </Card>
          ) : (
            <RegistrationForm
              onSubmit={handleRegistrationSubmit}
              disabled={!isRegistrationOpen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;
