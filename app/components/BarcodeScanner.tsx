"use client";

import { BrowserMultiFormatReader } from "@zxing/library";
import { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  // const startScan = useCallback(async () => {
  //   try {
  //     console.log("Starting scan...");
  //     setError("");
  //     setScannedResult("");
  //     setIsScanning(true);

  //     // Check if browser supports getUserMedia
  //     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //       throw new Error("Camera access not supported by this browser");
  //     }

  //     // Initialize the barcode reader
  //     console.log("Initializing barcode reader...");
  //     readerRef.current = new BrowserMultiFormatReader();

  //     // Get camera stream
  //     const constraints = {
  //       video: {
  //         facingMode: { ideal: "environment" }, // Prefer back camera on mobile
  //         width: { ideal: 1280 },
  //         height: { ideal: 720 }
  //       }
  //     };

  //     console.log("Requesting camera access...");
  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     streamRef.current = stream;
  //     console.log("Camera access granted, stream obtained");

  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       console.log("Video element set with stream");

  //       // Wait for video to load and start continuous scanning
  //       videoRef.current.onloadedmetadata = () => {
  //         console.log("Video metadata loaded, starting continuous scanning...");
  //         startContinuousScanning();
  //       };
  //     }
  //   } catch (err) {
  //     console.error("Error starting scan:", err);
  //     let errorMessage = "Failed to start camera";

  //     if (err instanceof Error) {
  //       if (err.name === "NotAllowedError") {
  //         errorMessage = "Camera permission denied. Please allow camera access and try again.";
  //       } else if (err.name === "NotFoundError") {
  //         errorMessage = "No camera found on this device.";
  //       } else if (err.name === "NotSupportedError") {
  //         errorMessage = "Camera not supported by this browser.";
  //       } else {
  //         errorMessage = err.message;
  //       }
  //     }

  //     setError(errorMessage);
  //     setIsScanning(false);
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);


  const startScan = useCallback(async () => {
    try {
      console.log("Starting scan...");
      setError("");
      setScannedResult("");
      setIsScanning(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access not supported by this browser");
      }

      // Relax constraints for mobile compatibility
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "environment" }
      };

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // ✅ required for iOS Safari
        videoRef.current.play();

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
          alert(`Scanned Number: ${scannedValue}`);
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
      alert(`Scanned Number: ${scannedValue}`);
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

  const resetScanner = () => {
    setScannedResult("");
    setError("");
    stopScan();
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Barcode Scanner
            </h1>
            <p className="text-muted-foreground text-lg">
              Use your camera to scan barcodes and QR codes
            </p>
          </div>

          <Card className="p-8 shadow-elegant">
            <div className="space-y-6">
              {!isScanning && !scannedResult && (
                <div className="text-center space-y-4">
                  <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-muted-foreground">
                        Click &quot;Start Scan&quot; to begin
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={startScan}
                    className="w-full h-12 text-lg bg-gradient-primary hover:opacity-90 transition-smooth shadow-elegant"
                  >
                    Start Scan
                  </Button>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover rounded-lg bg-black"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 border-2 border-accent rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-accent border-dashed rounded-lg"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Position the barcode within the scanning area
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={captureFrame}
                        className="flex-1 h-12 bg-gradient-primary hover:opacity-90 transition-smooth"
                      >
                        📸 Capture
                      </Button>
                      <Button
                        onClick={stopScan}
                        variant="secondary"
                        className="flex-1 h-12"
                      >
                        Stop Scan
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-destructive font-medium">Error:</span>
                    <span className="text-destructive">{error}</span>
                  </div>
                  <Button
                    onClick={resetScanner}
                    variant="outline"
                    className="mt-3 w-full"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {scannedResult && (
                <div className="space-y-4">
                  <div className="p-6 bg-accent/10 border border-accent/20 rounded-lg text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      Scan Successful!
                    </h3>
                    <div className="p-4 bg-card rounded-md border">
                      <p className="text-sm text-muted-foreground mb-1">Scanned Value:</p>
                      <p className="font-mono text-lg break-all">{scannedResult}</p>
                    </div>
                  </div>
                  <Button
                    onClick={resetScanner}
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-smooth"
                  >
                    Scan Another
                  </Button>
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