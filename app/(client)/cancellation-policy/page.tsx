"use client";

import React from 'react';
import { ArrowLeft, XCircle, Clock, CreditCard, AlertTriangle, Calendar, Phone, } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CancellationPolicy = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <XCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Cancellation Policy</h1>
                <p className="text-sm text-muted-foreground">AGS Alumni Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Last Updated */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-primary" />
            Event Cancellation & Refund Policy
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We understand that plans can change. This policy outlines our cancellation and refund 
            procedures for AGS Alumni Events. Please read carefully before registering for any event.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {/* Section 1: Cancellation Timeline */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              1. Cancellation Timeline & Refunds
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-200">7+ Days Before Event</h4>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    <strong>Full Refund (100%)</strong><br />
                    Complete refund of registration fees
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">3-7 Days Before Event</h4>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    <strong>Partial Refund (50%)</strong><br />
                    Half of registration fees refunded
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <h4 className="font-semibold text-red-800 dark:text-red-200">Less than 3 Days</h4>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    <strong>No Refund</strong><br />
                    Registration fees are non-refundable
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">No-Show</h4>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    <strong>No Refund</strong><br />
                    No refund for unattended events
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: How to Cancel */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-primary" />
              2. How to Cancel Your Registration
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Cancellation Methods</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Email:</strong> Send cancellation request to alumni@agsschool.edu</li>
                  <li><strong>Phone:</strong> Call our alumni relations office during business hours</li>
                  <li><strong>Online:</strong> Use the cancellation link in your confirmation email</li>
                  <li><strong>In-Person:</strong> Visit our alumni relations office (if applicable)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Required Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full name and registration confirmation number</li>
                  <li>Event name and date</li>
                  <li>Reason for cancellation (optional but helpful)</li>
                  <li>Preferred refund method (original payment method)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Refund Processing */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              3. Refund Processing
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Processing Time</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                  <li><strong>UPI Payments:</strong> 2-3 business days</li>
                  <li><strong>Bank Transfers:</strong> 3-5 business days</li>
                  <li><strong>Checks:</strong> 7-10 business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Refund Method</h4>
                <p className="ml-4">
                  Refunds will be processed to the original payment method used for registration. 
                  If the original payment method is no longer available, please contact us to 
                  arrange an alternative refund method.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Special Circumstances */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              4. Special Circumstances
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Event Cancellation by Organizers</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Full Refund:</strong> Complete refund of all registration fees</li>
                  <li><strong>Event Rescheduling:</strong> Option to transfer registration to new date</li>
                  <li><strong>Alternative Events:</strong> Credit towards future events</li>
                  <li><strong>Notification:</strong> Email and SMS notification within 24 hours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Emergency Situations</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Medical Emergencies:</strong> Full refund with medical documentation</li>
                  <li><strong>Family Emergencies:</strong> Case-by-case consideration</li>
                  <li><strong>Travel Restrictions:</strong> Full refund for government-imposed restrictions</li>
                  <li><strong>Natural Disasters:</strong> Full refund or event rescheduling</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Non-Refundable Items */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-primary" />
              5. Non-Refundable Items
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Items Not Eligible for Refund</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Processing fees and service charges</li>
                  <li>Merchandise and event materials already shipped</li>
                  <li>Third-party vendor fees (catering, venue deposits)</li>
                  <li>Administrative fees for special requests</li>
                  <li>Donations made during registration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Partial Attendance</h4>
                <p className="ml-4">
                  If you attend part of an event and then leave, no partial refunds will be provided. 
                  Full attendance is expected for the complete event experience.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Contact Information */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              6. Contact Information
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Cancellation Support</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Email:</strong> alumni@agsschool.edu</li>
                  <li><strong>Phone:</strong> +91-XXX-XXXX-XXXX</li>
                  <li><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM IST</li>
                  <li><strong>Response Time:</strong> Within 24 hours during business days</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Refund Inquiries</h4>
                <p className="ml-4">
                  For questions about refund status or processing, please include your registration 
                  confirmation number in your inquiry. We&apos;ll provide updates within 24-48 hours.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Important Notice</h4>
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                This cancellation policy applies to all AGS Alumni Events unless otherwise specified 
                in the event description. By registering for an event, you agree to these terms. 
                We reserve the right to modify this policy with advance notice.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-2">Need Help with Cancellation?</h4>
            <p className="text-muted-foreground text-sm">
              Our alumni relations team is here to help. Contact us if you have questions about 
              cancelling your registration or need assistance with the refund process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;