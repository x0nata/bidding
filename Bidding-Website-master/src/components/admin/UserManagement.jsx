import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Title, Body } from '../../components/common/Design';
import { HiOutlineUsers, HiOutlineSearch, HiOutlineDownload } from 'react-icons/hi';
import { MdEdit, MdDelete, MdBlock, MdCheckCircle } from 'react-icons/md';
import { FiEye } from 'react-icons/fi';
import { showSuccess, showError } from '../../redux/slices/notificationSlice';
import { adminUserApi } from '../../services/userApi';
import auditLogger, { AuditLogger } from '../../utils/auditLogger';

const UserManagement = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'

  // Fetch users from MongoDB backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await adminUserApi.getAllUsers();
      // Ensure userData is an array
      const usersArray = Array.isArray(userData) ? userData : [];
      setUsers(usersArray);
      setFilteredUsers(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      dispatch(showError(error));
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  const filterAndSortUsers = () => {
    // Ensure users is an array
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleUserAction = async (action, userId) => {
    switch (action) {
      case 'view':
        const user = users.find(u => u._id === userId);
        auditLogger.logAction(AuditLogger.ACTIONS.USER_VIEW, {
          targetUserId: userId,
          targetUserName: user?.name || 'Unknown',
          targetUserEmail: user?.email || 'Unknown'
        });
        setSelectedUser(user);
        setModalMode('view');
        setShowUserModal(true);
        break;
      case 'edit':
        const editUser = users.find(u => u._id === userId);
        setSelectedUser(editUser);
        setModalMode('edit');
        setShowUserModal(true);
        break;
      case 'suspend':
        try {
          const user = users.find(u => u._id === userId);
          const newStatus = user.status === 'active' ? 'suspended' : 'active';

          auditLogger.logAction(
            newStatus === 'suspended' ? AuditLogger.ACTIONS.USER_SUSPEND : AuditLogger.ACTIONS.USER_ACTIVATE,
            {
              targetUserId: userId,
              targetUserName: user?.name || 'Unknown',
              targetUserEmail: user?.email || 'Unknown',
              previousStatus: user?.status || 'unknown',
              newStatus: newStatus
            }
          );

          await adminUserApi.updateUser(userId, { status: newStatus });
          dispatch(showSuccess(`User ${newStatus} successfully`));
          fetchUsers(); // Refresh the list
        } catch (error) {
          dispatch(showError(error));
        }
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          try {
            const user = users.find(u => u._id === userId);

            auditLogger.logAction(AuditLogger.ACTIONS.USER_DELETE, {
              targetUserId: userId,
              targetUserName: user?.name || 'Unknown',
              targetUserEmail: user?.email || 'Unknown',
              deletionReason: 'Manual deletion by admin'
            });

            await adminUserApi.deleteUser(userId);
            dispatch(showSuccess('User deleted successfully'));
            fetchUsers(); // Refresh the list
          } catch (error) {
            dispatch(showError(error));
          }
        }
        break;
      default:
        break;
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      dispatch(showError('Please select users first'));
      return;
    }

    try {
      switch (action) {
        case 'suspend':
          await adminUserApi.bulkUpdateUsers(selectedUsers, 'suspend');
          dispatch(showSuccess(`${selectedUsers.length} users suspended successfully`));
          break;
        case 'activate':
          await adminUserApi.bulkUpdateUsers(selectedUsers, 'activate');
          dispatch(showSuccess(`${selectedUsers.length} users activated successfully`));
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
            await adminUserApi.bulkUpdateUsers(selectedUsers, 'delete');
            dispatch(showSuccess(`${selectedUsers.length} users deleted successfully`));
          }
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      fetchUsers(); // Refresh the list
    } catch (error) {
      dispatch(showError(error));
    }
  };

  const exportToCSV = () => {
    if (!Array.isArray(filteredUsers) || filteredUsers.length === 0) {
      dispatch(showError('No users to export'));
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Registration Date', 'Last Login', 'Total Bids', 'Total Purchases', 'Total Sales', 'Account Value'],
      ...filteredUsers.map(user => [
        user.name || '',
        user.email || '',
        user.role || '',
        user.status || '',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        user.lastLogin || '',
        user.totalBids || 0,
        user.totalPurchases || 0,
        user.totalSales || 0,
        user.balance || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = Array.isArray(filteredUsers) ? filteredUsers.slice(indexOfFirstUser, indexOfLastUser) : [];
  const totalPages = Array.isArray(filteredUsers) ? Math.ceil(filteredUsers.length / usersPerPage) : 0;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HiOutlineUsers className="text-green text-2xl" />
          <Title level={3} className="text-gray-800">User Management</Title>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            <HiOutlineDownload size={16} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setModalMode('create');
              setShowUserModal(true);
            }}
            className="bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{Array.isArray(users) ? users.length : 0}</Title>
              <Body className="text-gray-600">Total Users</Body>
            </div>
            <HiOutlineUsers className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{Array.isArray(users) ? users.filter(u => (u.status || 'active') === 'active').length : 0}</Title>
              <Body className="text-gray-600">Active Users</Body>
            </div>
            <MdCheckCircle className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-orange-500">{Array.isArray(users) ? users.filter(u => u.status === 'suspended').length : 0}</Title>
              <Body className="text-gray-600">Suspended</Body>
            </div>
            <MdBlock className="text-orange-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{Array.isArray(users) ? users.filter(u => u.createdAt && new Date(u.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length : 0}</Title>
              <Body className="text-gray-600">New This Month</Body>
            </div>
            <HiOutlineUsers className="text-green text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="updatedAt-desc">Last Updated</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green text-white px-3 py-1 rounded text-sm hover:bg-primary transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(currentUsers.map(u => u._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-green focus:ring-green"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        }
                      }}
                      className="rounded border-gray-300 text-green focus:ring-green"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green text-white flex items-center justify-center font-medium">
                          {user.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (user.status || 'active') === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>Balance: ${user.balance || 0}</div>
                    <div>Commission: ${user.commissionBalance || 0}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction('view', user._id)}
                        className="text-green hover:text-primary"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction('edit', user._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit User"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleUserAction('suspend', user._id)}
                        className={`${user.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green hover:text-primary'}`}
                        title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                      >
                        {user.status === 'active' ? <MdBlock size={16} /> : <MdCheckCircle size={16} />}
                      </button>
                      <button
                        onClick={() => handleUserAction('delete', user._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastUser, Array.isArray(filteredUsers) ? filteredUsers.length : 0)}</span> of{' '}
                    <span className="font-medium">{Array.isArray(filteredUsers) ? filteredUsers.length : 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-green border-green text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setShowUserModal(false)}
          onSave={async (userData) => {
            try {
              if (modalMode === 'create') {
                // For now, just show a message that create functionality needs backend implementation
                dispatch(showError('User creation functionality needs to be implemented on the backend'));
              } else if (modalMode === 'edit') {
                auditLogger.logAction(AuditLogger.ACTIONS.USER_EDIT, {
                  targetUserId: userData._id,
                  targetUserName: userData.name,
                  targetUserEmail: userData.email,
                  changes: userData
                });

                await adminUserApi.updateUser(userData._id, userData);
                dispatch(showSuccess('User updated successfully'));
                fetchUsers(); // Refresh the list
              }
              setShowUserModal(false);
            } catch (error) {
              dispatch(showError(error));
            }
          }}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    user || {
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      phone: '',
      address: ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">
            {mode === 'view' ? 'User Details' : mode === 'edit' ? 'Edit User' : 'Create User'}
          </Title>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <p className="text-gray-900">{new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="text-gray-900">{user?.address || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <Title level={2} className="text-green">${user?.balance || 0}</Title>
                <Body className="text-gray-600">Account Balance</Body>
              </div>
              <div className="text-center">
                <Title level={2} className="text-green">${user?.commissionBalance || 0}</Title>
                <Body className="text-gray-600">Commission Balance</Body>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green text-white rounded-lg hover:bg-primary transition-colors"
              >
                {mode === 'edit' ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
