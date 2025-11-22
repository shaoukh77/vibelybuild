export default function CookiePolicy() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. What Are Cookies?</h2>
            <p className="text-white/80 leading-relaxed">
              Cookies are small text files stored on your device when you visit websites. They help websites remember your preferences, keep you logged in, and analyze how you use the site. VibelyBuild.AI uses cookies and similar technologies to enhance your experience and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. Types of Cookies We Use</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.1 Essential Cookies (Required)</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              These cookies are necessary for the Service to function and cannot be disabled:
            </p>

            <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
              <div>
                <p className="text-white font-semibold">Firebase Authentication Token</p>
                <p className="text-white/60 text-sm">Purpose: User authentication and session management</p>
                <p className="text-white/60 text-sm">Duration: Until logout or 7 days</p>
                <p className="text-white/60 text-sm">Provider: Google Firebase</p>
              </div>
              <div>
                <p className="text-white font-semibold">Session ID</p>
                <p className="text-white/60 text-sm">Purpose: Maintain user session across pages</p>
                <p className="text-white/60 text-sm">Duration: Session (deleted when browser closed)</p>
                <p className="text-white/60 text-sm">Provider: VibelyBuild.AI</p>
              </div>
              <div>
                <p className="text-white font-semibold">CSRF Token</p>
                <p className="text-white/60 text-sm">Purpose: Security protection against cross-site request forgery</p>
                <p className="text-white/60 text-sm">Duration: Session</p>
                <p className="text-white/60 text-sm">Provider: VibelyBuild.AI</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.2 Functional Cookies</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              These cookies enhance functionality and personalization:
            </p>

            <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
              <div>
                <p className="text-white font-semibold">User Preferences</p>
                <p className="text-white/60 text-sm">Purpose: Remember theme, language, and display settings</p>
                <p className="text-white/60 text-sm">Duration: 1 year</p>
                <p className="text-white/60 text-sm">Provider: VibelyBuild.AI</p>
              </div>
              <div>
                <p className="text-white font-semibold">Build History Cache</p>
                <p className="text-white/60 text-sm">Purpose: Store recent builds for quick access</p>
                <p className="text-white/60 text-sm">Duration: 30 days</p>
                <p className="text-white/60 text-sm">Provider: VibelyBuild.AI</p>
              </div>
              <div>
                <p className="text-white font-semibold">Liked Apps (localStorage)</p>
                <p className="text-white/60 text-sm">Purpose: Track which Store apps you've liked</p>
                <p className="text-white/60 text-sm">Duration: Permanent (until cleared)</p>
                <p className="text-white/60 text-sm">Provider: VibelyBuild.AI</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.3 Analytics Cookies</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              These cookies help us understand how you use the Service:
            </p>

            <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
              <div>
                <p className="text-white font-semibold">Google Analytics (_ga, _gid, _gat)</p>
                <p className="text-white/60 text-sm">Purpose: Usage analytics, traffic sources, user behavior</p>
                <p className="text-white/60 text-sm">Duration: 2 years (_ga), 24 hours (_gid), 1 minute (_gat)</p>
                <p className="text-white/60 text-sm">Provider: Google LLC</p>
              </div>
              <div>
                <p className="text-white font-semibold">Firebase Analytics</p>
                <p className="text-white/60 text-sm">Purpose: App usage metrics, feature adoption, error tracking</p>
                <p className="text-white/60 text-sm">Duration: 2 years</p>
                <p className="text-white/60 text-sm">Provider: Google Firebase</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">2.4 Performance Cookies</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              These cookies help us improve site performance:
            </p>

            <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
              <div>
                <p className="text-white font-semibold">Build Performance Metrics</p>
                <p className="text-white/60 text-sm">Purpose: Track build times, success rates, error rates</p>
                <p className="text-white/60 text-sm">Duration: 90 days</p>
                <p className="text-white/60 text-sm">Provider: VibelyBuild.AI</p>
              </div>
              <div>
                <p className="text-white font-semibold">CDN Cache</p>
                <p className="text-white/60 text-sm">Purpose: Content delivery optimization</p>
                <p className="text-white/60 text-sm">Duration: Varies by resource</p>
                <p className="text-white/60 text-sm">Provider: Vercel / Render</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. Third-Party Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              We use services from trusted third parties that may set cookies on your device:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Google (Firebase, Analytics):</strong> Authentication, analytics, crash reporting</li>
              <li><strong>Stripe:</strong> Payment processing (if you make a purchase)</li>
              <li><strong>OpenAI, Anthropic, Google AI:</strong> No cookies set (server-side API calls only)</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              These third parties have their own privacy policies governing their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. How We Use Cookies</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              We use cookies to:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze usage patterns to improve features</li>
              <li>Track build success rates and performance</li>
              <li>Prevent fraud and abuse</li>
              <li>Provide personalized experiences</li>
              <li>Measure the effectiveness of our marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Managing Cookies</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.1 Browser Settings</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              You can control cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.2 Opt-Out Options</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>Google Analytics Opt-Out:</strong> Install the <a href="https://tools.google.com/dlpage/gaoptout" className="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a></li>
              <li><strong>Do Not Track:</strong> We respect browser Do Not Track signals for analytics cookies</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.3 Impact of Disabling Cookies</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Disabling cookies may affect your experience:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>You may be logged out frequently</li>
              <li>Your preferences won't be saved</li>
              <li>Some features may not work properly</li>
              <li>Build history may not persist</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              <strong>Note:</strong> Essential cookies are required for the Service to function. Disabling them will prevent you from using VibelyBuild.AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Local Storage and Similar Technologies</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              In addition to cookies, we use browser local storage and session storage to:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Cache build data for faster loading</li>
              <li>Store draft app prompts before submission</li>
              <li>Track liked apps in the Store</li>
              <li>Save UI preferences (theme, layout)</li>
            </ul>
            <p className="text-white/80 leading-relaxed mt-3">
              You can clear local storage through your browser's developer tools or site settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Cookie Consent</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              By using VibelyBuild.AI, you consent to the use of cookies as described in this policy. When you first visit our site, we may display a cookie banner informing you about our use of cookies and allowing you to manage your preferences.
            </p>
            <p className="text-white/80 leading-relaxed">
              You can withdraw your consent at any time by adjusting your browser settings or contacting us at privacy@vibelybuildai.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Updates to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We may update this Cookie Policy to reflect changes in our practices or applicable laws. We will notify you of material changes by posting the updated policy on our website with a new "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI - Privacy Team</strong><br />
                Email: privacy@vibelybuildai.com<br />
                Cookie Questions: cookies@vibelybuildai.com<br />
                Website: https://vibelybuildai.com/cookie-policy
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              By continuing to use VibelyBuild.AI, you consent to our use of cookies as outlined in this policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
