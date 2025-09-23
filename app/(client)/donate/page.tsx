"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import DonationForm from '@/app/components/DonationForm';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

const DonatePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get prefill data from URL params (if coming from registration)
  const prefillData = {
    donorName: searchParams.get('name') || undefined,
    donorEmail: searchParams.get('email') || undefined,
    donorPhone: searchParams.get('phone') || undefined,
  };

  const handleDonationSuccess = (donationId: Id<"donations">) => {
    router.push(`/donate/receipt?donationId=${donationId}`);
  };

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


      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto ">
          <DonationForm
            prefillData={prefillData}
            onSuccess={handleDonationSuccess}
          />
        </div>
      </div>

    </div>
  );
};

export default DonatePage;
