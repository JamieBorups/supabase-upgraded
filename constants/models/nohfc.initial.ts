
import { NohfcApplication } from '../../types';

export const initialNohfcApplicationData: Omit<NohfcApplication, 'id'> = {
    createdAt: '',
    updatedAt: '',
    projectId: null,
    infrastructureId: null,
    title: '',

    // Section 1
    question_1a: '',
    question_1b: '',
    question_1c: '',
    question_1d: '',
    question_1e: '',
    question_1f: '',
    question_2a: '',
    question_2b: '',

    // Section 2
    question_3a: '',
    question_3b: '',

    // Section 3
    question_4a: '',
    question_4b: '',
    question_5a: '',
    question_5b: '',
    question_6a: '',
    question_6b: '',

    // Section 4
    question_7a: '',
    question_7b: '',
    question_8a: '',
    question_8b: '',

    // Budget
    budgetItems: [],
};