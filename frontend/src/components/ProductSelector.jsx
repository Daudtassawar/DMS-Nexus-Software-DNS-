import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductSelector({ onAddProduct }) {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');

    useEffect(() => {
        axios.get('/api/v1/products')
            .then(res => setProducts(res.data))
            .catch(err => console.error('Failed to load products', err));
    }, []);

    const handleAdd = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.productId.toString() === selectedProductId);
        if (product) {
            onAddProduct(product);
            setSelectedProductId(''); // Reset after adding
        }
    };

    return (
        <div className="mb-4 flex gap-2 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search & Add Product</label>
                <select
                    className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                >
                    <option value="" disabled>-- Select a Product --</option>
                    {products.map(p => (
                        <option key={p.productId} value={p.productId}>
                            {p.productName} (Price: ${p.salePrice.toFixed(2)})
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="button"
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Add Item
            </button>
        </div>
    );
}
