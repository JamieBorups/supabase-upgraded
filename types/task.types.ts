

import { TaskStatus, TaskType, WorkType, ActivityStatus } from './shared.types';

export interface Task {
    id: string;
    taskCode: string;
    projectId: string;
    title: string;
    description: string;
    assignedMemberId: string | null;
    status: TaskStatus | string;
    startDate: string | null;
    dueDate: string | null;
    taskType: TaskType;
    parentTaskId: string | null;
    isComplete: boolean;
    estimatedHours: number;
    actualHours: number;
    budgetItemId: string | null; 
    workType: WorkType;
    hourlyRate: number;
    updatedAt: string | null;
    orderBy: number;
}

export interface Activity {
    id: string;
    taskId: string;
    memberId: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    hours: number;
    status: ActivityStatus;
    createdAt: string;
    updatedAt: string;
}

export interface DirectExpense {
  id: string;
  projectId: string;
  budgetItemId: string;
  description: string;
  amount: number;
  date: string;
}