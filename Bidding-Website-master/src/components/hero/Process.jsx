import { processList } from "../../utils/data";
import { Container, Title, Body } from "../../router";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const Process = () => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/register');
  };

  const handleAboutUs = () => {
    navigate('/about');
  };

  return (
    <>
      <section className="process py-20 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full"></div>
        </div>

        <Container className="py-16 text-white relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4">
              <FaCheckCircle className="text-green-300" size={16} />
              <span className="text-white font-medium text-sm">Simple Process</span>
            </div>
            <Title level={2} className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </Title>
            <Body className="text-xl text-green-200 max-w-3xl mx-auto leading-relaxed">
              Start your antique collecting journey in just 4 simple steps.
              From registration to winning your first auction.
            </Body>
          </div>

          <div className="content grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
            {processList.map((item, index) => (
              <div key={index} className="relative group">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  {index + 1}
                </div>

                {/* Card */}
                <div className="p-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-col text-center hover:bg-opacity-20 transition-all duration-300 group-hover:scale-105 border border-white border-opacity-20">
                  <div className="w-20 h-20 mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <img src={item.cover} alt={item.title} className="w-12 h-12" />
                  </div>
                  <Title level={4} className="mb-4 font-semibold text-white text-xl">
                    {item.title}
                  </Title>
                  <Body className="text-green-200 leading-relaxed">
                    {item.desc}
                  </Body>
                </div>

                {/* Arrow Connector */}
                {index < processList.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="bg-white bg-opacity-20 rounded-full p-2">
                      <FaArrowRight className="text-white" size={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleStartJourney}
                className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Start Your Journey
              </button>
              <button
                onClick={handleAboutUs}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all duration-300"
              >
                About Us
              </button>
            </div>
            <Body className="text-green-200 mt-4 text-sm">
              Join thousands of collectors who trust our platform
            </Body>
          </div>
        </Container>
      </section>
    </>
  );
};
