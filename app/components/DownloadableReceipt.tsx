import React, { useCallback, useRef, useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Loader2 } from "lucide-react";
import BarcodeGenerator from "@/app/components/BarcodeGenerator";

type RegistrationDetails = {
    token: {
        _id: string;
        _creationTime: number;
        transactionId: string;
        eventId: string;
        studentId: string;
        isUsed: boolean;
        uniqueCode?: string;
    };
    transaction: {
        _id: string;
        _creationTime: number;
        paymentId: string;
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        bank?: string;
        wallet?: string;
        vpa?: string;
        email: string;
        contact: string;
        fee: number;
        tax: number;
        created_at: string;
    };
    event: {
        _id: string;
        _creationTime: number;
        name: string;
        isFoodIncluded: boolean;
        amount: number;
        EndDate: string;
        StartDate: string;
    };
    student: {
        _id: string;
        _creationTime: number;
        name: string;
        email: string;
        phoneNumber: string;
        dateOfBirth: string;
        imageStorageId?: string;
        imageUrl?: string;
        batchYear: number;
    };
};

type DownloadableReceiptProps = {
    registrationDetails: RegistrationDetails;
    fileName?: string;
    mode?: "view" | "download";
    logoUrl?: string;
};

// --------- PDF Utilities ---------
async function exportReceiptAsPdf(
    element: HTMLElement,
    filename: string,
    mode: "download" | "blob" = "download"
) {
    try {
        // Dynamic import with error handling
        const html2pdf = (await import("html2pdf.js")).default;

        // Clone the element to avoid modifying the original
        const clonedElement = element.cloneNode(true) as HTMLElement;

        // Ensure the cloned element is visible and properly styled
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        clonedElement.style.width = '700px';
        clonedElement.style.height = 'auto';
        clonedElement.style.overflow = 'visible';
        clonedElement.style.backgroundColor = '#ffffff';

        // Temporarily add to DOM for proper rendering
        document.body.appendChild(clonedElement);

        const options = {
            margin: [10, 10, 10, 10],
            filename,
            image: {
                type: "jpeg" as const,
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 700,
                height: clonedElement.scrollHeight,
                windowWidth: 700,
                windowHeight: clonedElement.scrollHeight
            },
            jsPDF: {
                unit: "pt" as const,
                format: "a4" as const,
                orientation: "portrait" as const
            },
            pagebreak: {
                mode: ["avoid-all", "css", "legacy"] as const
            },
        };

        const instance = html2pdf().from(clonedElement).set(options);

        const result = mode === "download" ?
            await instance.save() :
            await instance.outputPdf("blob");

        // Clean up
        document.body.removeChild(clonedElement);

        return result;
    } catch (error) {
        console.error("PDF generation failed:", error);

        // More specific error messages
        if (error instanceof Error) {
            if (error.message.includes('html2pdf')) {
                throw new Error('html2pdf.js library is not installed. Please run: npm install html2pdf.js');
            }
            throw error;
        }
        throw new Error('Failed to generate PDF. Please try again.');
    }
}

// --------- Age Calculation Utility ---------
function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

