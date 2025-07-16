import { Venue } from '../../types.ts';

export const initialVenueData: Venue = {
    id: '',
    name: '',
    isVirtual: false,
    status: 'Potential',
    address: { street: '', city: '', province: 'MB', postalCode: '', country: 'Canada' },
    capacity: 0,
    url: '',
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    defaultCostType: 'free',
    defaultCost: 0,
    defaultCostPeriod: 'per_day',
    createdAt: '',
    updatedAt: '',
};
