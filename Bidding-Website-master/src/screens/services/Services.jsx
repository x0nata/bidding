import React from "react";
import { Container, Title, Body, Caption } from "../../router";
import { RiAuctionFill } from "react-icons/ri";
import { MdVerified } from "react-icons/md";
import { FaGavel, FaSearch } from "react-icons/fa";
import { GiCrown } from "react-icons/gi";

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
        </Container>
      </section>
    </>
  );
};
