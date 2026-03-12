import React from 'react';

const AppBadge = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  dot = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-[var(--secondary)] text-[var(--text-muted)] border-[var(--border)]',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    info: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-xs'
  };

  return (
    <span
      className={`
        inline-flex items-center font-black uppercase tracking-widest border rounded 
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${variant === 'success' ? 'bg-emerald-500' : 'bg-current shadow-[0_0_8px_rgba(37,99,235,0.4)]'}`}></span>
      )}
      {children}
    </span>
  );
};

export default AppBadge;
