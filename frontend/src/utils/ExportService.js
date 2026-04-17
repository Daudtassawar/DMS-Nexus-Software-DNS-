import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './currencyUtils';

export const ExportService = {
  /**
   * Export JSON array to an Excel file
   * @param {Array} data - Array of objects to export
   * @param {string} filename - Output filename (without extension)
   */
  exportToExcel: (data, filename) => {
    if (!data || data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  },

  /**
   * Export JSON array to a PDF file with a table
   * @param {Array} data - Array of objects to export
   * @param {Array} columns - Array of column definitions: { header: 'Name', key: 'name' }
   * @param {string} filename - Output filename (without extension)
   * @param {string} title - Title text rendered inside the PDF document
   */
  exportToPDF: (data, columns, filename, title) => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title || filename, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    // Build Table
    doc.autoTable({
      startY: 40,
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => {
          let val = row[c.key];
          if (val === null || val === undefined) return '-';
          if (typeof val === 'number' && c.isCurrency) return formatCurrency(val);
          return val;
      })),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });

    doc.save(`${filename}.pdf`);
  }
};
