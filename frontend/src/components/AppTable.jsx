import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AppTable = ({ 
  headers, 
  data, 
  renderRow, 
  loading, 
  emptyMessage = "No records found.",
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  totalCount = 0
}) => {
  return (
    <div className="w-full flex flex-col border border-[var(--border)] rounded-md bg-[var(--bg-card)] shadow-sm">
      <div className="w-full overflow-x-auto">
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

      {pagination && !loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--secondary)] border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Showing Page <span className="text-[var(--text-main)]">{currentPage}</span> of <span className="text-[var(--text-main)]">{totalPages}</span>
            <span className="ml-2 font-normal">({totalCount} records)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`min-w-[32px] h-[32px] rounded text-xs font-bold transition-all ${
                         currentPage === pageNum 
                         ? 'bg-[var(--primary)] text-white' 
                         : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
               })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppTable;
