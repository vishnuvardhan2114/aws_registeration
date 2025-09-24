"use client";

import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Settings, Globe, Lock, UserCheck, Mail} from 'lucide-react';
import { useRouter } from 'next/navigation';

const PrivacyPolicy = () => {
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
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Privacy Policy</h1>
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
            <Eye className="w-4 h-4" />
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
            Your Privacy Matters
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            At AGS Alumni Events, we are committed to protecting your privacy and ensuring the security 
            of your personal information. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our alumni event platform and services.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {/* Section 1: Information We Collect */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              1. Information We Collect
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full name and contact details (email, phone number)</li>
                  <li>Graduation year and academic program information</li>
                  <li>Professional information (current job, company, location)</li>
                  <li>Emergency contact information for event safety</li>
                  <li>Dietary preferences and accessibility requirements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Event-Related Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Event registration and attendance records</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Event feedback and survey responses</li>
                  <li>Photographs and videos taken during events</li>
                  <li>Communication preferences and marketing consent</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Technical Information</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Website usage patterns and analytics data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              2. How We Use Your Information
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Event Management</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Process event registrations and confirmations</li>
                  <li>Send event updates, reminders, and important notifications</li>
                  <li>Manage event logistics and catering requirements</li>
                  <li>Ensure safety and security at events</li>
                  <li>Generate attendance reports and analytics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Communication</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Send newsletters and alumni updates (with your consent)</li>
                  <li>Share information about upcoming events and opportunities</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Conduct surveys to improve our services</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Legal and Compliance</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Comply with legal obligations and regulatory requirements</li>
                  <li>Protect against fraud and unauthorized access</li>
                  <li>Maintain records for accounting and tax purposes</li>
                  <li>Enforce our terms of service and policies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Information Sharing */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              3. Information Sharing and Disclosure
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">We Do Not Sell Your Data</h4>
                <p className="ml-4">
                  We never sell, rent, or trade your personal information to third parties for 
                  marketing purposes. Your privacy is our priority.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Limited Sharing</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate our platform (payment processors, email services)</li>
                  <li><strong>Event Venues:</strong> Necessary information for event logistics and safety</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Emergency Situations:</strong> To protect health and safety of participants</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Alumni Directory</h4>
                <p className="ml-4">
                  With your explicit consent, we may include your basic information (name, graduation year, 
                  profession) in our alumni directory for networking purposes. You can opt-out at any time.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              4. Data Security and Protection
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Security Measures</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure servers with regular security updates</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Employee training on data protection best practices</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Payment Security</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>PCI DSS compliant payment processing</li>
                  <li>No storage of credit card information on our servers</li>
                  <li>Secure third-party payment gateways (Razorpay, Stripe)</li>
                  <li>Fraud detection and prevention systems</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Data Breach Response</h4>
                <p className="ml-4">
                  In the unlikely event of a data breach, we will notify affected users within 72 hours 
                  and take immediate steps to secure the system and prevent further unauthorized access.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Your Rights */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              5. Your Privacy Rights
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Access and Control</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Communication Preferences</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Opt-out of marketing emails at any time</li>
                  <li>Choose your preferred communication channels</li>
                  <li>Set frequency preferences for newsletters</li>
                  <li>Unsubscribe from specific types of communications</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">How to Exercise Your Rights</h4>
                <p className="ml-4">
                  Contact our Data Protection Officer at privacy@agsschool.edu or use the contact 
                  information provided below. We will respond to your request within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Cookies and Tracking */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              6. Cookies and Tracking Technologies
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Types of Cookies We Use</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our website</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Managing Cookies</h4>
                <p className="ml-4">
                  You can control cookies through your browser settings. However, disabling certain 
                  cookies may affect the functionality of our website. You can also manage your 
                  cookie preferences through our cookie consent banner.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Data Retention */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              7. Data Retention
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Retention Periods</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Event Records:</strong> 7 years for accounting and legal compliance</li>
                  <li><strong>Communication History:</strong> 3 years for customer service purposes</li>
                  <li><strong>Marketing Data:</strong> Until you opt-out or request deletion</li>
                  <li><strong>Analytics Data:</strong> 2 years in anonymized form</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Automatic Deletion</h4>
                <p className="ml-4">
                  We automatically delete personal data when it&apos;s no longer needed for the purposes 
                  for which it was collected, unless we&apos;re required to retain it for legal reasons.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: International Transfers */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              8. International Data Transfers
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Data Location</h4>
                <p className="ml-4">
                  Your personal data is primarily stored and processed in India. When we use 
                  international service providers, we ensure they provide adequate protection 
                  through appropriate safeguards such as Standard Contractual Clauses.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Adequate Protection</h4>
                <p className="ml-4">
                  We only transfer data to countries that provide adequate protection or where 
                  we have implemented appropriate safeguards to protect your personal information.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              9. Children&apos;s Privacy
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Age Requirements</h4>
                <p className="ml-4">
                  Our services are not directed to children under 18. We do not knowingly collect 
                  personal information from children under 18. If you are a parent or guardian and 
                  believe your child has provided us with personal information, please contact us.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Parental Consent</h4>
                <p className="ml-4">
                  For events that may include minors, we require parental consent and may collect 
                  limited information necessary for event participation and safety.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Contact Information */}
          <section className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              10. Contact Us
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Data Protection Officer</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email: privacy@agsschool.edu</li>
                  <li>Phone: +91-XXX-XXXX-XXXX</li>
                  <li>Address: AGS School, Alumni Relations Office, [School Address]</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">General Inquiries</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email: alumni@agsschool.edu</li>
                  <li>Phone: +91-XXX-XXXX-XXXX</li>
                  <li>Office Hours: Monday - Friday, 9:00 AM - 5:00 PM IST</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Privacy Policy Updates</h4>
                <p className="ml-4">
                  We may update this Privacy Policy from time to time. We will notify you of any 
                  significant changes via email or through our website. Your continued use of our 
                  services after such changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center">
            <h4 className="font-semibold text-foreground mb-2">Questions About Your Privacy?</h4>
            <p className="text-muted-foreground text-sm">
              We&apos;re committed to transparency and protecting your privacy. If you have any questions 
              about this Privacy Policy or how we handle your personal information, please don&apos;t 
              hesitate to contact our Data Protection Officer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;