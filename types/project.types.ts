import { ProjectStatus, BudgetItemStatus } from './shared.types';

export interface Collaborator {
    memberId: string;
    role: string;
}

export interface BudgetItem {
    id: string;
    source: string;
    description: string;
    amount: number;
    actualAmount?: number;
    status?: BudgetItemStatus;
}

export interface TicketRevenue {
    actualRevenue?: number;
}

export interface DetailedBudget {
    revenues: {
        grants: BudgetItem[];
        tickets: TicketRevenue;
        sales: BudgetItem[];
        fundraising: BudgetItem[];
        contributions: BudgetItem[];
    };
    expenses: {
        professionalFees: BudgetItem[];
        travel: BudgetItem[];
        production: BudgetItem[];
        administration: BudgetItem[];
        research: BudgetItem[];
        professionalDevelopment: BudgetItem[];
    };
}

export type ExpenseCategoryType = keyof DetailedBudget['expenses'];

export interface FormData {
    id: string;
    projectTitle: string;
    status: ProjectStatus | string;
    artisticDisciplines: string[];
    craftGenres: string[];
    danceGenres: string[];
    literaryGenres: string[];
    mediaGenres: string[];
    musicGenres: string[];
    theatreGenres: string[];
    visualArtsGenres: string[];
    otherArtisticDisciplineSpecify: string;
    projectStartDate: string;
    projectEndDate: string;
    activityType: string;
    background: string;
    projectDescription: string;
    audience: string;
    paymentAndConditions: string;
    permissionConfirmationFiles: File[];
    schedule: string;
    culturalIntegrity: string;
    communityImpact: string;
    organizationalRationale: string;
    artisticDevelopment: string;
    artisticAlignmentAndDevelopment?: string;
    additionalInfo: string;
    whoWillWork: string;
    howSelectionDetermined: string;
    collaboratorDetails: Collaborator[];
    budget: DetailedBudget;
    estimatedSales?: number;
    estimatedSalesDate?: string;
    actualSales?: number;
    actualSalesDate?: string;
    imageUrl?: string;
}