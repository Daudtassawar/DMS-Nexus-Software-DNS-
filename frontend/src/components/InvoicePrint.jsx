import React from 'react';

export default function InvoicePrint({ invoice, companySettings }) {
    if (!invoice) return null;

    const company = companySettings || {
      companyName: "Hamdaan Traders",
      address: "Sillanwali, Sargodha Road, Sargodha, Pakistan",
      phone: "+92 300 8843939",
      email: "contact@hamdaantraders.com"
    };

    const isDelivery = !!invoice.deliveryDate;
    const invoiceType = isDelivery ? "Delivery" : "Spot";
    
    // Check if subtotal is available, else calculate from items or net + discount
    const subtotal = invoice.totalAmount ?? (invoice.netAmount + invoice.discount);

    return (
        <div className="bg-white p-8 max-w-[210mm] w-full mx-auto border border-gray-200 text-black print:border-none print:p-0 print:shadow-none" id="printable-invoice">
            {/* Header */}
            <div className="flex justify-between border-b-2 border-black pb-6 mb-6">
                <div className="flex flex-col justify-between">
                    <h2 className="text-4xl font-extrabold tracking-widest uppercase m-0 text-black">INVOICE</h2>
                    <div className="mt-4">
                        <p className="text-sm font-bold mt-1 text-black m-0 mb-1">Invoice #: {invoice.invoiceNumber || `INV-${invoice.invoiceId}`}</p>
                        <p className="text-sm text-black m-0 mb-1"><span className="font-bold">Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                        {isDelivery && <p className="text-sm text-black m-0"><span className="font-bold">Delivery Date:</span> {new Date(invoice.deliveryDate).toLocaleDateString()}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold uppercase text-black m-0 tracking-tight">{company.companyName}</h1>
                    <p className="text-sm text-gray-800 font-bold m-0 mt-1 uppercase tracking-wide">Distributors & General Order Suppliers</p>
                    <div className="mt-3">
                        <p className="text-sm text-gray-800 m-0">{company.address}</p>
                        <p className="text-sm text-gray-800 m-0">{company.email}</p>
                        <p className="text-sm text-gray-800 m-0 font-medium">{company.phone}</p>
                    </div>
                </div>
            </div>

            {/* Customer Details */}
            <div className="flex justify-between mb-8 bg-gray-50 p-4 border border-black" style={{ backgroundColor: '#f9fafb !important', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div>
                    <h3 className="font-bold text-black text-xs uppercase mb-2 tracking-wider">Billed To:</h3>
                    <p className="font-bold text-black text-xl uppercase leading-tight m-0 mb-1">{invoice.customer?.customerName}</p>
                    <p className="text-sm text-black m-0 mb-1">📍 {invoice.customer?.address || 'No address provided'}</p>
                    <p className="text-sm text-black m-0">📞 {invoice.customer?.phone}</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                    <div className="mb-2">
                        <p className="text-sm text-black m-0"><span className="font-bold uppercase text-xs mr-2">Type:</span> <span className="font-bold text-xs border border-black px-2 py-0.5 rounded text-black">{invoiceType}</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-black m-0"><span className="font-bold uppercase text-xs mr-2">Sales Rep:</span> <span className="font-bold">{invoice.salesmanName || 'N/A'}</span></p>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <table className="w-full text-left mb-8 border-collapse border-2 border-black">
                <thead>
                    <tr className="border-b-2 border-black bg-gray-100" style={{ backgroundColor: '#f3f4f6 !important', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs">Item Description</th>
                        <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-center w-24">Variant</th>
                        <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-center w-20">Size</th>
                        <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-center w-16">Qty</th>
                        <th className="p-3 border-r-2 border-black font-bold text-black uppercase text-xs text-right w-28">Rate</th>
                        <th className="p-3 font-bold text-black uppercase text-xs text-right w-32">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.invoiceItems?.map((item, idx) => (
                        <tr key={idx} className="border-b border-black">
                            <td className="p-3 border-r-2 border-black text-sm font-medium">{item.product?.productName || item.productName || 'Unknown Product'}</td>
                            <td className="p-3 border-r-2 border-black text-sm text-center text-gray-700">{item.product?.flavor || '-'}</td>
                            <td className="p-3 border-r-2 border-black text-sm text-center text-gray-700">{item.product?.size || '-'}</td>
                            <td className="p-3 border-r-2 border-black text-sm text-center font-bold">{item.quantity}</td>
                            <td className="p-3 border-r-2 border-black text-sm text-right">Rs. {Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="p-3 text-sm text-right font-bold w-32">Rs. {Number(item.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                    ))}
                    {/* Empty rows to fill space if few items */}
                    {(!invoice.invoiceItems || invoice.invoiceItems.length < 3) && (
                        Array.from({ length: 3 - (invoice.invoiceItems?.length || 0) }).map((_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-gray-300 border-dashed">
                                <td className="p-6 border-r-2 border-black"></td>
                                <td className="p-6 border-r-2 border-black"></td>
                                <td className="p-6 border-r-2 border-black"></td>
                                <td className="p-6 border-r-2 border-black"></td>
                                <td className="p-6 border-r-2 border-black"></td>
                                <td className="p-6"></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end mb-16 relative">
                <div className="w-80 border-t-2 border-black pt-2">
                    <div className="flex justify-between py-2 border-b border-gray-300 border-dashed">
                        <span className="text-sm font-bold text-black uppercase">Subtotal:</span>
                        <span className="text-sm font-bold text-black">Rs. {Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-300 border-dashed">
                        <span className="text-sm font-bold text-black uppercase">Discount:</span>
                        <span className="text-sm font-bold text-black">Rs. {Number(invoice.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-3 border-y-4 border-black border-double mt-2 bg-gray-50 px-2" style={{ backgroundColor: '#f9fafb !important', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                        <span className="text-xl font-bold uppercase text-black">Net Total:</span>
                        <span className="text-xl font-bold text-black">Rs. {Number(invoice.netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-between items-end pt-4">
                <div className="w-1/2">
                    <p className="text-xs text-black font-bold uppercase mb-2 tracking-wider">Notes / Terms & Conditions:</p>
                    <ul className="text-xs text-gray-800 m-0 pl-4 list-disc space-y-1 font-medium">
                        <li>Goods once sold will not be taken back.</li>
                        <li>All claims must be made within 3 days of delivery.</li>
                        <li>Make all checks payable to {company.companyName}.</li>
                    </ul>
                    <p className="text-sm text-black font-bold italic mt-4">Thank you for your business!</p>
                </div>
                <div className="w-64 text-center">
                    <div className="border-t-2 border-black mb-2 border-solid"></div>
                    <p className="text-xs font-bold uppercase text-black m-0 tracking-wider">Authorized Signature & Stamp</p>
                </div>
            </div>
        </div>
    );
}
