/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import type { RegistrationFormData } from '@/lib/types/registration';
import { toast } from 'sonner';
import RegistrationForm from '@/app/components/RegistrationForm';
import {
    Calendar,
    DollarSign,
    Utensils,
    Clock,
    ArrowLeft,
    MapPin,
    Users
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/app/components/ui/card';
import {
    Badge
} from '@/app/components/ui/badge';
import {
    Skeleton
} from '@/app/components/ui/skeleton';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/app/components/ui/button';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const EventRegistrationPage = () => {
    const params = useParams();
    const eventId = params.id as Id<"events">;

    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);

    const event = useQuery(api.events.getEvent, { eventId });
    const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl);
    const addOrUpdateStudent = useMutation(api.students.addOrUpdateStudent);
    const createRazorpayOrder = useAction(api.razorpay.createRazorpayOrder);
    const createTransactions = useMutation(api.transactions.addTransaction);

    const isLoading = event === undefined;

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => setRazorpayLoaded(true);
        script.onerror = () => console.error("Failed to load Razorpay SDK");
        document.body.appendChild(script);

        return () => {
            // Clean up script when component unmounts
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, []);

    const storeFile = async (file: File): Promise<undefined | Id<"_storage">> => {
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
            await addOrUpdateStudent(formatedData);
            setRegistrationCompleted(true);
            toast.success("Registration successful!");
        } catch (error) {
            console.log("An error occurred during registration. Please try again.", error);
            toast.error("Registration failed. Please try again.");
        }
    };

    const handlePayment = async () => {
        if (!event) {
            toast.error("Event not found");
            return;
        }

        if (!razorpayLoaded) {
            toast.error("Payment system not loaded yet. Please try again.");
            return;
        }

        setProcessingPayment(true);
        try {
            const data = await createRazorpayOrder({ eventId });

            if (!data?.id) throw new Error("Order creation failed");

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                eventId: eventId,
                currency: "INR",
                name: "Event Registration",
                description: `Payment for ${event.name}`,
                order_id: data.id,
                handler: async (response: any) => {
                    try {
                        const transactions = await createTransactions({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            amount: response.razorpay_amount,
                            status: response.razorpay_status,
                        });

                        if (transactions) {
                            toast.success("Payment successful!");
                            setProcessingPayment(false);
                        }
                    } catch (error: unknown) {
                        console.error("Error in Razorpay API:", error);
                        const err = error as Error & { error?: { description: string } };
                        toast.error(`Failed to process payment. Please try again. ${err.error?.description || err.message}`);
                        setProcessingPayment(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setProcessingPayment(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => {
                setProcessingPayment(false);
                toast.error("Payment failed. Please try again.");
            });
            rzp.open();

        } catch (err) {
            toast.error(`Failed to create payment order. Please try again. ${err}`);
            setProcessingPayment(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="container mx-auto py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Event Info Skeleton */}
                            <Card>
                                <CardHeader>
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-8 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>

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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto text-center">
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
        <div className="min-h-screen ">
            <div className="container mx-auto py-8 ">
                <div className="">
                    <RegistrationForm
                        onSubmit={handleRegistrationSubmit}
                        disabled={!isRegistrationOpen}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventRegistrationPage;
