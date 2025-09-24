"use client";

import React from 'react';
import { ArrowLeft, FileText, Shield, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TermsAndConditions = () => {
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Terms & Conditions</h1>
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
            <Shield className="w-6 h-6 text-primary" />
            Welcome to AGS Alumni Events
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms and Conditions (&quot;Terms&quot;) govern your use of the AGS Alumni Events platform 
            and participation in our alumni events. By registering for or attending any AGS alumni 
            event, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {/* Section 1: Event Registration */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              1. Event Registration & Participation
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Registration Requirements</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All participants must be verified AGS alumni or invited guests</li>
                  <li>Accurate personal information must be provided during registration</li>
                  <li>Registration is subject to availability and event capacity limits</li>
                  <li>Participants must be 18 years or older, or accompanied by a guardian</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Event Conduct</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Respectful behavior towards all participants and staff is required</li>
                  <li>Follow all venue rules and safety guidelines</li>
                  <li>No disruptive or inappropriate behavior will be tolerated</li>
                  <li>Event organizers reserve the right to remove participants for violations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: Payments & Refunds */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              2. Payments & Refund Policy
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Payment Terms</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All payments must be made in full before the event date</li>
                  <li>We accept major credit cards, debit cards, and UPI payments</li>
                  <li>Payment confirmation will be sent via email</li>
                  <li>Prices are inclusive of applicable taxes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Refund Policy</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full refunds available up to 7 days before the event</li>
                  <li>50% refund available 3-7 days before the event</li>
                  <li>No refunds within 3 days of the event or for no-shows</li>
                  <li>Refunds processed within 5-7 business days</li>
                  <li>Event cancellation by organizers results in full refund</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Privacy & Data */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              3. Privacy & Data Protection
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Data Collection</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We collect personal information necessary for event management</li>
                  <li>Contact information is used for event communications</li>
                  <li>Photos and videos may be taken during events for promotional purposes</li>
                  <li>Data is stored securely and not shared with third parties without consent</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Your Rights</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Request access to your personal data</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your data (subject to legal requirements)</li>
                  <li>Opt-out of promotional communications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Liability & Disclaimers */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              4. Liability & Disclaimers
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Limitation of Liability</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>AGS Alumni Events is not liable for personal injury or property damage</li>
                  <li>Participants attend events at their own risk</li>
                  <li>We are not responsible for lost or stolen personal belongings</li>
                  <li>Liability is limited to the amount paid for event registration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Event Changes</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Event details may change due to circumstances beyond our control</li>
                  <li>Participants will be notified of significant changes</li>
                  <li>Weather-related cancellations may result in rescheduling or refunds</li>
                  <li>Force majeure events may affect event delivery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              5. Intellectual Property
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Content Rights</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>AGS Alumni Events retains rights to all event content and materials</li>
                  <li>Participants may not record or distribute event content without permission</li>
                  <li>Event photos and videos may be used for promotional purposes</li>
                  <li>Participants grant permission for their likeness to be used in event materials</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: Contact & Support */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              6. Contact Information
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Support & Inquiries</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email: alumni@agsschool.edu</li>
                  <li>Phone: +91-XXX-XXXX-XXXX</li>
                  <li>Office Hours: Monday - Friday, 9:00 AM - 5:00 PM IST</li>
                  <li>Response Time: Within 24-48 hours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Terms Updates</h4>
                <p className="ml-4">
                  These Terms may be updated periodically. Continued use of our services 
                  constitutes acceptance of any changes. We will notify users of significant 
                  updates via email or platform notifications.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-2">Questions About These Terms?</h4>
            <p className="text-muted-foreground text-sm">
              If you have any questions about these Terms and Conditions, please contact our 
              alumni relations team. We&apos;re here to help ensure you have a great experience 
              at our events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;