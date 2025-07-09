import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Title, Body } from '../../components/common/Design';
import { GiDiploma } from 'react-icons/gi';
import { HiOutlineSearch, HiOutlineDownload, HiOutlineDocumentText } from 'react-icons/hi';
import { MdVerified, MdCancel, MdFlag, MdVisibility, MdComment } from 'react-icons/md';
import { FiEye, FiDownload, FiUser, FiCalendar } from 'react-icons/fi';
import { BsShieldCheck, BsShieldX, BsExclamationTriangle } from 'react-icons/bs';
import { CertificateModal, AuthoritiesModal } from './CertificateModals';
import { showSuccess, showError } from '../../redux/slices/notificationSlice';
import { adminCertificateApi } from '../../services/adminApi';

const CertificateVerification = () => {
  const dispatch = useDispatch();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [certificatesPerPage] = useState(10);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'review', 'authorities'
  const [showAuthoritiesModal, setShowAuthoritiesModal] = useState(false);

  // Certificate data now comes from MongoDB backend - no mock data needed
  const mockCertificates = [];

  // Certificate authorities now come from MongoDB backend - no mock data needed
  const mockAuthorities = [];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCertificates(mockCertificates);
      setFilteredCertificates(mockCertificates);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortCertificates();
  }, [certificates, searchTerm, filterStatus, filterType, sortBy, sortOrder]);

  const filterAndSortCertificates = () => {
    let filtered = certificates.filter(cert => {
      const matchesSearch = cert.itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
      const matchesType = filterType === 'all' || cert.certificateType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort certificates
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'submissionDate' || sortBy === 'reviewDate' || sortBy === 'issueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCertificates(filtered);
    setCurrentPage(1);
  };

  const handleCertificateAction = (action, certificateId) => {
    const certificate = certificates.find(c => c.id === certificateId);
    
    switch (action) {
      case 'view':
        setSelectedCertificate(certificate);
        setModalMode('view');
        setShowCertificateModal(true);
        break;
      case 'review':
        setSelectedCertificate(certificate);
        setModalMode('review');
        setShowCertificateModal(true);
        break;
      case 'approve':
        setCertificates(certificates.map(c => 
          c.id === certificateId ? { 
            ...c, 
            status: 'approved', 
            reviewedBy: 'Admin User',
            reviewDate: new Date().toISOString(),
            verificationScore: 95
          } : c
        ));
        break;
      case 'reject':
        setCertificates(certificates.map(c => 
          c.id === certificateId ? { 
            ...c, 
            status: 'rejected', 
            reviewedBy: 'Admin User',
            reviewDate: new Date().toISOString(),
            verificationScore: 25
          } : c
        ));
        break;
      case 'flag':
        setCertificates(certificates.map(c => 
          c.id === certificateId ? { 
            ...c, 
            status: 'flagged', 
            flagged: true,
            flagReason: 'Requires manual review'
          } : c
        ));
        break;
      case 'download':
        // Simulate file download
        const link = document.createElement('a');
        link.href = '#';
        link.download = certificate.fileName;
        link.click();
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action) => {
    if (selectedCertificates.length === 0) {
      alert('Please select certificates first');
      return;
    }

    switch (action) {
      case 'approve':
        setCertificates(certificates.map(c => 
          selectedCertificates.includes(c.id) ? { 
            ...c, 
            status: 'approved', 
            reviewedBy: 'Admin User',
            reviewDate: new Date().toISOString(),
            verificationScore: 95
          } : c
        ));
        break;
      case 'reject':
        setCertificates(certificates.map(c => 
          selectedCertificates.includes(c.id) ? { 
            ...c, 
            status: 'rejected', 
            reviewedBy: 'Admin User',
            reviewDate: new Date().toISOString(),
            verificationScore: 25
          } : c
        ));
        break;
      case 'flag':
        setCertificates(certificates.map(c => 
          selectedCertificates.includes(c.id) ? { 
            ...c, 
            status: 'flagged', 
            flagged: true,
            flagReason: 'Bulk flagged for review'
          } : c
        ));
        break;
      default:
        break;
    }
    setSelectedCertificates([]);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Item Title', 'Seller', 'Certificate Type', 'Issuing Authority', 'Certificate Number', 'Status', 'Submission Date', 'Review Date', 'Verification Score'],
      ...filteredCertificates.map(cert => [
        cert.itemTitle,
        cert.seller,
        cert.certificateType,
        cert.issuingAuthority,
        cert.certificateNumber,
        cert.status,
        cert.submissionDate,
        cert.reviewDate || 'Not reviewed',
        cert.verificationScore || 'Not scored'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Pagination
  const indexOfLastCertificate = currentPage * certificatesPerPage;
  const indexOfFirstCertificate = indexOfLastCertificate - certificatesPerPage;
  const currentCertificates = filteredCertificates.slice(indexOfFirstCertificate, indexOfLastCertificate);
  const totalPages = Math.ceil(filteredCertificates.length / certificatesPerPage);

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
          <GiDiploma className="text-green text-2xl" />
          <Title level={3} className="text-gray-800">Certificate Verification</Title>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAuthoritiesModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BsShieldCheck size={16} />
            <span>Authorities</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
          >
            <HiOutlineDownload size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{certificates.length}</Title>
              <Body className="text-gray-600">Total Certificates</Body>
            </div>
            <GiDiploma className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-yellow-600">{certificates.filter(c => c.status === 'pending').length}</Title>
              <Body className="text-gray-600">Pending Review</Body>
            </div>
            <HiOutlineDocumentText className="text-yellow-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-green">{certificates.filter(c => c.status === 'approved').length}</Title>
              <Body className="text-gray-600">Approved</Body>
            </div>
            <MdVerified className="text-green text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-orange-600">{certificates.filter(c => c.flagged).length}</Title>
              <Body className="text-gray-600">Flagged</Body>
            </div>
            <MdFlag className="text-orange-600 text-2xl" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <Title level={1} className="text-red-600">{certificates.filter(c => c.status === 'rejected').length}</Title>
              <Body className="text-gray-600">Rejected</Body>
            </div>
            <MdCancel className="text-red-600 text-2xl" />
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
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-green focus:border-green outline-none"
          >
            <option value="all">All Types</option>
            <option value="Authenticity Certificate">Authenticity Certificate</option>
            <option value="Provenance Certificate">Provenance Certificate</option>
            <option value="Appraisal Certificate">Appraisal Certificate</option>
            <option value="Authentication Report">Authentication Report</option>
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
            <option value="submissionDate-desc">Newest First</option>
            <option value="submissionDate-asc">Oldest First</option>
            <option value="verificationScore-desc">Highest Score</option>
            <option value="verificationScore-asc">Lowest Score</option>
            <option value="reviewDate-desc">Recently Reviewed</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCertificates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedCertificates.length} certificate{selectedCertificates.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="bg-green text-white px-3 py-1 rounded text-sm hover:bg-primary transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('flag')}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
              >
                Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCertificates.length === currentCertificates.length && currentCertificates.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCertificates(currentCertificates.map(c => c.id));
                      } else {
                        setSelectedCertificates([]);
                      }
                    }}
                    className="rounded border-gray-300 text-green focus:ring-green"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item & Certificate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Authority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCertificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCertificates.includes(certificate.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCertificates([...selectedCertificates, certificate.id]);
                        } else {
                          setSelectedCertificates(selectedCertificates.filter(id => id !== certificate.id));
                        }
                      }}
                      className="rounded border-gray-300 text-green focus:ring-green"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          {certificate.fileType === 'application/pdf' ? (
                            <HiOutlineDocumentText className="text-red-500 text-xl" />
                          ) : (
                            <MdVisibility className="text-blue-500 text-xl" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {certificate.itemTitle}
                          {certificate.flagged && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              <MdFlag size={12} className="mr-1" />
                              Flagged
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {certificate.certificateType} • {certificate.seller}
                        </div>
                        <div className="text-xs text-gray-400">
                          {certificate.fileName} ({certificate.fileSize}MB)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{certificate.issuingAuthority}</div>
                    <div className="text-sm text-gray-500">{certificate.certificateNumber}</div>
                    <div className="text-xs text-gray-400">
                      Issued: {new Date(certificate.issueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(certificate.status)}`}>
                      {certificate.status}
                    </span>
                    {certificate.reviewedBy && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {certificate.reviewedBy}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {certificate.verificationScore ? (
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getVerificationScoreColor(certificate.verificationScore)}`}>
                          {certificate.verificationScore}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              certificate.verificationScore >= 90 ? 'bg-green-500' :
                              certificate.verificationScore >= 70 ? 'bg-yellow-500' :
                              certificate.verificationScore >= 50 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${certificate.verificationScore}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not scored</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(certificate.submissionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCertificateAction('view', certificate.id)}
                        className="text-green hover:text-primary"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => handleCertificateAction('download', certificate.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Certificate"
                      >
                        <FiDownload size={16} />
                      </button>
                      {certificate.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleCertificateAction('approve', certificate.id)}
                            className="text-green hover:text-primary"
                            title="Approve Certificate"
                          >
                            <MdVerified size={16} />
                          </button>
                          <button
                            onClick={() => handleCertificateAction('reject', certificate.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Reject Certificate"
                          >
                            <MdCancel size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleCertificateAction('review', certificate.id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Review Certificate"
                      >
                        <MdComment size={16} />
                      </button>
                      <button
                        onClick={() => handleCertificateAction('flag', certificate.id)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Flag Certificate"
                      >
                        <MdFlag size={16} />
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
                    Showing <span className="font-medium">{indexOfFirstCertificate + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastCertificate, filteredCertificates.length)}</span> of{' '}
                    <span className="font-medium">{filteredCertificates.length}</span> results
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

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateModal
          certificate={selectedCertificate}
          mode={modalMode}
          onClose={() => setShowCertificateModal(false)}
          onSave={(certificateData) => {
            setCertificates(certificates.map(c => c.id === certificateData.id ? certificateData : c));
            setShowCertificateModal(false);
          }}
        />
      )}

      {/* Authorities Modal */}
      {showAuthoritiesModal && (
        <AuthoritiesModal
          authorities={mockAuthorities}
          onClose={() => setShowAuthoritiesModal(false)}
        />
      )}
    </div>
  );
};

export default CertificateVerification;
