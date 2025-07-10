import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../../redux/slices/authSlice';

/**
 * AdminAuthDebug - Debug component to test admin authentication
 */
const AdminAuthDebug = () => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addTestResult = (test, success, result, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testAuthEndpoints = async () => {
    setTesting(true);
    setTestResults([]);

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem('token');

    // Test 1: Check if token exists
    addTestResult(
      'Token Check',
      !!token,
      token ? 'Token exists in localStorage' : 'No token found',
      token ? `Token: ${token.substring(0, 20)}...` : null
    );

    if (!token) {
      setTesting(false);
      return;
    }

    // Test 2: Check login status
    try {
      const response = await fetch(`${backendUrl}/api/users/loggedin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      const data = await response.json();
      addTestResult(
        'Login Status Check',
        response.ok,
        `Status: ${response.status}, Data: ${JSON.stringify(data)}`,
        response.ok ? 'User is logged in' : 'Login check failed'
      );
    } catch (error) {
      addTestResult(
        'Login Status Check',
        false,
        'Failed to check login status',
        error.message
      );
    }

    // Test 3: Get user data
    try {
      const response = await fetch(`${backendUrl}/api/users/getuser`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      const data = await response.json();
      addTestResult(
        'Get User Data',
        response.ok,
        response.ok ? `User: ${data.name}, Role: ${data.role}` : `Error: ${response.status}`,
        response.ok ? JSON.stringify(data, null, 2) : null
      );
    } catch (error) {
      addTestResult(
        'Get User Data',
        false,
        'Failed to get user data',
        error.message
      );
    }

    // Test 4: Redux auth status check
    try {
      console.log('Testing Redux checkAuthStatus...');
      await dispatch(checkAuthStatus()).unwrap();
      addTestResult(
        'Redux Auth Check',
        true,
        'Redux auth check successful',
        'Check console for detailed logs'
      );
    } catch (error) {
      addTestResult(
        'Redux Auth Check',
        false,
        'Redux auth check failed',
        error.message
      );
    }

    setTesting(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const refreshAuth = () => {
    dispatch(checkAuthStatus());
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Authentication Debug</h2>
      
      {/* Current State */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Current Authentication State</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User Name:</strong> {user?.name || 'Not available'}
          </div>
          <div>
            <strong>User Role:</strong> {user?.role || 'Not available'}
          </div>
          <div>
            <strong>User ID:</strong> {user?._id || 'Not available'}
          </div>
          <div>
            <strong>User Email:</strong> {user?.email || 'Not available'}
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Configuration</h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <strong>Backend URL:</strong> {process.env.REACT_APP_BACKEND_URL || 'Not configured'}
          </div>
          <div>
            <strong>Token in localStorage:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User data in localStorage:</strong> {localStorage.getItem('user') ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={testAuthEndpoints}
            disabled={testing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Auth Endpoints'}
          </button>
          <button
            onClick={refreshAuth}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Auth
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Results
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
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm text-gray-600 mt-1">{result.result}</div>
                    {result.details && (
                      <div className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                        {result.details}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center ml-4">
                    <span className="text-xs text-gray-400 mr-2">{result.timestamp}</span>
                    <span className={`text-sm font-medium ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Make sure you're logged in as an admin user</li>
          <li>2. Click "Test Auth Endpoints" to check all authentication endpoints</li>
          <li>3. Check the browser console for detailed logs</li>
          <li>4. If tests fail, check the backend server status</li>
          <li>5. Use "Refresh Auth" to trigger a new authentication check</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAuthDebug;
