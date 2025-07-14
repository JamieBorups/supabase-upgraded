import { ItemList } from '../../types.ts';

export const initialItemListData: Omit<ItemList, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    eventId: null,
    itemOrder: [],
};
