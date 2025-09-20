"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import DownloadableReceipt from '@/app/components/DownloadableReceipt';

const ReceiptPage = () => {
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('token') as Id<"tokens"> | null;

  // Fetch comprehensive registration details using the token ID
  const registrationDetails = useQuery(
    api.tokens.getRegistrationDetailsByTokenId,
    tokenId ? { tokenId } : "skip"
  );

  useEffect(() => {
    if (registrationDetails) {
      console.log("=== REGISTRATION DETAILS ===");
      console.log("Token Details:", registrationDetails.token);
      console.log("Transaction Details:", registrationDetails.transaction);
      console.log("Event Details:", registrationDetails.event);
      console.log("Student Details:", registrationDetails.student);
      console.log("===========================");
    }
  }, [registrationDetails]);

  if (!tokenId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">No Token Provided</h2>
          <p className="text-gray-600">Please provide a valid token in the URL.</p>
        </div>
      </div>
    );
  }

  if (registrationDetails === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (!registrationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Receipt Not Found</h2>
          <p className="text-gray-600">No registration found for the provided token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <DownloadableReceipt
          registrationDetails={registrationDetails}
          mode="view"
          fileName={`event_receipt_${tokenId}.pdf`}
        />
        
        {/* Mobile Download Button - Only visible on small screens */}
        <div className="mt-6 p-4 bg-white border-t border-gray-200">
          <DownloadableReceipt
            registrationDetails={registrationDetails}
            mode="download"
            fileName={`event_receipt_${tokenId}.pdf`}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;