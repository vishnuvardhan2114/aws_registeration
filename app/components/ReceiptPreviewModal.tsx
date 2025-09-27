"use client";

import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Download, FileImage, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl?: string;
  fileName?: string;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  receiptUrl,
  fileName = "receipt"
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setIsImageLoading(true);
    }
  }, [isOpen, receiptUrl]);

  const handleDownload = async () => {
    if (!receiptUrl) return;

    try {
      setIsDownloading(true);
      
      // Fetch the image
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_receipt_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      // You might want to show a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            Receipt Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
          {receiptUrl && !imageError ? (
            <>
              <div className="relative w-full max-w-2xl max-h-[500px] overflow-hidden rounded-lg border">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-500">Loading receipt...</p>
                    </div>
                  </div>
                )}
                <Image
                  src={receiptUrl}
                  alt="Receipt Preview"
                  className="w-full h-full object-contain"
                  width={500}
                  height={500}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => {
                    console.error('Error loading receipt image');
                    setImageError(true);
                    setIsImageLoading(false);
                  }}
                  priority
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading || isImageLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? 'Downloading...' : 'Download Receipt'}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
              <FileImage className="h-16 w-16" />
              <p className="text-lg">
                {imageError ? 'Failed to load receipt' : 'No receipt available'}
              </p>
              <p className="text-sm">
                {imageError 
                  ? 'There was an error loading the receipt image.' 
                  : 'This user has not uploaded a receipt yet.'
                }
              </p>
              {imageError && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setImageError(false);
                    setIsImageLoading(true);
                  }}
                  className="mt-2"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
