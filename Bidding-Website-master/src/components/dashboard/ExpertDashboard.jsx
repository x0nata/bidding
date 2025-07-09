import React from 'react';
import { NavLink } from 'react-router-dom';
import { Title, Body, Caption } from '../common/Design';
import { MdVerified } from 'react-icons/md';
import { GiMagnifyingGlass, GiDiploma, GiCrown } from 'react-icons/gi';
import { FiClock, FiCheckCircle, FiAward } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export const ExpertDashboard = ({ user }) => {
  // Use real data from API instead of mock data
  const expertStats = {
    pendingAppraisals: 0,
    completedAppraisals: 0,
    authenticationsRequested: 0,
    expertiseRating: 0,
    specializations: [],
    monthlyEarnings: 0
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Title level={3} className="text-primary mb-2">
              Expert Appraiser Dashboard - {user?.name} 🔍
            </Title>
            <Body className="text-gray-600">
              Manage appraisal requests, authenticate antiques, and share your expertise.
            </Body>
            <div className="flex items-center gap-2 mt-3">
              <MdVerified className="text-green-500" size={20} />
              <Caption className="text-green-600 font-medium">Certified Expert Appraiser</Caption>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="/images/dashboard/expert-welcome.png" 
              alt="Expert Dashboard" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Expert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Appraisals */}
        <div className="shadow-s3 border border-orange-200 bg-orange-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <FiClock size={60} className="text-orange-600" />
          <div>
            <Title level={1} className="text-orange-800">{expertStats.pendingAppraisals}</Title>
            <Caption className="text-orange-600">Pending Appraisals</Caption>
          </div>
        </div>

        {/* Completed Appraisals */}
        <div className="shadow-s3 border border-green-200 bg-green-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <FiCheckCircle size={60} className="text-green-600" />
          <div>
            <Title level={1} className="text-green-800">{expertStats.completedAppraisals}</Title>
            <Caption className="text-green-600">Completed</Caption>
          </div>
        </div>

        {/* Authentication Requests */}
        <div className="shadow-s3 border border-blue-200 bg-blue-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <MdVerified size={60} className="text-blue-600" />
          <div>
            <Title level={1} className="text-blue-800">{expertStats.authenticationsRequested}</Title>
            <Caption className="text-blue-600">Authentication Requests</Caption>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="shadow-s3 border border-purple-200 bg-purple-50 p-6 flex items-center text-center justify-center gap-4 flex-col rounded-xl">
          <FiAward size={60} className="text-purple-600" />
          <div>
            <Title level={1} className="text-purple-800">${expertStats.monthlyEarnings}</Title>
            <Caption className="text-purple-600">Monthly Earnings</Caption>
          </div>
        </div>
      </div>

      {/* Expert Tools */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <Title level={5} className="font-normal mb-6">
          Expert Tools
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NavLink
            to="/dashboard"
            className="bg-primary text-white p-4 rounded-lg text-center hover:bg-primary-dark transition-colors"
          >
            <GiMagnifyingGlass size={24} className="mx-auto mb-2" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/product"
            className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
          >
            <FiClock size={24} className="mx-auto mb-2" />
            <span>My Products</span>
          </NavLink>

          <NavLink
            to="/expert/expertise-profile"
            className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
          >
            <HiOutlineAcademicCap size={24} className="mx-auto mb-2" />
            <span>Expertise Profile</span>
          </NavLink>

          <NavLink
            to="/expert/reports"
            className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600 transition-colors"
          >
            <FiAward size={24} className="mx-auto mb-2" />
            <span>Reports</span>
          </NavLink>
        </div>

        {/* Onboarding Link */}
        <div className="mt-4 text-center">
          <NavLink
            to="/onboarding/expert"
            className="text-primary hover:text-primary-dark transition-colors text-sm flex items-center justify-center gap-2"
          >
            <span>🎓 Revisit Expert Guide</span>
          </NavLink>
        </div>
      </div>

      {/* Recent Appraisal Requests */}
      <div className="shadow-s1 p-8 rounded-lg mb-8">
        <div className="flex items-center justify-between mb-6">
          <Title level={5} className="font-normal">
            Recent Appraisal Requests
          </Title>
          <NavLink to="/expert/appraisals" className="text-primary hover:text-primary-dark text-sm">
            View All →
          </NavLink>
        </div>

        <div className="space-y-4">
          {/* Show empty state when no real appraisal requests */}
          <div className="text-center py-8 text-gray-500">
            <GiMagnifyingGlass size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No pending appraisal requests</p>
            <p className="text-sm mt-2">New requests will appear here when submitted</p>
          </div>


        </div>
      </div>

      {/* Expert Profile & Specializations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expertise Areas */}
        <div className="shadow-s1 p-8 rounded-lg">
          <Title level={5} className="font-normal mb-6">
            Areas of Expertise
          </Title>
          <div className="space-y-3">
            {expertStats.specializations.length > 0 ? (
              expertStats.specializations.map((specialization, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <GiCrown className="text-primary" size={20} />
                    <span className="font-medium">{specialization}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{expertStats.expertiseRating}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GiDiploma size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No specializations added yet</p>
                <p className="text-sm mt-2">Add your areas of expertise to start receiving appraisal requests</p>
              </div>
            )}
          </div>
          <NavLink 
            to="/expert/specializations" 
            className="block mt-4 text-center text-primary hover:text-primary-dark text-sm"
          >
            Manage Specializations →
          </NavLink>
        </div>

        {/* Performance Metrics */}
        <div className="shadow-s1 p-8 rounded-lg">
          <Title level={5} className="font-normal mb-6">
            Performance Metrics
          </Title>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Expert Rating</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-yellow-600">{expertStats.expertiseRating}/5.0</span>
                <span className="text-yellow-500">★★★★★</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Response Time</span>
              <span className="font-semibold text-green-600">&lt; 24 hours</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Accuracy Rate</span>
              <span className="font-semibold text-blue-600">98.5%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Earnings</span>
              <span className="font-semibold text-purple-600">$24,750</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
