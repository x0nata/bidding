import React, { useState } from 'react';
import { Title, Body } from '../../components/common/Design';
import { GiDiploma } from 'react-icons/gi';
import { MdVerified, MdCancel, MdFlag } from 'react-icons/md';
import { FiDownload, FiUser, FiCalendar, FiGlobe, FiMail, FiPhone } from 'react-icons/fi';
import { BsShieldCheck, BsShieldX } from 'react-icons/bs';

// Certificate Modal Component
export const CertificateModal = ({ certificate, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    status: certificate?.status || 'pending',
    reviewComments: certificate?.reviewComments || '',
    verificationScore: certificate?.verificationScore || '',
    flagReason: certificate?.flagReason || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedCertificate = {
      ...certificate,
      ...formData,
      reviewedBy: 'Admin User',
      reviewDate: new Date().toISOString()
    };
    onSave(updatedCertificate);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">
            {mode === 'view' ? 'Certificate Details' : 'Review Certificate'}
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

        <div className="space-y-6">
          {/* Certificate Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="text-gray-800 mb-4">Certificate Information</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                <p className="text-gray-900">{certificate?.itemTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                <p className="text-gray-900">{certificate?.seller}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
                <p className="text-gray-900">{certificate?.certificateType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <p className="text-gray-900">{certificate?.certificateNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                <p className="text-gray-900">{certificate?.issuingAuthority}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <p className="text-gray-900">{new Date(certificate?.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{certificate?.fileName}</p>
                  <button
                    onClick={() => {
                      // Simulate file download
                      const link = document.createElement('a');
                      link.href = '#';
                      link.download = certificate?.fileName;
                      link.click();
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Download Certificate"
                  >
                    <FiDownload size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                <p className="text-gray-900">{certificate?.fileSize} MB</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <Title level={5} className="text-gray-800 mb-4">Current Status</Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  certificate?.status === 'approved' ? 'bg-green-100 text-green-800' :
                  certificate?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  certificate?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  certificate?.status === 'flagged' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {certificate?.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verification Score</label>
                <p className="text-gray-900">
                  {certificate?.verificationScore ? `${certificate.verificationScore}%` : 'Not scored'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flagged</label>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  certificate?.flagged ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {certificate?.flagged ? <MdFlag size={12} className="mr-1" /> : <MdVerified size={12} className="mr-1" />}
                  {certificate?.flagged ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            
            {certificate?.reviewedBy && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
                    <p className="text-gray-900">{certificate.reviewedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Date</label>
                    <p className="text-gray-900">{new Date(certificate.reviewDate).toLocaleString()}</p>
                  </div>
                </div>
                {certificate.reviewComments && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Comments</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{certificate.reviewComments}</p>
                  </div>
                )}
              </div>
            )}

            {certificate?.flagged && certificate?.flagReason && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Flag Reason</label>
                <p className="text-orange-800 bg-orange-50 p-3 rounded">{certificate.flagReason}</p>
              </div>
            )}
          </div>

          {/* Review Form (only in review mode) */}
          {mode === 'review' && (
            <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <Title level={5} className="text-gray-800 mb-4">Review Certificate</Title>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="flagged">Flagged</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Score (0-100)</label>
                    <input
                      type="number"
                      name="verificationScore"
                      value={formData.verificationScore}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Comments</label>
                  <textarea
                    name="reviewComments"
                    value={formData.reviewComments}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter your review comments..."
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                  />
                </div>
                {formData.status === 'flagged' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flag Reason</label>
                    <textarea
                      name="flagReason"
                      value={formData.flagReason}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Reason for flagging this certificate..."
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
                    />
                  </div>
                )}
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
                    Save Review
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Authorities Modal Component
export const AuthoritiesModal = ({ authorities, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAuthorities, setFilteredAuthorities] = useState(authorities);

  React.useEffect(() => {
    const filtered = authorities.filter(auth =>
      auth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredAuthorities(filtered);
  }, [searchTerm, authorities]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <Title level={4} className="text-gray-800">Certificate Authorities Database</Title>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search authorities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
            />
          </div>
        </div>

        {/* Authorities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthorities.map((authority) => (
            <div key={authority.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${authority.verified ? 'bg-green-100' : 'bg-red-100'}`}>
                    {authority.verified ? (
                      <BsShieldCheck className="text-green-600 text-xl" />
                    ) : (
                      <BsShieldX className="text-red-600 text-xl" />
                    )}
                  </div>
                  <div>
                    <Title level={5} className="text-gray-800">{authority.name}</Title>
                    <Body className="text-gray-500 text-sm">({authority.abbreviation})</Body>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  authority.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {authority.verified ? 'Verified' : 'Unverified'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <FiGlobe className="text-gray-400" />
                  <a
                    href={authority.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {authority.website}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMail className="text-gray-400" />
                  <span className="text-gray-600 truncate">{authority.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="text-gray-400" />
                  <span className="text-gray-600">{authority.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-gray-600">Est. {authority.establishedYear}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1 mb-2">
                  {authority.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Trust Score:</span>
                    <span className={`ml-1 ${
                      authority.trustScore >= 95 ? 'text-green-600' :
                      authority.trustScore >= 85 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {authority.trustScore}%
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Certificates:</span>
                    <span className="ml-1">{authority.certificatesIssued.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">{authority.address}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredAuthorities.length === 0 && (
          <div className="text-center py-8">
            <GiDiploma className="mx-auto text-gray-400 text-4xl mb-2" />
            <Title level={5} className="text-gray-500">No authorities found</Title>
            <Body className="text-gray-400">Try adjusting your search criteria</Body>
          </div>
        )}
      </div>
    </div>
  );
};