// --------- Component ---------
export default function DownloadableReceipt({
    registrationDetails,
    fileName,
    mode = "view",
}: DownloadableReceiptProps) {
    const receiptRef = useRef<HTMLDivElement | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate finalFileName early for useCallback dependency
    const finalFileName = fileName || `event_receipt_${registrationDetails?.token?._id?.slice(0, 10) || "unknown"}.pdf`;

    // --------- Handlers ---------
    const handleDownload = useCallback(async () => {
        if (!receiptRef.current) {
            setError("Receipt content not found");
            return;
        }

        setIsDownloading(true);
        setError(null);

        try {
            await exportReceiptAsPdf(receiptRef.current, finalFileName, "download");
        } catch (error) {
            console.error("Download failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF. Please try again.";
            setError(errorMessage);
        } finally {
            setIsDownloading(false);
        }
    }, [finalFileName]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    if (!registrationDetails) {
  return (
            <div className="flex items-center justify-center p-8">
                <p className="text-gray-600">No registration details available</p>
            </div>
        );
    }

    // Extract data
    const studentName = registrationDetails.student.name;
    const studentEmail = registrationDetails.student.email;
    const studentPhone = registrationDetails.student.phoneNumber;
    const studentAge = calculateAge(registrationDetails.student.dateOfBirth);
    const batchYear = registrationDetails.student.batchYear;
    const eventName = registrationDetails.event.name;
    const eventStartDate = new Date(registrationDetails.event.StartDate);
    const eventEndDate = new Date(registrationDetails.event.EndDate);
    const isFoodIncluded = registrationDetails.event.isFoodIncluded;
    const amount = registrationDetails.transaction.amount;
    const paymentMethod = registrationDetails.transaction.method;
    const paymentStatus = registrationDetails.transaction.status;
    const tokenId = registrationDetails.token._id;
    const transactionId = registrationDetails.transaction._id;
    const paymentId = registrationDetails.transaction.paymentId;
    const registrationDate = new Date(registrationDetails.token._creationTime);
    const currencySymbol = "₹";

    // --------- Render ---------
    return (
        <>
            {/* Download button */}
            {mode === "download" && (
                <div className="mb-4">
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full max-w-[300px] m-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 h-12 text-white flex items-center justify-center space-x-2 text-base"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                <span>Download PDF Receipt</span>
                            </>
                        )}
                    </Button>

                    {/* Error Display */}
                    {error && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded max-w-[300px] m-auto">
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={clearError}
                                className="text-xs underline mt-1 hover:no-underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* PDF Content */}
            <div className={cn(mode === "download" ? "h-0 overflow-hidden" : "")}>
                <div
                    ref={receiptRef}
                    className={cn(
                        "bg-white relative font-sans text-gray-900 py-5",
                        mode === "download" ? "w-[700px] mx-auto" : "w-full max-w-[800px] mx-auto"
                    )}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#111827',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.5',
                    }}
                >
                    {/* Header */}
                    <div
                        className="border-b border-gray-200 p-8"
                        style={{
                            borderBottom: '1px solid #e5e7eb',
                            padding: '32px'
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div
                                    className="text-2xl font-bold mb-1"
                                    style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#2563eb',
                                        marginBottom: '4px'
                                    }}
                                >
                                    Event Registration
                                </div>
                                <p
                                    className="text-sm"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280'
                                    }}
                                >
                                    Professional Event Management System
                                </p>
                            </div>
                            <div className="text-right">
                                <h2
                                    className="text-3xl font-bold mb-2"
                                    style={{
                                        fontSize: '30px',
                                        fontWeight: 'bold',
                                        color: '#000000',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Receipt
                                </h2>
                                <div
                                    className="flex justify-end items-center text-sm font-semibold mb-1"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#059669',
                                        marginBottom: '4px'
                                    }}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full mr-2"
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: '#059669',
                                            borderRadius: '50%',
                                            marginRight: '8px'
                                        }}
                                    ></span>
                                    <p>{paymentStatus === 'captured' ? 'Paid' : 'Pending'}</p>
                                </div>
                                <p
                                    className="text-sm"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280'
                                    }}
                                >
                                    {registrationDate.toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-8" style={{ padding: '32px' }}>
                        <div className="mb-6 flex flex-wrap gap-4" style={{ marginBottom: '24px' }}>
                            {/* Student Details */}
                            <div className="flex-1 min-w-[200px]" style={{ flex: '1', minWidth: '200px' }}>
                                <h3
                                    className="text-sm font-semibold text-gray-900 mb-2"
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Student Details
                                </h3>
                                <p
                                    className="text-lg font-semibold text-black"
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#000000',
                                        marginBottom: '4px'
                                    }}
                                >
                                    {studentName}
                                </p>
                                <p
                                    className="text-sm text-gray-600"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        marginBottom: '2px'
                                    }}
                                >
                                    Age: {studentAge} years
                                </p>
                                <p
                                    className="text-sm text-gray-600"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        marginBottom: '2px'
                                    }}
                                >
                                    Batch: {batchYear}
                                </p>
                                <p
                                    className="text-sm text-gray-600"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        marginBottom: '2px'
                                    }}
                                >
                                    {studentEmail}
                                </p>
                                <p
                                    className="text-sm text-gray-600"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280'
                                    }}
                                >
                                    {studentPhone}
                                </p>
                            </div>

                            {/* Registration Details */}
                            <div
                                className="flex-1 min-w-[200px]"
                                style={{
                                    flex: '1',
                                    minWidth: '200px',
                                    wordBreak: 'break-all'
                                }}
                            >
                                <h3
                                    className="text-sm font-semibold text-gray-900 mb-2"
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        marginBottom: '8px'
                                    }}
                                >
                                    Registration Details
                                </h3>

                                <p
                                    className="text-sm text-gray-600"
                                    style={{
                                        fontSize: '14px',
                                        color: '#6b7280'
                                    }}
                                >
                                    Payment ID: {paymentId}
                                </p>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div
                            className="border-t border-gray-200 pt-6 mb-6"
                            style={{
                                borderTop: '1px solid #e5e7eb',
                                paddingTop: '24px',
                                marginBottom: '24px'
                            }}
                        >
                            <h3
                                className="text-sm font-semibold text-gray-900 mb-4"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '16px'
                                }}
                            >
                                Event Information
                            </h3>
                            
                            <div className="flex justify-between items-start gap-6">
                                {/* Left side - Event Details */}
                                <div className="flex-1">
                                    <p
                                        className="text-lg font-semibold"
                                        style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#000000',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        {eventName}
                                    </p>
                                    <p
                                        className="text-sm text-gray-600"
                                        style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '2px'
                                        }}
                                    >
                                        {eventStartDate.toLocaleDateString()} - {eventEndDate.toLocaleDateString()}
                                    </p>
                                    <p
                                        className="text-sm text-gray-800"
                                        style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            marginBottom: '0'
                                        }}
                                    >
                                        Food Included: {isFoodIncluded ? "Yes" : "No"}
                                    </p>
                                </div>

                                {/* Right side - Barcode */}
                                {registrationDetails.token.uniqueCode && (
                                    <div className="flex flex-col items-center">
                                        <p
                                            className="text-xs text-gray-500 mb-2"
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginBottom: '8px',
                                                textAlign: 'center',
                                                maxWidth: '200px'
                                            }}
                                        >
                                            Show this barcode for food at counter:
                                        </p>
                                        <BarcodeGenerator uniqueCode={registrationDetails.token.uniqueCode} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div
                            className="border-t border-gray-200 pt-6"
                            style={{
                                borderTop: '1px solid #e5e7eb',
                                paddingTop: '24px'
                            }}
                        >
                            <h3
                                className="text-sm font-semibold text-gray-900 mb-4"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '16px'
                                }}
                            >
                                Payment Summary
                            </h3>
                            <div style={{ marginBottom: '12px' }}>
                                <div
                                    className="flex justify-between text-sm"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '14px',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <span
                                        className="text-gray-600"
                                        style={{ color: '#6b7280' }}
                                    >
                                        Event Registration Fee
                                    </span>
                                    <span
                                        className="text-black"
                                        style={{ color: '#000000' }}
                                    >
                                        {currencySymbol}{amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div
                                className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-lg font-bold"
                                style={{
                                    borderTop: '1px solid #e5e7eb',
                                    paddingTop: '16px',
                                    marginTop: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#000000'
                                }}
                            >
                                <span>Total Paid</span>
                                <span>{currencySymbol}{amount.toFixed(2)}</span>
                            </div>

                            <div
                                className="mt-2 flex justify-between text-sm"
                                style={{
                                    marginTop: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '14px'
                                }}
                            >
                                <span
                                    className="text-gray-600"
                                    style={{ color: '#6b7280' }}
                                >
                                    Payment Method
                                </span>
                                <span
                                    className="capitalize text-black"
                                    style={{
                                        textTransform: 'capitalize',
                                        color: '#000000'
                                    }}
                                >
                                    {paymentMethod}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="border-t border-gray-200 pt-6 mt-8 text-center"
                        style={{
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '24px',
                            marginTop: '32px',
                            textAlign: 'center'
                        }}
                    >
                        <p
                            className="text-sm text-gray-500 mb-3"
                            style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                marginBottom: '12px'
                            }}
                        >
                            Questions? Contact us at support@eventsystem.com
                        </p>

                        <div
                            className="flex justify-center space-x-4 mb-3"
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '16px',
                                marginBottom: '12px'
                            }}
                        >
                            <a
                                href="/terms-conditions"
                                className="text-sm text-gray-500 hover:text-black"
                                style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    textDecoration: 'none'
                                }}
                            >
                                Terms of Service
                            </a>
                            <a
                                href="/cancellation-policy"
                                className="text-sm text-gray-500 hover:text-black"
                                style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    textDecoration: 'none'
                                }}
                            >
                                Cancellation Policy
                            </a>
                        </div>

                        <p
                            className="text-sm text-gray-400"
                            style={{
                                fontSize: '14px',
                                color: '#9ca3af'
                            }}
                        >
                            This receipt was created on {registrationDate.toLocaleDateString()} and is valid for your records.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}