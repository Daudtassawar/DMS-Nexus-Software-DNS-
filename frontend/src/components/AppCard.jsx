import React from 'react';

const AppCard = ({ children, title, subtitle, footer, className = '', hover = true, p0 = false }) => {
  return (
    <div className={`
        bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-sm transition-all duration-300
        ${hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''} 
        ${className}
    `}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[var(--border)]">
          {title && <h3 className="text-sm font-black uppercase tracking-[0.2em] italic text-primary">{title}</h3>}
          {subtitle && <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1.5">{subtitle}</p>}
        </div>
      )}
      <div className={`${p0 ? 'p-0' : 'p-6'}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-[var(--secondary)]/30 border-t border-[var(--border)] rounded-b-[var(--radius-lg)]">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AppCard;
