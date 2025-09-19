/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import RegistrationForm from '@/app/components/RegistrationForm'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import type { RegistrationFormData } from '@/lib/types/registration'
import { useAction, useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: any;
  }
}


const RegistrationPage = () => {

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl)
  const addOrUpdateStudent = useMutation(api.students.addOrUpdateStudent)
  const createRazorpayOrder = useAction(api.razorpay.createRazorpayOrder);
  const createTransactions = useMutation(api.transactions.addTransaction)
  async function storeFile(
    file: File,
  ): Promise<undefined | Id<"_storage">> {
    try {
      const postUrl = await generateUploadStorageUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Error occurred on StoreDocument Function, error: ", error);
      return undefined;
    }
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);
  }, []);

  const handleRegistrationSubmit = async (data: RegistrationFormData) => {
    //get the storage id after uploading the file to convex storage
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
    }
    try {
      await addOrUpdateStudent(formatedData)
    }
    catch (error) {
      console.log("An error occurred during registration. Please try again.", error)
    }
    toast.success("Registration successful!")
  }

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Razorpay SDK not loaded yet.");
      return;
    }
    setProcessingPayment(true);
    try {
      const eventId = "j57cry93hm1ac0w6b3tdpzk34d7qxzbd" as Id<'events'>;
      const data = await createRazorpayOrder({ eventId: "j57cry93hm1ac0w6b3tdpzk34d7qxzbd" as Id<'events'> });

      if (!data?.id) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        eventId: eventId,
        currency: "INR",
        name: "AWS Registration",
        description: "Payment for Visa Application",
        order_id: data.id,
        handler: async (response: any) => {
          try {

            const transactions = await createTransactions({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              amount: response.razorpay_amount,
              status: response.razorpay_status,
              })

            if (transactions) {
              // send receipt to the user
              toast.success("Payment successful!")
            }

          } catch (error: unknown) {
            console.error("Error in Razorpay API:", error);
            const err = error as Error & { error?: { description: string } };
            toast.error(`Failed to create payment order. Please try again.${err.error?.description || err.message}`);
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
        },
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setProcessingPayment(false);
      });
      rzp.open();

    } catch (err) {
      toast.error(`Failed to create payment order. Please try again.${err}`);
      setProcessingPayment(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <RegistrationForm onSubmit={handleRegistrationSubmit} />
      </div>
    </div>
  )
}

export default RegistrationPage