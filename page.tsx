'use client';

import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-6">Terms and Conditions</h1>
          
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              By accessing and using CogniFatigue, you agree to be bound by these terms and conditions.
              If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">2. Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your use of CogniFatigue is also governed by our Privacy Policy, which outlines how we collect,
              use, and protect your personal information.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Users are responsible for maintaining the confidentiality of their account information
              and for all activities that occur under their account.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">4. Data Usage</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The cognitive fatigue detection results and test data are used for assessment purposes only
              and should not be considered as medical advice. Please consult healthcare professionals for
              medical decisions.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">5. Service Modifications</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify or discontinue the service at any time without notice.
              We shall not be liable to you or any third party for any modification, suspension, or
              discontinuance of the service.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              For any questions about these Terms and Conditions, please contact us through our support channels.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}