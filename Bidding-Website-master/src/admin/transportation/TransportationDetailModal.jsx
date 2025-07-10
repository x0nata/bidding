import React, { useState } from "react";
import { MdClose, MdLocationOn, MdPhone, MdEmail, MdDateRange } from "react-icons/md";
import { FaTruck, FaUser, FaClipboardList } from "react-icons/fa";

export const TransportationDetailModal = ({ item, onClose, onStatusUpdate, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: item.transportationStatus || 'Ready for Pickup',
    notes: item.transportationNotes || '',
    assignedTo: item.transportationAssignedTo || '',
    pickupAddress: item.pickupAddress || item.seller?.address || '',
    deliveryAddress: item.deliveryAddress || item.buyer?.address || ''
  });

  const statusOptions = [
    'Ready for Pickup',
    'In Transit', 
    'Delivered'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await onStatusUpdate(item._id, formData);
      if (success) {
        onRefresh();
        onClose();
      } else {
        alert('Failed to update transportation status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update transportation status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready for Pickup':
        return 'text-yellow-600 bg-yellow-100';
      case 'In Transit':
        return 'text-blue-600 bg-blue-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transportation Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Item Details */}
            <div className="space-y-6">
              {/* Item Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaClipboardList className="mr-2 text-green" />
                  Item Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <img 
                      className="w-20 h-20 rounded-lg object-cover" 
                      src={item.image?.filePath || '/placeholder-image.jpg'} 
                      alt={item.title}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description?.slice(0, 100)}...</p>
                      <p className="text-lg font-semibold text-green mt-2">{formatCurrency(item.finalPrice)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Item ID:</span>
                      <p className="font-medium">{item._id.slice(-8)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Sale Date:</span>
                      <p className="font-medium">{formatDate(item.settlementDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Buyer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-gray-400" size={16} />
                    <span className="font-medium">{item.buyer?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MdEmail className="mr-2 text-gray-400" size={16} />
                    <span>{item.buyer?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MdPhone className="mr-2 text-gray-400" size={16} />
                    <span>{item.buyer?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <MdLocationOn className="mr-2 text-gray-400 mt-1" size={16} />
                    <span>{item.buyer?.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-green-600" />
                  Seller Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FaUser className="mr-2 text-gray-400" size={16} />
                    <span className="font-medium">{item.seller?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MdEmail className="mr-2 text-gray-400" size={16} />
                    <span>{item.seller?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MdPhone className="mr-2 text-gray-400" size={16} />
                    <span>{item.seller?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <MdLocationOn className="mr-2 text-gray-400 mt-1" size={16} />
                    <span>{item.seller?.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Transportation Management */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaTruck className="mr-2 text-green" />
                  Current Transportation Status
                </h3>
                <div className="space-y-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.transportationStatus)}`}>
                    {item.transportationStatus || 'Ready for Pickup'}
                  </div>
                  {item.transportationAssignedTo && (
                    <p className="text-sm">
                      <span className="text-gray-600">Assigned to:</span> {item.transportationAssignedTo}
                    </p>
                  )}
                  {item.transportationStartDate && (
                    <p className="text-sm">
                      <span className="text-gray-600">Started:</span> {formatDate(item.transportationStartDate)}
                    </p>
                  )}
                  {item.transportationCompletedDate && (
                    <p className="text-sm">
                      <span className="text-gray-600">Completed:</span> {formatDate(item.transportationCompletedDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* Status History */}
              {item.transportationStatusHistory && item.transportationStatusHistory.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
                  <div className="space-y-3">
                    {item.transportationStatusHistory.map((history, index) => (
                      <div key={index} className="border-l-2 border-green pl-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.status)}`}>
                            {history.status}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(history.timestamp)}</span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Transportation Form */}
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Transportation</h3>
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportation Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={formData.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                      placeholder="Enter delivery personnel name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
                    />
                  </div>

                  {/* Pickup Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Address
                    </label>
                    <textarea
                      value={formData.pickupAddress}
                      onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                      placeholder="Enter pickup address"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      placeholder="Enter delivery address"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportation Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Add any transportation notes or special instructions..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Updating...' : 'Update Transportation'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
