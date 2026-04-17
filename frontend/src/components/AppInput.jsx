import React from 'react';

const AppInput = ({ label, error, helperText, icon: Icon, prefix, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <label className="text-[10px] font-black p-0.5 text-[var(--text-muted)] uppercase tracking-[0.1em] ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-black text-xs pointer-events-none uppercase tracking-widest">
            {prefix}
          </div>
        )}
        <input
          className={`
            w-full ${Icon || prefix ? 'pl-12' : 'px-4'} py-3.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-xl 
            text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)]
            transition-all placeholder:text-[var(--text-muted)] placeholder:opacity-50 text-[var(--text-main)]
            ${error ? 'border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1 animate-pulse uppercase tracking-tight">{error}</span>}
      {helperText && !error && <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 ml-1 uppercase tracking-tight opacity-70">{helperText}</span>}
    </div>
  );
};

export default AppInput;
