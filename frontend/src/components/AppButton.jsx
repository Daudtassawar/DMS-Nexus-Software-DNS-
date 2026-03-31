import React from 'react';

const AppButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  disabled = false,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border';
  
  const variants = {
    primary: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white border-transparent shadow-sm',
    secondary: 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--secondary)] shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
    outline: 'bg-transparent border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
    ghost: 'bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--secondary)]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default AppButton;
