import React from "react";
import { Container, Title, Body } from "../../components/common/Design";

export const TermsOfService = () => {
  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Title level={1} className="mb-6 text-4xl md:text-5xl font-bold text-gray-800">
              Terms of Service
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
                  1. Acceptance of Terms
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  By accessing and using the Horn of Antiques platform, you accept and agree to be
                  bound by the terms and provision of this agreement. If you do not agree to abide by
                  the above, please do not use this service.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  2. Platform Description
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  Our platform provides an online marketplace for authentic antiques and collectibles, 
                  connecting buyers and sellers through a secure auction system with expert authentication 
                  and verification services.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  3. User Accounts and Registration
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  To participate in auctions, you must create an account and provide accurate information:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>You must be at least 18 years old to use our services</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You must provide accurate and complete registration information</li>
                  <li>You are responsible for all activities that occur under your account</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  4. Auction Rules and Bidding
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  Participation in auctions is subject to the following rules:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>All bids are binding and cannot be retracted</li>
                  <li>The highest bidder at auction close wins the item</li>
                  <li>Reserve prices may apply to certain items</li>
                  <li>Payment must be completed within 7 days of auction end</li>
                  <li>Bidding increments are determined by the platform</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  5. Seller Responsibilities
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  Sellers must comply with the following requirements:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Provide accurate descriptions and authentic items only</li>
                  <li>Upload clear, representative photographs</li>
                  <li>Provide certificates of authenticity when required</li>
                  <li>Ship items promptly after payment receipt</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  6. Authentication and Verification
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  We employ expert appraisers to authenticate items, but we cannot guarantee the accuracy 
                  of all descriptions. Buyers are encouraged to examine items carefully and ask questions 
                  before bidding.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  7. Payment and Fees
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  Payment terms and fee structure:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Buyers pay a buyer's premium on winning bids</li>
                  <li>Sellers pay a commission on successful sales</li>
                  <li>Payment processing fees may apply</li>
                  <li>All fees are clearly disclosed before transaction completion</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  8. Shipping and Returns
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  Shipping is arranged between buyers and sellers. Returns are accepted only in cases of 
                  misrepresentation or authenticity disputes, subject to our return policy guidelines.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  9. Prohibited Activities
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-4">
                  The following activities are strictly prohibited:
                </Body>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Listing counterfeit or stolen items</li>
                  <li>Bid manipulation or shill bidding</li>
                  <li>Harassment of other users</li>
                  <li>Violation of intellectual property rights</li>
                  <li>Any illegal or fraudulent activity</li>
                </ul>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  10. Limitation of Liability
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  Our liability is limited to the maximum extent permitted by law. We are not responsible 
                  for disputes between buyers and sellers, though we will assist in resolution efforts.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  11. Termination
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  We reserve the right to terminate or suspend accounts that violate these terms or 
                  engage in prohibited activities.
                </Body>
              </section>

              <section>
                <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                  12. Contact Information
                </Title>
                <Body className="text-gray-600 leading-relaxed">
                  For questions about these Terms of Service, contact us at:
                </Body>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <Body className="text-gray-700">
                    <strong>Email:</strong> legal@heritageauctions.com<br />
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

export default TermsOfService;
