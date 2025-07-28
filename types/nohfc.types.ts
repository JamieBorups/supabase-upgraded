
export interface NohfcBudgetItem {
    id: string;
    application_id?: string;
    category: string;
    itemDescription: string;
    costBreakdown: string;
    requestedAmount: number;
    justification: string;
}

export interface NohfcApplication {
    id: string;
    createdAt: string;
    updatedAt: string;
    projectId: string | null;
    infrastructureId: string | null;
    title: string;

    // Section 1
    question_1a: string;
    question_1b: string;
    question_1c: string;
    question_1d: string;
    question_1e: string;
    question_1f: string;
    question_2a: string;
    question_2b: string;

    // Section 2
    question_3a: string;
    question_3b: string;

    // Section 3
    question_4a: string;
    question_4b: string;
    question_5a: string;
    question_5b: string;
    question_6a: string;
    question_6b: string;

    // Section 4
    question_7a: string;
    question_7b: string;
    question_8a: string;
    question_8b: string;
    
    // Budget
    budgetItems: NohfcBudgetItem[];
}