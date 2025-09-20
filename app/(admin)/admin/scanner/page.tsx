"use client";

import Scanner from "@/app/components/BarcodeScanner";

const ScannerPage = () => {

  // Render scanner if authenticated
  return (
    <div className='flex items-center justify-center h-screen'>
      <Scanner />
    </div>
  );
};

export default ScannerPage;