import React, { useEffect } from 'react';

const SuccessModal = ({ isOpen, onClose, title, message, redirectDelay = 5000 }) => {
  // Auto close/redirect after delay
  useEffect(() => {
    if (isOpen && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, redirectDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, redirectDelay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      {/* Modal */}
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full m-4 z-50">
        {/* Header */}
        <div className="bg-secondary py-4 px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button 
              type="button" 
              className="text-white hover:text-neutral-200"
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="py-6 px-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-neutral-700">{message}</p>
              <p className="text-sm text-neutral-500 mt-1">Redirecting in a few seconds...</p>
            </div>
          </div>
          
          {/* Countdown bar */}
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-4">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-100"
              style={{ 
                width: '100%',
                animation: `countdown ${redirectDelay/1000}s linear forwards`
              }}
            ></div>
          </div>
          
          <style jsx>{`
            @keyframes countdown {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;