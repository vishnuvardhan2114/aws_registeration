"use client"

import RegistrationForm from '@/app/components/RegistrationForm'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import type { RegistrationFormData } from '@/lib/types/registration'
import { useAction, useMutation } from 'convex/react'
import { useEffect, useState } from 'react'

const RegistrationPage = () => {

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl)
  const addOrUpdateStudent = useMutation(api.students.addOrUpdateStudent)
  const createRazorpayOrder = useAction(api.razorpay.createRazorpayOrder);

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
    window.alert("Registration successful!")
  }

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      window.alert("Razorpay SDK not loaded yet.");
      return;
    }
    setProcessingPayment(true);
    try {
      const data = await createRazorpayOrder({ eventId: "j57cry93hm1ac0w6b3tdpzk34d7qxzbd" as Id<'events'> });
      
    } catch (err) {
      window.alert(`Failed to create payment order. Please try again.${err}`);
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