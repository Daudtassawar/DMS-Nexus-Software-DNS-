import React from 'react';

const AppTable = ({ headers, data, renderRow, loading, emptyMessage = "No records found." }) => {
  return (
    <div className="w-full overflow-x-auto border border-[var(--border)] rounded-md bg-[var(--bg-card)] shadow-sm">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead className="sticky top-0 z-10 bg-[var(--secondary)] border-b border-[var(--border)]">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] text-sm">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-[var(--text-muted)]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Loading data...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center text-[var(--text-muted)] text-sm italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="odd:bg-[var(--bg-card)] even:bg-[var(--secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-[var(--border)] last:border-0">
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
