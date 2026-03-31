import React from 'react';

const AppBadge = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  dot = false,
  uppercase = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
    secondary: 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3 py-1.5 text-xs'
  };

  return (
    <span
      className={`
        inline-flex items-center font-bold border rounded-md
        ${variants[variant]} ${sizes[size]} ${uppercase ? 'uppercase tracking-wider' : ''} ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${variant === 'success' ? 'bg-emerald-500' : 'bg-current opacity-70'}`}></span>
      )}
      {children}
    </span>
  );
};

export default AppBadge;
