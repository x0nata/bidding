import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFacebook, FaGoogle, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaShieldAlt, FaUserCheck } from "react-icons/fa";
import { MdSecurity, MdVerified } from "react-icons/md";
import { Caption, Container, CustomNavLink, PrimaryButton, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { loginUser, clearError } from "../../redux/slices/authSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      dispatch(showError(error));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);

    // Validate form in real-time
    setIsFormValid(newFormData.email && newFormData.password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      dispatch(showError("Please fill in all required fields"));
      return;
    }

    try {
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      dispatch(showSuccess("Login successful! Welcome back."));
      navigate(from, { replace: true });
    } catch (error) {
      dispatch(showError(error || "Login failed"));
    }
  };
  return (
    <>
      <section className="login-page min-h-screen bg-gray-50 pt-16 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="bg-primary w-96 h-96 rounded-full opacity-10 blur-3xl absolute top-1/4 -left-48"></div>
        <div className="bg-green-400 w-64 h-64 rounded-full opacity-10 blur-3xl absolute bottom-1/4 -right-32"></div>

        {/* Header Section */}
        <div className="bg-primary pt-12 pb-20 relative">
          <Container>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  <FaShieldAlt className="text-4xl text-white" />
                </div>
              </div>
              <Title level={2} className="text-white mb-2">
                Welcome Back
              </Title>
              <p className="text-white/90 text-lg max-w-md mx-auto">
                Sign in to access your antique auction account and discover rare treasures
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-white/80">
                <CustomNavLink href="/" className="hover:text-white transition-colors">Home</CustomNavLink>
                <span>/</span>
                <span>Sign In</span>
              </div>
            </div>
          </Container>
        </div>
        {/* Login Form */}
        <div className="container mx-auto px-4 -mt-10 relative z-10">
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
              {/* Form Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FaUserCheck className="text-2xl text-primary" />
                  </div>
                </div>
                <Title level={4} className="text-gray-800 mb-2">Sign In to Your Account</Title>
                <p className="text-gray-600">
                  New to antique auctions?
                  <CustomNavLink href="/register" className="text-primary hover:text-green-600 font-medium ml-1">
                    Create Account Here
                  </CustomNavLink>
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r mb-6 flex items-center">
                  <MdSecurity className="mr-2" />
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="mb-6">
                <Caption className="mb-2 text-gray-700 font-medium flex items-center">
                  <FaEnvelope className="mr-2 text-primary" />
                  Email Address *
                </Caption>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${commonClassNameOfInput} pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                      formData.email ? 'border-green-300 bg-green-50/30' : ''
                    }`}
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    aria-label="Email Address"
                  />
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {formData.email && (
                    <MdVerified className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <Caption className="mb-2 text-gray-700 font-medium flex items-center">
                  <FaLock className="mr-2 text-primary" />
                  Password *
                </Caption>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${commonClassNameOfInput} pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                      formData.password ? 'border-green-300 bg-green-50/30' : ''
                    }`}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    aria-label="Password"
                  />
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <Caption className="ml-2 text-gray-600">Remember me</Caption>
                </label>
                <CustomNavLink href="/forgot-password" className="text-primary hover:text-green-600 text-sm font-medium">
                  Forgot Password?
                </CustomNavLink>
              </div>

              {/* Submit Button */}
              <PrimaryButton
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isFormValid && !isLoading
                    ? 'bg-primary hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </PrimaryButton>
              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-all duration-200 hover:shadow-lg"
                  disabled={isLoading}
                >
                  <FaGoogle />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200 hover:shadow-lg"
                  disabled={isLoading}
                >
                  <FaFacebook />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>

              {/* Terms */}
              <p className="text-center text-sm text-gray-600 leading-relaxed">
                By signing in, you agree to our{' '}
                <CustomNavLink href="/terms" className="text-primary hover:text-green-600 underline">
                  Terms & Conditions
                </CustomNavLink>{' '}
                and{' '}
                <CustomNavLink href="/privacy" className="text-primary hover:text-green-600 underline">
                  Privacy Policy
                </CustomNavLink>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};
