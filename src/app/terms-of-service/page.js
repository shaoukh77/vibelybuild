export default function TermsOfService() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
            <p className="text-white/80 leading-relaxed">
              By accessing or using VibelyBuild.AI ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. These Terms apply to all users, including but not limited to browsers, developers, creators, and publishers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. Description of Service</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI is an AI-powered application development platform that provides the following services:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>AI App Builder:</strong> Automated generation of web, iOS, and Android applications using artificial intelligence</li>
              <li><strong>AI Ads Generator:</strong> Creation of marketing advertisements using AI image generation</li>
              <li><strong>AI Marketing Suite:</strong> Automated marketing campaign tools and content generation</li>
              <li><strong>Publishing Store:</strong> Platform for publishing and distributing user-generated applications</li>
              <li><strong>Messaging System:</strong> Communication features between users and creators</li>
              <li><strong>Feed:</strong> Social content discovery and sharing platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. User Accounts and Registration</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>3.1 Account Creation:</strong> To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>3.2 Account Security:</strong> You are responsible for safeguarding your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>3.3 Age Requirement:</strong> You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you are at least 18 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. AI-Generated Content and Applications</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>4.1 AI Generation:</strong> The Service uses artificial intelligence to generate applications, advertisements, and marketing content. You acknowledge that AI-generated content may contain errors, inconsistencies, or inaccuracies.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>4.2 Review Responsibility:</strong> You are solely responsible for reviewing, testing, and validating all AI-generated content before use, deployment, or distribution. We do not guarantee the accuracy, functionality, or suitability of any AI-generated output.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>4.3 No Warranty:</strong> AI-generated applications are provided "as is" without warranties of any kind. You acknowledge that generated applications may require modification, debugging, or enhancement before production use.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>4.4 Intellectual Property:</strong> You retain ownership of the content you input into the Service. AI-generated outputs based on your inputs are provided to you under a non-exclusive license. You may use, modify, and distribute these outputs subject to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Publishing Store and Developer Responsibilities</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>5.1 Publishing Rights:</strong> By publishing an application to the VibelyBuild Store, you grant us a non-exclusive, worldwide, royalty-free license to host, distribute, and display your application.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>5.2 Content Standards:</strong> Published applications must comply with our Acceptable Use Policy and Community Guidelines. Applications containing illegal, harmful, or prohibited content will be removed without notice.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>5.3 Developer Obligations:</strong> As a developer/publisher, you are responsible for:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Ensuring your applications comply with all applicable laws and regulations</li>
              <li>Maintaining the security and privacy of user data collected by your applications</li>
              <li>Providing accurate descriptions and screenshots of your applications</li>
              <li>Responding to user support requests and bug reports</li>
              <li>Updating applications to fix security vulnerabilities</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              <strong>5.4 Removal Rights:</strong> We reserve the right to remove any published application at our sole discretion, with or without notice, for any reason including but not limited to violation of these Terms, user complaints, or security concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Subscription Plans and Payment</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>6.1 Subscription Tiers:</strong> The Service offers multiple subscription tiers (Free Trial, PRO, BUSINESS, ENTERPRISE) with varying features and usage limits. Pricing and features are subject to change with 30 days notice to active subscribers.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>6.2 Billing:</strong> Subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method on file for all applicable fees.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>6.3 Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>6.4 Usage Limits:</strong> Each subscription tier includes specific usage limits (builds per day, API calls, storage). Exceeding these limits may result in service interruption or additional charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Monetization and Payouts (Future Feature)</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>7.1 Store Revenue Sharing:</strong> When monetization features become available, we may offer revenue sharing for published applications. Specific terms, payout percentages, and eligibility requirements will be provided separately.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>7.2 Payment Processing:</strong> Payouts will be subject to minimum thresholds, payment processing fees, and tax withholding as required by law. You are responsible for providing accurate payment and tax information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Prohibited Uses</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Generate or publish applications that violate laws, regulations, or third-party rights</li>
              <li>Create malicious software, viruses, or applications designed to harm users</li>
              <li>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
              <li>Engage in automated abuse, scraping, or excessive API usage that disrupts service availability</li>
              <li>Circumvent usage limits, rate limits, or security measures</li>
              <li>Resell or redistribute the Service without explicit written permission</li>
              <li>Use the Service to create competing AI application generation services</li>
              <li>Generate content for illegal gambling, weapons, drugs, or other prohibited products/services</li>
              <li>Create applications designed to deceive, defraud, or phish users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Intellectual Property Rights</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>9.1 Platform Ownership:</strong> The Service, including all software, algorithms, designs, and documentation, is owned by VibelyBuild.AI and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>9.2 User Content:</strong> You retain all rights to content you provide to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your User Content solely for the purpose of providing the Service.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>9.3 AI Output:</strong> AI-generated applications and content are provided to you under a non-exclusive license. You may use these outputs for commercial purposes, but you may not claim exclusive ownership of AI-generated code patterns that are commonly generated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. Disclaimer of Warranties</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            <p className="text-white/80 leading-relaxed">
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT DEFECTS WILL BE CORRECTED. WE DO NOT WARRANT THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY AI-GENERATED CONTENT.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIBELYBUILD.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="text-white/80 leading-relaxed">
              OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">12. Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to indemnify, defend, and hold harmless VibelyBuild.AI, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising from your use of the Service, your violation of these Terms, or your violation of any rights of third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">13. Beta Access and Pre-Release Features</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>13.1 Beta Status:</strong> The Service or certain features may be offered as "Beta", "Pre-Beta", or "Early Access". These features are provided for evaluation purposes and may be unstable, incomplete, or changed without notice.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>13.2 No SLA:</strong> Beta features are provided without service level agreements (SLAs) and may be discontinued at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">14. Termination</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>14.1 Termination by You:</strong> You may terminate your account at any time by contacting support or using account deletion features.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>14.2 Termination by Us:</strong> We may suspend or terminate your access to the Service at any time, with or without cause, with or without notice. Reasons for termination may include violation of these Terms, fraudulent activity, or extended periods of inactivity.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>14.3 Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. We may delete your account data after termination. Published applications may remain in the Store unless you request removal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">15. Changes to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or in-app notification. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">16. Governing Law and Dispute Resolution</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>16.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where VibelyBuild.AI is registered, without regard to conflict of law principles.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>16.2 Dispute Resolution:</strong> Any disputes arising from these Terms or the Service shall first be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">17. Miscellaneous</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>17.1 Entire Agreement:</strong> These Terms constitute the entire agreement between you and VibelyBuild.AI regarding the Service.
            </p>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>17.2 Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
            </p>
            <p className="text-white/80 leading-relaxed">
              <strong>17.3 Waiver:</strong> No waiver of any term shall be deemed a further or continuing waiver of such term or any other term.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">18. Contact Information</h2>
            <p className="text-white/80 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI</strong><br />
                Email: legal@vibelybuildai.com<br />
                Website: https://vibelybuildai.com<br />
                Support: https://vibelybuildai.com/support
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              By using VibelyBuild.AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
