import { TicketType } from '../../types.ts';

export const initialTicketTypeData: Omit<TicketType, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    description: '',
    defaultPrice: 0,
    isFree: false,
};
