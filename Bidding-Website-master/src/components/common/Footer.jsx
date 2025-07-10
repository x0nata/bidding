import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, PrimaryButton, Title, Body } from "./Design";
import { FiPhoneOutgoing } from "react-icons/fi";
import { MdOutlineAttachEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { apiEndpoints } from "../../services/api";
import { toast } from "react-toastify";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Newsletter subscription handler
  const handleNewsletterSubscription = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      await apiEndpoints.newsletter.subscribe({
        email,
        source: "footer",
        preferences: {
          auctionUpdates: true,
          newListings: true,
          expertTips: true,
          weeklyDigest: true,
        },
      });

      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to subscribe. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Social media links - using environment variables for configurability
  const socialLinks = [
    {
      name: "YouTube",
      icon: <FaYoutube size={22} />,
      url: process.env.REACT_APP_YOUTUBE_URL || "https://youtube.com/@hornofantiques",
      color: "hover:bg-red-600",
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={22} />,
      url: process.env.REACT_APP_INSTAGRAM_URL || "https://instagram.com/hornofantiques",
      color: "hover:bg-pink-600",
    },
    {
      name: "Twitter",
      icon: <FaTwitter size={22} />,
      url: process.env.REACT_APP_TWITTER_URL || "https://twitter.com/hornofantiques",
      color: "hover:bg-blue-400",
    },

  ];

  return (
    <>
      <footer className="bg-primary py-16 mt-16 relative">
        <Container className="flex flex-col md:flex-row justify-between gap-12">
          {/* Company Info & Newsletter */}
          <div className="w-full md:w-1/3">
            <Body className="text-gray-300 mb-8 leading-relaxed">
              Ethiopia's premier destination for authentic antiques and collectibles.
              Connecting Ethiopian collectors with verified treasures since 2024.
            </Body>

            <div className="bg-gray-300 h-[1px] my-8"></div>

            <Title level={4} className="font-normal text-gray-100 mb-4">
              Get Auction Updates
            </Title>
            <form onSubmit={handleNewsletterSubscription} className="flex items-center justify-between mt-5">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                className="w-full h-full p-3.5 py-[15px] text-sm border-none outline-none rounded-l-md text-gray-800 focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                aria-label="Email address for newsletter subscription"
              />
              <PrimaryButton
                type="submit"
                disabled={isSubscribing}
                className="rounded-none py-3.5 px-8 text-sm hover:bg-indigo-800 rounded-r-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? "..." : "Subscribe"}
              </PrimaryButton>
            </form>
            <Body className="text-gray-300 text-sm mt-3">
              Stay updated on new auctions and rare finds. We respect your privacy and you can unsubscribe anytime.
            </Body>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-2/3">
            {/* About Us */}
            <div>
              <Title level={5} className="text-white font-normal mb-6">
                About Us
              </Title>
              <ul className="flex flex-col gap-5 text-gray-200">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Learn about Horn of Antiques"
                  >
                    About Horn of Antiques
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Learn how our auction process works"
                  >
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            {/* Help & Support */}
            <div>
              <Title level={5} className="text-white font-normal mb-6">
                We are Here to Help
              </Title>
              <ul className="flex flex-col gap-5 text-gray-200">
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Access your account dashboard"
                  >
                    My Account
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help#bidding"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Learn how to bid on auctions"
                  >
                    Bidding Guide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help#payment"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Learn about payment and shipping"
                  >
                    Payment & Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Contact our support team"
                  >
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Browse frequently asked questions"
                  >
                    Help & FAQ
                  </Link>
                </li>
              </ul>
            </div>
            {/* Contact & Social */}
            <div>
              <Title level={5} className="text-white font-normal mb-6">
                Follow Us
              </Title>
              <ul className="flex flex-col gap-5 text-gray-200 mb-6">
                <li className="flex items-center gap-2">
                  <FiPhoneOutgoing size={19} />
                  <a
                    href="tel:+251977165578"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Call us at +251977165578"
                  >
                    +251977165578
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MdOutlineAttachEmail size={22} />
                  <a
                    href="mailto:HornofAntique@gmail.com"
                    className="hover:text-green transition-colors duration-300"
                    aria-label="Email us at HornofAntique@gmail.com"
                  >
                    HornofAntique@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <IoLocationOutline size={22} />
                  <span>Addis Ababa, Ethiopia</span>
                </li>
              </ul>

              {/* Social Media Links */}
              <div className="flex items-center mt-5 justify-between">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-gray-800 p-3 rounded-lg transition-all duration-300 hover:bg-green hover:text-white hover:scale-110 hover:shadow-lg"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>

        {/* Copyright and Legal Section */}
        <div className="border-t border-gray-600 mt-12 pt-8">
          <Container>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-300 text-sm">
                <p>&copy; {new Date().getFullYear()} Horn of Antiques. All rights reserved.</p>
                <p className="mt-1">Connecting Ethiopian collectors with authentic treasures.</p>
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-green transition-colors duration-300 text-sm"
                  aria-label="Read our privacy policy"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-green transition-colors duration-300 text-sm"
                  aria-label="Read our terms of service"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-green transition-colors duration-300 text-sm"
                  aria-label="Get help and support"
                >
                  Help & FAQ
                </Link>
                <span className="text-gray-500">|</span>
                <Link
                  to="/admin/login"
                  className="text-gray-400 hover:text-green transition-colors duration-300 text-sm font-medium"
                  title="Admin Dashboard Access"
                  aria-label="Admin login portal"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </Container>
        </div>


      </footer>
    </>
  );
};
