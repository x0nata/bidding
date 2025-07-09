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
          question: "How do I create an account?",
          answer: "Click the 'Register' button in the top right corner, fill in your details including name, email, and contact number, then verify your email address. All users can both buy and sell items on our platform - there's no need for separate buyer and seller accounts."
        },
        {
          question: "What types of antiques can I find here?",
          answer: "Horn of Antiques specializes in authenticated Ethiopian and international antiques including traditional furniture, jewelry, ceramics & porcelain, art & paintings, coins & currency, books & manuscripts, traditional textiles, glassware, silverware & metalwork, clocks & watches, musical instruments, toys & games, military collectibles, religious artifacts, and decorative arts. We particularly focus on items with Ethiopian cultural significance and heritage value."
        },
        {
          question: "How do I know if an item is authentic?",
          answer: "Every item on our platform goes through our expert authentication process. We provide detailed provenance documentation and certificates of authenticity. Look for the verification badge on listings."
        }
      ]
    },
    {
      title: "Bidding & Auctions",
      icon: <FaGavel className="text-primary" />,
      faqs: [
        {
          question: "How does the bidding process work?",
          answer: "To place a bid, ensure you have sufficient Ethiopian Birr (ETB) in your account balance, then click 'Place Bid' on any active auction. Enter your bid amount and confirm. Our system supports both manual bidding and proxy bidding, where the system automatically bids for you up to your maximum amount. The highest bidder when the auction ends wins the item."
        },
        {
          question: "What is proxy bidding and how does it work?",
          answer: "Proxy bidding allows you to set a maximum bid amount, and our system will automatically place bids on your behalf up to that limit. This ensures you don't miss out on items due to time zone differences or being away from your device. The system only bids the minimum amount needed to maintain your leading position."
        },
        {
          question: "Can I retract a bid?",
          answer: "No, all bids are binding and cannot be retracted once placed. This policy ensures fairness for all participants and maintains the integrity of our auction process. Please bid carefully and only place bids for amounts you're prepared to pay in Ethiopian Birr."
        },
        {
          question: "How long do auctions typically run?",
          answer: "Most auctions run for 7 days, but sellers can choose durations of 3, 5, 7, or 10 days when listing their items. Timed auctions have automatic bid extensions - if a bid is placed in the final minutes, the auction extends to give other bidders a fair chance to respond."
        },
        {
          question: "What happens if I win an auction?",
          answer: "Congratulations! You'll receive an email confirmation and have 7 days to complete payment in Ethiopian Birr through bank transfer. Once payment is confirmed, the seller will prepare your item for shipping and provide tracking information. All transactions are processed securely through our Ethiopian banking partners."
        },
        {
          question: "Is Horn of Antiques available throughout Ethiopia?",
          answer: "Yes, Horn of Antiques serves collectors throughout Ethiopia. Our online platform allows you to participate in auctions from anywhere in the country. We work with trusted shipping partners to deliver items safely to all major Ethiopian cities and regions."
        },
        {
          question: "Do I need special knowledge to start collecting antiques?",
          answer: "Not at all! While expertise helps, our platform is designed for collectors of all levels. Each item includes detailed descriptions, historical context, and authenticity certificates. Our customer support team and expert appraisers are always available to help guide new collectors in making informed decisions."
        },
        {
          question: "What are reserve prices?",
          answer: "Some auctions have reserve prices - a minimum amount the seller will accept. If bidding doesn't reach the reserve, the item won't be sold. Reserve amounts are not disclosed but you'll see if the reserve has been met."
        }
      ]
    },
    {
      title: "Selling Items",
      icon: <FaShieldAlt className="text-primary" />,
      faqs: [
        {
          question: "How do I list an item for auction?",
          answer: "With your Horn of Antiques account, click 'Add Product' to start listing. Upload high-quality photos from multiple angles, provide detailed descriptions including historical context, and submit a Certificate of Authenticity (required for all listings). Include physical measurements, materials used, era/period, and provenance information. Our expert team will review and approve your listing before it goes live."
        },
        {
          question: "What documentation do I need to sell antiques?",
          answer: "A Certificate of Authenticity is mandatory for all antique listings on Horn of Antiques. This document should verify the item's age, origin, and authenticity. If you don't have one, our network of certified Ethiopian appraisers can help you obtain proper documentation for a fee."
        },
        {
          question: "What fees do sellers pay?",
          answer: "Horn of Antiques charges a commission on successful sales only - no upfront listing fees. The commission rate varies by item category and final sale price, typically ranging from 10-15% for most antiques. All fees are clearly disclosed before you confirm your listing, and you'll see exactly what you'll receive after the sale."
        },
        {
          question: "How are starting prices and reserves determined?",
          answer: "You set your own starting bid amount in Ethiopian Birr. You can also set an optional reserve price (minimum amount you'll accept). Our system suggests starting bids based on similar items, but the final decision is yours. Lower starting bids often generate more interest and competitive bidding."
        },
        {
          question: "What happens after my item sells?",
          answer: "Once your auction ends, you'll receive the buyer's payment (minus our commission) via bank transfer to your Ethiopian bank account within 3-5 business days. You'll then have 2 business days to carefully package and ship the item to the buyer with tracking information."
        }
      ]
    },
    {
      title: "Payment & Security",
      icon: <FaCreditCard className="text-primary" />,
      faqs: [
        {
          question: "What payment methods are accepted?",
          answer: "Horn of Antiques uses a secure bank transfer system for all transactions in Ethiopian Birr (ETB). You can add funds to your account balance through bank transfers from any Ethiopian bank. We work with major Ethiopian banks including Commercial Bank of Ethiopia, Dashen Bank, Bank of Abyssinia, and others. All payments are processed securely through encrypted channels."
        },
        {
          question: "How do I add money to my account?",
          answer: "Click 'Add Balance' from your account dashboard or during the bidding process. Enter the amount in Ethiopian Birr (minimum 10 ETB, maximum 100,000 ETB per transaction), provide your bank account details, and confirm the transfer. Funds are typically available in your account within minutes for demo purposes, though real bank transfers may take 1-2 business days."
        },
        {
          question: "Is my payment information secure?",
          answer: "Absolutely. Horn of Antiques uses bank-level security with industry-standard SSL encryption. We never store your complete banking information and all transactions are processed through secure, encrypted channels. Your financial data is protected according to Ethiopian banking regulations and international security standards."
        },
        {
          question: "What currencies do you accept?",
          answer: "All transactions on Horn of Antiques are conducted in Ethiopian Birr (ETB). This ensures transparency and eliminates currency conversion fees for Ethiopian collectors. Prices, bids, and payments are all displayed and processed in ETB."
        },
        {
          question: "What if there's a problem with my purchase?",
          answer: "Horn of Antiques offers comprehensive buyer protection for authenticity disputes and misrepresented items. Contact our Ethiopian support team within 14 days of receiving your item if there are any issues. We work with certified appraisers to resolve disputes fairly and may offer full refunds for items that don't match their descriptions."
        },
        {
          question: "How do refunds work?",
          answer: "If a refund is approved, funds are returned to your Horn of Antiques account balance in Ethiopian Birr within 2-3 business days. You can then withdraw the funds to your Ethiopian bank account or use them for future purchases. Refund processing follows Ethiopian consumer protection guidelines."
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
              Find answers to common questions about Horn of Antiques, Ethiopia's premier
              antique auction platform. Can't find what you're looking for? Our Ethiopian
              support team is here to help.
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
              Our Ethiopian expert support team is here to help with any questions about auctions,
              authentication, antique appraisals, or technical issues. We understand the local market
              and typically respond within 24 hours during Ethiopian business hours.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
                Contact Support
              </PrimaryButton>
              <PrimaryButton className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg font-semibold">
                Live Chat
              </PrimaryButton>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <Body className="text-white/80 text-sm">
                <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EAT (East Africa Time)<br />
                <strong>Email:</strong> support@hornofantiques.com<br />
                <strong>Phone:</strong> +251 11 123 4567<br />
                <strong>WhatsApp:</strong> +251 91 234 5678
              </Body>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HelpFAQ;
