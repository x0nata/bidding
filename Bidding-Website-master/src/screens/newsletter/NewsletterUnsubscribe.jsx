import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Title, Body, PrimaryButton } from "../../components/common/Design";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { apiEndpoints } from "../../services/api";

export const NewsletterUnsubscribe = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid unsubscribe link. Please check the URL and try again.");
        return;
      }

      try {
        const response = await apiEndpoints.newsletter.unsubscribe(token);
        setStatus("success");
        setMessage(response.data.message || "You have been successfully unsubscribed from our newsletter.");
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Failed to unsubscribe. Please try again or contact support.");
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-6"></div>
              <Title level={2} className="text-2xl font-bold text-gray-800 mb-4">
                Processing your request...
              </Title>
              <Body className="text-gray-600">
                Please wait while we unsubscribe you from our newsletter.
              </Body>
            </div>
          )}

          {status === "success" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <FaCheckCircle size={60} className="text-green-600" />
                </div>
              </div>
              
              <Title level={1} className="text-3xl font-bold text-gray-800 mb-6">
                Successfully Unsubscribed
              </Title>
              
              <Body className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </Body>
              
              <Body className="text-gray-600 mb-8 leading-relaxed">
                You will no longer receive newsletter emails from Heritage Auctions. 
                If you change your mind, you can always subscribe again from our website.
              </Body>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <PrimaryButton className="bg-primary text-white hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                    Return to Homepage
                  </PrimaryButton>
                </Link>
                <Link to="/contact">
                  <PrimaryButton className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold">
                    Contact Support
                  </PrimaryButton>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Body className="text-sm text-gray-500">
                  If you continue to receive emails after unsubscribing, please contact our support team at{" "}
                  <a 
                    href="mailto:support@heritageauctions.com" 
                    className="text-primary hover:underline"
                  >
                    support@heritageauctions.com
                  </a>
                </Body>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-4 rounded-full">
                  <FaExclamationTriangle size={60} className="text-red-600" />
                </div>
              </div>
              
              <Title level={1} className="text-3xl font-bold text-gray-800 mb-6">
                Unsubscribe Failed
              </Title>
              
              <Body className="text-gray-600 mb-8 leading-relaxed">
                {message}
              </Body>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <PrimaryButton className="bg-primary text-white hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold">
                    Contact Support
                  </PrimaryButton>
                </Link>
                <Link to="/">
                  <PrimaryButton className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold">
                    Return to Homepage
                  </PrimaryButton>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <Body className="text-sm text-gray-500">
                  For immediate assistance, please email us at{" "}
                  <a 
                    href="mailto:support@heritageauctions.com" 
                    className="text-primary hover:underline"
                  >
                    support@heritageauctions.com
                  </a>{" "}
                  or call{" "}
                  <a 
                    href="tel:+15551234567" 
                    className="text-primary hover:underline"
                  >
                    +1 (555) 123-4567
                  </a>
                </Body>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default NewsletterUnsubscribe;
