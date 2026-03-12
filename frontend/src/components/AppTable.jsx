import React from 'react';

const AppTable = ({ headers, data, renderRow, loading, emptyMessage = "No records found in current node." }) => {
  return (
    <div className="overflow-x-auto custom-scrollbar rounded-xl">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[var(--secondary)]/50 border-b border-[var(--border)]">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] italic">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">Syncing Matrix...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-[var(--text-muted)] font-bold italic opacity-50 uppercase tracking-widest text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-primary/5 transition-colors group">
                {renderRow(item, index)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppTable;
