"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";


export default function RegistrationConfirmation() {
  return (
    <div className="flex items-center justify-center min-h-[650px] px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Registration Successful 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          You have registered successfully for the event.
          Please complete the payment at the venue.
        </p>

        <Button
          className="w-full"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
