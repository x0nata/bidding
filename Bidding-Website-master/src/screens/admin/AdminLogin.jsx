import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Caption, Container, PrimaryButton, Title } from "../../router";
import { commonClassNameOfInput } from "../../components/common/Design";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import { loginUser } from "../../redux/slices/authSlice";
import auditLogger, { AuditLogger } from "../../services/auditLogger";
import securityManager from "../../utils/security";
import { HiArrowLeft, HiHome } from "react-icons/hi";

export const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      dispatch(showError("Please fill in all required fields"));
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = securityManager.sanitizeInput(formData.email);
    const sanitizedPassword = securityManager.sanitizeInput(formData.password);

    setIsLoading(true);
    try {
      // Use MongoDB backend authentication
      const result = await dispatch(loginUser({
        email: sanitizedEmail,
        password: sanitizedPassword
      })).unwrap();

      // Check if user is admin - handle both response formats
      const user = result.user || result;

      if (user && user.role === 'admin') {
        // Validate admin access
        securityManager.validateAdminAccess(user);

        // Log successful admin login
        auditLogger.logAction(AuditLogger.ACTIONS.LOGIN, {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          loginTime: new Date().toISOString(),
          userAgent: navigator.userAgent
        });

        dispatch(showSuccess("Admin login successful!"));
        navigate("/admin/dashboard");
      } else {
        // Log failed admin access attempt
        auditLogger.logAction('ADMIN_ACCESS_DENIED', {
          attemptedEmail: sanitizedEmail,
          reason: 'Insufficient privileges',
          userRole: user?.role || 'unknown',
          timestamp: new Date().toISOString()
        });

        dispatch(showError("Access denied. Admin privileges required."));
      }
    } catch (error) {
      // Log failed login attempt
      auditLogger.logAction('ADMIN_LOGIN_FAILED', {
        attemptedEmail: sanitizedEmail,
        error: error.toString(),
        timestamp: new Date().toISOString()
      });

      dispatch(showError(error || "Invalid admin credentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="regsiter pt-16 relative">
        <div className="bg-green w-96 h-96 rounded-full opacity-20 blur-3xl absolute top-2/3"></div>
        <div className="bg-[#241C37] pt-8 h-[40vh] relative content">
          <Container>
            <div>
              <Title level={3} className="text-white">
                Admin Access - Antique Auction System
              </Title>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to="/" className="text-green font-normal text-xl hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                    <HiHome className="text-xl" />
                    Home
                  </Link>
                  <Title level={5} className="text-white font-normal text-xl">
                    /
                  </Title>
                  <Title level={5} className="text-white font-normal text-xl">
                    Admin Login
                  </Title>
                </div>
                <Link
                  to="/"
                  className="bg-green hover:bg-primary text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <HiArrowLeft className="text-lg" />
                  Back to Home
                </Link>
              </div>
            </div>
          </Container>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-s3 w-1/3 m-auto my-16 p-8 rounded-xl">
          <div className="text-center">
            <Title level={5}>Admin Dashboard Access</Title>
            <p className="mt-2 text-lg">
              Authorized personnel only
            </p>
          </div>

          <div className="py-5 mt-8">
            <Caption className="mb-2">Admin Email *</Caption>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={commonClassNameOfInput}
              placeholder="Enter admin email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Caption className="mb-2">Password *</Caption>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={commonClassNameOfInput}
              placeholder="Enter admin password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2 py-4">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={isLoading}
              className="accent-green"
            />
            <Caption>Remember me</Caption>
          </div>

          <PrimaryButton
            type="submit"
            className="w-full my-5"
            disabled={isLoading}
          >
            {isLoading ? "SIGNING IN..." : "ACCESS ADMIN DASHBOARD"}
          </PrimaryButton>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Secure admin access with enhanced authentication
            </p>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <Link
              to="/"
              className="text-gray-600 hover:text-green transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <HiArrowLeft className="text-lg" />
              Return to Main Website
            </Link>
          </div>
        </form>
        
        <div className="bg-green w-96 h-96 rounded-full opacity-20 blur-3xl absolute bottom-96 right-0"></div>
      </section>
    </>
  );
};
