export default function RefundPolicy() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Refund Policy</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. Overview</h2>
            <p className="text-white/80 leading-relaxed">
              This Refund Policy explains the terms and conditions under which VibelyBuild.AI may issue refunds for subscription fees and other charges. As a Software-as-a-Service (SaaS) platform providing AI-generated applications and digital services, refunds are handled on a case-by-case basis according to the guidelines below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. General Refund Policy</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>2.1 No Refunds After Usage:</strong> Due to the nature of our AI-powered services, once you have used the Service to generate applications, advertisements, or other content, refunds are generally not available. This includes but is not limited to:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Completed app builds or generations</li>
              <li>AI-generated advertisements or marketing content</li>
              <li>Published applications to the VibelyBuild Store</li>
              <li>Downloaded project files or ZIP bundles</li>
              <li>Consumed API credits or usage quota</li>
            </ul>

            <p className="text-white/80 leading-relaxed mt-4">
              <strong>2.2 Digital Service Nature:</strong> Because AI-generated outputs are delivered immediately and cannot be "returned," we cannot offer refunds once generation has occurred.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. Subscription Refunds</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.1 Monthly Subscriptions</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Monthly subscription fees are <strong>non-refundable</strong>. You may cancel your subscription at any time, and your access will continue until the end of the current billing period. No refunds will be issued for partial months.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.2 Annual Subscriptions</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Annual subscription fees are <strong>non-refundable</strong> after the first 14 days. You may request a refund within 14 days of purchase if you have not used the Service to generate any content. After 14 days or upon first usage, annual fees are non-refundable.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.3 Cancellation Policy</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation will take effect at the end of the current billing period</li>
              <li>You will retain access to your subscription features until the period ends</li>
              <li>No refunds will be issued for early cancellation</li>
              <li>Downloaded project files and published apps will remain accessible after cancellation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. Exceptional Circumstances for Refunds</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              We may issue refunds at our sole discretion in the following exceptional cases:
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.1 Technical Failures</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              If our Service experiences extended downtime or technical issues that prevent you from using your subscription for more than 72 consecutive hours, you may be eligible for a prorated refund for the affected period.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.2 Billing Errors</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              If you are charged incorrectly due to a system error (duplicate charges, wrong subscription tier, etc.), we will issue a full refund for the erroneous charge within 5-7 business days.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.3 Unauthorized Charges</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              If you report unauthorized charges on your account within 30 days and can provide evidence of unauthorized access, we will investigate and may issue a refund if the claim is validated.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.4 Service Not as Described</h3>
            <p className="text-white/80 leading-relaxed">
              If the Service materially fails to perform as advertised, you may request a refund within 7 days of initial subscription, provided you have not extensively used the Service (fewer than 3 builds generated).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Beta and Pre-Beta Access</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.1 Beta Program Refunds</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              If you are participating in a Beta or Pre-Beta access program:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Free Beta:</strong> No refunds applicable as no payment is collected</li>
              <li><strong>Paid Beta:</strong> Special refund terms may apply as communicated during beta enrollment</li>
              <li>Beta features are provided "as is" with limited stability guarantees</li>
              <li>Issues with beta features do not constitute grounds for refund</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.2 Early Access Pricing</h3>
            <p className="text-white/80 leading-relaxed">
              Early access or promotional pricing is final sale. Discounted subscriptions are non-refundable even within the standard refund windows.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Requesting a Refund</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.1 Refund Request Process</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Contact our support team at refunds@vibelybuildai.com</li>
              <li>Provide your account email, transaction ID, and reason for refund</li>
              <li>Include any supporting documentation (error logs, screenshots, etc.)</li>
              <li>Our team will review your request within 5 business days</li>
              <li>You will receive a decision via email</li>
              <li>If approved, refunds are processed within 7-10 business days</li>
            </ol>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.2 Required Information</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Your refund request must include:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Account email address</li>
              <li>Date of charge</li>
              <li>Transaction ID or invoice number</li>
              <li>Detailed reason for refund request</li>
              <li>Evidence supporting your claim (if applicable)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.3 Refund Methods</h3>
            <p className="text-white/80 leading-relaxed">
              Approved refunds will be issued to the original payment method used for the purchase. Refunds may take 7-10 business days to appear in your account, depending on your payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Chargebacks and Disputes</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">7.1 Chargeback Policy</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Initiating a chargeback without first contacting us may result in immediate suspension of your account. We encourage you to work with our support team to resolve billing disputes before filing chargebacks.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">7.2 Fraudulent Chargebacks</h3>
            <p className="text-white/80 leading-relaxed">
              Filing fraudulent chargebacks (e.g., claiming non-delivery after using the Service) is a violation of our Terms of Service and may result in permanent account termination and legal action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Non-Refundable Items and Services</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              The following are explicitly non-refundable:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>AI generation credits after usage</li>
              <li>One-time purchases (e.g., additional build credits)</li>
              <li>Setup fees or onboarding charges</li>
              <li>Custom development or consulting services</li>
              <li>Enterprise contract fees (unless specified otherwise)</li>
              <li>Third-party service fees (Stripe processing fees, etc.)</li>
              <li>Taxes paid on behalf of the customer</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Account Termination and Refunds</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>9.1 Voluntary Termination:</strong> If you voluntarily delete your account or cancel your subscription, no refunds will be issued for the remaining subscription period.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>9.2 Involuntary Termination:</strong> If we terminate your account for violation of our Terms of Service or Acceptable Use Policy, no refunds will be issued, regardless of the remaining subscription period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. Changes to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website. Material changes will be communicated via email. Your continued use of the Service after changes constitutes acceptance of the modified policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Contact Information</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              For refund requests or questions about this policy, contact us:
            </p>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI - Refunds Department</strong><br />
                Email: refunds@vibelybuildai.com<br />
                Support: support@vibelybuildai.com<br />
                Website: https://vibelybuildai.com/refund-policy
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              By subscribing to VibelyBuild.AI, you acknowledge and agree to this Refund Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
