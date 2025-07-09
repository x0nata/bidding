import React from 'react';
import { Link } from 'react-router-dom';
import { MdGavel, MdAdd, MdTrendingUp, MdVerified } from 'react-icons/md';
import { Container } from '../../router';

export const EmptyState = ({ 
  type = 'products', 
  title, 
  subtitle, 
  actionText, 
  actionLink, 
  showFeatures = true 
}) => {
  const getEmptyStateContent = () => {
    switch (type) {
      case 'products':
        return {
          icon: <MdGavel className="text-6xl text-green mb-6" />,
          title: title || "No Antiques Listed Yet",
          subtitle: subtitle || "Be the first to discover and list authentic antiques on our premium auction platform.",
          actionText: actionText || "List Your First Antique",
          actionLink: actionLink || "/add-product",
          features: [
            {
              icon: <MdVerified className="text-green text-2xl" />,
              title: "Expert Authentication",
              description: "Every item is verified by certified antique experts"
            },
            {
              icon: <MdTrendingUp className="text-green text-2xl" />,
              title: "Premium Marketplace",
              description: "Reach serious collectors and antique enthusiasts across Ethiopia"
            },
            {
              icon: <MdGavel className="text-green text-2xl" />,
              title: "Secure Auctions",
              description: "Protected transactions with escrow and insurance options"
            }
          ]
        };
      default:
        return {
          icon: <MdAdd className="text-6xl text-green mb-6" />,
          title: title || "Nothing Here Yet",
          subtitle: subtitle || "Start by adding your first item.",
          actionText: actionText || "Get Started",
          actionLink: actionLink || "/",
          features: []
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Empty State */}
          <div className="mb-12">
            {content.icon}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {content.title}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
            
            <Link
              to={content.actionLink}
              className="inline-flex items-center space-x-2 bg-green hover:bg-primary text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <MdAdd className="text-xl" />
              <span>{content.actionText}</span>
            </Link>
          </div>

          {/* Features Section */}
          {showFeatures && content.features.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {content.features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <MdVerified className="text-green" />
                <span className="text-sm">SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <MdVerified className="text-green" />
                <span className="text-sm">Expert Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <MdVerified className="text-green" />
                <span className="text-sm">Insured Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default EmptyState;
