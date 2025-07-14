import { Task } from '../../types.ts';

export const initialTaskData: Task = {
    id: '',
    taskCode: '',
    projectId: '',
    title: '',
    description: '',
    assignedMemberId: null,
    status: 'To Do',
    startDate: null,
    dueDate: null,
    taskType: 'Time-Based',
    parentTaskId: null,
    isComplete: false,
    estimatedHours: 0,
    actualHours: 0,
    budgetItemId: null, 
    workType: 'Volunteer',
    hourlyRate: 20,
    updatedAt: null,
    orderBy: 0,
};
