"use client";

import { BrowserMultiFormatReader } from "@zxing/library";
import React, { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import Image from "next/image";
import { 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  Utensils,
  Loader2,
  X
} from "lucide-react";

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  // Convex hooks
  const tokenData = useQuery(api.tokens.getTokenByUniqueCode, 
    scannedResult ? { uniqueCode: scannedResult } : "skip"
  );
  const markTokenAsUsed = useMutation(api.tokens.markTokenAsUsed);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const startScan = useCallback(async () => {
    try {
      console.log("Starting scan...");
      setError("");
      setScannedResult("");
      setIsScanning(true);

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported by this browser");
      }

      // Initialize the barcode reader
      console.log("Initializing barcode reader...");
      readerRef.current = new BrowserMultiFormatReader();

      // Get camera stream
      const constraints = {
        video: {
          facingMode: { ideal: "environment" }, // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log("Camera access granted, stream obtained");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video element set with stream");

        // Wait for video to load and start continuous scanning
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, starting continuous scanning...");
          startContinuousScanning();
        };
      }
    } catch (err) {
      console.error("Error starting scan:", err);
      let errorMessage = "Failed to start camera";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Camera permission denied. Please allow camera access and try again.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found on this device.";
        } else if (err.name === "NotSupportedError") {
          errorMessage = "Camera not supported by this browser.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setIsScanning(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const startContinuousScanning = useCallback(() => {
    if (!readerRef.current || !videoRef.current || !isScanning) return;

    try {
      console.log("Starting decodeFromVideoDevice...");
      readerRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          console.log("Barcode detected:", result.getText());
          const scannedValue = result.getText();
          setScannedResult(scannedValue);
          setIsValidating(true);
          stopScan();
        }
        if (err && err.name !== 'NotFoundException') {
          console.log("Scan error:", err);
        }
      });
    } catch (err) {
      console.error("Error during scanning:", err);
      setError("Failed to scan barcode");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !readerRef.current) return;

    try {
      console.log("Capturing frame for manual decode...");
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');
      const result = await readerRef.current.decodeFromImage(undefined, dataUrl);
      const scannedValue = result.getText();
      console.log("Manual capture detected:", scannedValue);
      setScannedResult(scannedValue);
      setIsValidating(true);
      stopScan();
    } catch (err) {
      console.log("No barcode found in captured frame", err);
      setError("No barcode detected in the captured frame. Try again.");
      setTimeout(() => setError(""), 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScan = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsScanning(false);
  }, []);

  const resetScanner = useCallback(() => {
    setScannedResult("");
    setError("");
    setIsValidating(false);
    setIsAccepting(false);
    stopScan();
  }, [stopScan]);

  // Handle token acceptance
  const handleAcceptToken = useCallback(async () => {
    if (!tokenData?.token) return;
    
    setIsAccepting(true);
    try {
      const result = await markTokenAsUsed({ tokenId: tokenData.token._id });
      
      if (result.success) {
        toast.success("Token accepted successfully!", {
          description: `${tokenData.student.name} has been checked in for ${tokenData.event.name}`,
        });
        
        // Auto-reset after 2 seconds
        setTimeout(() => {
          resetScanner();
        }, 2000);
      } else {
        toast.error("Failed to accept token", {
          description: result.message,
        });
        setIsAccepting(false);
      }
    } catch (error) {
      console.error("Error accepting token:", error);
      toast.error("Error accepting token", {
        description: "Please try again",
      });
      setIsAccepting(false);
    }
  }, [tokenData, markTokenAsUsed, resetScanner]);

  // Handle token validation result
  const handleTokenValidation = useCallback(() => {
    if (tokenData === null) {
      toast.error("Invalid token", {
        description: "The scanned code is not a valid token",
      });
      setIsValidating(false);
      setTimeout(() => resetScanner(), 2000);
    } else if (tokenData.token.isUsed) {
      toast.error("Token already used", {
        description: "This token has already been used",
      });
      setIsValidating(false);
      setTimeout(() => resetScanner(), 2000);
    } else {
      setIsValidating(false);
    }
  }, [tokenData, resetScanner]);

  // Effect to handle token validation
  React.useEffect(() => {
    if (scannedResult && !isValidating) return;
    if (tokenData === undefined) return; // Still loading
    
    handleTokenValidation();
  }, [tokenData, scannedResult, isValidating, handleTokenValidation]);

  return (
    <div className="min-h-screen w-full">
      {/* Mobile App Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Image
                src="/SGA.webp"
                alt="Company Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Event Scanner
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="">
          {/* Welcome Message */}
          <div className="text-center mb-6">
           
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Scan Event Ticket
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Point your camera at the barcode to validate entry
            </p>
          </div>

          <Card className="overflow-hidden shadow-xl border-0 bg-white dark:bg-slate-800">
            <div className="p-6">
              {!isScanning && !scannedResult && (
                <div className="text-center space-y-6">
                  {/* Camera Placeholder */}
                  <div className="relative">
                    <div className="w-full h-80 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-500">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center shadow-sm">
                          <Camera className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                          Ready to scan
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                          Tap to start camera
                        </p>
                      </div>
                    </div>
                    {/* Scanning Frame Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-40 border-2 border-slate-400 border-dashed rounded-xl opacity-50"></div>
                    </div>
                  </div>
                  
                  {/* Start Button */}
                  <Button
                    onClick={startScan}
                    className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all duration-200"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start Scanning
                  </Button>
                </div>
              )}

              {isScanning && (
                <div className="space-y-6">
                  {/* Video Container */}
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-80 object-cover rounded-2xl bg-black shadow-lg"
                      autoPlay
                      playsInline
                    />
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner indicators */}
                      <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-slate-900 dark:border-white rounded-tl-lg"></div>
                      <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-slate-900 dark:border-white rounded-tr-lg"></div>
                      <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-slate-900 dark:border-white rounded-bl-lg"></div>
                      <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-slate-900 dark:border-white rounded-br-lg"></div>
                      
                      {/* Center scanning area */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-slate-900 dark:border-white border-dashed rounded-xl opacity-80">
                        <div className="absolute inset-0 bg-slate-900/10 dark:bg-white/10 rounded-xl animate-pulse"></div>
                      </div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-slate-900 dark:bg-white animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full animate-pulse"></div>
                      <p className="text-sm font-medium">Position barcode in the frame</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={captureFrame}
                        className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                      </Button>
                      <Button
                        onClick={stopScan}
                        variant="outline"
                        className="flex-1 h-12 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h4>
                      <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                  <Button
                    onClick={resetScanner}
                    className="w-full h-12 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all duration-200"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {isValidating && (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm">
                      <Loader2 className="w-8 h-8 text-slate-600 dark:text-slate-400 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
                      Validating Token...
                    </h3>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Scanned Code:</p>
                      <p className="font-mono text-sm break-all text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                        {scannedResult}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {scannedResult && !isValidating && tokenData && (
                <div className="space-y-6">
                  {/* Success Header */}
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center shadow-sm border border-green-200 dark:border-green-800">
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      Valid Ticket Found!
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Ready to check in this attendee
                    </p>
                  </div>
                  
                  {/* Student Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                      {tokenData.student.imageUrl ? (
                        <Image
                          src={tokenData.student.imageUrl}
                          alt={tokenData.student.name}
                          width={60}
                          height={60}
                          className="rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                          {tokenData.student.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          {tokenData.student.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {tokenData.student.phoneNumber}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400 mb-1">Batch</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {tokenData.student.batchYear}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          Age: {calculateAge(tokenData.student.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Event Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                        {tokenData.event.name}
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Amount</span>
                        <span className="font-bold text-lg text-green-600 dark:text-green-400">
                          ₹{tokenData.event.amount}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
                          <p className="text-slate-500 dark:text-slate-400 mb-1">Start Date</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(tokenData.event.StartDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
                          <p className="text-slate-500 dark:text-slate-400 mb-1">End Date</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(tokenData.event.EndDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {tokenData.event.isFoodIncluded && (
                        <div className="flex items-center space-x-2 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-200 dark:border-green-800">
                          <Utensils className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300 font-medium">Food Included</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleAcceptToken}
                      disabled={isAccepting}
                      className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAccepting ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Accepting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>Accept & Check In</span>
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      onClick={resetScanner}
                      variant="outline"
                      className="w-full h-12 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Scanner;