"use client";
import { Id } from "@/convex/_generated/dataModel";
import { Heart, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import DonationForm from "./DonationForm";
interface DonationCTAProps {
  donorInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  eventName?: string;
  onDonationSuccess?: (donationId: Id<"donations">) => void;
}
const DonationCTA: React.FC<DonationCTAProps> = ({
  donorInfo,
  onDonationSuccess,
}) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const handleDonationSuccess = (donationId: Id<"donations">) => {
    setIsDonationModalOpen(false);
    if (onDonationSuccess) {
      onDonationSuccess(donationId);
    }
  };
  return (
    <>
      {/* Fixed Donation Button */}
      <button
        onClick={() => setIsDonationModalOpen(true)}
        className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg z-40 sm:w-auto flex items-center gap-2 text-lg font-medium"
      >
        <Heart className="h-5 w-5" />
        <span className="sm:hidden">Donate Now</span>
        <span className="hidden sm:inline">Make a Donation</span>
      </button>
      {/* Mobile Drawer */}
      {isMobile && isDonationModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDonationModalOpen(false)}
          ></div>
          {/* Drawer Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white h-[90%] max-h-screen rounded-t-2xl shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center font-semibold text-lg">
                <Heart className="h-5 w-5 mr-2 text-green-600" />
                Make a Donation
              </div>
              <button
                onClick={() => setIsDonationModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <DonationForm
                prefillData={
                  donorInfo
                    ? {
                      donorName: donorInfo.name,
                      donorEmail: donorInfo.email,
                      donorPhone: donorInfo.phone,
                    }
                    : undefined
                }
                onSuccess={handleDonationSuccess}
                onCancel={() => setIsDonationModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Desktop Modal */}
      {!isMobile && isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDonationModalOpen(false)}
          ></div>
          {/* Modal Panel */}
          <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center font-semibold text-lg">
                <Heart className="h-5 w-5 mr-2 text-green-600" />
                Make a Donation
              </div>
              <button
                onClick={() => setIsDonationModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Content */}
            <div className="p-4">
              <DonationForm
                prefillData={
                  donorInfo
                    ? {
                      donorName: donorInfo.name,
                      donorEmail: donorInfo.email,
                      donorPhone: donorInfo.phone,
                    }
                    : undefined
                }
                onSuccess={handleDonationSuccess}
                onCancel={() => setIsDonationModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default DonationCTA;