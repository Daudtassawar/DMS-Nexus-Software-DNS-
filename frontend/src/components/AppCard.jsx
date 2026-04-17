import React from 'react';

const AppCard = ({ children, title, subtitle, footer, className = '', hover = false, p0 = false }) => {
  return (
    <div className={`
        bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden transition-all duration-300
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''} 
        ${className}
    `}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--bg-app)] bg-opacity-50">
          {title && <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.1em] leading-tight">{title}</h3>}
          {subtitle && <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-bold uppercase tracking-wider opacity-70">{subtitle}</p>}
        </div>
      )}
      <div className={`${p0 ? 'p-0' : 'p-6 md:p-8'}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-[var(--bg-app)] bg-opacity-30 border-t border-[var(--border)]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AppCard;
