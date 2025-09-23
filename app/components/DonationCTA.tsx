"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/app/components/ui/drawer';
import { 
  Heart, 
  X
} from 'lucide-react';
import DonationForm from './DonationForm';
import { Id } from '@/convex/_generated/dataModel';

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
  onDonationSuccess 
}) => {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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
      <Button
        onClick={() => setIsDonationModalOpen(true)}
        className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 shadow-lg z-40 sm:w-auto"
        size="lg"
      >
        <Heart className="h-5 w-5 " />
        <span className="sm:hidden">Donate Now</span>
        <span className="hidden sm:inline">Make a Donation</span>
      </Button>

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
          <DrawerContent className="h-screen max-h-screen flex flex-col ">
            <DrawerHeader className="flex-shrink-0 pb-4">
              <DrawerTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-green-600" />
                  Make a Donation
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDonationModalOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="flex-1 pb-4 overflow-y-auto">
              <DonationForm
                prefillData={donorInfo ? {
                  donorName: donorInfo.name,
                  donorEmail: donorInfo.email,
                  donorPhone: donorInfo.phone
                } : undefined}
                onSuccess={handleDonationSuccess}
                onCancel={() => setIsDonationModalOpen(false)}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop Dialog */
        <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-green-600" />
                  Make a Donation
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDonationModalOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              <DonationForm
                prefillData={donorInfo ? {
                  donorName: donorInfo.name,
                  donorEmail: donorInfo.email,
                  donorPhone: donorInfo.phone
                } : undefined}
                onSuccess={handleDonationSuccess}
                onCancel={() => setIsDonationModalOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DonationCTA;
