
export const NOHFC_BUDGET_CATEGORIES = [
    { value: '', label: 'Select category...' },
    { value: 'Capital Costs', label: 'Capital Costs' },
    { value: 'Salaries and Wages', label: 'Salaries and Wages' },
    { value: 'Administrative Costs', label: 'Administrative Costs' },
    { value: 'Marketing Costs', label: 'Marketing Costs' },
    { value: 'Other Costs', label: 'Other Costs' },
];

export const NOHFC_SECTIONS = [
    { section: 1, key: 'question_1a', label: '1a. Organization Description', limit: 1500, limitType: 'char' as const },
    { section: 1, key: 'question_1b', label: '1b. Enhanced Organization Description', limit: 1000, limitType: 'word' as const },
    { section: 1, key: 'question_1c', label: '1c. Why is the project being undertaken?', limit: 1500, limitType: 'char' as const },
    { section: 1, key: 'question_1d', label: '1d. Enhanced: Why is the project being undertaken?', limit: 1000, limitType: 'word' as const },
    { section: 1, key: 'question_1e', label: '1e. Is the project identified in a planning process such as a current community or organizational plan? Please explain.', limit: 1500, limitType: 'char' as const },
    { section: 1, key: 'question_1f', label: '1f. Enhanced: Is the project identified in a planning process?', limit: 1000, limitType: 'word' as const },
    { section: 1, key: 'question_2a', label: '2a. What are the key activities that will be undertaken to complete the project?', limit: 1500, limitType: 'char' as const },
    { section: 1, key: 'question_2b', label: '2b. Enhanced: Key project activities', limit: 1000, limitType: 'word' as const },
    { section: 2, key: 'question_3a', label: '3a. What are the expected outcomes and benefits of the project?', limit: 1500, limitType: 'char' as const },
    { section: 2, key: 'question_3b', label: '3b. Enhanced: Expected outcomes and benefits', limit: 1000, limitType: 'word' as const },
    { section: 3, key: 'question_4a', label: '4a. Please identify the technical, managerial and financial capacity for implementing the project:', limit: 1500, limitType: 'char' as const },
    { section: 3, key: 'question_4b', label: '4b. Enhanced: Capacity for implementing', limit: 1000, limitType: 'word' as const },
    { section: 3, key: 'question_5a', label: '5a. Please identify the technical, managerial and financial capacity for sustaining the facility:', limit: 1500, limitType: 'char' as const },
    { section: 3, key: 'question_5b', label: '5b. Enhanced: Capacity for sustaining', limit: 1000, limitType: 'word' as const },
    { section: 3, key: 'question_6a', label: '6a. Please explain how the project builds on and optimizes the capacity and efficiency of existing infrastructure.', limit: 1500, limitType: 'char' as const },
    { section: 3, key: 'question_6b', label: '6b. Enhanced: Optimizing existing infrastructure', limit: 1000, limitType: 'word' as const },
    { section: 4, key: 'question_7a', label: '7a. Why is NOHFC funding necessary for the completion of the project?', limit: 1500, limitType: 'char' as const },
    { section: 4, key: 'question_7b', label: '7b. Enhanced: Need for NOHFC funding', limit: 1000, limitType: 'word' as const },
    { section: 4, key: 'question_8a', label: '8a. In addition to the funding sources identified herein , have you approached or applied to any other funding programs?', limit: 1500, limitType: 'char' as const },
    { section: 4, key: 'question_8b', label: '8b. Enhanced: Other funding applications', limit: 1000, limitType: 'word' as const },
];
