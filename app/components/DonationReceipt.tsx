"use client";

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Heart, 
  Calendar, 
  CreditCard,
  Shield,
  ArrowLeft,
  Share2,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface DonationReceiptProps {
  donationId: Id<"donations">;
  mode?: 'view' | 'download';
  fileName?: string;
}

const DonationReceipt: React.FC<DonationReceiptProps> = ({ 
  donationId, 
  mode = 'view',
  fileName = 'donation_receipt.pdf'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const donation = useQuery(api.donations.getDonation, { donationId });

  if (!donation) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading receipt...</span>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    if (mode !== 'download') return;
    
    setIsDownloading(true);
    try {
      // Generate PDF using browser's print functionality
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const receiptContent = document.getElementById('donation-receipt-content');
        if (receiptContent) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Donation Receipt - ${donation.paymentId}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                  .receipt { max-width: 800px; margin: 0 auto; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .amount { font-size: 2.5em; font-weight: bold; color: #2ecc71; text-align: center; margin: 20px 0; }
                  .details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                  .footer { text-align: center; margin-top: 30px; color: #666; }
                  @media print { body { margin: 0; } }
                </style>
              </head>
              <body>
                ${receiptContent.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
      toast.success("Receipt download initiated");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download receipt");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Donation Receipt',
          text: `I just made a donation of ${formatCurrency(donation.amount)} to SGA!`,
          url: window.location.href,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `I just made a donation of ${formatCurrency(donation.amount)} to SGA! Check out their work at ${window.location.origin}`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'captured':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg" id="donation-receipt-content">
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Donation Successful!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Thank you for your generous contribution
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Amount Display */}
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {formatCurrency(donation.amount)}
            </div>
            <Badge className={`${getStatusColor(donation.status)} flex items-center gap-1 w-fit mx-auto`}>
              {getStatusIcon(donation.status)}
              {donation.status.toUpperCase()}
            </Badge>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-blue-600" />
                Donation Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt Number:</span>
                  <span className="font-medium">#{donation.paymentId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{formatDate(donation._creationTime)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Donor Name:</span>
                  <span className="font-medium">
                    {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="secondary" className="ml-2">
                    {donation.category?.name || 'General Donation'}
                  </Badge>
                </div>
                
                {donation.customPurpose && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purpose:</span>
                    <span className="font-medium text-right max-w-xs">
                      {donation.customPurpose}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Payment Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{donation.method.toUpperCase()}</span>
                </div>
                
                {donation.bank && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{donation.bank}</span>
                  </div>
                )}
                
                {donation.wallet && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet:</span>
                    <span className="font-medium">{donation.wallet}</span>
                  </div>
                )}
                
                {donation.vpa && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">UPI ID:</span>
                    <span className="font-medium">{donation.vpa}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-sm">{donation.paymentId}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Thank You Message */}
          <div className="text-center mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <Heart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Thank You for Your Generosity!
              </h4>
              <p className="text-blue-700">
                Your donation of <strong>{formatCurrency(donation.amount)}</strong> will help us 
                continue our important work and make a positive impact in our community. 
                We truly appreciate your support and belief in our mission.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Receipt Confirmation</h4>
                <p className="text-sm text-green-700 mt-1">
                  A detailed receipt has been sent to <strong>{donation.donorEmail}</strong>. 
                  Please keep this receipt for your records.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {mode === 'download' && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/donate">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Make Another Donation
              </Link>
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Student Government Association (SGA)</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This is an official receipt for your donation. For any queries, 
              please contact us at donations@sga.org
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationReceipt;
