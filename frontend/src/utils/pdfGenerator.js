import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './currencyUtils';

export const generateProfessionalInvoicePDF = (invoice, settings) => {
    if (!invoice) return;

    // Fallback settings if not provided
    const company = settings || {
      companyName: "Hamdaan Traders",
      address: "Sillanwali, Sargodha Road, Sargodha, Pakistan",
      phone: "+92 300 8843939",
      email: "contact@hamdaantraders.com"
    };

    const doc = new jsPDF('print', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // --- Header ---
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - margin, margin + 10, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoice.invoiceNumber || 'INV-' + invoice.invoiceId}`, pageWidth - margin, margin + 18, { align: "right" });
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, pageWidth - margin, margin + 24, { align: "right" });

    // --- Company Info ---
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(company.companyName, margin, margin + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    
    // Split address if too long
    const splitCompanyAddress = doc.splitTextToSize(company.address, 70);
    doc.text(splitCompanyAddress, margin, margin + 16);
    
    const addressHeight = (splitCompanyAddress.length * 5); // Rough estimate
    doc.text(company.email, margin, margin + 18 + addressHeight);
    doc.text(company.phone, margin, margin + 24 + addressHeight);

    doc.line(margin, margin + 35, pageWidth - margin, margin + 35); // Horizontal line

    // --- Bill To ---
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", margin, margin + 48);

    doc.setFontSize(12);
    doc.text(invoice.customer?.customerName || "Standard Client", margin, margin + 55);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Client ID: ${invoice.customerId}`, margin, margin + 61);
    const splitAddress = doc.splitTextToSize(invoice.customer?.address || "No address on file", 80);
    doc.text(splitAddress, margin, margin + 67);

    // --- Rep Info ---
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Representative:", pageWidth - margin - 60, margin + 48);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.salesman?.name || "Central Desk", pageWidth - margin - 60, margin + 55);

    // --- Items Table ---
    const tableStartY = margin + 85;
    
    const tableColumn = ["Description", "Qty", "Unit Price", "Empties", "Total"];
    const tableRows = [];

    if (invoice.invoiceItems) {
        invoice.invoiceItems.forEach(item => {
            const rowData = [
                item.product?.productName || 'General Item',
                `${item.quantity} PCS`,
                formatCurrency(item.unitPrice),
                (item.returnedQuantity || 0).toString(),
                formatCurrency(item.totalPrice)
            ];
            tableRows.push(rowData);
        });
    }

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'center' },
            4: { halign: 'right', fontStyle: 'bold' }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 15;

    // --- Totals ---
    const summaryX = pageWidth - margin - 70;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Subtotal:", summaryX, finalY);
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(invoice.totalAmount), pageWidth - margin, finalY, { align: "right" });

    doc.setTextColor(100, 116, 139);
    doc.text("Discount:", summaryX, finalY + 8);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`- ${formatCurrency(invoice.discount)}`, pageWidth - margin, finalY + 8, { align: "right" });

    // Thick line before total
    doc.setLineWidth(0.5);
    doc.line(summaryX, finalY + 12, pageWidth - margin, finalY + 12);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Net Total:", summaryX, finalY + 20);
    doc.text(formatCurrency(invoice.netAmount), pageWidth - margin, finalY + 20, { align: "right" });

    // --- Notes ---
    if (invoice.notes) {
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("Notes:", margin, finalY);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        const splitNotes = doc.splitTextToSize(invoice.notes, 100);
        doc.text(splitNotes, margin, finalY + 6);
    }

    // --- Footer ---
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Thank you for your business.", pageWidth / 2, pageHeight - 15, { align: "center" });

    // Automatically download the PDF
    doc.save(`Invoice_${invoice.invoiceNumber || invoice.invoiceId}.pdf`);
};
