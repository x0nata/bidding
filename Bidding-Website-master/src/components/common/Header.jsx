import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// design
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { Container, CustomNavLink, CustomNavLinkList, ProfileCard } from "../../router";
import { User1 } from "../../utils/userAvatars";
import { menulists, getRoleBasedMenus } from "../../utils/data";
import { logoutUser } from "../../redux/slices/authSlice";
import { setFilters } from "../../redux/slices/productSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import NotificationCenter from "./NotificationCenter";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenuOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(setFilters({ search: searchQuery.trim() }));
      navigate('/');
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(showSuccess("Logged out successfully"));
      navigate('/');
    } catch (error) {
      dispatch(showError(error || "Logout failed"));
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeMenuOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", closeMenuOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check if it's the home page
  const isHomePage = location.pathname === "/";

  // Get user role from authentication state
  const role = user?.role || "user";

  // Get role-based menu items
  const roleBasedMenus = user ? getRoleBasedMenus(role) : menulists;

  return (
    <>
      <header className={isHomePage ? `header py-1 bg-primary ${isScrolled ? "scrolled" : ""}` : `header bg-white shadow-s1 ${isScrolled ? "scrolled" : ""}`}>
        <Container>
          <nav className="p-4 flex justify-between items-center relative">
            <div className="flex items-center gap-14">
              <div>
                <CustomNavLink href="/" className="flex items-center">
                  <h1 className={`text-2xl font-bold ${isHomePage && !isScrolled ? "text-white" : "text-primary"} hover:opacity-80 transition-opacity`}>
                    Horn of Antiques
                  </h1>
                </CustomNavLink>
              </div>
              <div className="hidden lg:flex items-center justify-between gap-8">
                {roleBasedMenus.map((list) => (
                  <li key={list.id} className="capitalize list-none">
                    <CustomNavLinkList href={list.path} isActive={location.pathname === list.path} className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`}>
                      {list.link}
                    </CustomNavLinkList>
                  </li>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-8 icons">
              {/* Search functionality */}
              {showSearch && (
                <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search antiques..."
                    className="px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark"
                  >
                    Search
                  </button>
                </form>
              )}

              <div className="hidden lg:flex lg:items-center lg:gap-8">
                <button
                  onClick={toggleSearch}
                  className={`${isScrolled || !isHomePage ? "text-black" : "text-white"} hover:text-primary transition-colors`}
                >
                  <IoSearchOutline size={23} />
                </button>

                {!isAuthenticated ? (
                  <>
                    {role === "buyer" && (
                      <CustomNavLink href="/seller/login" className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`}>
                        Become an Ethiopian Antique Seller
                      </CustomNavLink>
                    )}
                    <CustomNavLink href="/login" className={`${isScrolled || !isHomePage ? "text-black" : "text-white"}`}>
                      Login
                    </CustomNavLink>
                    <CustomNavLink href="/register" className={`${!isHomePage || isScrolled ? "bg-green" : "bg-white"} px-8 py-2 rounded-full text-primary shadow-md`}>
                      Sign Up
                    </CustomNavLink>
                  </>
                ) : (
                  <>
                    {/* Enhanced Notification Center */}
                    <NotificationCenter />

                    {/* User Profile */}
                    <CustomNavLink href="/dashboard">
                      <ProfileCard>
                        <img
                          src={user?.photo || user?.avatar || user?.profileImage || User1}
                          alt={user?.name || "User"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = User1; // Fallback to default avatar on error
                          }}
                        />
                      </ProfileCard>
                    </CustomNavLink>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className={`${isScrolled || !isHomePage ? "text-black" : "text-white"} hover:text-red-500 transition-colors`}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
              <div className={`icon flex items-center justify-center gap-6 ${isScrolled || !isHomePage ? "text-primary" : "text-white"}`}>
                <button onClick={toggleMenu} className="lg:hidden w-10 h-10 flex justify-center items-center bg-black text-white focus:outline-none">
                  {isOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
                </button>
              </div>
            </div>

            {/* Responsive Menu if below 768px */}
            <div ref={menuRef} className={`lg:hidden absolute right-0 top-full w-full bg-white shadow-lg z-50 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
              <div className="p-5">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search antiques..."
                      className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Mobile Menu Items */}
                {roleBasedMenus.map((list) => (
                  <div key={list.id} className="py-2">
                    <CustomNavLink
                      href={list.path}
                      className="block text-gray-800 hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {list.link}
                    </CustomNavLink>
                  </div>
                ))}

                {/* Mobile Auth Links */}
                <div className="border-t pt-4 mt-4">
                  {!isAuthenticated ? (
                    <>
                      <div className="py-2">
                        <CustomNavLink
                          href="/login"
                          className="block text-gray-800 hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Login
                        </CustomNavLink>
                      </div>
                      <div className="py-2">
                        <CustomNavLink
                          href="/register"
                          className="block bg-primary text-white px-4 py-2 rounded-md text-center hover:bg-primary-dark transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign Up
                        </CustomNavLink>
                      </div>
                      {role === "buyer" && (
                        <div className="py-2">
                          <CustomNavLink
                            href="/seller/login"
                            className="block text-gray-800 hover:text-primary transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            Become an Antique Seller
                          </CustomNavLink>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="py-2">
                        <CustomNavLink
                          href="/dashboard"
                          className="block text-gray-800 hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          Dashboard
                        </CustomNavLink>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="block w-full text-left text-red-600 hover:text-red-800 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </Container>
      </header>
    </>
  );
};
