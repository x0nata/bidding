import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Title, Body } from "../../components/common/Design";
import { FaTruck, FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdLocationOn, MdEdit, MdCheckCircle, MdRefresh } from "react-icons/md";
import { HiOutlineDownload, HiOutlineSearch } from "react-icons/hi";
import { TransportationDetailModal } from "./TransportationDetailModal";
import { adminTransportationApi } from "../../services/adminApi";
import { showSuccess, showError } from "../../redux/slices/notificationSlice";

const TransportationManagement = () => {
  const dispatch = useDispatch();
  
  // Core state - following UserManagement pattern
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Fetch transportation items - following UserManagement pattern exactly
  const fetchItems = async () => {
    try {
      setLoading(true);
      const itemsData = await adminTransportationApi.getItems();
      // Ensure itemsData is an array
      const itemsArray = Array.isArray(itemsData?.data) ? itemsData.data : [];
      setItems(itemsArray);
      setFilteredItems(itemsArray);
    } catch (error) {
      console.error('Error fetching transportation items:', error);
      dispatch(showError(error));
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch - following UserManagement pattern exactly
  useEffect(() => {
    fetchItems();
  }, []);

  // Filter and search logic - following UserManagement pattern exactly
  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter]);

  // Filter function - following UserManagement pattern exactly
  const filterItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        (item.transportationStatus || 'Ready for Pickup') === statusFilter
      );
    }

    setFilteredItems(filtered);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Event handlers
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleStatusUpdate = async (itemId, updateData) => {
    try {
      await adminTransportationApi.updateStatus(itemId, updateData);
      dispatch(showSuccess('Transportation status updated successfully'));
      fetchItems(); // Refresh the list - following UserManagement pattern
      return true;
    } catch (error) {
      console.error('Failed to update transportation status:', error);
      dispatch(showError(error));
      return false;
    }
  };

  const handleQuickStatusUpdate = async (itemId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        notes: `Status updated to ${newStatus} via quick action`,
        assignedTo: '',
        pickupAddress: '',
        deliveryAddress: ''
      };

      await adminTransportationApi.updateStatus(itemId, updateData);
      dispatch(showSuccess(`Status updated to ${newStatus}`));
      fetchItems(); // Refresh the list - following UserManagement pattern
    } catch (error) {
      console.error('Failed to update status:', error);
      dispatch(showError(error));
    }
  };

  const handleMarkAsDelivered = async (itemId) => {
    if (window.confirm('Mark this item as delivered? This action cannot be undone.')) {
      await handleQuickStatusUpdate(itemId, 'Delivered');
    }
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready for Pickup':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'In Transit':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Delivered':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Loading state - following admin panel pattern
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green"></div>
        <span className="ml-3 text-gray-600">Loading transportation data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - following admin panel pattern */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaTruck className="text-green text-2xl" />
          <Title level={3} className="text-gray-800">Transportation Management</Title>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchItems}
            className="flex items-center space-x-2 bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            <MdRefresh size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - following admin panel pattern */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{items.length}</Title>
              <Body className="text-gray-600">Total Items</Body>
            </div>
            <FaTruck className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-yellow-600">{items.filter(item => (item.transportationStatus || 'Ready for Pickup') === 'Ready for Pickup').length}</Title>
              <Body className="text-gray-600">Ready for Pickup</Body>
            </div>
            <MdLocationOn className="text-yellow-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-blue-600">{items.filter(item => item.transportationStatus === 'In Transit').length}</Title>
              <Body className="text-gray-600">In Transit</Body>
            </div>
            <FaTruck className="text-blue-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{items.filter(item => item.transportationStatus === 'Delivered').length}</Title>
              <Body className="text-gray-600">Delivered</Body>
            </div>
            <MdCheckCircle className="text-green text-2xl" />
          </div>
        </div>
      </div>

      {/* Search and Filters - following admin panel pattern */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items, buyers, sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>

          {/* Items per page */}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <span>Showing {filteredItems.length} of {items.length} items</span>
          </div>
        </div>
      </div>

      {/* Transportation Items - following admin panel pattern */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {paginatedItems.length === 0 ? (
          <div className="p-12 text-center">
            <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <Title level={4} className="text-gray-900 mb-2">No Transportation Items</Title>
            <Body className="text-gray-600">
              {items.length === 0
                ? "No items require transportation at this time. Items will appear here when auction items are won and need delivery."
                : "No items match your current search and filter criteria."
              }
            </Body>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-3">Item Details</div>
                <div className="col-span-2">Buyer</div>
                <div className="col-span-2">Seller</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <div key={item._id} className="hover:bg-gray-50 transition-colors">
                  {/* Main Row */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Item Details */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <img
                            className="w-12 h-12 rounded-lg object-cover"
                            src={item.image?.filePath || '/placeholder-image.jpg'}
                            alt={item.title}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                          <div>
                            <Title level={5} className="text-gray-900 font-medium">{item.title}</Title>
                            <Body className="text-gray-600 text-sm">ID: {item._id.slice(-8)}</Body>
                          </div>
                        </div>
                      </div>

                      {/* Buyer */}
                      <div className="col-span-2">
                        <Body className="text-gray-900 font-medium">{item.buyer?.name || 'N/A'}</Body>
                        <Body className="text-gray-600 text-sm">{item.buyer?.email || 'N/A'}</Body>
                      </div>

                      {/* Seller */}
                      <div className="col-span-2">
                        <Body className="text-gray-900 font-medium">{item.seller?.name || 'N/A'}</Body>
                        <Body className="text-gray-600 text-sm">{item.seller?.email || 'N/A'}</Body>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.transportationStatus || 'Ready for Pickup')}`}>
                          {item.transportationStatus || 'Ready for Pickup'}
                        </span>
                        <Body className="text-gray-600 text-sm mt-1">{formatDate(item.settlementDate)}</Body>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2">
                        <Title level={5} className="text-gray-900 font-bold">{formatCurrency(item.finalPrice)}</Title>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-2 text-gray-400 hover:text-green transition-colors"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>

                          <button
                            onClick={() => toggleItemExpansion(item._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {expandedItems.has(item._id) ? (
                              <FaChevronUp size={16} />
                            ) : (
                              <FaChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItems.has(item._id) && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Buyer Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Title level={5} className="text-gray-900 mb-3 flex items-center">
                            <MdLocationOn className="mr-2 text-green" />
                            Buyer Information
                          </Title>
                          <div className="space-y-2">
                            <Body><span className="font-medium">Name:</span> {item.buyer?.name || 'N/A'}</Body>
                            <Body><span className="font-medium">Email:</span> {item.buyer?.email || 'N/A'}</Body>
                            <Body><span className="font-medium">Phone:</span> {item.buyer?.phone || 'N/A'}</Body>
                            <Body><span className="font-medium">Delivery Address:</span> {item.buyer?.address || 'N/A'}</Body>
                          </div>
                        </div>

                        {/* Seller Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Title level={5} className="text-gray-900 mb-3 flex items-center">
                            <MdLocationOn className="mr-2 text-blue-500" />
                            Seller Information
                          </Title>
                          <div className="space-y-2">
                            <Body><span className="font-medium">Name:</span> {item.seller?.name || 'N/A'}</Body>
                            <Body><span className="font-medium">Email:</span> {item.seller?.email || 'N/A'}</Body>
                            <Body><span className="font-medium">Phone:</span> {item.seller?.phone || 'N/A'}</Body>
                            <Body><span className="font-medium">Pickup Address:</span> {item.seller?.address || 'N/A'}</Body>
                          </div>
                        </div>

                        {/* Transportation Management */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <Title level={5} className="text-gray-900 mb-3 flex items-center">
                            <FaTruck className="mr-2 text-green" />
                            Transportation Management
                          </Title>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                value={item.transportationStatus || 'Ready for Pickup'}
                                onChange={(e) => handleQuickStatusUpdate(item._id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                              >
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                            <Body><span className="font-medium">Assigned To:</span> {item.transportationAssignedTo || 'Unassigned'}</Body>
                            <Body><span className="font-medium">Notes:</span> {item.transportationNotes || 'No notes'}</Body>

                            <div className="flex space-x-2 mt-4">
                              <button
                                onClick={() => handleViewDetails(item)}
                                className="flex-1 bg-green text-white px-3 py-2 rounded-lg hover:bg-primary transition-colors flex items-center justify-center text-sm"
                              >
                                <FaEye className="mr-1" size={14} />
                                Details
                              </button>
                              {(item.transportationStatus || 'Ready for Pickup') !== 'Delivered' && (
                                <button
                                  onClick={() => handleMarkAsDelivered(item._id)}
                                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                                >
                                  <MdCheckCircle className="mr-1" size={14} />
                                  Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination - following admin panel pattern */}
      {totalPages > 1 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm bg-green text-white rounded-lg">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export { TransportationManagement };
