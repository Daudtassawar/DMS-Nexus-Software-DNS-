import React from 'react';

const AppInput = ({ label, error, helperText, icon: Icon, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-bold text-[var(--text-main)]">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-10' : 'px-3'} py-2.5 bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-md 
            text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]
            transition-all placeholder:text-[var(--text-muted)] min-h-[42px] text-[var(--text-main)]
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
      {helperText && !error && <span className="text-xs text-[var(--text-muted)] mt-1">{helperText}</span>}
    </div>
  );
};

export default AppInput;
