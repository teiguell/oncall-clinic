import React from 'react';

export default function TermsOfUseEN() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions of Use</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Service Object and Nature</h2>
              <p className="mb-4">
                OnCall Clinic S.L. (hereinafter, "the Platform") acts as an <strong>intermediary on behalf of others</strong> 
                facilitating the contracting of home medical services between patients and independent registered 
                healthcare professionals.
              </p>
              <p className="mb-4">
                <strong>IMPORTANT:</strong> Medical services are provided directly by registered doctors. 
                The Platform does NOT provide healthcare services, it only facilitates contact 
                and coordination between parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Platform Users</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">2.1 Patients</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Must be 18 years or older or have parental authorization</li>
                <li>Must provide truthful and up-to-date information</li>
                <li>Are responsible for paying the doctor directly for services received</li>
                <li>Can access appointment tracking via unique code</li>
                <li>Must respect doctors' professional schedules and availability</li>
                <li>Must provide safe access to their home for medical visits</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">2.2 Doctors</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Must be licensed and in active practice</li>
                <li>Are independent professionals who invoice patients directly</li>
                <li>Must complete their tax data to activate their profile</li>
                <li>Are responsible for providing medical services</li>
                <li>Pay a commission to the Platform for each managed service</li>
                <li>Must maintain valid professional insurance</li>
                <li>Must comply with professional ethics and medical standards</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Service Operation</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Booking Process</h3>
              <ol className="list-decimal pl-6 mb-4">
                <li>Patient requests medical consultation through the Platform</li>
                <li>Platform assigns an available doctor in the area</li>
                <li>Patient makes payment through Revolut Pay</li>
                <li>Corresponding invoices are automatically generated</li>
                <li>Doctor visits patient's home</li>
                <li>Both parties confirm service completion</li>
              </ol>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Invoicing System</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Doctor issues invoice to patient (VAT exempt according to healthcare regulations)</li>
                <li>Platform issues invoice to doctor for intermediation commission (with VAT)</li>
                <li>All invoices are generated and sent automatically</li>
                <li>Invoices comply with Spanish tax legislation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Prices and Payments</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Prices are set independently by each doctor</li>
                <li>Payment is made through Revolut Pay before consultation</li>
                <li>Fees are transferred to the doctor after deducting Platform commission</li>
                <li>Platform commission is 15% of total amount</li>
                <li>All prices include applicable taxes</li>
                <li>Prices may vary based on specialty, time, and location</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Tracking and Traceability</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Each appointment generates a unique tracking code</li>
                <li>Patients can check real-time status without registration</li>
                <li>Doctor geolocation provided during 15 minutes prior to arrival</li>
                <li>Direct chat system between doctor and patient</li>
                <li>Mandatory completion confirmation by both parties</li>
                <li>Complete audit trail for quality and security purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Responsibilities</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">6.1 Platform Responsibilities</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Facilitate contact between doctors and patients</li>
                <li>Process payments securely</li>
                <li>Handle complaints related to intermediation service</li>
                <li>Maintain data confidentiality</li>
                <li>Verify doctor credentials and licensing</li>
                <li>Provide technical support for the platform</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.2 Doctor Responsibilities</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide medical services according to professional ethics</li>
                <li>Maintain valid professional insurance</li>
                <li>Comply with schedules and commitments</li>
                <li>Invoice patients correctly</li>
                <li>Respect patient privacy and medical confidentiality</li>
                <li>Maintain professional licenses and certifications</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-700 mb-3">6.3 Patient Responsibilities</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide truthful medical information</li>
                <li>Facilitate home access</li>
                <li>Make payment as agreed</li>
                <li>Confirm service completion</li>
                <li>Respect doctor's professional time</li>
                <li>Follow medical recommendations and prescriptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cancellations and Refunds</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Free cancellation up to 2 hours before appointment</li>
                <li>Late cancellations: 50% refund</li>
                <li>Doctor no-show: full refund</li>
                <li>Patient no-show: no refund</li>
                <li>Refunds processed within 3-5 business days</li>
                <li>Emergency cancellations evaluated case by case</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Complaints and Claims System</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Complaint form available after each consultation</li>
                <li>Unique tracking code for each claim</li>
                <li>Guaranteed response within 48 business hours</li>
                <li>Possibility of escalation to competent authorities</li>
                <li>Mediation service for dispute resolution</li>
                <li>Right to external arbitration if needed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">
                The Platform is NOT responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Quality or outcome of medical services provided</li>
                <li>Medical decisions made by professionals</li>
                <li>Complications arising from treatment</li>
                <li>Doctor non-compliance in direct relationship with patient</li>
                <li>Force majeure events preventing service delivery</li>
                <li>Technical failures beyond our reasonable control</li>
              </ul>
              <p className="mb-4">
                Maximum liability is limited to the amount paid for the specific service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Intellectual Property</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>All platform content is protected by intellectual property rights</li>
                <li>Users may not copy, modify, or distribute platform content</li>
                <li>User-generated content remains property of the user</li>
                <li>Platform has license to use user content for service provision</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Account Suspension and Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate accounts for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violation of these terms</li>
                <li>Fraudulent activity</li>
                <li>Inappropriate behavior toward other users</li>
                <li>Providing false information</li>
                <li>Professional misconduct (for doctors)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Data Protection</h2>
              <p className="mb-4">
                Personal data processing is governed by our Privacy Policy. 
                All users have rights under GDPR including access, rectification, and erasure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Applicable Legislation</h2>
              <p className="mb-4">
                These terms are governed by Spanish legislation. For any dispute, 
                the competent courts will be those of Madrid, Spain.
              </p>
              <p className="mb-4">
                This service complies with:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Spanish Healthcare Legislation</li>
                <li>European GDPR</li>
                <li>Spanish Data Protection Law (LOPDGDD)</li>
                <li>Information Society Services Law (LSSI-CE)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">14. Updates to Terms</h2>
              <p className="mb-4">
                We may update these terms occasionally. Users will be notified of material changes 
                via email or platform notification. Continued use constitutes acceptance of updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">15. Contact</h2>
              <p className="mb-4">
                For questions about these terms: <strong>legal@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                For complaints: <strong>complaints@oncallclinic.com</strong>
              </p>
              <p className="mb-4">
                Customer service: <strong>support@oncallclinic.com</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}