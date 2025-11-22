export default function DataProcessingAddendum() {
  return (
    <main className="min-h-screen relative overflow-x-hidden py-20 px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12"></div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white space-y-6 relative z-10">
        <h1 className="text-3xl font-bold mb-4">Data Processing Addendum (DPA)</h1>
        <p className="text-white/60 text-sm">Last Updated: January 22, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction and Scope</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              This Data Processing Addendum ("DPA") forms part of the Terms of Service between you ("Customer" or "Data Controller") and VibelyBuild.AI ("Processor") and governs the processing of Personal Data in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
            </p>
            <p className="text-white/80 leading-relaxed">
              This DPA applies when VibelyBuild.AI processes Personal Data on behalf of Customer in connection with the provision of services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">2. Definitions</h2>
            <p className="text-white/80 leading-relaxed mb-3">
              For the purposes of this DPA:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person</li>
              <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, and deletion</li>
              <li><strong>"Data Subject"</strong> means the individual to whom Personal Data relates</li>
              <li><strong>"Data Controller"</strong> means the entity that determines the purposes and means of processing Personal Data</li>
              <li><strong>"Data Processor"</strong> means the entity that processes Personal Data on behalf of the Data Controller</li>
              <li><strong>"Sub-processor"</strong> means any third-party processor engaged by the Processor</li>
              <li><strong>"GDPR"</strong> means the General Data Protection Regulation (EU) 2016/679</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">3. Roles and Responsibilities</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.1 Controller and Processor Relationship</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              The parties acknowledge that with regard to the processing of Personal Data:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Customer is the Data Controller and determines the purposes and means of processing</li>
              <li>VibelyBuild.AI is the Data Processor and processes data solely on behalf of the Customer</li>
              <li>VibelyBuild.AI shall process Personal Data only on documented instructions from the Customer</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">3.2 Dual Roles</h3>
            <p className="text-white/80 leading-relaxed">
              For certain processing activities (e.g., account management, analytics), VibelyBuild.AI acts as an independent Data Controller. These activities are governed by our Privacy Policy rather than this DPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Processing Details</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.1 Subject Matter and Nature of Processing</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI processes Personal Data to provide AI-powered application generation, hosting, and publishing services as described in the Terms of Service.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.2 Purpose of Processing</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Generating applications based on Customer inputs</li>
              <li>Storing and managing Customer projects and builds</li>
              <li>Providing live preview and download functionality</li>
              <li>Publishing Customer applications to the Store (when initiated by Customer)</li>
              <li>Facilitating messaging and community features</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.3 Duration of Processing</h3>
            <p className="text-white/80 leading-relaxed">
              Processing will continue for the duration of the Customer's use of the Service and for a reasonable period thereafter as necessary to fulfill legal obligations or resolve disputes.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.4 Types of Personal Data</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Account information (name, email, profile data)</li>
              <li>User-generated content (app prompts, descriptions, code)</li>
              <li>Usage data (build history, feature usage, analytics)</li>
              <li>Technical data (IP addresses, device information, logs)</li>
              <li>Communication data (messages, support requests)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">4.5 Categories of Data Subjects</h3>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Customer's employees, contractors, and authorized users</li>
              <li>End users of Customer-generated applications (if applicable)</li>
              <li>Individuals featured in Customer-provided content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">5. Processor Obligations</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.1 Processing Instructions</h3>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI shall process Personal Data only on documented instructions from the Customer, unless required by applicable law. If legally required to process data contrary to Customer's instructions, we will notify Customer before processing (unless prohibited by law).
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.2 Confidentiality</h3>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI ensures that persons authorized to process Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.3 Security Measures</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              VibelyBuild.AI implements appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Encryption of Personal Data in transit and at rest</li>
              <li>Regular security testing and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Incident response and breach notification procedures</li>
              <li>Regular backups and disaster recovery capabilities</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">5.4 Data Breach Notification</h3>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI will notify Customer without undue delay (and in any event within 72 hours) after becoming aware of a Personal Data breach affecting Customer data. Notification will include available information about the nature of the breach, affected data categories, and remedial measures taken.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">6. Sub-processors</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.1 Authorized Sub-processors</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Customer authorizes VibelyBuild.AI to engage the following sub-processors:
            </p>

            <div className="bg-white/5 rounded-lg border border-white/10 p-4 space-y-3">
              <div>
                <p className="text-white font-semibold">Google Cloud Platform / Firebase</p>
                <p className="text-white/60 text-sm">Purpose: Database (Firestore), Authentication, Storage, Analytics</p>
                <p className="text-white/60 text-sm">Location: United States, European Union</p>
              </div>
              <div>
                <p className="text-white font-semibold">OpenAI (ChatGPT/GPT-4)</p>
                <p className="text-white/60 text-sm">Purpose: AI code generation and content creation</p>
                <p className="text-white/60 text-sm">Location: United States</p>
              </div>
              <div>
                <p className="text-white font-semibold">Anthropic (Claude)</p>
                <p className="text-white/60 text-sm">Purpose: AI code generation and content creation</p>
                <p className="text-white/60 text-sm">Location: United States</p>
              </div>
              <div>
                <p className="text-white font-semibold">Google AI (Gemini)</p>
                <p className="text-white/60 text-sm">Purpose: AI code generation and content creation</p>
                <p className="text-white/60 text-sm">Location: United States, European Union</p>
              </div>
              <div>
                <p className="text-white font-semibold">Stripe</p>
                <p className="text-white/60 text-sm">Purpose: Payment processing</p>
                <p className="text-white/60 text-sm">Location: United States, European Union</p>
              </div>
              <div>
                <p className="text-white font-semibold">Vercel / Render</p>
                <p className="text-white/60 text-sm">Purpose: Application hosting and deployment</p>
                <p className="text-white/60 text-sm">Location: United States, European Union, Global CDN</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.2 Sub-processor Changes</h3>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI will notify Customer of any intended changes to sub-processors at least 30 days in advance. Customer may object to such changes within 15 days. If Customer objects, we will work with Customer to find a reasonable solution or allow termination of the Service.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">6.3 Sub-processor Obligations</h3>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI ensures that sub-processors are bound by data protection obligations equivalent to those in this DPA, including appropriate technical and organizational security measures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">7. Data Subject Rights</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">7.1 Assistance with Requests</h3>
            <p className="text-white/80 leading-relaxed">
              Taking into account the nature of processing, VibelyBuild.AI shall assist Customer by implementing appropriate technical and organizational measures to fulfill Customer's obligation to respond to Data Subject rights requests (access, rectification, erasure, restriction, portability, objection).
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">7.2 Response Timeframe</h3>
            <p className="text-white/80 leading-relaxed">
              If VibelyBuild.AI receives a Data Subject request directly, we will forward it to Customer within 5 business days. Customer remains responsible for responding to Data Subjects within applicable legal timeframes (typically 30 days under GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">8. Data Transfers</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">8.1 International Transfers</h3>
            <p className="text-white/80 leading-relaxed mb-3">
              Personal Data may be transferred to and processed in countries outside the European Economic Area (EEA), including the United States. VibelyBuild.AI ensures appropriate safeguards are in place for such transfers:
            </p>
            <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-2 ml-4">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions for transfers to countries deemed adequate by the European Commission</li>
              <li>EU-U.S. Data Privacy Framework participation (where applicable)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">8.2 Transfer Mechanism Documentation</h3>
            <p className="text-white/80 leading-relaxed">
              Upon request, VibelyBuild.AI will provide Customer with documentation of the transfer mechanisms in place, including copies of Standard Contractual Clauses where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">9. Data Deletion and Return</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">9.1 Deletion Upon Termination</h3>
            <p className="text-white/80 leading-relaxed">
              Upon termination of the Service, VibelyBuild.AI will delete or return all Personal Data to Customer (at Customer's choice), unless retention is required by applicable law. Deletion will occur within 90 days of termination.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">9.2 Certification of Deletion</h3>
            <p className="text-white/80 leading-relaxed">
              Upon request, VibelyBuild.AI will provide written certification that Personal Data has been deleted in accordance with this DPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">10. Audits and Compliance</h2>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">10.1 Audit Rights</h3>
            <p className="text-white/80 leading-relaxed">
              VibelyBuild.AI shall make available to Customer all information necessary to demonstrate compliance with the obligations in this DPA and allow for and contribute to audits, including inspections, conducted by Customer or an auditor mandated by Customer.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2 text-purple-300">10.2 Audit Frequency and Notice</h3>
            <p className="text-white/80 leading-relaxed">
              Audits may be conducted once per year with 30 days advance notice, unless required more frequently by a supervisory authority or in response to a suspected data breach.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">11. Liability and Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              Each party's liability under this DPA is subject to the exclusions and limitations of liability set out in the Terms of Service. VibelyBuild.AI shall be liable for damages caused by processing Personal Data in violation of GDPR or this DPA only to the extent not caused by Customer's instructions or Customer's breach of its own obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">12. Term and Termination</h2>
            <p className="text-white/80 leading-relaxed">
              This DPA will remain in effect for as long as VibelyBuild.AI processes Personal Data on behalf of Customer. Upon termination of the Service or this DPA, the data deletion provisions in Section 9 will apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-2">13. Contact for DPA Matters</h2>
            <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/80">
                <strong>VibelyBuild.AI - Data Protection Officer</strong><br />
                Email: dpo@vibelybuildai.com<br />
                Privacy Team: privacy@vibelybuildai.com<br />
                Legal Team: legal@vibelybuildai.com
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-sm text-center">
              This Data Processing Addendum is effective as of the date of your acceptance of the Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
