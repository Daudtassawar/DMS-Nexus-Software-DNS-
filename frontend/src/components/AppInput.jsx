import React from 'react';

const AppInput = ({ label, error, helperText, icon: Icon, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] italic">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors">
            <Icon size={16} />
          </div>
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-11' : 'px-4'} py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg 
            text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary
            transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500
            ${error ? 'border-rose-500 ring-rose-500/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter mt-0.5">{error}</span>}
      {helperText && !error && <span className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">{helperText}</span>}
    </div>
  );
};

export default AppInput;
