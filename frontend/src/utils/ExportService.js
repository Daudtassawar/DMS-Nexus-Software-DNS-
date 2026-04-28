import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './currencyUtils';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const saveAndShareFile = async (base64Data, filename) => {
  if (Capacitor.isNativePlatform()) {
    try {
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache
      });
      await Share.share({
        title: filename,
        url: savedFile.uri,
      });
    } catch (e) {
      console.error('Error saving/sharing file', e);
      alert('Failed to save file: ' + e.message);
    }
  }
};

export const ExportService = {
  /**
   * Save and share a jsPDF document (handles native and web platforms)
   * @param {Object} doc - jsPDF instance
   * @param {string} filename - Output filename (with extension)
   */
  savePdf: async (doc, filename) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = doc.output('datauristring').split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache
        });
        await Share.share({
          title: filename,
          url: savedFile.uri,
        });
      } catch (e) {
        console.error('Error saving/sharing PDF file', e);
        alert('Failed to save PDF file: ' + e.message);
      }
    } else {
      doc.save(filename);
    }
  },

  /**
   * Save and share an Excel workbook (handles native and web platforms)
   * @param {Object} wb - XLSX workbook instance
   * @param {string} filename - Output filename (with extension)
   */
  saveExcel: async (wb, filename) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache
        });
        await Share.share({
          title: filename,
          url: savedFile.uri,
        });
      } catch (e) {
        console.error('Error saving/sharing Excel file', e);
        alert('Failed to save Excel file: ' + e.message);
      }
    } else {
      XLSX.writeFile(wb, filename);
    }
  },

  /**
   * Export JSON array to an Excel file
   * @param {Array} data - Array of objects to export
   * @param {string} filename - Output filename (without extension)
   */
  exportToExcel: async (data, filename) => {
    if (!data || data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    
    if (Capacitor.isNativePlatform()) {
      const base64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      await saveAndShareFile(base64, `${filename}.xlsx`);
    } else {
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  },

  /**
   * Export JSON array to a PDF file with a table
   * @param {Array} data - Array of objects to export
   * @param {Array} columns - Array of column definitions: { header: 'Name', key: 'name' }
   * @param {string} filename - Output filename (without extension)
   * @param {string} title - Title text rendered inside the PDF document
   */
  exportToPDF: async (data, columns, filename, title) => {
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

    if (Capacitor.isNativePlatform()) {
      const base64 = doc.output('datauristring').split(',')[1];
      await saveAndShareFile(base64, `${filename}.pdf`);
    } else {
      doc.save(`${filename}.pdf`);
    }
  }
};
