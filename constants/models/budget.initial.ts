import { DetailedBudget } from '../../types.ts';

export const initialBudget: DetailedBudget = {
    revenues: {
        grants: [],
        tickets: {
            actualRevenue: 0
        },
        sales: [],
        fundraising: [],
        contributions: [],
    },
    expenses: {
        professionalFees: [],
        travel: [],
        production: [],
        administration: [],
        research: [],
        professionalDevelopment: [],
    }
};
