// src/utils/errorUtils.js

/**
 * Extract error message from different error types
 */
export const getErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    // Handle axios error response
    if (error.response) {
      // Server responded with an error status
      const data = error.response.data;
      
      if (typeof data === 'string') return data;
      if (data?.message) return data.message;
      if (data?.error) return data.error;
      
      return `Server error: ${error.response.status} ${error.response.statusText}`;
    }
    
    // Handle network errors
    if (error.request) {
      return 'Network error. Server did not respond.';
    }
    
    // Handle other types of errors
    return error.message || 'An unexpected error occurred';
  };
  
  /**
   * Show appropriate error UI based on error type
   */
  export const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
    if (!error) return null;
    
    const message = getErrorMessage(error);
    
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {message}</span>
        
        <div className="mt-2 flex space-x-3">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          )}
          
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  };