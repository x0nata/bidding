import React from "react";
import { Container, Title, Body, Caption, PrimaryButton } from "../../router";
import { RiAuctionFill } from "react-icons/ri";
import { MdVerified, MdAssessment, MdSecurity } from "react-icons/md";
import { FaGavel, FaSearch, FaShieldAlt, FaCertificate } from "react-icons/fa";
import { GiTreasureMap, GiCrown } from "react-icons/gi";
import { BiTime, BiSupport } from "react-icons/bi";

export const Services = () => {
  const mainServices = [
    {
      icon: <RiAuctionFill size={60} className="text-primary" />,
      title: "Live & Timed Auctions",
      description: "Participate in exciting live auctions featuring Ethiopian antiques or bid at your convenience with our timed auction format.",
      features: ["Real-time bidding", "Proxy bidding available", "Mobile-friendly platform", "Ethiopian expert auctioneers"]
    },
    {
      icon: <MdVerified size={60} className="text-green" />,
      title: "Authentication Services",
      description: "Professional authentication and appraisal services by certified experts specializing in Ethiopian cultural artifacts.",
      features: ["Ethiopian heritage experts", "Detailed cultural reports", "Ethiopian provenance research", "Insurance valuations"]
    },
    {
      icon: <FaSearch size={60} className="text-blue-500" />,
      title: "Consignment Services",
      description: "Sell your antiques through our trusted platform with expert guidance.",
      features: ["Free consultations", "Marketing support", "Competitive commission", "Global reach"]
    }
  ];

  const additionalServices = [
    {
      icon: <GiTreasureMap size={40} className="text-purple-500" />,
      title: "Provenance Research",
      description: "Comprehensive historical research to verify the authenticity and ownership history of antiques."
    },
    {
      icon: <FaCertificate size={40} className="text-orange-500" />,
      title: "Certification",
      description: "Official certificates of authenticity for all verified antique pieces in our collection."
    },
    {
      icon: <MdAssessment size={40} className="text-red-500" />,
      title: "Market Valuation",
      description: "Professional market analysis and valuation services for insurance and estate purposes."
    },
    {
      icon: <FaShieldAlt size={40} className="text-indigo-500" />,
      title: "Secure Storage",
      description: "Climate-controlled storage facilities for high-value items before and after auctions."
    },
    {
      icon: <BiSupport size={40} className="text-teal-500" />,
      title: "Expert Consultation",
      description: "One-on-one consultations with our antique specialists for collecting guidance."
    },
    {
      icon: <BiTime size={40} className="text-pink-500" />,
      title: "Condition Reports",
      description: "Detailed condition assessments with high-resolution photography and documentation."
    }
  ];

  const auctionTypes = [
    {
      title: "Live Auctions",
      description: "Experience the excitement of real-time bidding with our professional auctioneers.",
      features: ["Real-time bidding", "Expert commentary", "Interactive experience", "Global participation"]
    },
    {
      title: "Timed Auctions",
      description: "Bid at your convenience over several days with automatic bid extensions.",
      features: ["Extended bidding period", "Proxy bidding", "Mobile accessibility", "Detailed catalogs"]
    },
    {
      title: "Private Sales",
      description: "Exclusive private sales for high-value or unique pieces outside of auction format.",
      features: ["Confidential transactions", "Negotiated pricing", "Expert mediation", "Immediate availability"]
    }
  ];

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <Container>
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <FaGavel size={80} className="text-primary" />
              </div>
            </div>
            <Title level={1} className="mb-6 text-4xl md:text-5xl font-bold text-gray-800">
              Our Services
            </Title>
            <Body className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive antique auction services designed to serve collectors, sellers, and enthusiasts 
              with the highest standards of authenticity, security, and expertise.
            </Body>
          </div>

          {/* Main Services */}
          <div className="mb-20">
            <Title level={2} className="text-center mb-12 text-3xl font-bold text-gray-800">
              Core Services
            </Title>
            <div className="grid lg:grid-cols-3 gap-8">
              {mainServices.map((service, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-6">
                    {service.icon}
                  </div>
                  <Title level={3} className="text-center mb-4 text-xl font-bold text-gray-800">
                    {service.title}
                  </Title>
                  <Body className="text-gray-600 text-center mb-6 leading-relaxed">
                    {service.description}
                  </Body>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        <Caption>{feature}</Caption>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Auction Types */}
          <div className="mb-20">
            <Title level={2} className="text-center mb-12 text-3xl font-bold text-gray-800">
              Auction Formats
            </Title>
            <div className="grid md:grid-cols-3 gap-8">
              {auctionTypes.map((type, index) => (
                <div key={index} className="bg-gradient-to-br from-primary/5 to-green/5 rounded-xl p-6 border border-primary/10">
                  <Title level={4} className="mb-3 text-lg font-bold text-gray-800">
                    {type.title}
                  </Title>
                  <Body className="text-gray-600 mb-4 leading-relaxed">
                    {type.description}
                  </Body>
                  <ul className="space-y-2">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <GiCrown size={16} className="text-primary mr-2" />
                        <Caption className="text-sm">{feature}</Caption>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Services */}
          <div className="mb-16">
            <Title level={2} className="text-center mb-12 text-3xl font-bold text-gray-800">
              Additional Services
            </Title>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    {service.icon}
                    <Title level={5} className="ml-3 font-semibold text-gray-800">
                      {service.title}
                    </Title>
                  </div>
                  <Caption className="text-gray-600 leading-relaxed">
                    {service.description}
                  </Caption>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-primary text-white rounded-2xl p-8 md:p-12 text-center">
            <Title level={2} className="mb-6 text-3xl font-bold">
              Ready to Start Your Antique Journey?
            </Title>
            <Body className="text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Whether you're looking to buy, sell, or authenticate antiques, our expert team is here to help. 
              Contact us today to learn more about our services.
            </Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PrimaryButton className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
                Start Bidding
              </PrimaryButton>
              <PrimaryButton className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 rounded-lg font-semibold">
                Consign Items
              </PrimaryButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};
