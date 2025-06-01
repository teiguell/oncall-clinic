import React from 'react';

export default function CookiesPolicyEN() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookies Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. What are cookies?</h2>
              <p className="mb-4">
                Cookies are small text files that websites send to your device when you visit them. 
                They are stored in your browser and allow us to recognize your device and remember 
                information about your visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How we use cookies</h2>
              <p className="mb-4">
                OnCall Clinic uses cookies to improve your user experience, analyze website traffic, 
                and personalize content. Cookies help us to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Keep your session active during your visit</li>
                <li>Remember your language preferences</li>
                <li>Analyze how you use our services</li>
                <li>Improve platform functionality</li>
                <li>Provide security features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Types of cookies we use</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">3.1 Strictly necessary cookies</h3>
              <p className="mb-4">
                These cookies are essential for you to browse the website and use its features. 
                Without these cookies, we could not provide the services you request.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">session_id</td>
                      <td className="py-2">Maintains your user session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">csrf_token</td>
                      <td className="py-2">Protection against CSRF attacks</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">cookie_consent</td>
                      <td className="py-2">Remembers your cookie preferences</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.2 Functionality cookies</h3>
              <p className="mb-4">
                These cookies allow the website to remember choices you make and provide 
                enhanced, more personal features.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">user_language</td>
                      <td className="py-2">Remembers your preferred language</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">theme_preference</td>
                      <td className="py-2">Remembers your preferred visual theme</td>
                      <td className="py-2">6 months</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.3 Analytics cookies</h3>
              <p className="mb-4">
                These cookies help us understand how visitors interact with our website, 
                providing us with information about areas visited, time spent, and any issues encountered.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cookie</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics - Distinguishes users</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">_ga_*</td>
                      <td className="py-2">Google Analytics - Session state</td>
                      <td className="py-2">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">3.4 Third-party cookies</h3>
              <p className="mb-4">
                We use third-party services that may set their own cookies:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Maps:</strong> To display maps and locations</li>
                <li><strong>Revolut Pay:</strong> To process secure payments</li>
                <li><strong>SendGrid:</strong> For sending transactional emails</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Cookie management</h2>
              
              <h3 className="text-xl font-medium text-gray-700 mb-3">4.1 Consent panel</h3>
              <p className="mb-4">
                When you first visit our website, you will see a cookie banner that allows you to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your preferences by category</li>
              </ul>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Configure cookie preferences</h4>
                <p className="text-blue-700 text-sm mb-3">
                  You can change your preferences at any time by clicking the button below:
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                  Manage cookies
                </button>
              </div>

              <h3 className="text-xl font-medium text-gray-700 mb-3">4.2 Browser settings</h3>
              <p className="mb-4">
                You can also manage cookies directly from your browser:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Mobile device cookies</h2>
              <p className="mb-4">
                If you access our services from a mobile device, cookies work similarly. 
                You can manage cookies through your mobile browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Consequences of disabling cookies</h2>
              <p className="mb-4">
                If you decide to disable cookies, some features of our website may not work properly:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>You may need to log in repeatedly</li>
                <li>Your language preferences won't be remembered</li>
                <li>Some interactive features may not be available</li>
                <li>User experience may be affected</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Updates to this policy</h2>
              <p className="mb-4">
                We may update this Cookie Policy occasionally. When we do, we will revise 
                the "last updated" date at the top of this page. We recommend that you 
                review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. More information</h2>
              <p className="mb-4">
                For more information about cookies, you can visit:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><a href="https://www.aboutcookies.org" className="text-blue-600 hover:underline">www.aboutcookies.org</a></li>
                <li><a href="https://www.allaboutcookies.org" className="text-blue-600 hover:underline">www.allaboutcookies.org</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact</h2>
              <p className="mb-4">
                If you have questions about our Cookie Policy, you can contact us at:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Email: <strong>privacy@oncallclinic.com</strong></li>
                <li>Phone: <strong>+34 900 123 456</strong></li>
                <li>Address: <strong>Calle Ejemplo, 123, 28001 Madrid, Spain</strong></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}