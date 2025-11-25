export default function CommunityGuidelines() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Community Guidelines</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. Welcome to VibelyBuild.AI Community</h2>
            <p className="text-white/80 leading-relaxed">
              Our community is built on creativity, collaboration, and respect. These guidelines help maintain a safe, positive, and productive environment for all users. By participating in the VibelyBuild.AI Feed, Messaging System, Store Comments, or any community features, you agree to follow these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. Core Principles</h2>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Be Respectful:</strong> Treat everyone with kindness and respect</li>
              <li><strong>Be Constructive:</strong> Provide helpful, actionable feedback</li>
              <li><strong>Be Authentic:</strong> Don't impersonate others or misrepresent yourself</li>
              <li><strong>Be Safe:</strong> Protect your privacy and the privacy of others</li>
              <li><strong>Be Legal:</strong> Follow all applicable laws and regulations</li>
              <li><strong>Be Original:</strong> Respect intellectual property and creative work</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. Feed Guidelines</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.1 Appropriate Content</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Content posted to the Feed should be:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Related to app development, AI, technology, or creativity</li>
              <li>Original or properly attributed if sharing others' work</li>
              <li>Valuable to the community (tutorials, tips, showcases, questions)</li>
              <li>Safe for work (no adult, graphic, or disturbing content)</li>
              <li>Constructive and positive in tone</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.2 Prohibited Feed Content</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Do not post:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Spam, promotional content, or excessive self-promotion</li>
              <li>Misleading, false, or deceptive information</li>
              <li>Hate speech, harassment, or discriminatory content</li>
              <li>Adult, sexual, or explicit content</li>
              <li>Violence, gore, or disturbing imagery</li>
              <li>Personal information (doxxing) about yourself or others</li>
              <li>Malware, phishing links, or malicious content</li>
              <li>Off-topic or irrelevant content</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.3 Self-Promotion</h3>
            <p className="text-white/80 leading-relaxed">
              Sharing your projects is encouraged! However, limit promotional posts to no more than 20% of your activity. Engage genuinely with the community rather than just advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. Messaging Guidelines</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.1 Respectful Communication</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              When messaging other users:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Be polite and professional</li>
              <li>Respect users' time and privacy</li>
              <li>Don't send unsolicited promotional messages or spam</li>
              <li>Accept "no" gracefully if someone declines collaboration</li>
              <li>Use appropriate language (no profanity, slurs, or harassment)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.2 Prohibited Messaging Behavior</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Harassment, stalking, or unwanted repeated contact</li>
              <li>Sending threats, abuse, or intimidating messages</li>
              <li>Sharing explicit, sexual, or inappropriate content</li>
              <li>Phishing, scamming, or fraudulent schemes</li>
              <li>Mass messaging or automated spam</li>
              <li>Soliciting personal information or off-platform contact</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.3 Blocking and Reporting</h3>
            <p className="text-white/80 leading-relaxed">
              You can block users to prevent them from contacting you. If you receive abusive or inappropriate messages, please report them using the in-app reporting feature.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Store Comment Guidelines</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.1 Constructive Feedback</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              When commenting on published apps:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Provide specific, actionable feedback</li>
              <li>Be constructive, not destructive</li>
              <li>Acknowledge positive aspects along with criticism</li>
              <li>Focus on the app, not the creator</li>
              <li>Suggest improvements when pointing out issues</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.2 Prohibited Comments</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Personal attacks or insults directed at creators</li>
              <li>Spam, promotional links, or off-topic comments</li>
              <li>False reviews or manipulated ratings</li>
              <li>Harassment or coordinated negative campaigns</li>
              <li>Disclosure of security vulnerabilities (report privately instead)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Safety and Privacy</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.1 Protect Your Privacy</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Don't share your password, API keys, or sensitive credentials</li>
              <li>Be cautious about sharing personal contact information publicly</li>
              <li>Use privacy settings to control who can contact you</li>
              <li>Don't share financial information through messages</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.2 Respect Others' Privacy</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Don't share others' personal information without consent</li>
              <li>Don't screenshot and share private conversations</li>
              <li>Don't attempt to gather personal data through deception</li>
              <li>Respect confidentiality if someone shares information privately</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.3 Child Safety</h3>
            <p className="text-white/80 leading-relaxed">
              Our Service is for users 18 and older. Do not share content that sexualizes, exploits, or endangers minors. Report any concerning content immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Intellectual Property and Attribution</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              Respect the creative work of others:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Don't copy or plagiarize others' apps, designs, or content</li>
              <li>Provide proper attribution when sharing others' work</li>
              <li>Respect open-source licenses and terms</li>
              <li>Don't use copyrighted assets without permission</li>
              <li>Don't impersonate brands or use trademarked names without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Creator Responsibilities</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">8.1 Published App Quality</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              If you publish apps to the Store, you are responsible for:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Testing functionality before publishing</li>
              <li>Providing accurate descriptions and screenshots</li>
              <li>Responding to bug reports and user feedback</li>
              <li>Updating apps to fix security issues</li>
              <li>Removing apps that violate guidelines</li>
              <li>Respecting end user privacy and data</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">8.2 Accurate Representation</h3>
            <p className="text-white/80 leading-relaxed">
              Don't mislead users about your app's capabilities, features, or limitations. Clearly disclose if an app collects data, requires permissions, or has in-app purchases (if applicable).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Reporting Violations</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">9.1 How to Report</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              If you see content or behavior that violates these guidelines:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Use the "Report" button on posts, apps, or comments</li>
              <li>Select the violation type and provide details</li>
              <li>Email abuse@vibelybuildai.com for serious violations</li>
              <li>Include screenshots or evidence if available</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">9.2 Report Review Process</h3>
            <p className="text-white/80 leading-relaxed">
              Our Trust & Safety team reviews all reports within 24-48 hours. We may remove violating content, issue warnings, or suspend accounts depending on severity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. Consequences for Violations</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">10.1 Enforcement Actions</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Depending on the severity and frequency of violations, we may:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Warning:</strong> First-time minor violations receive a warning</li>
              <li><strong>Content Removal:</strong> Violating posts, comments, or apps are deleted</li>
              <li><strong>Feature Restriction:</strong> Temporary loss of messaging or posting privileges</li>
              <li><strong>Account Suspension:</strong> Temporary ban for repeated violations (7-30 days)</li>
              <li><strong>Permanent Ban:</strong> Account termination for severe or repeated violations</li>
              <li><strong>Legal Action:</strong> Referral to authorities for illegal activity</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">10.2 Appeals</h3>
            <p className="text-white/80 leading-relaxed">
              If you believe enforcement action was taken in error, you may appeal by emailing appeals@vibelybuildai.com within 30 days with a detailed explanation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Positive Community Behavior</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              We encourage and celebrate:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Helping other users solve problems</li>
              <li>Sharing knowledge, tutorials, and resources</li>
              <li>Providing constructive feedback on projects</li>
              <li>Celebrating others' successes and achievements</li>
              <li>Collaborating on creative projects</li>
              <li>Welcoming new members to the community</li>
              <li>Reporting violations to keep the community safe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">12. Changes to These Guidelines</h2>
            <p className="text-white/80 leading-relaxed">
              We may update these Community Guidelines to address new issues or improve clarity. Material changes will be announced through the Feed or email notification. Continued participation in community features after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">13. Contact Us</h2>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI - Community Team</strong><br />
                General Inquiries: community@vibelybuildai.com<br />
                Report Abuse: abuse@vibelybuildai.com<br />
                Appeals: appeals@vibelybuildai.com<br />
                Safety Concerns: safety@vibelybuildai.com
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              Thank you for helping make VibelyBuild.AI a welcoming and creative community for all developers!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
