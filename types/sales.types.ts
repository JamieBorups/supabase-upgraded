
export interface SaleSession {
    id: string;
    name: string;
    expectedRevenue: number;
    createdAt: string;
    updatedAt: string;
    organizerType: 'internal' | 'partner';
    associationType: 'event' | 'project' | 'general' | null;
    projectId: string | null;
    eventId: string | null;
    partnerName: string | null;
    partnerContactId: string | null;
}
export interface SalesSettings {
    pstRate: number;
    gstRate: number;
}
export interface InventoryCategory {
    id: string;
    name: string;
    createdAt: string;
}
export interface InventoryItem {
    id: string;
    categoryId: string | null;
    createdAt: string;
    updatedAt: string;
    name: string;
    description: string;
    sku: string;
    costPrice: number;
    salePrice: number;
    currentStock: number;
    trackStock: boolean;
}
export interface SaleListing {
    id: string;
    saleSessionId: string;
    inventoryItemId: string;
}
export interface SalesTransactionItem {
    id: string;
    transactionId: string;
    inventoryItemId: string;
    quantity: number;
    pricePerItem: number;
    itemTotal: number;
    isVoucherRedemption: boolean;
}
export interface SalesTransaction {
    id: string;
    saleSessionId: string;
    createdAt: string;
    notes: string;
    subtotal: number;
    taxes: number;
    total: number;
    items: SalesTransactionItem[];
    saleSessions?: SaleSession;
}

export interface ItemList {
    id: string;
    name: string;
    eventId: string | null;
    itemOrder: string[];
    createdAt: string;
    updatedAt: string;
}
