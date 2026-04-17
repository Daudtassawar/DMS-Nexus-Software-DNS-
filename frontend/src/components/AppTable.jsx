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
    <div className="w-full flex flex-col border border-[var(--border)] rounded-2xl bg-[var(--bg-card)] shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-10 bg-[var(--bg-app)] border-b border-[var(--border)]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center text-[var(--text-muted)]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-xl animate-spin shadow-lg"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center text-[var(--text-muted)]">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50 italic">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="group hover:bg-[var(--bg-app)] transition-all duration-200 border-b border-[var(--border)] last:border-0 interactive">
                  {renderRow(item, index)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-[var(--bg-app)] border-t border-[var(--border)] bg-opacity-30">
          <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            <span className="bg-[var(--bg-card)] px-3 py-1 rounded-lg border border-[var(--border)] shadow-sm">
              Page <span className="text-[var(--primary)]">{currentPage}</span> / {totalPages}
            </span>
            <span className="opacity-40">{totalCount} System Modules</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border)] shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--primary)] hover:text-white transition-all active:scale-90"
            >
              <ChevronLeft size={18} />
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
                      className={`min-w-[36px] h-[36px] rounded-lg text-[10px] font-black transition-all active:scale-90 ${
                         currentPage === pageNum 
                         ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--ring)]' 
                         : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
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
              className="p-2 rounded-lg text-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--primary)] hover:text-white transition-all active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppTable;
