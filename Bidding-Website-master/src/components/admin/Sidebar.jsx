import { Caption, CustomNavLink, Title } from "../common/Design";
import { CiGrid41 } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineCategory, MdAnalytics, MdOutlineGavel } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { IoIosLogOut } from "react-icons/io";
import { User1 } from "../../utils/userAvatars";
import { CgProductHunt } from "react-icons/cg";
import { TbCurrencyDollar } from "react-icons/tb";
import { FiUser, FiClock, FiShoppingBag } from "react-icons/fi";
import { FaPlusCircle, FaGavel, FaTrophy, FaTruck } from "react-icons/fa";
import { GiMagnifyingGlass, GiDiploma } from "react-icons/gi";
import { HiOutlineAcademicCap, HiOutlineChartBar } from "react-icons/hi";
import { BsGraphUp, BsHeart } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import { useAuth } from "../../hooks/useAuth";

export const Sidebar = ({ role: propRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    userDisplayData,
    isAuthenticated,
    getRoleDisplayName,
    getRoleBadgeClass
  } = useAuth();

  const role = propRole || userDisplayData.role;

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(showSuccess("Logged out successfully"));
      navigate('/');
    } catch (error) {
      dispatch(showError(error || "Logout failed"));
      navigate('/');
    }
  };

  // Enhanced navigation item styling
  const getNavItemClass = (isActive) => {
    return `flex items-center gap-3 mb-2 p-3 rounded-lg transition-all duration-200 hover:bg-green hover:text-white group ${
      isActive
        ? 'bg-green text-white shadow-md'
        : 'text-gray-700 hover:shadow-sm'
    }`;
  };

  // Section header styling
  const sectionHeaderClass = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-6 first:mt-0 px-3";

  return (
    <>
      <section className="sidebar flex flex-col justify-between h-full bg-white shadow-lg">
        {/* Enhanced Profile Section */}
        <div className="profile flex items-center text-center justify-center gap-4 flex-col mb-6 p-6 bg-gradient-to-br from-green/5 to-green/10 border-b border-gray-100">
          <div className="relative">
            <img
              src={userDisplayData.photo}
              alt={`${userDisplayData.name}'s Profile`}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = User1; // Fallback to default avatar on error
              }}
            />
            {/* Online status indicator - only show for authenticated users */}
            {isAuthenticated && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <div>
            <Title level={5} className="capitalize text-gray-800 mb-1">
              {userDisplayData.name}
            </Title>
            <Caption className="text-gray-600 text-sm">
              {userDisplayData.email}
            </Caption>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(role)}`}>
                {getRoleDisplayName(role)}
              </span>
              {/* Authentication status badge */}
              {!isAuthenticated && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Not Logged In
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Main Dashboard */}
          <CustomNavLink
            href="/dashboard"
            isActive={location.pathname === "/dashboard"}
            className={getNavItemClass(location.pathname === "/dashboard")}
          >
            <span className="flex-shrink-0">
              <CiGrid41 size={20} />
            </span>
            <span className="font-medium">Dashboard</span>
          </CustomNavLink>

          {/* Universal Navigation - All authenticated users can buy and sell */}

          {/* Buying Section - Available to all users */}
          <div className={sectionHeaderClass}>
            <FaGavel className="inline mr-2" size={12} />
            Bidding & Buying
          </div>

          <CustomNavLink
            href="/"
            isActive={location.pathname === "/"}
            className={getNavItemClass(location.pathname === "/")}
          >
            <span className="flex-shrink-0">
              <RiAuctionLine size={20} />
            </span>
            <span className="font-medium">Browse Auctions</span>
          </CustomNavLink>

          <CustomNavLink
            href="/my-bids"
            isActive={location.pathname === "/my-bids"}
            className={getNavItemClass(location.pathname === "/my-bids")}
          >
            <span className="flex-shrink-0">
              <MdOutlineGavel size={20} />
            </span>
            <span className="font-medium">My Bids</span>
          </CustomNavLink>



          <CustomNavLink
            href="/winning-products"
            isActive={location.pathname === "/winning-products"}
            className={getNavItemClass(location.pathname === "/winning-products")}
          >
            <span className="flex-shrink-0">
              <FaTrophy size={18} />
            </span>
            <span className="font-medium">Won Items</span>
          </CustomNavLink>

          {/* Selling Section - Available to all users */}
          <div className={sectionHeaderClass}>
            <FiShoppingBag className="inline mr-2" size={12} />
            Selling & Listings
          </div>

          <CustomNavLink
            href="/add-product"
            isActive={location.pathname === "/add-product"}
            className={getNavItemClass(location.pathname === "/add-product")}
          >
            <span className="flex-shrink-0">
              <FaPlusCircle size={18} />
            </span>
            <span className="font-medium">Add Product</span>
          </CustomNavLink>



          <CustomNavLink
            href="/seller/sales-history"
            isActive={location.pathname === "/seller/sales-history"}
            className={getNavItemClass(location.pathname === "/seller/sales-history")}
          >
            <span className="flex-shrink-0">
              <BsGraphUp size={18} />
            </span>
            <span className="font-medium">Sales History</span>
          </CustomNavLink>

          {/* Expert Navigation */}
          {role === "expert" && (
            <>
              <div className={sectionHeaderClass}>
                <GiDiploma className="inline mr-2" size={12} />
                Expert Services
              </div>

              <CustomNavLink
                href="/expert/appraisal-queue"
                isActive={location.pathname === "/expert/appraisal-queue"}
                className={getNavItemClass(location.pathname === "/expert/appraisal-queue")}
              >
                <span className="flex-shrink-0">
                  <GiMagnifyingGlass size={20} />
                </span>
                <span className="font-medium">Appraisal Queue</span>
              </CustomNavLink>

              <CustomNavLink
                href="/expert/my-appraisals"
                isActive={location.pathname === "/expert/my-appraisals"}
                className={getNavItemClass(location.pathname === "/expert/my-appraisals")}
              >
                <span className="flex-shrink-0">
                  <FiClock size={20} />
                </span>
                <span className="font-medium">My Appraisals</span>
              </CustomNavLink>

              <CustomNavLink
                href="/expert/expertise-profile"
                isActive={location.pathname === "/expert/expertise-profile"}
                className={getNavItemClass(location.pathname === "/expert/expertise-profile")}
              >
                <span className="flex-shrink-0">
                  <HiOutlineAcademicCap size={20} />
                </span>
                <span className="font-medium">Expertise Profile</span>
              </CustomNavLink>

              <CustomNavLink
                href="/expert/reports"
                isActive={location.pathname === "/expert/reports"}
                className={getNavItemClass(location.pathname === "/expert/reports")}
              >
                <span className="flex-shrink-0">
                  <HiOutlineChartBar size={20} />
                </span>
                <span className="font-medium">Reports</span>
              </CustomNavLink>
            </>
          )}

          {/* Admin Navigation */}
          {role === "admin" && (
            <>
              <div className={sectionHeaderClass}>
                <MdAnalytics className="inline mr-2" size={12} />
                Administration
              </div>

              <CustomNavLink
                href="/userlist"
                isActive={location.pathname === "/userlist"}
                className={getNavItemClass(location.pathname === "/userlist")}
              >
                <span className="flex-shrink-0">
                  <FiUser size={20} />
                </span>
                <span className="font-medium">All Users</span>
              </CustomNavLink>

              <CustomNavLink
                href="/product/admin"
                isActive={location.pathname === "/product/admin"}
                className={getNavItemClass(location.pathname === "/product/admin")}
              >
                <span className="flex-shrink-0">
                  <CgProductHunt size={20} />
                </span>
                <span className="font-medium">All Products</span>
              </CustomNavLink>

              <CustomNavLink
                href="/category"
                isActive={location.pathname === "/category"}
                className={getNavItemClass(location.pathname === "/category")}
              >
                <span className="flex-shrink-0">
                  <MdOutlineCategory size={20} />
                </span>
                <span className="font-medium">Categories</span>
              </CustomNavLink>

              <CustomNavLink
                href="/admin/income"
                isActive={location.pathname === "/admin/income"}
                className={getNavItemClass(location.pathname === "/admin/income")}
              >
                <span className="flex-shrink-0">
                  <TbCurrencyDollar size={20} />
                </span>
                <span className="font-medium">Revenue</span>
              </CustomNavLink>

              <CustomNavLink
                href="/admin/transportation"
                isActive={location.pathname === "/admin/transportation"}
                className={getNavItemClass(location.pathname === "/admin/transportation")}
              >
                <span className="flex-shrink-0">
                  <FaTruck size={18} />
                </span>
                <span className="font-medium">Transportation</span>
              </CustomNavLink>
            </>
          )}

          {/* Account Section */}
          <div className={sectionHeaderClass}>
            <FiUser className="inline mr-2" size={12} />
            Account
          </div>

          <CustomNavLink
            href="/profile"
            isActive={location.pathname === "/profile"}
            className={getNavItemClass(location.pathname === "/profile")}
          >
            <span className="flex-shrink-0">
              <IoSettingsOutline size={20} />
            </span>
            <span className="font-medium">Personal Profile</span>
          </CustomNavLink>
        </div>

        {/* Enhanced Logout Section */}
        <div className="p-4 border-t border-gray-100">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-3 bg-red-500 hover:bg-red-600 p-3 rounded-lg text-white transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <span>
                <IoIosLogOut size={20} />
              </span>
              <span className="font-medium">Log Out</span>
            </button>
          ) : (
            <CustomNavLink
              href="/login"
              className="flex items-center justify-center w-full gap-3 bg-green hover:bg-green-600 p-3 rounded-lg text-white transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <span>
                <FiUser size={20} />
              </span>
              <span className="font-medium">Log In</span>
            </CustomNavLink>
          )}
        </div>
      </section>
    </>
  );
};
