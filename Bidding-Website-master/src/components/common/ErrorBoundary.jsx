import React from 'react';
import { Title, Body, Caption } from './Design';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and error reporting service
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle size={32} className="text-red-600" />
            </div>

            {/* Error Message */}
            <Title level={3} className="text-gray-800 mb-4">
              Oops! Something went wrong
            </Title>
            
            <Body className="text-gray-600 mb-6">
              {this.props.fallbackMessage || 
                "We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage."
              }
            </Body>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                <Caption className="text-gray-700 font-medium mb-2">Error Details:</Caption>
                <pre className="text-xs text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FiRefreshCw size={16} />
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FiHome size={16} />
                Go Home
              </button>
            </div>

            {/* Support Message */}
            <Caption className="text-gray-500 mt-6">
              If this problem persists, please contact our support team.
            </Caption>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
export const DashboardErrorBoundary = ({ children, fallbackMessage }) => {
  return (
    <ErrorBoundary fallbackMessage={fallbackMessage}>
      {children}
    </ErrorBoundary>
  );
};

// Lightweight error boundary for individual components
export const ComponentErrorBoundary = ({ children, fallback }) => {
  return (
    <ErrorBoundary 
      fallbackMessage="This component encountered an error. Please refresh to try again."
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
