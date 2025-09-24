"use client";

import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ContactPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    alumniYear: '',
    eventInterest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission (no backend implementation)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        alumniYear: '',
        eventInterest: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.message;

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
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Contact Us</h1>
                <p className="text-sm text-muted-foreground">AGS Alumni Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Introduction */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have questions about our alumni events? Need help with registration? 
            We&apos;re here to help! Reach out to us and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Email</h4>
                    <p className="text-muted-foreground">alumni@agsschool.edu</p>
                    <p className="text-sm text-muted-foreground">General inquiries and support</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Phone</h4>
                    <p className="text-muted-foreground">+91-XXX-XXXX-XXXX</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday, 9:00 AM - 5:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Address</h4>
                    <p className="text-muted-foreground">
                      AGS School<br />
                      Alumni Relations Office<br />
                      [School Address]<br />
                      [City, State] - [PIN]
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Office Hours</h4>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-primary/5 rounded-lg border border-primary/20 p-6">
              <h4 className="font-semibold text-foreground mb-2">Response Time</h4>
              <p className="text-muted-foreground text-sm">
                We typically respond to inquiries within 24-48 hours during business days. 
                For urgent matters, please call our office directly.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Send us a Message</h3>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    Message sent successfully!
                  </p>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  We&apos;ll get back to you within 24-48 hours.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    Failed to send message
                  </p>
                </div>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  Please try again or contact us directly.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="alumniYear" className="block text-sm font-medium text-foreground mb-2">
                    Graduation Year
                  </label>
                  <select
                    id="alumniYear"
                    name="alumniYear"
                    value={formData.alumniYear}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select graduation year</option>
                    {Array.from({ length: 30 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="event-registration">Event Registration</option>
                  <option value="payment-issues">Payment Issues</option>
                  <option value="cancellation">Cancellation/Refund</option>
                  <option value="event-inquiry">Event Information</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="alumni-network">Alumni Network</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="eventInterest" className="block text-sm font-medium text-foreground mb-2">
                  Event Interest
                </label>
                <select
                  id="eventInterest"
                  name="eventInterest"
                  value={formData.eventInterest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select event type (optional)</option>
                  <option value="reunion">Class Reunion</option>
                  <option value="networking">Networking Events</option>
                  <option value="workshop">Workshops & Seminars</option>
                  <option value="sports">Sports Events</option>
                  <option value="cultural">Cultural Events</option>
                  <option value="charity">Charity Events</option>
                  <option value="all">All Events</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Frequently Asked Questions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-medium text-foreground mb-2">How do I register for an event?</h4>
              <p className="text-muted-foreground text-sm">
                Visit our events page, select the event you&apos;re interested in, and follow the registration process. 
                You&apos;ll receive a confirmation email once registered.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-medium text-foreground mb-2">Can I cancel my registration?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, you can cancel your registration. Please refer to our cancellation policy for 
                refund details based on timing.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-medium text-foreground mb-2">How do I update my information?</h4>
              <p className="text-muted-foreground text-sm">
                Contact us with your updated information, and we&apos;ll help you update your alumni profile 
                and event registrations.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-medium text-foreground mb-2">Are events open to all alumni?</h4>
              <p className="text-muted-foreground text-sm">
                Most events are open to all AGS alumni. Some events may have specific requirements 
                or capacity limits, which will be mentioned in the event details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;