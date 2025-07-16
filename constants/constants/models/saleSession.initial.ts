import { SaleSession } from '../../types.ts';

export const initialSaleSession: Omit<SaleSession, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    expectedRevenue: 0,
    organizerType: 'internal',
    associationType: null,
    projectId: null,
    eventId: null,
    partnerName: null,
    partnerContactId: null,
};
