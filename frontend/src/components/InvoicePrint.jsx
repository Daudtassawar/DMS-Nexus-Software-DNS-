import React, { useRef } from 'react';

export default function InvoicePrint({ invoice }) {
    if (!invoice) return null;

    return (
        <div className="bg-white p-8 w-[800px] border shadow text-gray-800" id="printable-invoice">
            {/* Header */}
            <div className="flex justify-between border-b pb-6 mb-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-blue-900 tracking-wider">INVOICE</h2>
                    <p className="text-gray-500 mt-1">Invoice #: {invoice.invoiceNumber || `INV-${invoice.invoiceId}`}</p>
                    <p className="text-gray-500">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-800">DMS Beverage Distribution Co.</h1>
                    <p className="text-sm text-gray-600">123 Logistics Way, Suite A</p>
                    <p className="text-sm text-gray-600">contact@dmsbeverage.com</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
            </div>

            {/* Bill To Info */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-700 border-b pb-1 mb-2">Billed To:</h3>
                <p className="font-bold text-gray-800 text-lg">{invoice.customer?.customerName}</p>
                <p className="text-gray-600">{invoice.customer?.address || 'No address provided'}</p>
                <p className="text-gray-600">{invoice.customer?.phone}</p>
            </div>

            {/* Products Table */}
            <table className="w-full text-left mb-8 border-collapse">
                <thead>
                    <tr className="bg-blue-50 text-blue-900 border-y-2 border-blue-900">
                        <th className="p-3">Item Description</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.invoiceItems?.map((item, idx) => (
                        <tr key={idx} className="border-b">
                            <td className="p-3">{item.product?.productName || 'Unknown Product'}</td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                            <td className="p-3 text-right font-medium">${item.totalPrice.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end">
                <div className="w-1/2 md:w-1/3">
                    <div className="flex justify-between py-1 text-gray-600">
                        <span>Subtotal:</span>
                        <span>${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-600">
                        <span>Discount:</span>
                        <span>${invoice.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-gray-800 text-xl font-bold mt-2">
                        <span>TOTAL:</span>
                        <span>${invoice.netAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-sm text-gray-500 border-t pt-4">
                Thank you for your business! All payments are subject to company policy.
            </div>
        </div>
    );
}
