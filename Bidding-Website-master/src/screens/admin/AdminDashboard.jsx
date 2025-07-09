import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Title } from "../../router";
import { logoutUser } from "../../redux/slices/authSlice";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";
import {
  MdDashboard,
  MdPeople,
  MdGavel,
  MdVerified,
  MdLogout,
  MdTrendingUp,
  MdAttachMoney,
  MdCategory,
  MdMenu,
  MdClose
} from "react-icons/md";
import { HiOutlineUsers } from "react-icons/hi2";
import { RiAuctionFill } from "react-icons/ri";
import { GiDiploma } from "react-icons/gi";
import UserManagement from '../../components/admin/UserManagement';
import AuctionManagement from '../../components/admin/AuctionManagement';
import { adminAnalyticsApi } from '../../services/adminApi';
import auditLogger, { AuditLogger } from '../../services/auditLogger';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    recentUsers: [],
    recentProducts: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: MdDashboard },
    { id: 'users', label: 'User Management', icon: MdPeople },
    { id: 'auctions', label: 'Auction Management', icon: MdGavel },
  ];

  // Fetch real-time system statistics
  const fetchSystemStats = async () => {
    try {
      setLoadingStats(true);
      const systemStats = await adminAnalyticsApi.getSystemStats();
      setStats(systemStats);
    } catch (error) {
      console.error('Failed to load system statistics:', error);
      dispatch(showError(`Failed to load system statistics: ${error.message || error}`));
    } finally {
      setLoadingStats(false);
    }
  };

  // Auto-refresh stats every 30 seconds and log dashboard access
  useEffect(() => {
    fetchSystemStats();
    auditLogger.logAction(AuditLogger.ACTIONS.SYSTEM_ACCESS, {
      section: 'Admin Dashboard',
      user: user?.name || 'Unknown',
      userId: user?._id || 'Unknown'
    });

    const interval = setInterval(fetchSystemStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      auditLogger.logAction(AuditLogger.ACTIONS.LOGOUT, {
        user: user?.name || 'Unknown',
        userId: user?._id || 'Unknown',
        timestamp: new Date().toISOString()
      });

      await dispatch(logoutUser()).unwrap();
      dispatch(showSuccess("Logged out successfully"));
      navigate('/admin/login');
    } catch (error) {
      dispatch(showError("Logout failed"));
      navigate('/admin/login');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <Title level={3} className="text-gray-800">Admin Dashboard Overview</Title>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">
                {loadingStats ? '...' : stats.totalUsers}
              </Title>
              <Title level={5} className="text-gray-600">Total Users</Title>
            </div>
            <HiOutlineUsers size={40} className="text-green" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">
                {loadingStats ? '...' : stats.totalProducts}
              </Title>
              <Title level={5} className="text-gray-600">Total Products</Title>
            </div>
            <RiAuctionFill size={40} className="text-green" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">
                {loadingStats ? '...' : stats.pendingApprovals}
              </Title>
              <Title level={5} className="text-gray-600">Pending Approvals</Title>
            </div>
            <GiDiploma size={40} className="text-green" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">${stats.totalRevenue.toLocaleString()}</Title>
              <Title level={5} className="text-gray-600">Total Revenue</Title>
            </div>
            <MdAttachMoney size={40} className="text-green" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{stats.activeAuctions}</Title>
              <Title level={5} className="text-gray-600">Active Auctions</Title>
            </div>
            <MdTrendingUp size={40} className="text-green" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{stats.completedAuctions}</Title>
              <Title level={5} className="text-gray-600">Completed Auctions</Title>
            </div>
            <MdCategory size={40} className="text-green" />
          </div>
        </div>
      </div>

      {/* Production Ready Message */}
      <div className="bg-gradient-to-r from-green to-primary p-6 rounded-lg shadow-md text-white">
        <div className="flex items-center space-x-4">
          <MdVerified size={48} className="text-white" />
          <div>
            <Title level={4} className="text-white mb-2">🎉 System Ready for Production!</Title>
            <p className="text-green-100">
              Your antique auction platform has been successfully cleaned and is ready for real users.
              All demo data has been removed, and the system is configured with proper admin credentials.
            </p>
            <div className="mt-3 text-sm text-green-100">
              <p>✅ Database cleaned • ✅ Admin account configured • ✅ Production ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <Title level={4} className="text-gray-800 mb-4">Quick Actions</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveSection('auctions')}
            className="bg-green text-white p-4 text-center rounded-lg hover:bg-primary transition-colors"
          >
            Manage Auctions
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className="bg-green text-white p-4 text-center rounded-lg hover:bg-primary transition-colors"
          >
            User Management
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return <UserManagement />;
      case 'auctions':
        return <AuctionManagement />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <Title level={4} className="text-gray-800">Admin Panel</Title>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-green hover:bg-gray-100"
        >
          {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen shadow-lg transition-transform duration-300 ease-in-out`}>
          <div className="p-6 hidden md:block">
            <Title level={4} className="text-gray-800">Admin Panel</Title>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
          </div>

          <nav className="mt-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false); // Close mobile menu
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-300 ${
                    activeSection === item.id
                      ? 'bg-green text-white border-r-4 border-green'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-6 py-3 text-left text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-300 mt-8"
            >
              <MdLogout size={20} className="mr-3" />
              Logout
            </button>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};
