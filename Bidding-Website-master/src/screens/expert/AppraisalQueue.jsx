import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../../components/common/Design';
import { showError, showSuccess } from '../../redux/slices/notificationSlice';
import { GiMagnifyingGlass, GiDiploma } from 'react-icons/gi';
import { FiClock, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { MdVerified, MdPending, MdAssignment } from 'react-icons/md';
import { BsCheckCircle, BsXCircle } from 'react-icons/bs';

const AppraisalQueue = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [appraisalRequests, setAppraisalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, in-progress, completed
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [appraisalForm, setAppraisalForm] = useState({
    estimatedValue: '',
    condition: '',
    authenticity: '',
    description: '',
    notes: ''
  });

  // Load real appraisal data from API instead of mock data
  useEffect(() => {
    const fetchAppraisalRequests = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to fetch appraisal requests
        // const response = await api.get('/appraisals/queue');
        // setAppraisalRequests(response.data);

        // For now, show empty state until API is implemented
        setAppraisalRequests([]);
      } catch (error) {
        setAppraisalRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisalRequests();
  }, []);

  const getFilteredRequests = () => {
    return appraisalRequests.filter(request => {
      if (filter === 'all') return true;
      return request.status === filter;
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 flex items-center gap-1">
            <MdPending size={14} />
            Pending Review
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 flex items-center gap-1">
            <FiClock size={14} />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 flex items-center gap-1">
            <BsCheckCircle size={14} />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const handleStartAppraisal = (request) => {
    setSelectedRequest(request);
    setAppraisalForm({
      estimatedValue: request.estimatedValue || '',
      condition: '',
      authenticity: '',
      description: request.expertNotes || '',
      notes: ''
    });
  };

  const handleSubmitAppraisal = () => {
    // In real app, this would submit to API
    dispatch(showSuccess('Appraisal submitted successfully'));
    setSelectedRequest(null);
    setAppraisalForm({
      estimatedValue: '',
      condition: '',
      authenticity: '',
      description: '',
      notes: ''
    });
  };

  const filteredRequests = getFilteredRequests();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Body>Loading appraisal queue...</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="mb-2 flex items-center gap-3">
          <GiMagnifyingGlass className="text-primary" />
          Appraisal Queue
        </Title>
        <Body className="text-gray-600">
          Review and appraise submitted antique items from sellers and buyers.
        </Body>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-orange-800">
                {appraisalRequests.filter(r => r.status === 'pending').length}
              </Title>
              <Caption className="text-orange-600">Pending Requests</Caption>
            </div>
            <MdPending size={40} className="text-orange-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-blue-800">
                {appraisalRequests.filter(r => r.status === 'in-progress').length}
              </Title>
              <Caption className="text-blue-600">In Progress</Caption>
            </div>
            <FiClock size={40} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green-800">
                {appraisalRequests.filter(r => r.status === 'completed').length}
              </Title>
              <Caption className="text-green-600">Completed</Caption>
            </div>
            <BsCheckCircle size={40} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <Caption className="font-medium">Filter by status:</Caption>
          <div className="flex gap-2">
            {[
              { key: 'pending', label: 'Pending' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'all', label: 'All' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filter === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appraisal Requests */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <GiMagnifyingGlass size={64} className="mx-auto mb-4 text-gray-300" />
            <Title level={4} className="mb-2">No appraisal requests found</Title>
            <Body className="text-gray-600">
              {filter === 'all' 
                ? "No appraisal requests available at the moment."
                : `No ${filter} appraisal requests found.`
              }
            </Body>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-6">
                  {/* Product Image */}
                  <div className="relative">
                    <img
                      src={request.product.images[0] || '/images/placeholder.jpg'}
                      alt={request.product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    {getPriorityBadge(request.priority)}
                  </div>

                  {/* Request Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <Title level={5} className="font-medium">
                        {request.product.title}
                      </Title>
                      {getStatusBadge(request.status)}
                    </div>

                    <Body className="text-gray-600 mb-3 line-clamp-2">
                      {request.product.description}
                    </Body>

                    {/* Request Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-blue-500" />
                        <div>
                          <Caption className="text-gray-500">Submitted by</Caption>
                          <div className="font-medium">{request.product.submittedBy.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-orange-500" />
                        <div>
                          <Caption className="text-gray-500">Submitted</Caption>
                          <div className="font-medium">
                            {request.submittedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MdAssignment className="text-purple-500" />
                        <div>
                          <Caption className="text-gray-500">Category</Caption>
                          <div className="font-medium">{request.product.category}</div>
                        </div>
                      </div>

                      {request.estimatedValue && (
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="text-green-500" />
                          <div>
                            <Caption className="text-gray-500">Estimated Value</Caption>
                            <div className="font-medium">${request.estimatedValue}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Required Expertise */}
                    <div className="mb-3">
                      <Caption className="text-gray-500 mb-2">Required Expertise:</Caption>
                      <div className="flex gap-2">
                        {request.requiredExpertise.map((expertise, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {expertise}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Expert Notes */}
                    {request.expertNotes && (
                      <div className="mb-3">
                        <Caption className="text-gray-500">Expert Notes:</Caption>
                        <Body className="text-sm text-gray-700">{request.expertNotes}</Body>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartAppraisal(request)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm flex items-center gap-2"
                      >
                        <GiMagnifyingGlass size={16} />
                        {request.status === 'pending' ? 'Start Appraisal' : 'Continue Appraisal'}
                      </button>

                      <NavLink
                        to={`/expert/appraisal/${request._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        View Details
                      </NavLink>

                      {request.status === 'completed' && (
                        <NavLink
                          to={`/expert/appraisal/${request._id}/certificate`}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
                        >
                          <GiDiploma size={16} />
                          View Certificate
                        </NavLink>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appraisal Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Title level={4}>Appraise: {selectedRequest.product.title}</Title>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <BsXCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value ($)
                  </label>
                  <input
                    type="number"
                    value={appraisalForm.estimatedValue}
                    onChange={(e) => setAppraisalForm({...appraisalForm, estimatedValue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Enter estimated value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Assessment
                  </label>
                  <select
                    value={appraisalForm.condition}
                    onChange={(e) => setAppraisalForm({...appraisalForm, condition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="very-good">Very Good</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authenticity
                  </label>
                  <select
                    value={appraisalForm.authenticity}
                    onChange={(e) => setAppraisalForm({...appraisalForm, authenticity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select authenticity</option>
                    <option value="authentic">Authentic</option>
                    <option value="likely-authentic">Likely Authentic</option>
                    <option value="uncertain">Uncertain</option>
                    <option value="likely-reproduction">Likely Reproduction</option>
                    <option value="reproduction">Reproduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={appraisalForm.description}
                    onChange={(e) => setAppraisalForm({...appraisalForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Provide detailed appraisal description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={appraisalForm.notes}
                    onChange={(e) => setAppraisalForm({...appraisalForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Any additional notes or recommendations..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAppraisal}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Submit Appraisal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppraisalQueue;
