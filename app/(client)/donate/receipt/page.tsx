"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DonationReceipt from '@/app/components/DonationReceipt';
import { Id } from '@/convex/_generated/dataModel';

const DonationReceiptPage = () => {
  const searchParams = useSearchParams();
  const donationId = searchParams.get('donationId') as Id<"donations"> | null;

  if (!donationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">No Donation ID Provided</h2>
          <p className="text-gray-600 mb-4">Please provide a valid donation ID in the URL.</p>
          <Link 
            href="/donate" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make a Donation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex justify-center lg:justify-start">
          <Link href="/" className="inline-block">
            <Image
              src="/SGA.webp"
              alt="SGA Logo"
              width={120}
              height={60}
              className="h-12 w-auto object-contain lg:h-16"
              priority
            />
          </Link>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="py-8">
        <DonationReceipt donationId={donationId} mode="view" />
      </div>
    </div>
  );
};

export default DonationReceiptPage;
