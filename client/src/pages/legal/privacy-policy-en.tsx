import React from 'react';

export default function PrivacyPolicyEN() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Data Controller Information</h2>
              <p className="mb-4">
                <strong>OnCall Clinic</strong> (hereinafter, "the Platform") acts as an <strong>intermediary on behalf of others</strong> 
                facilitating the contracting of home medical services between patients and registered healthcare professionals. 
                Medical services are provided directly by doctors registered on our platform.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Company name: OnCall Clinic S.L.</li>
                <li>Tax ID (CIF): B-12345678</li>
                <li>Address: Calle Ejemplo, 123, 28001 Madrid, Spain</li>
                <li>Email: privacy@oncallclinic.com</li>
                <li>Phone: +34 900 123 456</li>
                <li>DPO Contact: dpo@oncallclinic.com</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Data We Collect</h2>
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Patient Data</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Identity data: name, surname, DNI/NIE</li>
                <li>Contact data: email, phone, postal address</li>
                <li>Medical data: reason for consultation, medical history (when provided)</li>
                <li>Geolocation data: to coordinate medical visits</li>
                <li>Payment data: information necessary to process payment through Revolut Pay</li>
                <li>Usage data: interaction with the platform, cookies, device information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Doctor Data</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Professional data: medical license number, specialty, experience</li>
                <li>Tax data: NIF, fiscal address (for invoicing)</li>
                <li>Banking data: IBAN for fee transfers</li>
                <li>Documentation: ID, professional certificates</li>
                <li>Geolocation: to show real-time location during consultations</li>
                <li>Verification documents: identity documents, professional credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Purpose of Data Processing</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitate contracting of medical services between patients and doctors</li>
                <li>Payment processing and invoice generation</li>
                <li>Communication between parties (chat, notifications)</li>
                <li>Real-time tracking of medical consultations</li>
                <li>Claims management and customer service</li>
                <li>Compliance with legal and tax obligations</li>
                <li>Service improvement through statistical analysis</li>
                <li>Fraud prevention and platform security</li>
                <li>Marketing communications (with explicit consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Legal Basis</h2>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Contract performance:</strong> to provide intermediation services</li>
                <li><strong>Consent:</strong> for medical data and marketing communications</li>
                <li><strong>Legal obligation:</strong> to comply with tax and health regulations</li>
                <li><strong>Legitimate interest:</strong> for fraud prevention and service improvement</li>
                <li><strong>Vital interests:</strong> in emergency medical situations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Sharing</h2>
              <p className="mb-4">Your data may be shared with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Assigned doctors (only data necessary for consultation)</li>
                <li>Payment providers (Revolut) to process transactions</li>
                <li>Competent authorities when legally required</li>
                <li>Technical service providers under confidentiality agreements</li>
                <li>Professional verification services (for doctor validation)</li>
                <li>Insurance companies (with explicit consent for claims)</li>
              </ul>
              <p className="mb-4">
                <strong>International transfers:</strong> Some service providers may be located outside the EU. 
                In such cases, we ensure adequate protection through adequacy decisions or appropriate safeguards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Retention</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Billing data: 6 years (tax obligation)</li>
                <li>Medical data: 5 years (Patient Autonomy Law)</li>
                <li>Contact data: until you request deletion</li>
                <li>Geolocation data: 24 hours after consultation</li>
                <li>Marketing data: until consent is withdrawn</li>
                <li>Security logs: 12 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Rights</h2>
              <p className="mb-4">Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Access:</strong> obtain information about your personal data</li>
                <li><strong>Rectification:</strong> correct inaccurate data</li>
                <li><strong>Erasure:</strong> delete your data (right to be forgotten)</li>
                <li><strong>Restriction:</strong> limit processing under certain circumstances</li>
                <li><strong>Data portability:</strong> receive your data in a structured format</li>
                <li><strong>Object:</strong> oppose processing based on legitimate interests</li>
                <li><strong>Withdraw consent:</strong> at any time for consent-based processing</li>
                <li><strong>Lodge a complaint:</strong> with the Spanish Data Protection Agency (AEPD)</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, contact: <strong>privacy@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                We will respond within one month of receiving your request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Security Measures</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal data 
                against unauthorized access, alteration, disclosure, or destruction, including:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and authentication systems</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Staff training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to improve your experience. 
                For detailed information, please see our <a href="/legal/cookies-policy-en" className="text-blue-600 hover:underline">Cookie Policy</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Minors</h2>
              <p className="mb-4">
                Our services are intended for individuals 18 years or older. For minors, parental or guardian 
                consent is required. We do not knowingly collect personal data from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Updates to This Policy</h2>
              <p className="mb-4">
                We may update this privacy policy from time to time. We will notify you of any material changes 
                via email or through the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact and Complaints</h2>
              <p className="mb-4">
                For any questions about this privacy policy: <strong>privacy@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                You may file complaints with the Spanish Data Protection Agency (AEPD): 
                <a href="https://www.aepd.es" className="text-blue-600 hover:underline">www.aepd.es</a>
              </p>
              <p className="mb-4">
                Address: C/ Jorge Juan, 6, 28001 Madrid, Spain<br/>
                Phone: +34 901 100 099
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}