import React from "react";
import { Container, Title, Body, Caption } from "../../router";
import { RiAuctionFill } from "react-icons/ri";
import { GiCrown, GiTreasureMap } from "react-icons/gi";
import { MdVerified, MdSecurity, MdSchool } from "react-icons/md";
import { FaHistory, FaGavel, FaShieldAlt } from "react-icons/fa";

export const About = () => {
  const features = [
    {
      icon: <GiCrown size={60} className="text-primary" />,
      title: "Authentic Ethiopian Antiques",
      description: "Every piece in our collection is carefully authenticated by our team of expert appraisers and Ethiopian cultural historians."
    },
    {
      icon: <MdVerified size={60} className="text-green" />,
      title: "Verified Provenance",
      description: "We provide detailed provenance documentation for all items, ensuring their historical authenticity and legal ownership."
    },
    {
      icon: <FaGavel size={60} className="text-blue-500" />,
      title: "Professional Auctions",
      description: "Our auction platform combines traditional auction house expertise with modern technology for seamless bidding."
    },
    {
      icon: <MdSecurity size={60} className="text-red-500" />,
      title: "Secure Transactions",
      description: "All transactions are protected with bank-level security, ensuring safe and reliable purchases for our clients."
    }
  ];

  const stats = [
    { number: "15+", label: "Years of Experience" },
    { number: "10,000+", label: "Antiques Sold" },
    { number: "5,000+", label: "Happy Collectors" },
    { number: "50+", label: "Expert Appraisers" }
  ];

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <Container>
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <GiTreasureMap size={80} className="text-primary" />
              </div>
            </div>
            <Title level={1} className="mb-6 text-4xl md:text-5xl font-bold text-gray-800">
              About Horn of Antiques
            </Title>
            <Body className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover Ethiopia's finest antiques through our premier auction platform.
              We connect passionate Ethiopian collectors with extraordinary historical treasures,
              ensuring authenticity, provenance, and exceptional service.
            </Body>
          </div>

          {/* Mission Statement */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Title level={2} className="mb-6 text-3xl font-bold text-gray-800">
                  Our Mission
                </Title>
                <Body className="text-gray-600 leading-relaxed mb-6">
                  To preserve and celebrate Ethiopian heritage by connecting authentic antiques with passionate collectors across Ethiopia.
                  We believe every antique tells a story of our rich cultural history, and our mission is to ensure these stories continue to be told
                  for generations to come.
                </Body>
                <Body className="text-gray-600 leading-relaxed">
                  Through our expertise in Ethiopian cultural artifacts, authentication, provenance research, and local market knowledge, we provide a trusted
                  platform where collectors can discover, bid on, and acquire exceptional historical pieces with complete confidence.
                </Body>
              </div>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-primary/10 to-green/10 p-8 rounded-2xl">
                  <FaHistory size={120} className="text-primary mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <Title level={2} className="text-center mb-12 text-3xl font-bold text-gray-800">
              Why Choose Horn of Antiques
            </Title>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <Title level={4} className="mb-3 font-semibold text-gray-800">
                    {feature.title}
                  </Title>
                  <Caption className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </Caption>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-primary text-white rounded-2xl p-8 md:p-12 mb-16">
            <Title level={2} className="text-center mb-12 text-3xl font-bold">
              Our Track Record
            </Title>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <Title level={1} className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </Title>
                  <Caption className="text-white/80 text-lg">
                    {stat.label}
                  </Caption>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center">
            <Title level={2} className="mb-6 text-3xl font-bold text-gray-800">
              Expert Team
            </Title>
            <Body className="text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Our team consists of certified appraisers, art historians, and auction specialists with decades of combined experience 
              in the antique and collectibles market. We're passionate about preserving history and helping collectors find their perfect pieces.
            </Body>
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <MdSchool size={40} className="text-primary" />
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <FaShieldAlt size={40} className="text-green" />
              </div>
              <div className="bg-white rounded-full p-4 shadow-lg">
                <RiAuctionFill size={40} className="text-blue-500" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};
