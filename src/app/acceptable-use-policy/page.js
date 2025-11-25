export default function AcceptableUsePolicy() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Acceptable Use Policy</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. Purpose</h2>
            <p className="text-white/80 leading-relaxed">
              This Acceptable Use Policy ("Policy") governs your use of VibelyBuild.AI and its services. This Policy is incorporated into and is part of our Terms of Service. By using the Service, you agree to comply with this Policy. Violation of this Policy may result in suspension or termination of your account without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. Prohibited Content</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              You may not use VibelyBuild.AI to create, generate, publish, or distribute content that:
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.1 Illegal Content</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Violates any local, state, national, or international law or regulation</li>
              <li>Facilitates illegal activities (drug trafficking, weapons sales, human trafficking, etc.)</li>
              <li>Promotes or enables fraud, scams, or financial crimes</li>
              <li>Infringes on intellectual property rights (copyright, trademark, patents)</li>
              <li>Violates export control laws or sanctions</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.2 Harmful or Dangerous Content</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Malware, viruses, ransomware, or malicious code</li>
              <li>Instructions for creating weapons, explosives, or harmful substances</li>
              <li>Content that promotes self-harm, suicide, or eating disorders</li>
              <li>Content that endangers the safety of minors</li>
              <li>Medical advice or treatments without proper disclaimers</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.3 Abusive or Hateful Content</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Hate speech targeting protected groups based on race, religion, ethnicity, gender, sexual orientation, disability, or other characteristics</li>
              <li>Harassment, bullying, or threats of violence</li>
              <li>Doxxing (sharing private personal information without consent)</li>
              <li>Content promoting discrimination or violence against individuals or groups</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.4 Adult and Sexual Content</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Pornography or sexually explicit content</li>
              <li>Content sexualizing minors or depicting minors in sexual situations</li>
              <li>Non-consensual intimate imagery</li>
              <li>Sex trafficking or prostitution services</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.5 Deceptive or Misleading Content</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Phishing applications or scam websites</li>
              <li>Impersonation of individuals, companies, or organizations</li>
              <li>False or misleading advertising claims</li>
              <li>Misinformation campaigns or coordinated inauthentic behavior</li>
              <li>Applications designed to deceive users about their functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. Prohibited Activities</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.1 Abuse of AI Services</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Generating applications solely for the purpose of spam or phishing</li>
              <li>Attempting to manipulate, jailbreak, or exploit AI models</li>
              <li>Using AI outputs to train competing AI models without permission</li>
              <li>Generating content at scale for bot networks or fake accounts</li>
              <li>Circumventing content filters or safety mechanisms</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.2 System Abuse and Attacks</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Denial-of-service (DoS) or distributed denial-of-service (DDoS) attacks</li>
              <li>Attempting to gain unauthorized access to systems or accounts</li>
              <li>Exploiting security vulnerabilities for malicious purposes</li>
              <li>Scraping, crawling, or harvesting data without permission</li>
              <li>Reverse engineering, decompiling, or disassembling the Service</li>
              <li>Interfering with the proper functioning of the Service</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.3 API Abuse and Fair Use</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Exceeding rate limits or making excessive API requests</li>
              <li>Using automated scripts to abuse free trial limits</li>
              <li>Creating multiple accounts to circumvent usage quotas</li>
              <li>Sharing API keys or account credentials with unauthorized users</li>
              <li>Reselling API access or build credits without authorization</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.4 Publishing Violations</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Publishing applications with misleading names or descriptions</li>
              <li>Uploading malware or trojans disguised as legitimate apps</li>
              <li>Spamming the Store with duplicate or low-quality apps</li>
              <li>Manipulating view counts, likes, or reviews</li>
              <li>Publishing apps that violate third-party platform policies (App Store, Google Play)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. Restricted Use Cases</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              The following use cases require special approval or are restricted:
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.1 High-Risk Applications</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Healthcare:</strong> Medical diagnosis, treatment recommendations, or healthcare provider apps require proper disclaimers and compliance with regulations (HIPAA, etc.)</li>
              <li><strong>Financial Services:</strong> Banking, investment advice, or financial management apps must comply with financial regulations</li>
              <li><strong>Legal Services:</strong> Legal advice or document preparation apps must include proper disclaimers</li>
              <li><strong>Critical Infrastructure:</strong> Apps controlling critical systems (power grids, transportation, etc.) require prior approval</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.2 Gambling and Betting</h3>
            <p className="text-white/80 leading-relaxed">
              Real-money gambling, sports betting, or casino apps are prohibited unless you provide proof of proper licensing and regulatory compliance.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.3 Cryptocurrency and Blockchain</h3>
            <p className="text-white/80 leading-relaxed">
              Cryptocurrency trading, ICOs, or blockchain apps must comply with applicable regulations and clearly disclose risks to users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Data Collection and Privacy</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              If your generated application collects user data, you must:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Provide a clear privacy policy to your users</li>
              <li>Obtain proper consent before collecting personal data</li>
              <li>Comply with GDPR, CCPA, and other privacy regulations</li>
              <li>Implement appropriate security measures to protect user data</li>
              <li>Not collect data from children under 13 without parental consent (COPPA compliance)</li>
              <li>Not sell or share user data without explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Intellectual Property Respect</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              You must respect the intellectual property rights of others:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Do not generate apps that infringe on copyrights, trademarks, or patents</li>
              <li>Do not impersonate brands or use trademarked names without permission</li>
              <li>Do not scrape or republish copyrighted content without authorization</li>
              <li>Respond promptly to DMCA takedown notices</li>
              <li>Respect open-source licenses if incorporating third-party code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Community Conduct</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              When using community features (Feed, Messaging, Store comments):
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Be respectful and professional in all interactions</li>
              <li>Do not spam, harass, or abuse other users</li>
              <li>Do not share inappropriate or offensive content</li>
              <li>Do not impersonate other users or create fake accounts</li>
              <li>Report violations using the reporting tools provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Enforcement and Consequences</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">8.1 Violation Consequences</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Violations of this Policy may result in:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Warning:</strong> First-time minor violations may receive a warning</li>
              <li><strong>Content Removal:</strong> Offending apps or content will be removed</li>
              <li><strong>Account Suspension:</strong> Temporary suspension for repeated violations</li>
              <li><strong>Account Termination:</strong> Permanent ban for severe or repeated violations</li>
              <li><strong>Legal Action:</strong> Referral to law enforcement for illegal activities</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">8.2 Appeals Process</h3>
            <p className="text-white/80 leading-relaxed">
              If you believe your account was suspended in error, you may appeal by contacting appeals@vibelybuildai.com within 30 days. We will review appeals on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Reporting Violations</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              If you encounter content or behavior that violates this Policy, please report it:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Use the "Report" button on published apps or content</li>
              <li>Email abuse@vibelybuildai.com with details and evidence</li>
              <li>For legal matters, contact legal@vibelybuildai.com</li>
              <li>For security vulnerabilities, contact security@vibelybuildai.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. Changes to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Acceptable Use Policy to reflect changes in legal requirements, industry standards, or platform capabilities. Material changes will be communicated via email or in-app notification. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Contact Information</h2>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI - Trust & Safety Team</strong><br />
                Abuse Reports: abuse@vibelybuildai.com<br />
                Security Issues: security@vibelybuildai.com<br />
                Appeals: appeals@vibelybuildai.com<br />
                Legal: legal@vibelybuildai.com
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              By using VibelyBuild.AI, you agree to comply with this Acceptable Use Policy. Violations may result in account termination without refund.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
