
import { produce } from 'immer';
import { AppState, Action, InventoryItem, InventoryCategory, SaleSession, SaleListing, SalesTransaction, ItemList } from '../../types';

export const salesInitialState: {
    inventoryItems: InventoryItem[],
    inventoryCategories: InventoryCategory[],
    saleSessions: SaleSession[],
    saleListings: SaleListing[],
    salesTransactions: SalesTransaction[],
    itemLists: ItemList[],
} = {
    inventoryItems: [],
    inventoryCategories: [],
    saleSessions: [],
    saleListings: [],
    salesTransactions: [],
    itemLists: [],
};

export const salesReducer = (state: AppState, action: Action): Partial<AppState> => {
    switch (action.type) {
        case 'SET_INVENTORY_ITEMS':
            return { inventoryItems: action.payload };
        case 'ADD_INVENTORY_ITEM':
            return { inventoryItems: [...state.inventoryItems, action.payload] };
        case 'UPDATE_INVENTORY_ITEM':
            return { inventoryItems: state.inventoryItems.map(i => i.id === action.payload.id ? action.payload : i) };
        case 'ADJUST_INVENTORY_STOCK':
            return {
                inventoryItems: state.inventoryItems.map(item => {
                    if (item.id === action.payload.itemId && item.trackStock) {
                        return { ...item, currentStock: item.currentStock + action.payload.quantityDelta };
                    }
                    return item;
                })
            };
        case 'DELETE_INVENTORY_ITEM':
            return { inventoryItems: state.inventoryItems.filter(i => i.id !== action.payload) };

        case 'SET_INVENTORY_CATEGORIES':
            return { inventoryCategories: action.payload };
        case 'ADD_INVENTORY_CATEGORY':
            return { inventoryCategories: [...state.inventoryCategories, action.payload] };
        case 'UPDATE_INVENTORY_CATEGORY':
            return { inventoryCategories: state.inventoryCategories.map(c => c.id === action.payload.id ? action.payload : c) };
        case 'DELETE_INVENTORY_CATEGORY':
            return {
                inventoryCategories: state.inventoryCategories.filter(c => c.id !== action.payload),
                inventoryItems: state.inventoryItems.map(item =>
                    item.categoryId === action.payload ? { ...item, categoryId: null } : item
                )
            };

        case 'SET_SALE_SESSIONS':
            return { saleSessions: action.payload };
        case 'ADD_SALE_SESSION':
            return { saleSessions: [action.payload, ...state.saleSessions] };
        case 'UPDATE_SALE_SESSION':
            return { saleSessions: state.saleSessions.map(s => s.id === action.payload.id ? action.payload : s) };
        case 'DELETE_SALE_SESSION':
            return { saleSessions: state.saleSessions.filter(s => s.id !== action.payload) };
            
        case 'SET_SALES_TRANSACTIONS':
            return { salesTransactions: action.payload };
        case 'ADD_SALES_TRANSACTION':
            const newInventory = produce(state.inventoryItems, draft => {
                action.payload.items.forEach(txItem => {
                    const inventoryItem = draft.find(invItem => invItem.id === txItem.inventoryItemId);
                    if (inventoryItem && inventoryItem.trackStock) {
                        inventoryItem.currentStock -= txItem.quantity;
                    }
                });
            });
            return {
                salesTransactions: [...state.salesTransactions, action.payload],
                inventoryItems: newInventory
            };

        case 'SET_ITEM_LISTS':
            return { itemLists: action.payload };
        case 'ADD_ITEM_LIST':
            return { itemLists: [...state.itemLists, action.payload] };
        case 'UPDATE_ITEM_LIST':
            return { itemLists: state.itemLists.map(m => m.id === action.payload.id ? action.payload : m) };
        case 'DELETE_ITEM_LIST':
            return { itemLists: state.itemLists.filter(m => m.id !== action.payload) };

        case 'SET_SALE_LISTINGS':
            return { saleListings: action.payload };
        case 'ADD_SALE_LISTING':
            return { saleListings: [...state.saleListings, action.payload] };
        case 'DELETE_SALE_LISTING':
            return {
                saleListings: state.saleListings.filter(l =>
                    !(l.saleSessionId === action.payload.saleSessionId && l.inventoryItemId === action.payload.inventoryItemId)
                )
            };

        default:
            return {};
    }
};