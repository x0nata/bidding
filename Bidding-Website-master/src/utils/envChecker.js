/**
 * Environment variable checker for debugging
 */

export const checkEnvironment = () => {
  
  // Check all React environment variables
  const envVars = {
    'REACT_APP_BACKEND_URL': process.env.REACT_APP_BACKEND_URL,
    'REACT_APP_SERVER_URL': process.env.REACT_APP_SERVER_URL,
    'REACT_APP_API_URL': process.env.REACT_APP_API_URL,
    'REACT_APP_SOCKET_URL': process.env.REACT_APP_SOCKET_URL,
    'NODE_ENV': process.env.NODE_ENV,
  };
  
  
  // Check which URLs are being used by different services
  const serviceUrls = {
    'Payment API': process.env.REACT_APP_BACKEND_URL,
    'Auth API': process.env.REACT_APP_BACKEND_URL,
    'Bidding API': process.env.REACT_APP_BACKEND_URL,
    'WebSocket': process.env.REACT_APP_SOCKET_URL,
  };
  
  
  // Check if URLs are consistent
  const uniqueUrls = [...new Set(Object.values(serviceUrls))];
  
  if (uniqueUrls.length > 1) {
  } else {
  }
  
  // Test URL reachability
  const testUrl = async (url, name) => {
    try {
      const response = await fetch(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Test backend connectivity
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  if (backendUrl) {
    testUrl(backendUrl, 'Backend Root');
    testUrl(`${backendUrl}/api/payments/methods`, 'Payment Methods API (will fail without auth)');
  }
  
  
  return {
    envVars,
    serviceUrls,
    uniqueUrls,
    backendUrl
  };
};

// Add to window for easy access
if (typeof window !== 'undefined') {
  window.checkEnvironment = checkEnvironment;
}

export default checkEnvironment;