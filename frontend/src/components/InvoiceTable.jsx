import InvoiceItemRow from './InvoiceItemRow';

export default function InvoiceTable({ items, onQuantityChange, onRemove }) {
    if (items.length === 0) {
        return <div className="p-8 text-center text-gray-400 bg-gray-50 border border-dashed rounded">No items added to invoice yet.</div>;
    }

    return (
        <div className="overflow-x-auto shadow rounded-lg border">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3">Line Total</th>
                        <th className="p-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <InvoiceItemRow
                            key={index}
                            index={index}
                            item={item}
                            onQuantityChange={onQuantityChange}
                            onRemove={onRemove}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
