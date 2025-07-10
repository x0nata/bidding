import React, { useState } from "react";
import { Container, Title, Body, PrimaryButton } from "../../components/common/Design";
import { FaChevronDown, FaChevronUp, FaQuestionCircle, FaGavel, FaShieldAlt, FaCreditCard } from "react-icons/fa";

export const HelpFAQ = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqCategories = [
    {
      title: "Getting Started",
      icon: <FaQuestionCircle className="text-primary" />,
      faqs: [
        {
          question: "How do I create an account on the Ethiopian bidding platform?",
          answer: "Click the 'Register' button and provide your full name, email address, Ethiopian phone number, and create a secure password. You'll need to verify your email and phone number. Ethiopian residents must provide valid identification (ID card or passport) for account verification as required by Ethiopian regulations."
        },
        {
          question: "What documents do I need for account verification?",
          answer: "Ethiopian citizens need a valid Ethiopian ID card or passport. Foreign residents require a passport and valid Ethiopian residence permit. Business accounts need additional documentation including business license and tax identification number (TIN) issued by Ethiopian authorities."
        },
        {
          question: "Is the platform available in local languages?",
          answer: "Yes, our platform supports Amharic, Oromo, and Tigrinya in addition to English. You can change your language preference in your account settings. Customer support is also available in these languages during Ethiopian business hours."
        },
        {
          question: "What types of items can I bid on?",
          answer: "Our platform features a wide variety of items including electronics, vehicles, real estate, art and collectibles, household items, business equipment, and traditional Ethiopian crafts. All items comply with Ethiopian import/export regulations and cultural heritage protection laws."
        }
      ]
    },
    {
      title: "Bidding & Auctions",
      icon: <FaGavel className="text-primary" />,
      faqs: [
        {
          question: "How does the bidding process work in Ethiopia?",
          answer: "Register and verify your account, then browse active auctions. To bid, ensure you have sufficient Ethiopian Birr (ETB) in your account balance. Click 'Place Bid', enter your amount, and confirm. All bids are legally binding under Ethiopian commercial law. The highest bidder when the auction closes wins the item."
        },
        {
          question: "What are the bidding rules and regulations?",
          answer: "All auctions follow Ethiopian commercial regulations and our platform terms. Bids are final and cannot be retracted. Minimum bid increments are set per item. Bidders must be 18+ years old and Ethiopian residents or have valid residence permits. False bidding or bid manipulation is prohibited and may result in legal action."
        },
        {
          question: "What is the auction schedule?",
          answer: "Auctions run 24/7 but most activity occurs during Ethiopian business hours (8 AM - 6 PM EAT). Auction durations vary from 3-10 days. Popular items may have extended bidding periods. We observe Ethiopian public holidays when processing payments and deliveries."
        },
        {
          question: "How do I know if my bid is winning?",
          answer: "You'll receive real-time notifications via SMS and email when you're outbid. Your account dashboard shows all your active bids and their status. We recommend setting up mobile notifications to stay updated, especially in the final hours of auctions."
        },
        {
          question: "What happens after I win an auction?",
          answer: "You'll receive confirmation via SMS and email. Payment must be completed within 72 hours through Ethiopian banking channels. After payment verification, the seller has 5 business days to ship your item. You'll receive tracking information and delivery updates."
        },
        {
          question: "Are there any bidding limits or restrictions?",
          answer: "New accounts have a 30-day bidding limit of 50,000 ETB. Verified accounts can bid up to 500,000 ETB per auction. Higher limits available for business accounts. Some items (vehicles, real estate) require additional verification. Cultural heritage items follow Ethiopian Heritage Authority guidelines."
        },
        {
          question: "Can I bid from anywhere in Ethiopia?",
          answer: "Yes, you can bid from any location within Ethiopia with internet access. Our platform works on mobile phones, tablets, and computers. We have partnerships with Ethiopian telecom providers for reliable access across all regions including rural areas."
        }
      ]
    },
    {
      title: "Selling & Legal Requirements",
      icon: <FaShieldAlt className="text-primary" />,
      faqs: [
        {
          question: "What can I sell on the Ethiopian bidding platform?",
          answer: "You can sell most legal items including electronics, vehicles, household goods, art, and collectibles. Prohibited items include weapons, drugs, counterfeit goods, and items restricted by Ethiopian law. Cultural heritage items require special permits from the Ethiopian Heritage Authority. All listings are reviewed before going live."
        },
        {
          question: "What documents do I need to sell items?",
          answer: "For most items: proof of ownership, purchase receipts, and valid ID. Vehicles require title documents and traffic police clearance. Real estate needs title deeds and municipal clearances. Business equipment may require import/export documentation. Cultural items need Heritage Authority permits."
        },
        {
          question: "What are the seller fees and taxes?",
          answer: "Platform commission is 8-12% of final sale price. Ethiopian VAT (15%) applies to applicable items. Income tax may apply based on Ethiopian tax law - consult a tax advisor. Business sellers need valid TIN numbers. All fees are clearly displayed before listing confirmation."
        },
        {
          question: "How do I price my items competitively?",
          answer: "Research similar items on our platform and Ethiopian markets. Consider item condition, rarity, and demand. Start with lower opening bids to attract more bidders. Set realistic reserve prices. Our pricing tools provide market insights based on recent Ethiopian sales data."
        },
        {
          question: "What are my responsibilities as a seller?",
          answer: "Provide accurate descriptions and photos, respond to buyer questions promptly, ship items within 5 business days after payment, provide tracking information, and honor all sale terms. Misrepresentation or fraud may result in account suspension and legal action under Ethiopian commercial law."
        },
        {
          question: "How do I handle shipping and delivery?",
          answer: "We partner with Ethiopian Postal Service, DHL Ethiopia, and local courier services. Sellers choose shipping methods and costs. Insurance is recommended for valuable items. Delivery confirmation is required. International shipping requires customs documentation and may have restrictions."
        }
      ]
    },
    {
      title: "Payment & Security",
      icon: <FaCreditCard className="text-primary" />,
      faqs: [
        {
          question: "What payment methods are available in Ethiopia?",
          answer: "We accept Ethiopian Birr (ETB) through multiple channels: bank transfers from all Ethiopian banks (CBE, Dashen, Awash, Bank of Abyssinia, etc.), mobile money (M-Birr, HelloCash, Amole), and digital wallets. Credit/debit cards from Ethiopian banks are also accepted. All transactions comply with National Bank of Ethiopia regulations."
        },
        {
          question: "How do I add funds to my bidding account?",
          answer: "Go to 'Account Balance' in your dashboard. Choose from bank transfer, mobile money, or card payment. Minimum deposit is 100 ETB, maximum is 1,000,000 ETB per transaction. Bank transfers take 1-2 hours, mobile money is instant. All deposits are verified through Ethiopian banking systems."
        },
        {
          question: "Is my financial information secure?",
          answer: "Yes, we use bank-grade security certified by the National Bank of Ethiopia. All data is encrypted using international standards. We never store complete banking details. Our security measures comply with Ethiopian data protection laws and international best practices. Regular security audits ensure your information stays safe."
        },
        {
          question: "What about taxes and fees?",
          answer: "Platform fees range from 3-8% depending on payment method. Ethiopian VAT (15%) applies where required. Winners pay a 2% transaction fee. International payments may incur additional charges. All fees are clearly displayed before payment confirmation. Consult Ethiopian tax authorities for income tax obligations."
        },
        {
          question: "How do I withdraw my earnings?",
          answer: "Sellers can withdraw funds to any Ethiopian bank account within 24 hours. Minimum withdrawal is 50 ETB. Mobile money withdrawals are available for amounts up to 50,000 ETB. International transfers require additional documentation and take 3-5 business days through authorized foreign exchange dealers."
        },
        {
          question: "What if there's a payment dispute?",
          answer: "Contact our Ethiopian support team immediately. We offer buyer protection for up to 30 days. Disputes are resolved according to Ethiopian consumer protection laws. We work with Ethiopian banks and authorities to investigate fraud. Mediation services are available through Ethiopian commercial arbitration centers."
        },
        {
          question: "Are there any payment limits or restrictions?",
          answer: "Daily transaction limits follow National Bank of Ethiopia guidelines: 100,000 ETB for individuals, 1,000,000 ETB for businesses. Foreign currency transactions require NBE approval. Some items (vehicles, real estate) have special payment procedures. Money laundering prevention measures apply to large transactions."
        }
      ]
    }
  ];

  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <FaQuestionCircle size={80} className="text-primary" />
              </div>
            </div>
            <Title level={1} className="mb-6 text-4xl md:text-5xl font-bold text-gray-800">
              Help & FAQ
            </Title>
            <Body className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about Ethiopia's leading online bidding platform.
              Get help with bidding, payments, regulations, and more. Our Ethiopian support team
              is here to assist you in Amharic, English, and other local languages.
            </Body>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{category.icon}</div>
                    <Title level={2} className="text-2xl font-bold text-gray-800">
                      {category.title}
                    </Title>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex;
                      const isOpen = openFAQ === globalIndex;
                      
                      return (
                        <div key={faqIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleFAQ(globalIndex)}
                            className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                          >
                            <Title level={4} className="font-semibold text-gray-800 pr-4">
                              {faq.question}
                            </Title>
                            {isOpen ? (
                              <FaChevronUp className="text-primary flex-shrink-0" />
                            ) : (
                              <FaChevronDown className="text-primary flex-shrink-0" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <Body className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </Body>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support Section */}
          <div className="mt-16 bg-primary text-white rounded-2xl p-8 md:p-12 text-center">
            <Title level={2} className="mb-6 text-3xl font-bold">
              Still Need Help?
            </Title>
            <Body className="text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our Ethiopian customer support team is available to help with bidding questions,
              payment issues, technical problems, and regulatory compliance. We provide support
              in Amharic, English, Oromo, and Tigrinya during Ethiopian business hours.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
                Contact Support
              </PrimaryButton>
              <PrimaryButton className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg font-semibold">
                Live Chat (Amharic/English)
              </PrimaryButton>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <Body className="text-white/80 text-sm">
                <strong>Support Hours:</strong> Monday - Saturday, 8:00 AM - 8:00 PM EAT (East Africa Time)<br />
                <strong>Email:</strong> support@ethiopianbidding.com<br />
                <strong>Phone:</strong> +251 11 551 2345 (Addis Ababa)<br />
                <strong>Mobile/WhatsApp:</strong> +251 91 123 4567<br />
                <strong>Telegram:</strong> @EthiopianBiddingSupport<br />
                <strong>Emergency Line:</strong> +251 92 555 0000 (24/7 for urgent issues)
              </Body>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HelpFAQ;
