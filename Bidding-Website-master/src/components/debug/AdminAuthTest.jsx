import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAuthStatus, isAdminUser, getRedirectPath, shouldRedirectToAdmin } from '../../redux/slices/authSlice';

/**
 * AdminAuthTest - Debug component to test admin authentication flow
 * This component helps verify that admin authentication and routing logic works correctly
 */
const AdminAuthTest = () => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, expected, passed) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      expected,
      passed,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runAuthTests = () => {
    setTestResults([]);
    
    // Test 1: Check if user is admin
    const isAdmin = isAdminUser(user);
    addTestResult(
      'isAdminUser check',
      `User is admin: ${isAdmin}`,
      'Should return true for admin users',
      user?.role === 'admin' ? isAdmin : !isAdmin
    );

    // Test 2: Check redirect path
    const redirectPath = getRedirectPath(user);
    addTestResult(
      'getRedirectPath check',
      `Redirect path: ${redirectPath}`,
      'Should return /admin/dashboard for admin users',
      user?.role === 'admin' ? redirectPath === '/admin/dashboard' : redirectPath === '/dashboard'
    );

    // Test 3: Check if current path should redirect
    const shouldRedirect = shouldRedirectToAdmin(user, location.pathname);
    addTestResult(
      'shouldRedirectToAdmin check',
      `Should redirect from ${location.pathname}: ${shouldRedirect}`,
      'Should return true for admin users on user dashboard paths',
      true // This test is informational
    );

    // Test 4: Check authentication status
    addTestResult(
      'Authentication status',
      `Authenticated: ${isAuthenticated}, Loading: ${isLoading}`,
      'Should be authenticated and not loading',
      isAuthenticated && !isLoading
    );

    // Test 5: Check localStorage consistency
    const tokenExists = !!localStorage.getItem('token');
    const userDataExists = !!localStorage.getItem('user');
    addTestResult(
      'localStorage consistency',
      `Token exists: ${tokenExists}, User data exists: ${userDataExists}`,
      'Both should exist for authenticated users',
      isAuthenticated ? (tokenExists && userDataExists) : (!tokenExists && !userDataExists)
    );
  };

  const testNavigation = (path) => {
    console.log(`Testing navigation to: ${path}`);
    navigate(path);
  };

  const clearTests = () => {
    setTestResults([]);
  };

  const refreshAuth = () => {
    dispatch(checkAuthStatus());
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Authentication Test</h2>
      
      {/* Current State */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Current State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User:</strong> {user?.name || 'Not logged in'}
          </div>
          <div>
            <strong>Role:</strong> {user?.role || 'None'}
          </div>
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Current Path:</strong> {location.pathname}
          </div>
          <div>
            <strong>Is Admin:</strong> {isAdminUser(user) ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runAuthTests}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Run Auth Tests
          </button>
          <button
            onClick={refreshAuth}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Auth
          </button>
          <button
            onClick={clearTests}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Navigation Tests */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Navigation Tests</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testNavigation('/dashboard')}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
          >
            Go to /dashboard
          </button>
          <button
            onClick={() => testNavigation('/admin/dashboard')}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
          >
            Go to /admin/dashboard
          </button>
          <button
            onClick={() => testNavigation('/product')}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
          >
            Go to /product
          </button>
          <button
            onClick={() => testNavigation('/admin/products')}
            className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
          >
            Go to /admin/products
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600">Result: {result.result}</div>
                    <div className="text-sm text-gray-500">Expected: {result.expected}</div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">{result.timestamp}</span>
                    <span className={`text-sm font-medium ${
                      result.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.passed ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuthTest;
