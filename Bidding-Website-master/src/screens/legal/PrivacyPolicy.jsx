import React from "react";
import { Container, Title, Body } from "../../components/common/Design";

export const PrivacyPolicy = () => {
  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Title level={1} className="mb-6 text-4xl md:text-5xl font-bold text-gray-800">
              Privacy Policy
            </Title>
            <Body className="text-lg text-gray-600">
              Last updated: January 1, 2024
            </Body>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
              
              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  1. Information We Collect
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  participate in auctions, or contact us for support.
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Personal information (name, email address, phone number)</li>
                  <li>Account credentials and profile information</li>
                  <li>Bidding history and transaction data</li>
                  <li>Communication preferences and correspondence</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  2. How We Use Your Information
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Process and manage your auction participation</li>
                  <li>Authenticate and verify your identity</li>
                  <li>Send you important updates about auctions and your account</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  3. Information Sharing and Disclosure
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  except as described in this policy:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>With your consent or at your direction</li>
                  <li>To service providers who assist us in operating our platform</li>
                  <li>To comply with legal requirements or protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  4. Data Security
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. However, 
                  no method of transmission over the internet is 100% secure.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  5. Your Rights and Choices
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  You have certain rights regarding your personal information:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Access and update your account information</li>
                  <li>Request deletion of your personal data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  6. Cookies and Tracking Technologies
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and personalize content. You can control cookie settings through your browser preferences.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  7. Children's Privacy
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  Our services are not intended for children under 18 years of age. We do not knowingly 
                  collect personal information from children under 18.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  8. Changes to This Policy
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new policy on this page and updating the "Last updated" date.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  9. Contact Us
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </Body>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <Body className="text-gray-700">
                    <strong>Email:</strong> privacy@heritageauctions.com<br />
                    <strong>Phone:</strong> +1 (555) 123-4567<br />
                    <strong>Address:</strong> Heritage Auction House, 123 Antique Street, Collector City, CC 12345
                  </Body>
                </div>
              </section>

            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PrivacyPolicy;
