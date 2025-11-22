export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered application development platform and related services. This policy complies with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. Information We Collect</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, username, profile photo (via Google/Firebase Authentication)</li>
              <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through Stripe)</li>
              <li><strong>User Content:</strong> App prompts, descriptions, code, images, and other content you create or upload</li>
              <li><strong>Communication Data:</strong> Messages, support requests, and feedback you send us</li>
              <li><strong>Profile Information:</strong> Bio, preferences, and settings you configure</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, build requests, AI generation history, click patterns</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Log Data:</strong> Access times, error logs, API requests, system events</li>
              <li><strong>Cookies and Tracking:</strong> Session tokens, authentication cookies, analytics cookies (see Cookie Policy)</li>
              <li><strong>Performance Metrics:</strong> Build times, success rates, feature usage statistics</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.3 AI and Third-Party Data</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>AI API Data:</strong> Prompts and inputs sent to AI providers (OpenAI, Anthropic, Google AI)</li>
              <li><strong>Generated Content:</strong> AI-generated code, images, and text stored for your projects</li>
              <li><strong>Firebase/Firestore:</strong> User data, project metadata, build history stored in Google Cloud</li>
              <li><strong>Analytics:</strong> Aggregated usage statistics via Firebase Analytics and Google Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. How We Use Your Information</h2>
            <p className="text-white/80 leading-relaxed mb-3">We use collected information for the following purposes:</p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.1 Service Provision</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Generate applications, ads, and marketing content using AI</li>
              <li>Store and manage your projects, builds, and published apps</li>
              <li>Provide live preview, download, and publishing features</li>
              <li>Process payments and manage subscriptions</li>
              <li>Deliver customer support and respond to inquiries</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.2 Improvement and Development</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Analyze usage patterns to improve AI models and features</li>
              <li>Debug errors, fix bugs, and enhance performance</li>
              <li>Develop new features and services</li>
              <li>Conduct research on AI application generation effectiveness</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.3 Communication</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Send transactional emails (build completion, payment confirmations)</li>
              <li>Notify you of system updates, new features, and service changes</li>
              <li>Send marketing communications (with your consent, opt-out available)</li>
              <li>Respond to support requests and feedback</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.4 Security and Compliance</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Detect and prevent fraud, abuse, and unauthorized access</li>
              <li>Enforce our Terms of Service and Acceptable Use Policy</li>
              <li>Comply with legal obligations and regulatory requirements</li>
              <li>Protect the rights, property, and safety of our users and the public</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Sharing and Disclosure</h2>
            <p className="text-white/80 leading-relaxed mb-3">We share your information in the following circumstances:</p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.1 Service Providers and Processors</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Firebase/Google Cloud:</strong> Authentication, database (Firestore), hosting, analytics</li>
              <li><strong>OpenAI, Anthropic, Google AI:</strong> AI model providers for code and content generation</li>
              <li><strong>Stripe:</strong> Payment processing and billing management</li>
              <li><strong>Vercel/Render:</strong> Application hosting and deployment infrastructure</li>
              <li><strong>Puppeteer/Chrome:</strong> Screenshot generation (server-side only)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.2 Public Information</h3>
            <p className="text-white/80 leading-relaxed">
              Information you publish to the VibelyBuild Store (app names, descriptions, screenshots) is publicly accessible. User profiles, feed posts, and public comments are visible to other users.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.3 Legal Requirements</h3>
            <p className="text-white/80 leading-relaxed">
              We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.4 Business Transfers</h3>
            <p className="text-white/80 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Storage and Security</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.1 Storage Locations</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Your data is stored on secure servers provided by:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Google Cloud Platform (Firestore):</strong> User accounts, project metadata, published apps</li>
              <li><strong>Server File System:</strong> Generated project files, screenshots, ZIP bundles (temporary)</li>
              <li><strong>Firebase Storage:</strong> User-uploaded images and media</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.2 Security Measures</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Encryption in transit (HTTPS/TLS) for all data transmission</li>
              <li>Firebase Authentication with secure session management</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and role-based permissions</li>
              <li>Secure API keys and environment variable management</li>
              <li>Automated backup and disaster recovery procedures</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.3 Data Retention</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Account Data:</strong> Retained until account deletion or 3 years of inactivity</li>
              <li><strong>Build History:</strong> Retained for 90 days, then deleted from cache</li>
              <li><strong>Published Apps:</strong> Retained indefinitely until manually removed</li>
              <li><strong>Log Data:</strong> Retained for 30 days for debugging and security purposes</li>
              <li><strong>Billing Records:</strong> Retained for 7 years for tax and legal compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Your Privacy Rights</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.1 GDPR Rights (European Users)</h3>
            <p className="text-white/80 leading-relaxed mb-3">If you are located in the European Economic Area (EEA), you have the following rights:</p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restriction:</strong> Limit how we process your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.2 CCPA Rights (California Residents)</h3>
            <p className="text-white/80 leading-relaxed mb-3">If you are a California resident, you have the following rights:</p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Right to Know:</strong> Request disclosure of data collection and sharing practices</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell data)</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy rights exercise</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.3 Exercising Your Rights</h3>
            <p className="text-white/80 leading-relaxed">
              To exercise any of these rights, contact us at privacy@vibelybuildai.com. We will respond within 30 days. You may also access, update, or delete certain information through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Cookies and Tracking Technologies</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              We use cookies and similar tracking technologies to enhance your experience. See our Cookie Policy for detailed information. Key cookies include:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Authentication, session management, security</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics, Firebase Analytics for usage statistics</li>
              <li><strong>Functional Cookies:</strong> User preferences, language settings, theme selection</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              You can control cookies through your browser settings. Note that disabling essential cookies may affect service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Children's Privacy</h2>
            <p className="text-white/80 leading-relaxed">
              Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected information from a child under 18, we will promptly delete such information. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. International Data Transfers</h2>
            <p className="text-white/80 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) for transfers from the EEA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. AI Model Provider Data Usage</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              When you use AI generation features, your prompts and inputs are sent to third-party AI providers:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>OpenAI:</strong> Subject to OpenAI's API Data Usage Policies. Data is not used to train models by default.</li>
              <li><strong>Anthropic (Claude):</strong> Subject to Anthropic's Commercial Terms. Data is not used for model training.</li>
              <li><strong>Google AI:</strong> Subject to Google Cloud AI/ML Terms. Data processing follows Google Cloud privacy commitments.</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              We recommend not including sensitive, confidential, or personal information in AI prompts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Changes to This Privacy Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or prominent notice on our website. Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">12. Contact Us</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us:
            </p>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI - Privacy Team</strong><br />
                Email: privacy@vibelybuildai.com<br />
                Data Protection Officer: dpo@vibelybuildai.com<br />
                Website: https://vibelybuildai.com/privacy-policy<br />
                Support: https://vibelybuildai.com/support
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              By using VibelyBuild.AI, you consent to the collection and use of information as described in this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
