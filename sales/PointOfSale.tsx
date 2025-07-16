
import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { InventoryItem, SalesTransaction, SalesTransactionItem, SaleSession } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import * as api from '../../services/api';

type CartItem = {
    itemId: string;
    name: string;
    quantity: number;
    salePrice: number;
    isVoucher: boolean;
};

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

interface PointOfSaleProps {
    saleSession: SaleSession;
}

const PointOfSale: React.FC<PointOfSaleProps> = ({ saleSession }) => {
    const { state, dispatch, notify } = useAppContext();
    const { inventoryItems, inventoryCategories, settings, saleListings } = state;
    const { sales: salesSettings } = settings;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const [notes, setNotes] = useState('');

    const itemMap = useMemo(() => new Map(inventoryItems.map(i => [i.id, i])), [inventoryItems]);

    const availableItems = useMemo(() => {
        const itemIdsForSession = new Set(
            saleListings
                .filter(l => l.saleSessionId === saleSession.id)
                .map(l => l.inventoryItemId)
        );

        return inventoryItems.filter(item => {
            if (!itemIdsForSession.has(item.id)) return false;

            const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = !categoryFilter || item.categoryId === categoryFilter;
            
            return searchMatch && categoryMatch;
        });
    }, [inventoryItems, searchTerm, categoryFilter, saleSession.id, saleListings]);
    
    const addToCart = (item: InventoryItem) => {
        const existingCartItem = cart.find(cartItem => cartItem.itemId === item.id);
        const itemFromState = itemMap.get(item.id);

        if(!itemFromState) return;

        const availableStock = itemFromState.currentStock;
        const quantityInCart = existingCartItem?.quantity || 0;

        if (itemFromState.trackStock && availableStock <= quantityInCart) {
            notify(`No more stock available for "${item.name}".`, 'warning');
            return;
        }

        if (existingCartItem) {
            updateQuantity(item.id, existingCartItem.quantity + 1);
        } else {
            setCart(currentCart => [
                ...currentCart,
                { itemId: item.id, name: item.name, quantity: 1, salePrice: item.salePrice, isVoucher: false }
            ]);
        }
    };
    
    const updateQuantity = (itemId: string, newQuantity: number) => {
        const itemFromState = itemMap.get(itemId);
        if(!itemFromState) return;
        
        if (newQuantity < 0) return; // Do not allow negative quantities
        
        if (itemFromState.trackStock && newQuantity > itemFromState.currentStock) {
            notify(`Not enough stock for "${itemFromState.name}". Only ${itemFromState.currentStock} available.`, 'warning');
            return;
        }
        
        if (newQuantity === 0) {
            setCart(cart.filter(i => i.itemId !== itemId));
        } else {
            setCart(produce(draft => {
                const item = draft.find(i => i.itemId === itemId);
                if (item) {
                    item.quantity = newQuantity;
                }
            }));
        }
    };


    const toggleVoucher = (itemId: string) => {
        setCart(produce(draft => {
            const item = draft.find(i => i.itemId === itemId);
            if (item) {
                item.isVoucher = !item.isVoucher;
            }
        }));
    };

    const cartCalculations = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => {
            return item.isVoucher ? sum : sum + item.quantity * item.salePrice;
        }, 0);
        
        const taxes = subtotal * (salesSettings.gstRate + salesSettings.pstRate);
        const total = subtotal + taxes;
        return { subtotal, taxes, total };
    }, [cart, salesSettings]);
    
    const handleClearCart = () => {
        setCart([]);
        setNotes('');
        notify('Cart cleared.', 'info');
    };

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            notify('Cart is empty.', 'warning');
            return;
        }
        setIsCompleting(true);
        try {
            const transactionItems: Omit<SalesTransactionItem, 'id' | 'transactionId'>[] = cart.map(item => ({
                inventoryItemId: item.itemId,
                quantity: item.quantity,
                pricePerItem: item.isVoucher ? 0 : item.salePrice,
                itemTotal: item.isVoucher ? 0 : item.quantity * item.salePrice,
                isVoucherRedemption: item.isVoucher,
            }));
            
            const transaction: Omit<SalesTransaction, 'id' | 'createdAt' | 'items' | 'saleSessions'> = {
                saleSessionId: saleSession.id,
                notes,
                subtotal: cartCalculations.subtotal,
                taxes: cartCalculations.taxes,
                total: cartCalculations.total,
            };
            
            // The API call now handles the authoritative stock update.
            const newTx = await api.addSalesTransaction(transaction, transactionItems);
            
            // The reducer now handles both adding the transaction AND updating the local stock state.
            dispatch({ type: 'ADD_SALES_TRANSACTION', payload: newTx });
            
            notify('Sale completed successfully!', 'success');
            setCart([]);
            setNotes('');
        } catch (error: any) {
            notify(`Error completing sale: ${error.message}`, 'error');
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Item Selection */}
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} options={[{value: '', label: 'All Categories'}, ...inventoryCategories.map(c => ({ value: c.id, label: c.name }))]} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto pr-2">
                    {availableItems.map(item => {
                        const quantityInCart = cart.find(ci => ci.itemId === item.id)?.quantity || 0;
                        const remainingStock = item.currentStock - quantityInCart;
                        const disabled = item.trackStock && remainingStock <= 0;
                        
                        return (
                            <button key={item.id} onClick={() => addToCart(item)} disabled={disabled} className={`p-3 border rounded-lg text-left bg-white hover:border-teal-500 hover:shadow-md transition-all disabled:bg-slate-100 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-slate-200`}>
                                <p className="font-semibold text-slate-800">{item.name}</p>
                                <p className="text-sm text-teal-600 font-bold">{formatCurrency(item.salePrice)}</p>
                                <p className={`text-xs mt-1 ${item.trackStock && item.currentStock < 10 ? 'text-orange-600 font-semibold' : 'text-slate-500'}`}>
                                    {item.trackStock ? `${item.currentStock} in stock` : 'Unlimited Stock'}
                                </p>
                            </button>
                        )
                    })}
                    {availableItems.length === 0 && (
                        <p className="col-span-full text-center text-slate-500 py-10">No items available for this session.</p>
                    )}
                </div>
            </div>

            {/* Cart & Checkout */}
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col h-[75vh]">
                <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Current Sale</h3>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
                    {cart.map(item => (
                        <div key={item.itemId} className="flex items-center gap-3 bg-white p-2 rounded-md shadow-sm">
                           <div className="flex-grow">
                                <p className={`font-semibold text-sm text-slate-800 ${item.isVoucher ? 'line-through' : ''}`}>{item.name}</p>
                                <p className={`text-xs text-slate-500 ${item.isVoucher ? 'line-through' : ''}`}>{formatCurrency(item.salePrice)}</p>
                                <div className="mt-1">
                                    <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                                        <input type="checkbox" checked={item.isVoucher} onChange={() => toggleVoucher(item.itemId)} className="h-3 w-3 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                                        <span className="ml-1.5">Voucher</span>
                                    </label>
                                </div>
                           </div>
                           <Input type="number" min="0" value={item.quantity} onChange={e => updateQuantity(item.itemId, parseInt(e.target.value) || 0)} className="w-16 text-center" />
                           <p className="w-20 text-right font-bold text-sm text-slate-900">{formatCurrency(item.isVoucher ? 0 : item.quantity * item.salePrice)}</p>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-slate-500 italic py-10">Cart is empty.</p>}
                </div>
                <div className="flex-shrink-0 pt-4 border-t space-y-2">
                    <FormField label="Notes (Optional)" htmlFor="pos_notes" className="mb-0">
                        <Input id="pos_notes" value={notes} onChange={e => setNotes(e.target.value)} />
                    </FormField>
                    
                     <div className="space-y-1 text-sm pt-2">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(cartCalculations.subtotal)}</span></div>
                        <div className="flex justify-between"><span>Taxes:</span><span>{formatCurrency(cartCalculations.taxes)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-1 mt-1"><span>Total:</span><span>{formatCurrency(cartCalculations.total)}</span></div>
                    </div>
                     <div className="flex gap-2 mt-4">
                        <button onClick={handleClearCart} className="w-1/3 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Clear</button>
                        <button onClick={handleCompleteSale} disabled={isCompleting || cart.length === 0} className="w-2/3 px-4 py-3 text-lg font-bold text-white bg-teal-600 rounded-md shadow-lg hover:bg-teal-700 disabled:bg-slate-400">
                           {isCompleting ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointOfSale;
