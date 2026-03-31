import { useState, useEffect } from 'react';
import distributorService from '../services/distributorService';
import AppModal from './AppModal';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { Package, DollarSign, Calendar, Tag, Shield, Image as ImageIcon } from 'lucide-react';

const UNITS = ['Bottle', 'Carton', 'Pack', 'Pcs', 'Box', 'Litre', 'Kg'];
const CATEGORIES = ['Soft Drink', 'Juice', 'Water', 'Energy Drink', 'Dairy', 'Snacks', 'Other'];

export default function ProductModal({ product, onSave, onClose }) {
    const isEdit = Boolean(product?.productId);
    
    const [form, setForm] = useState({
        productId: 0, productName: '', brand: '', category: '',
        barcode: '', purchasePrice: '', salePrice: '',
        unit: 'Bottle', minStockLevel: '0', expiryDate: '', imagePath: '', distributorId: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [distributors, setDistributors] = useState([]);

    useEffect(() => {
        const fetchDistributors = async () => {
            try { const data = await distributorService.getDistributors(); setDistributors(data || []); }
            catch (err) { console.error("Failed to load distributors:", err); }
        };
        fetchDistributors();
    }, []);

    useEffect(() => {
        if (product) {
            setForm({
                productId: product.productId || 0,
                productName: product.productName || '',
                brand: product.brand || '',
                category: product.category || '',
                barcode: product.barcode || '',
                purchasePrice: product.purchasePrice?.toString() || '',
                salePrice: product.salePrice?.toString() || '',
                unit: product.unit || 'Bottle',
                minStockLevel: product.minStockLevel?.toString() || '0',
                expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
                imagePath: product.imagePath || '',
                distributorId: product.distributorId || '',
            });
            if (product.imagePath) setImagePreview(product.imagePath);
        }
    }, [product]);

    const handleChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const handleImg = (e) => {
        const f = e.target.files[0];
        if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSaving(true);
        try {
            await onSave({
                ...form,
                purchasePrice: parseFloat(form.purchasePrice) || 0,
                salePrice: parseFloat(form.salePrice) || 0,
                minStockLevel: parseInt(form.minStockLevel) || 0,
                distributorId: form.distributorId ? parseInt(form.distributorId) : null,
                expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
            }, imageFile);
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save product.';
            setError(msg);
            throw err; // Re-throw so parent can handle if needed, but we show local error first
        } finally { setSaving(false); }
    };

    return (
        <AppModal
            isOpen={true}
            onClose={onClose}
            title={isEdit ? 'Update Product Details' : 'Register New Product'}
            size="lg"
            footer={
                <>
                    <AppButton variant="secondary" onClick={onClose} disabled={saving}>Discard</AppButton>
                    <AppButton onClick={handleSubmit} loading={saving}>
                        {isEdit ? 'Save Changes' : 'Add to Catalogue'}
                    </AppButton>
                </>
            }
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <AppInput 
                            label="Product Name" 
                            placeholder="e.g. Coca Cola Classic 500ml" 
                            value={form.productName} 
                            onChange={handleChange('productName')}
                            required
                        />
                    </div>
                    
                    <AppInput 
                        label="Brand" 
                        placeholder="e.g. Coke Industries" 
                        value={form.brand} 
                        onChange={handleChange('brand')}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-main)]">Category</label>
                        <select 
                            value={form.category} 
                            onChange={handleChange('category')}
                            className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                        >
                            <option value="">Generic</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <AppInput 
                        label="Barcode / SKU" 
                        placeholder="89012345678" 
                        value={form.barcode} 
                        onChange={handleChange('barcode')}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-[var(--text-main)]">Unit of Measure</label>
                        <select 
                            value={form.unit} 
                            onChange={handleChange('unit')}
                            className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                        >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-px bg-[var(--border)]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                            <DollarSign size={14}/> Pricing & Supply
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <AppInput label="Cost Price" type="number" step="0.01" value={form.purchasePrice} onChange={handleChange('purchasePrice')} required />
                            <AppInput label="Sale Price" type="number" step="0.01" value={form.salePrice} onChange={handleChange('salePrice')} required />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Preferred Distributor</label>
                            <select 
                                value={form.distributorId} 
                                onChange={handleChange('distributorId')}
                                className="w-full px-4 py-2.5 bg-[var(--bg-app)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]"
                            >
                                <option value="">Direct Supply</option>
                                {distributors.map(d => <option key={d.distributorId} value={d.distributorId}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14}/> Product Image
                        </h4>
                        <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                            <div className="w-20 h-20 rounded-lg bg-[var(--bg-app)] flex items-center justify-center overflow-hidden border border-[var(--border)]">
                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon className="text-[var(--text-muted)] opacity-30" />}
                            </div>
                            <label className="cursor-pointer">
                                <span className="text-xs font-bold text-[var(--primary)] hover:underline">Click to upload</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImg} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-[var(--border)]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppInput label="Min Stock Level" type="number" value={form.minStockLevel} onChange={handleChange('minStockLevel')} />
                    <AppInput label="Expiry Date" type="date" value={form.expiryDate} onChange={handleChange('expiryDate')} />
                </div>
            </div>
        </AppModal>
    );
}
