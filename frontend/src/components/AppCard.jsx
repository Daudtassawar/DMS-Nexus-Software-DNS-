import React from 'react';

const AppCard = ({ children, title, subtitle, footer, className = '', hover = false, p0 = false }) => {
  return (
    <div className={`
        bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-sm
        ${hover ? 'hover:shadow-md transition-shadow' : ''} 
        ${className}
    `}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--secondary)] rounded-t-lg">
          {title && <h3 className="text-base font-bold text-[var(--text-main)]">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">{subtitle}</p>}
        </div>
      )}
      <div className={`${p0 ? 'p-0' : 'p-6'}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)] rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AppCard;
