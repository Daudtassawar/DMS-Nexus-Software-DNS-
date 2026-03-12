export default function InvoiceItemRow({ item, index, onQuantityChange, onRemove }) {
    const handleQuantityChange = (e) => {
        const qty = parseInt(e.target.value) || 0;
        onQuantityChange(index, qty);
    };

    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-3">{item.productName}</td>
            <td className="p-3">
                <input
                    type="number"
                    min="1"
                    className="w-20 border border-gray-300 rounded p-1 text-center"
                    value={item.quantity}
                    onChange={handleQuantityChange}
                />
            </td>
            <td className="p-3">${item.salePrice.toFixed(2)}</td>
            <td className="p-3 font-semibold">${item.lineTotal.toFixed(2)}</td>
            <td className="p-3 text-center">
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                >
                    ✕
                </button>
            </td>
        </tr>
    );
}
