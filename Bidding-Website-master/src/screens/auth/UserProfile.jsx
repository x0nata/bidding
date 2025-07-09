import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { Caption, Title } from "../../router";
import { User2 } from "../../utils/userAvatars";
import { commonClassNameOfInput, PrimaryButton } from "../../components/common/Design";
import { updateUserProfile, refreshUserData } from "../../redux/slices/authSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import { useAuth } from "../../hooks/useAuth";
import { useDashboard } from "../../hooks/useDashboard";
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave, FiRefreshCw,
  FiShoppingBag, FiHeart, FiTrendingUp, FiSettings, FiShield, FiDollarSign
} from "react-icons/fi";
import BankBalanceDisplay from "../../components/payment/BankBalanceDisplay";
import BankAddBalanceModal from "../../components/payment/BankAddBalanceModal";
import { MdVerified, MdSecurity } from "react-icons/md";
import { BsGraphUp, BsCollection } from "react-icons/bs";

// Component to display real user statistics
const ProfileStatistics = ({ user }) => {
  const { stats, dashboardLoading } = useDashboard();

  if (dashboardLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white shadow-s1 p-6 rounded-lg border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white shadow-s1 p-6 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <Caption className="text-gray-600 mb-1">Active Bids</Caption>
            <Title level={4} className="text-green">{stats.activeBids || 0}</Title>
          </div>
          <div className="w-12 h-12 bg-green/10 rounded-lg flex items-center justify-center">
            <FiTrendingUp className="text-green" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-s1 p-6 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <Caption className="text-gray-600 mb-1">Items Listed</Caption>
            <Title level={4} className="text-blue-600">{stats.totalListings || 0}</Title>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <BsCollection className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-s1 p-6 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <Caption className="text-gray-600 mb-1">Won Auctions</Caption>
            <Title level={4} className="text-purple-600">{stats.itemsWon || 0}</Title>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <BsGraphUp className="text-purple-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserProfile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { userDisplayData, getRoleDisplayName, getRoleBadgeClass, refreshUser } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    role: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0);

  // Auto-populate form with user data when component mounts or user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        contactNumber: user.contactNumber || user.phone || '',
        address: user.address || '',
        role: user.role || 'user'
      });
      setImagePreview(user.photo || user.profileImage || '');
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        dispatch(showError("Please select a valid image file (JPG, JPEG, or PNG)"));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        dispatch(showError("Image size should be less than 5MB"));
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = new FormData();

      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] && key !== 'email') { // Don't update email
          updateData.append(key, formData[key]);
        }
      });

      // Add profile image if selected
      if (profileImage) {
        updateData.append('profileImage', profileImage);
      }

      await dispatch(updateUserProfile(updateData)).unwrap();
      dispatch(showSuccess("Profile updated successfully!"));

      // Refresh user data to update sidebar and other components
      refreshUser();
    } catch (error) {
      dispatch(showError(error || "Failed to update profile"));
    }
  };

  // Balance management handlers
  const handleAddBalanceClick = () => {
    setShowAddBalanceModal(true);
  };

  const handleAddBalanceSuccess = () => {
    setBalanceRefreshTrigger(prev => prev + 1);
    dispatch(showSuccess("Balance added successfully!"));
  };

  if (!user) {
    return (
      <section className="shadow-s1 p-8 rounded-lg">
        <div className="text-center">
          <Title level={5}>Loading Profile...</Title>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Profile Header */}
        <section className="bg-gradient-to-r from-green/5 to-green/10 shadow-s1 p-8 rounded-lg border border-green/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={imagePreview || User2}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-green text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors shadow-md"
                >
                  <FiCamera size={14} />
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Title level={4} className="capitalize text-gray-800">
                    {user.name || 'User'}
                  </Title>
                  {user.verified && (
                    <MdVerified className="text-green" size={20} title="Verified User" />
                  )}
                </div>
                <Caption className="text-gray-600 flex items-center gap-2 mb-2">
                  <FiMail size={14} />
                  {user.email || 'No email provided'}
                </Caption>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddBalanceClick}
                className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <FiDollarSign size={16} />
                Manage Balance
              </button>
              <NavLink
                to="/my-bids"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green text-green rounded-lg hover:bg-green hover:text-white transition-colors text-sm font-medium"
              >
                <FiTrendingUp size={16} />
                My Bids
              </NavLink>
              <NavLink
                to="/favorites"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green text-green rounded-lg hover:bg-green hover:text-white transition-colors text-sm font-medium"
              >
                <FiHeart size={16} />
                Watchlist
              </NavLink>
              <NavLink
                to="/add-product"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green text-green rounded-lg hover:bg-green hover:text-white transition-colors text-sm font-medium"
              >
                <FiShoppingBag size={16} />
                Sell Item
              </NavLink>
            </div>
          </div>
        </section>

        {/* Profile Statistics Cards - Using Real Data */}
        <ProfileStatistics user={user} />

        {/* Balance Management Section */}
        <section className="bg-white shadow-s1 p-6 rounded-lg border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Balance</h3>
              <p className="text-sm text-gray-600">Manage your balance for participating in auctions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankBalanceDisplay
              showAddBalance={true}
              onAddBalanceClick={handleAddBalanceClick}
              refreshTrigger={balanceRefreshTrigger}
              className="h-fit"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How Balance Works</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>Add balance using our secure demo payment system</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>When you bid, the amount is temporarily held</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>If you win, payment is deducted. If you lose, amount is refunded</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Profile Form */}
        <section className="bg-white shadow-s1 p-8 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <Title level={5} className="text-gray-800">Personal Information</Title>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiShield size={16} />
              Your information is secure
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <Caption className="mb-2 flex items-center gap-2 text-gray-700 font-medium">
                  <FiUser size={16} />
                  Full Name *
                </Caption>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`capitalize ${commonClassNameOfInput} focus:ring-green focus:border-green`}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Caption className="mb-2 flex items-center gap-2 text-gray-700 font-medium">
                  <FiPhone size={16} />
                  Contact Number
                </Caption>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`${commonClassNameOfInput} focus:ring-green focus:border-green`}
                  placeholder="Enter your contact number"
                />
              </div>

              <div>
                <Caption className="mb-2 flex items-center gap-2 text-gray-700 font-medium">
                  <FiMail size={16} />
                  Email Address
                </Caption>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className={`${commonClassNameOfInput} bg-gray-50 focus:ring-green focus:border-green`}
                  placeholder="Email cannot be changed"
                  disabled
                />
                <Caption className="text-xs text-gray-500 mt-1">
                  Email address cannot be modified for security reasons
                </Caption>
              </div>
            </div>

            <div>
              <Caption className="mb-2 flex items-center gap-2 text-gray-700 font-medium">
                <FiMapPin size={16} />
                Address
              </Caption>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`${commonClassNameOfInput} min-h-[100px] resize-vertical focus:ring-green focus:border-green`}
                placeholder="Enter your complete address"
                rows="3"
              />
            </div>

            <div>
              <Caption className="mb-2 flex items-center gap-2 text-gray-700 font-medium">
                <FiSettings size={16} />
                Account Role
              </Caption>
              <input
                type="text"
                name="role"
                value={formData.role === "admin" ? "Administrator" :
                       formData.role === "expert" ? "Expert Appraiser" :
                       "User"}
                className={`${commonClassNameOfInput} bg-gray-50 focus:ring-green focus:border-green`}
                disabled
              />
              <Caption className="text-xs text-gray-500 mt-1">
                Contact support to change your account role
              </Caption>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <PrimaryButton
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green hover:bg-green-600 focus:ring-green"
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" size={18} />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Update Profile
                  </>
                )}
              </PrimaryButton>

              <button
                type="button"
                onClick={() => {
                  // Reset form to original user data
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      contactNumber: user.contactNumber || user.phone || '',
                      address: user.address || '',
                      role: user.role || 'user'
                    });
                    setImagePreview(user.photo || user.profileImage || '');
                    setProfileImage(null);
                  }
                }}
                className="flex-1 sm:flex-none px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700"
                disabled={isLoading}
              >
                <FiRefreshCw size={18} />
                Reset Changes
              </button>
            </div>
          </form>
        </section>

        {/* Add Balance Modal */}
        <BankAddBalanceModal
          isOpen={showAddBalanceModal}
          onClose={() => setShowAddBalanceModal(false)}
          onSuccess={handleAddBalanceSuccess}
        />
      </div>
    </>
  );
};
