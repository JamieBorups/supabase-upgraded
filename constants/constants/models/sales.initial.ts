import { SalesSettings, SalesTransaction } from '../../types.ts';

export const initialSalesSettings: SalesSettings = {
    pstRate: 0.07,
    gstRate: 0.05,
};

export const initialSalesTransaction: Omit<SalesTransaction, 'id' | 'createdAt'> = {
    saleSessionId: '',
    notes: '',
    subtotal: 0,
    taxes: 0,
    total: 0,
    items: [],
};
