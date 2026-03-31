import React, { useEffect } from 'react';

const AppModal = ({ isOpen, onClose, title, children, footer, size = 'md', className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className={`relative w-full ${sizes[size]} bg-[var(--bg-card)] rounded-md shadow-md border border-[var(--border)] flex flex-col max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--secondary)] rounded-md transition-colors group"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppModal;
