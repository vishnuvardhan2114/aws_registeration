"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Banknote, CreditCard, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { toast } from 'sonner';
import { ReceiptUpload } from "./ReceiptUpload";
import { RegisteredUser } from "./RegisteredUsersTable";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegisteredUser;
  eventId: Id<"events">;
}

type PaymentMethod = "upi" | "cash";

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  eventId,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isException, setIsException] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const createCoTransactionAndUpdateToken = useMutation(
    api.coTransactions.createCoTransactionAndUpdateToken
  );
  const generateUploadStorageUrl = useMutation(api.storage.generateUploadUrl);

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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, PDF, DOC, DOCX images are allowed");
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

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsException(false); // disable exception when a method is selected
    if (method !== "upi") {
      setReceiptFile(null);
      setCurrentStep(1);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setReceiptFile(null);
  };

  const handleExceptionToggle = (checked: boolean) => {
    setIsException(checked);
    if (checked) {
      setSelectedMethod(null); // reset method if exception is chosen
      setReceiptFile(null);
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isException) {
        await createCoTransactionAndUpdateToken({
          eventId,
          studentId: user.studentId as Id<"students">,
          paymentMethod: "upi", // fallback, since Convex expects a method
          status: "exception",
        });
      } else if (selectedMethod) {
        let storageId: undefined | Id<"_storage"> = undefined;
        if (receiptFile) {
          storageId = await storeFile(receiptFile);
        }
        await createCoTransactionAndUpdateToken({
          eventId,
          studentId: user.studentId as Id<"students">,
          paymentMethod: selectedMethod,
          status: "paid",
          storageId
        });
      }
      resetForm();
    } catch (error) {
      console.error("Payment submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setReceiptFile(null);
    setIsException(false);
    setCurrentStep(1);
    onClose();
  };

  const paymentMethods = [
    {
      id: "upi" as const,
      title: "UPI Payment",
      description: "Pay via UPI (Google Pay, PhonePe, Paytm)",
      icon: Smartphone,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "cash" as const,
      title: "Cash Payment",
      description: "Pay in cash at the venue",
      icon: Banknote,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  const canSubmit =
    (isException && !selectedMethod) ||
    (selectedMethod && (selectedMethod !== "upi" || receiptFile));

  return (
    <Dialog open={isOpen} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment for {user.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-2">
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
            </CardContent>
          </Card>

          {/* Step 1: Payment Method Selection */}
          {currentStep === 1 && !isException && (
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
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          isSelected ? method.bgColor : "bg-gray-100"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isSelected ? method.color : "text-gray-600"
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={cn(
                            "font-medium",
                            isSelected ? method.color : "text-gray-900"
                          )}
                        >
                          {method.title}
                        </h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Step 2: UPI Receipt Upload */}
          {currentStep === 2 && selectedMethod === "upi" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBackToStep1} className="p-1">
                  ← Back
                </Button>
                <h3 className="text-sm font-medium text-gray-900">Upload Payment Receipt</h3>
              </div>
              <ReceiptUpload onFileSelect={setReceiptFile} selectedFile={receiptFile} />
            </div>
          )}

          {/* Exception Checkbox */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exception"
                  checked={isException}
                  onCheckedChange={(checked) => handleExceptionToggle(checked as boolean)}
                />
                <label
                  htmlFor="exception"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as Exception
                </label>
              </div>
              {isException && (
                <p className="text-xs text-gray-500">
                  Please ensure you have proper documentation for this exception.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {currentStep === 1 && selectedMethod === "upi" ? (
              <Button onClick={() => setCurrentStep(2)} disabled={!selectedMethod} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  isException ? "Confirm Exception" : "Confirm Payment"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
