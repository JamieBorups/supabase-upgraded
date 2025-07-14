
import { supabase } from '../../supabase.ts';
import { InventoryCategory, InventoryItem, SalesTransaction, SalesTransactionItem, SaleSession, ItemList, SaleListing } from '../../types.ts';
import { mapObjectToSnakeCase, mapObjectToCamelCase, handleResponse } from './utils';

export const getInventoryCategories = async (): Promise<InventoryCategory[]> => mapObjectToCamelCase(handleResponse(await supabase.from('inventory_categories').select('*')));
export const addInventoryCategory = async (cat: InventoryCategory): Promise<InventoryCategory> => {
    const { id, ...rest } = cat;
    return mapObjectToCamelCase(handleResponse(await supabase.from('inventory_categories').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateInventoryCategory = async (id: string, cat: Partial<InventoryCategory>): Promise<InventoryCategory> => mapObjectToCamelCase(handleResponse(await supabase.from('inventory_categories').update(mapObjectToSnakeCase(cat)).eq('id', id).select().single()));
export const deleteInventoryCategory = async (id: string): Promise<void> => handleResponse(await supabase.from('inventory_categories').delete().eq('id', id));

export const getInventoryItems = async (): Promise<InventoryItem[]> => mapObjectToCamelCase(handleResponse(await supabase.from('inventory_items').select('*')));
export const addInventoryItem = async (item: InventoryItem): Promise<InventoryItem> => {
    const { id, ...rest } = item;
    return mapObjectToCamelCase(handleResponse(await supabase.from('inventory_items').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateInventoryItem = async (id: string, item: InventoryItem): Promise<InventoryItem> => mapObjectToCamelCase(handleResponse(await supabase.from('inventory_items').update(mapObjectToSnakeCase(item)).eq('id', id).select().single()));
export const deleteInventoryItem = async (id: string): Promise<void> => handleResponse(await supabase.from('inventory_items').delete().eq('id', id));

export const getSaleSessions = async (): Promise<SaleSession[]> => mapObjectToCamelCase(handleResponse(await supabase.from('sale_sessions').select('*')));
export const addSaleSession = async (session: SaleSession): Promise<SaleSession> => {
    const { id, ...rest } = session;
    return mapObjectToCamelCase(handleResponse(await supabase.from('sale_sessions').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateSaleSession = async (id: string, session: SaleSession): Promise<SaleSession> => mapObjectToCamelCase(handleResponse(await supabase.from('sale_sessions').update(mapObjectToSnakeCase(session)).eq('id', id).select().single()));
export const deleteSaleSession = async (id: string): Promise<void> => handleResponse(await supabase.from('sale_sessions').delete().eq('id', id));

export const getSaleListings = async (): Promise<SaleListing[]> => mapObjectToCamelCase(handleResponse(await supabase.from('sale_listings').select('*')));
export const addSaleListing = async (sessionId: string, itemId: string): Promise<SaleListing> => mapObjectToCamelCase(handleResponse(await supabase.from('sale_listings').insert({ sale_session_id: sessionId, inventory_item_id: itemId }).select().single()));
export const removeSaleListing = async (sessionId: string, itemId: string): Promise<void> => handleResponse(await supabase.from('sale_listings').delete().match({ sale_session_id: sessionId, inventory_item_id: itemId }));

export const getSalesTransactions = async (): Promise<SalesTransaction[]> => {
    const { data, error } = await supabase.from('sales_transactions').select('*, sales_transaction_items(*)');
    handleResponse({ data, error });
    return (data || []).map(tx => {
        const { sales_transaction_items, ...rest } = tx;
        const mappedTx = mapObjectToCamelCase(rest);
        mappedTx.items = mapObjectToCamelCase(sales_transaction_items);
        return mappedTx;
    });
};
export const addSalesTransaction = async (tx: Omit<SalesTransaction, 'id' | 'createdAt' | 'items'>, items: Omit<SalesTransactionItem, 'id' | 'transactionId'>[]): Promise<SalesTransaction> => {
    // 1. Insert transaction header
    const { data: txData, error: txError } = await supabase.from('sales_transactions').insert(mapObjectToSnakeCase(tx)).select().single();
    if (txError) throw new Error(txError.message);

    const transactionId = txData.id;

    try {
        // 2. Insert transaction items
        const itemsWithTxId = items.map(item => ({ ...item, transactionId }));
        const { data: itemsData, error: itemsError } = await supabase.from('sales_transaction_items').insert(itemsWithTxId.map(mapObjectToSnakeCase)).select();
        if (itemsError) throw new Error(itemsError.message);

        // 3. Decrement stock for each item
        for (const item of items) {
            const { data: inventoryItem, error: fetchItemError } = await supabase
                .from('inventory_items')
                .select('track_stock, current_stock')
                .eq('id', item.inventoryItemId)
                .single();

            if (fetchItemError) {
                console.error(`Could not fetch item ${item.inventoryItemId} to update stock.`);
                continue; 
            }

            if (inventoryItem && inventoryItem.track_stock) {
                const newStock = inventoryItem.current_stock - item.quantity;
                const { error: updateError } = await supabase
                    .from('inventory_items')
                    .update({ current_stock: newStock })
                    .eq('id', item.inventoryItemId);
                
                if (updateError) {
                    console.error(`Failed to update stock for item ${item.inventoryItemId}. Transaction ${transactionId} was successful but stock is now out of sync. Manual adjustment needed.`);
                }
            }
        }

        const mappedTx = mapObjectToCamelCase(txData);
        mappedTx.items = mapObjectToCamelCase(itemsData);
        return mappedTx;

    } catch (error) {
        console.error("Error during transaction item processing, attempting to roll back transaction header:", error);
        await supabase.from('sales_transactions').delete().eq('id', transactionId);
        throw error;
    }
};

export const getItemLists = async (): Promise<ItemList[]> => mapObjectToCamelCase(handleResponse(await supabase.from('item_lists').select('*')));
export const addItemList = async (menu: ItemList): Promise<ItemList> => {
    const { id, ...rest } = menu;
    return mapObjectToCamelCase(handleResponse(await supabase.from('item_lists').insert(mapObjectToSnakeCase(rest)).select().single()));
};
export const updateItemList = async (id: string, menu: ItemList): Promise<ItemList> => mapObjectToCamelCase(handleResponse(await supabase.from('item_lists').update(mapObjectToSnakeCase(menu)).eq('id', id).select().single()));
export const deleteItemList = async (id: string): Promise<void> => handleResponse(await supabase.from('item_lists').delete().eq('id', id));
