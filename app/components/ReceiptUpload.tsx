"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Upload, Camera, FileImage, X, CheckCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceiptUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onFileSelect,
  selectedFile,
  maxSizeInMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload an image (JPEG, PNG, WebP) or PDF file';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onFileSelect(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const startCamera = async (useFrontCamera = false) => {
    try {
      setCameraError('');
      setIsVideoReady(false);
      setShowCamera(true);
      setIsFrontCamera(useFrontCamera);

      // Small delay to ensure modal is rendered
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: useFrontCamera ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;

            // Ensure video plays
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play().then(() => {
                  setIsVideoReady(true);
                }).catch(console.error);
              }
            };
          }
        } catch (error) {
          console.error('Camera error:', error);
          setCameraError('Unable to access camera. Please check permissions.');
        }
      }, 100);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError('');
    setIsVideoReady(false);
  };

  const switchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsVideoReady(false);
    await startCamera(!isFrontCamera);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // If front camera (mirrored), flip the captured image back to normal
        if (isFrontCamera) {
          context.scale(-1, 1);
          context.drawImage(video, -canvas.width, 0);
        } else {
          context.drawImage(video, 0, 0);
        }

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'receipt-capture.jpg', { type: 'image/jpeg' });
            const validationError = validateFile(file);
            if (validationError) {
              setError(validationError);
            } else {
              onFileSelect(file);
              setError(null);
              stopCamera();
            }
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    }
    return <FileImage className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!selectedFile && (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Payment Receipt
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your receipt here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPEG, PNG, WebP, PDF (Max {maxSizeInMB}MB)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!selectedFile && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          <Button
            variant="outline"
            onClick={() => startCamera(false)}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Take Receipt Photo</h3>
                <p className="text-sm text-gray-600">
                  {isFrontCamera ? 'Front Camera' : 'Back Camera'}
                </p>
              </div>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{cameraError}</p>
                <button
                  onClick={() => startCamera(isFrontCamera)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    style={{ transform: isFrontCamera ? 'scaleX(-1)' : 'none' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    disabled={!isVideoReady}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVideoReady ? 'Capture Photo' : 'Loading...'}
                  </button>
                  <button
                    onClick={switchCamera}
                    disabled={!isVideoReady}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Switch to ${isFrontCamera ? 'back' : 'front'} camera`}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
