import React, { useState } from "react";
import { Container, Title, Body, Caption, PrimaryButton } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { FiPhone, FiMail, FiMapPin, FiClock } from "react-icons/fi";

import { MdSend } from "react-icons/md";
import { apiEndpoints } from "../../services/api";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [immediateHelpData, setImmediateHelpData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "technical-support",
    message: ""
  });

  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  const helpCategories = [
    { value: "technical-support", label: "Technical Support" },
    { value: "dispute-resolution", label: "Resolve a Dispute" },
    { value: "account-issues", label: "Account Issues" },
    { value: "payment-problems", label: "Payment Problems" },
    { value: "bidding-assistance", label: "Bidding Assistance" },
    { value: "urgent-inquiry", label: "Urgent Inquiry" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert("Thank you for your message! We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleImmediateHelpChange = (e) => {
    const { name, value } = e.target;
    setImmediateHelpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImmediateHelpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingHelp(true);

    try {
      await apiEndpoints.contact.sendImmediateHelp({
        ...immediateHelpData,
        timestamp: new Date().toISOString(),
        priority: "urgent"
      });

      alert("Your urgent request has been sent to our admin team. We'll contact you immediately!");
      setImmediateHelpData({
        name: "",
        email: "",
        phone: "",
        category: "technical-support",
        message: ""
      });
    } catch (error) {
      alert("Failed to send your request. Please try calling us directly at +1 (555) 123-4567");
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiPhone size={24} className="text-primary" />,
      title: "Phone",
      details: ["+251977165578"],
      description: "Call us during business hours"
    },
    {
      icon: <FiMail size={24} className="text-green" />,
      title: "Email",
      details: ["info@heritageauctions.com", "support@heritageauctions.com"],
      description: "We respond within 24 hours"
    },
    {
      icon: <FiMapPin size={24} className="text-blue-500" />,
      title: "Address",
      details: ["123 Antique Row", "Heritage District, NY 10001"],
      description: "Visit our showroom"
    },
    {
      icon: <FiClock size={24} className="text-purple-500" />,
      title: "Business Hours",
      details: ["Mon-Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      description: "Closed on Sundays"
    }
  ];

  const departments = [
    { value: "general", label: "General Inquiry" },
    { value: "bidding", label: "Bidding Support" },
    { value: "consignment", label: "Consignment" },
    { value: "authentication", label: "Authentication" },
    { value: "technical", label: "Technical Support" },
    { value: "media", label: "Media & Press" }
  ];

  return (
    <>
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <Container>
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Title level={1} className="mb-6 text-4xl md:text-5xl font-bold text-gray-800">
              Contact Us
            </Title>
            <Body className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our expert team. We're here to help with all your antique auction needs, 
              from bidding assistance to consignment inquiries.
            </Body>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Title level={2} className="mb-6 text-2xl font-bold text-gray-800">
                Send us a Message
              </Title>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Caption className="mb-2 font-medium text-gray-700">Full Name *</Caption>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={commonClassNameOfInput}
                      placeholder="Your full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Caption className="mb-2 font-medium text-gray-700">Email Address *</Caption>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={commonClassNameOfInput}
                      placeholder="your.email@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Caption className="mb-2 font-medium text-gray-700">Phone Number</Caption>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={commonClassNameOfInput}
                      placeholder="+1 (555) 123-4567"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Caption className="mb-2 font-medium text-gray-700">Inquiry Type</Caption>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className={commonClassNameOfInput}
                      disabled={isSubmitting}
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Caption className="mb-2 font-medium text-gray-700">Subject *</Caption>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={commonClassNameOfInput}
                    placeholder="Brief subject of your inquiry"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Caption className="mb-2 font-medium text-gray-700">Message *</Caption>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={commonClassNameOfInput}
                    rows="6"
                    placeholder="Please provide details about your inquiry..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <MdSend className="mr-2" />
                      Send Message
                    </>
                  )}
                </PrimaryButton>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <Title level={2} className="mb-6 text-2xl font-bold text-gray-800">
                  Get in Touch
                </Title>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        {info.icon}
                      </div>
                      <div>
                        <Title level={4} className="font-semibold text-gray-800 mb-1">
                          {info.title}
                        </Title>
                        {info.details.map((detail, idx) => (
                          <Body key={idx} className="text-gray-600">
                            {detail}
                          </Body>
                        ))}
                        <Caption className="text-gray-500 text-sm">
                          {info.description}
                        </Caption>
                      </div>
                    </div>
                  ))}
                </div>
              </div>



              {/* Immediate Help Form */}
              <div className="bg-primary text-white rounded-2xl p-8">
                <Title level={3} className="mb-4 text-xl font-bold">
                  Need Immediate Help?
                </Title>
                <Body className="text-white/90 mb-6">
                  For urgent auction-related questions or technical support during live auctions.
                </Body>

                <form onSubmit={handleImmediateHelpSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Caption className="mb-2 font-medium text-white/90">Your Name *</Caption>
                      <input
                        type="text"
                        name="name"
                        value={immediateHelpData.name}
                        onChange={handleImmediateHelpChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-800"
                        placeholder="Enter your name"
                        required
                        disabled={isSubmittingHelp}
                      />
                    </div>
                    <div>
                      <Caption className="mb-2 font-medium text-white/90">Email *</Caption>
                      <input
                        type="email"
                        name="email"
                        value={immediateHelpData.email}
                        onChange={handleImmediateHelpChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-800"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmittingHelp}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Caption className="mb-2 font-medium text-white/90">Phone Number</Caption>
                      <input
                        type="tel"
                        name="phone"
                        value={immediateHelpData.phone}
                        onChange={handleImmediateHelpChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-800"
                        placeholder="+2519xxxxxxxx"
                        disabled={isSubmittingHelp}
                      />
                    </div>
                    <div>
                      <Caption className="mb-2 font-medium text-white/90">Help Category *</Caption>
                      <select
                        name="category"
                        value={immediateHelpData.category}
                        onChange={handleImmediateHelpChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-gray-800"
                        required
                        disabled={isSubmittingHelp}
                      >
                        {helpCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Caption className="mb-2 font-medium text-white/90">Describe Your Issue *</Caption>
                    <textarea
                      name="message"
                      value={immediateHelpData.message}
                      onChange={handleImmediateHelpChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-gray-800"
                      placeholder="Please describe your urgent issue in detail..."
                      required
                      disabled={isSubmittingHelp}
                    />
                  </div>

                  <div className="pt-2">
                    <PrimaryButton
                      type="submit"
                      className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      disabled={isSubmittingHelp}
                    >
                      <MdSend size={18} />
                      {isSubmittingHelp ? "Sending..." : "Send to Admin"}
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};
