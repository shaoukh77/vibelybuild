export default function Disclaimer() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Disclaimer</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. General Disclaimer</h2>
            <p className="text-white/80 leading-relaxed">
              The information and services provided by VibelyBuild.AI are for general informational and educational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the Service or any information, products, services, or related graphics provided through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. AI-Generated Content Disclaimer</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.1 Potential Errors and Inaccuracies</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>AI-generated applications, code, advertisements, and content may contain errors, bugs, security vulnerabilities, or inaccuracies.</strong> Artificial intelligence systems are not perfect and may produce outputs that are:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Functionally incomplete or non-working</li>
              <li>Insecure or vulnerable to exploitation</li>
              <li>Inefficient or poorly optimized</li>
              <li>Incompatible with certain devices, browsers, or platforms</li>
              <li>Containing deprecated or outdated code patterns</li>
              <li>Logically inconsistent or contradictory</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.2 User Responsibility for Review</h3>
            <p className="text-white/80 leading-relaxed">
              <strong>YOU ARE SOLELY RESPONSIBLE for reviewing, testing, debugging, and validating all AI-generated outputs before use, deployment, or distribution.</strong> We strongly recommend having qualified developers review and modify AI-generated code before production use.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.3 No Guarantee of Functionality</h3>
            <p className="text-white/80 leading-relaxed">
              We do not guarantee that AI-generated applications will work as intended, compile successfully, or be free from errors. Generated applications are provided "as is" and may require significant modification to be production-ready.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. Not Professional Advice</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.1 Not Legal Advice</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI does not provide legal advice. Any legal information provided through the Service is for general informational purposes only and should not be relied upon as legal counsel. You should consult with a qualified attorney for legal matters specific to your situation.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.2 Not Medical Advice</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI is not a healthcare provider and does not offer medical advice, diagnosis, or treatment. Any health-related applications generated through the Service are for informational purposes only. Always consult with qualified healthcare professionals for medical concerns.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.3 Not Financial Advice</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI does not provide financial, investment, tax, or accounting advice. Any financial applications or calculators generated through the Service are for educational and informational purposes only. Consult with licensed financial professionals before making financial decisions.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.4 Not Technical Consulting</h3>
            <p className="text-white/80 leading-relaxed">
              While we provide AI-powered application generation tools, this does not constitute professional software development consulting. For mission-critical, enterprise, or complex projects, we recommend engaging qualified software development professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. Developer Misuse and Responsibility</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.1 Not Responsible for User Applications</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              <strong>We are not responsible for how you use, modify, or deploy AI-generated applications.</strong> You bear full responsibility for:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Ensuring compliance with all applicable laws and regulations</li>
              <li>Testing and validating functionality before deployment</li>
              <li>Implementing proper security measures</li>
              <li>Protecting user data and privacy</li>
              <li>Obtaining necessary licenses and permissions</li>
              <li>Providing support and maintenance to your end users</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.2 No Liability for Third-Party Damages</h3>
            <p className="text-white/80 leading-relaxed">
              We are not liable for any damages, losses, or claims arising from your use of AI-generated applications, including but not limited to data breaches, financial losses, business interruptions, or harm to end users.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.3 Compliance is Your Responsibility</h3>
            <p className="text-white/80 leading-relaxed">
              You are responsible for ensuring that your applications comply with platform-specific requirements (Apple App Store, Google Play Store, etc.), accessibility standards, data protection laws, and industry regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Beta and Pre-Release Disclaimer</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI or certain features may be offered as "Beta," "Pre-Beta," or "Early Access." These features:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Are provided for evaluation and testing purposes</li>
              <li>May be unstable, incomplete, or contain significant bugs</li>
              <li>May change or be discontinued without notice</li>
              <li>Are provided without service level agreements (SLAs)</li>
              <li>Should not be used for production or mission-critical applications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Third-Party Services and Content</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI integrates with third-party services (OpenAI, Anthropic, Google AI, Firebase, Stripe). We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>The availability, reliability, or accuracy of third-party services</li>
              <li>Changes to third-party APIs, pricing, or terms</li>
              <li>Data processing practices of third-party providers</li>
              <li>Service interruptions caused by third-party failures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. VibelyBuild Store Disclaimer</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              Applications published to the VibelyBuild Store are created and maintained by independent developers. We do not:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Guarantee the functionality, security, or quality of published apps</li>
              <li>Endorse or recommend any specific applications</li>
              <li>Verify the accuracy of app descriptions or screenshots</li>
              <li>Assume liability for damages caused by third-party apps</li>
              <li>Provide support for applications we did not create</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              Use published applications at your own risk. Report malicious or inappropriate apps using the reporting tools provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. No Warranty</h2>
            <p className="text-white/80 leading-relaxed">
              THE SERVICE AND ALL AI-GENERATED CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, OR RELIABILITY. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR VIRUS-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIBELYBUILD.AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE OR AI-GENERATED CONTENT, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. Security Disclaimer</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              While we implement security measures to protect the Service, we cannot guarantee absolute security. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Internet transmission is never completely secure</li>
              <li>AI-generated code may contain security vulnerabilities</li>
              <li>You are responsible for implementing additional security measures</li>
              <li>You should conduct security audits before production deployment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Changes to This Disclaimer</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify this Disclaimer at any time. Changes will be effective immediately upon posting. Your continued use of the Service after changes constitutes acceptance of the modified Disclaimer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">12. Contact Information</h2>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI</strong><br />
                Email: legal@vibelybuildai.com<br />
                Support: support@vibelybuildai.com<br />
                Website: https://vibelybuildai.com
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              By using VibelyBuild.AI, you acknowledge that you have read, understood, and agree to this Disclaimer.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
