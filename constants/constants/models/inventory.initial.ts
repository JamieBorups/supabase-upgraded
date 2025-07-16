import { InventoryItem, InventoryCategory } from '../../types.ts';

export const initialInventoryCategory: Omit<InventoryCategory, 'id' | 'createdAt'> = {
    name: '',
};

export const initialInventoryItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
    categoryId: null,
    name: '',
    description: '',
    sku: '',
    costPrice: 0,
    salePrice: 0,
    currentStock: 0,
    trackStock: true,
};
