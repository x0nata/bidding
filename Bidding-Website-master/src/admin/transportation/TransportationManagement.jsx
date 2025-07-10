import React, { useState, useEffect } from "react";
import { Title } from "../../router";
import { TiEyeOutline } from "react-icons/ti";
import { FaTruck, FaSearch, FaFilter } from "react-icons/fa";
import { MdLocationOn, MdDateRange } from "react-icons/md";
import { TransportationDetailModal } from "./TransportationDetailModal";

export const TransportationManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({});
  
  // Filter and search states
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    assignedTo: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch transportation items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Check if we have a valid token
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/product/admin/transportation?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch transportation items (${response.status})`);
      }

      const data = await response.json();
      setItems(data.data || []);
      setPagination(data.pagination || {});
      console.log('Transportation items loaded successfully:', data.data?.length || 0, 'items');
    } catch (err) {
      console.error('Error fetching transportation items:', err);
      setError(err.message);
      setItems([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch transportation statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');

      // Check if we have a valid token
      if (!token) {
        console.warn('No authentication token found for transportation stats');
        return;
      }

      const response = await fetch('/api/product/admin/transportation/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
        console.log('Transportation stats loaded successfully:', data.data);
      } else if (response.status === 404) {
        console.warn('Transportation stats endpoint not found, using default stats');
        // Set default stats if endpoint doesn't exist
        setStats({
          statusBreakdown: {
            'Ready for Pickup': 0,
            'In Transit': 0,
            'Delivered': 0,
            'Not Required': 0
          },
          totalSoldItems: 0,
          totalRequiringTransportation: 0
        });
      } else if (response.status === 401 || response.status === 403) {
        console.error('Authentication failed for transportation stats');
        // Don't clear auth state here, just log the error
      } else {
        console.error('Failed to fetch transportation stats:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Set default stats on error to prevent UI issues
      setStats({
        statusBreakdown: {
          'Ready for Pickup': 0,
          'In Transit': 0,
          'Delivered': 0,
          'Not Required': 0
        },
        totalSoldItems: 0,
        totalRequiringTransportation: 0
      });
    }
  };

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleStatusUpdate = async (itemId, updateData) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No authentication token found for status update');
        return false;
      }

      const response = await fetch(`/api/product/admin/transportation/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.status === 401 || response.status === 403) {
        console.error('Authentication failed for status update');
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update transportation status (${response.status})`);
      }

      console.log('Transportation status updated successfully for item:', itemId);

      // Refresh the items list
      await fetchItems();
      await fetchStats();

      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      return false;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready for Pickup':
        return 'bg-yellow-500';
      case 'In Transit':
        return 'bg-blue-500';
      case 'Delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <section className="shadow-s1 p-8 rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transportation data...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shadow-s1 p-8 rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.38 0 2.5-1.12 2.5-2.5 0-.394-.094-.77-.26-1.106L13.64 6.394a2.5 2.5 0 00-4.28 0L3.86 15.394c-.166.336-.26.712-.26 1.106 0 1.38 1.12 2.5 2.5 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Transportation Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchItems();
                fetchStats();
              }}
              className="bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="shadow-s1 p-8 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <Title level={5} className="font-normal">
            Transportation Management
          </Title>
          <div className="flex items-center gap-4">
            <FaTruck className="text-green" size={24} />
            <span className="text-sm text-gray-600">
              {stats.totalRequiringTransportation || 0} items requiring transportation
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats.statusBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{status}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>

            {/* Assigned To Filter */}
            <input
              type="text"
              placeholder="Assigned to..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            />

            {/* Date From */}
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            {/* Date To */}
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
        </div>

        <hr className="my-5" />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Transportation Items Table */}
        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-5">Item</th>
                <th scope="col" className="px-6 py-3">Buyer</th>
                <th scope="col" className="px-6 py-3">Seller</th>
                <th scope="col" className="px-6 py-3">Final Price</th>
                <th scope="col" className="px-6 py-3">Sale Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Assigned To</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No transportation items found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          className="w-12 h-12 rounded-lg object-cover" 
                          src={item.image?.filePath || '/placeholder-image.jpg'} 
                          alt={item.title}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.title?.slice(0, 30)}...</p>
                          <p className="text-xs text-gray-500">ID: {item._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{item.buyer?.name}</p>
                        <p className="text-xs text-gray-500">{item.buyer?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{item.seller?.name}</p>
                        <p className="text-xs text-gray-500">{item.seller?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(item.finalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(item.settlementDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(item.transportationStatus)} me-2`}></div>
                        <span className="text-xs">{item.transportationStatus || 'Ready for Pickup'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs">{item.transportationAssignedTo || 'Unassigned'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="font-medium text-indigo-500 hover:text-indigo-700"
                      >
                        <TiEyeOutline size={25} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)} of {pagination.totalItems} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm bg-green text-white rounded-lg">
                {pagination.currentPage}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Transportation Detail Modal */}
      {showModal && selectedItem && (
        <TransportationDetailModal
          item={selectedItem}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={fetchItems}
        />
      )}
    </>
  );
};
