import React, { useState } from 'react';
import { adminTransportationApi } from '../../services/adminApi';

/**
 * TransportationApiTest - Debug component to test transportation API endpoints
 */
const TransportationApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test, success, result, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      result,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testTransportationEndpoints = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Get transportation items
    try {
      console.log('Testing transportation items endpoint...');
      const itemsResult = await adminTransportationApi.getItems();
      addTestResult(
        'Get Transportation Items',
        true,
        `Success: Found ${itemsResult.data?.length || 0} items`,
        null
      );
    } catch (error) {
      addTestResult(
        'Get Transportation Items',
        false,
        'Failed to fetch items',
        error.toString()
      );
    }

    // Test 2: Get transportation stats
    try {
      console.log('Testing transportation stats endpoint...');
      const statsResult = await adminTransportationApi.getStats();
      addTestResult(
        'Get Transportation Stats',
        true,
        `Success: ${JSON.stringify(statsResult.data)}`,
        null
      );
    } catch (error) {
      addTestResult(
        'Get Transportation Stats',
        false,
        'Failed to fetch stats',
        error.toString()
      );
    }

    // Test 3: Check backend connectivity
    try {
      console.log('Testing backend connectivity...');
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/debug/routes`);
      const data = await response.json();
      addTestResult(
        'Backend Connectivity',
        true,
        `Connected to: ${backendUrl}`,
        null
      );
    } catch (error) {
      addTestResult(
        'Backend Connectivity',
        false,
        'Failed to connect to backend',
        error.toString()
      );
    }

    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Transportation API Test</h2>
      
      {/* Current Configuration */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Current Configuration</h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <strong>Backend URL:</strong> {process.env.REACT_APP_BACKEND_URL || 'Not configured'}
          </div>
          <div>
            <strong>Token Available:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User Role:</strong> {JSON.parse(localStorage.getItem('user') || '{}')?.role || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
        <div className="flex gap-2">
          <button
            onClick={testTransportationEndpoints}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Transportation APIs'}
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
                    {result.error && (
                      <div className="text-sm text-red-600 mt-1 font-mono bg-red-100 p-2 rounded">
                        {result.error}
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
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1. Make sure you're logged in as an admin user</li>
          <li>2. Click "Test Transportation APIs" to check all endpoints</li>
          <li>3. Check the results to see which endpoints are working</li>
          <li>4. If tests fail, check the browser console for more details</li>
        </ul>
      </div>
    </div>
  );
};

export default TransportationApiTest;
