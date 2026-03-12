export default function InvoiceSummary({ subtotal, discount, netTotal, onDiscountChange }) {
    return (
        <div className="bg-white p-4 rounded shadow border mt-6 w-full md:w-1/3 ml-auto">
            <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center">
                    <span className="mr-1 text-gray-500">$</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-24 border border-gray-300 rounded p-1 text-right"
                        value={discount === 0 ? '' : discount}
                        onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                    />
                </div>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                <span>Net Total:</span>
                <span className="text-blue-600">${netTotal.toFixed(2)}</span>
            </div>
        </div>
    );
}
