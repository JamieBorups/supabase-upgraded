
export type Page = 'home' | 'projects' | 'members' | 'tasks' | 'reports' | 'highlights' | 'media' | 'contacts' | 'events' | 'proposals' | 'sales' | 'settings' | 'importExport' | 'taskAssessor' | 'projectAssessor' | 'aiWorkshop' | 'schemaReport' | 'ecoStarWorkshop' | 'aiProjectGenerator' | 'userGuide' | 'interestCompatibility' | 'dbTest' | 'communityReach' | 'impactAssessment' | 'sdgAlignment' | 'frameworkForRecreation' | 'about' | 'researchPlanGenerator' | 'otf' | 'experienceHub' | 'autoGenerateJobs';
export type TabId = 'projectInfo' | 'collaborators' | 'budget';
export type ProjectViewTabId = 'info' | 'collaborators' | 'budget' | 'workplan' | 'insights' | 'externalContacts' | 'communityReach' | 'impactAssessment';
export type TaskManagerView = 'workplan' | 'tasks' | 'timesheet';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type ProjectStatus = 'Pending' | 'Active' | 'On Hold' | 'Completed' | 'Terminated';
export type DateRangeFilter = 'all' | 'last7days' | 'last30days' | 'thisMonth';
export type BudgetItemStatus = 'Pending' | 'Approved' | 'Denied';

export type SortDirection = 'asc' | 'desc';
export type TaskSortOption = 'updatedAt' | 'dueDate' | 'assignee';
export type TaskStatusFilter = 'all' | 'overdue' | 'dueThisWeek' | 'todo' | 'inProgress' | 'done';

export type ActivitySortOption = 'date-desc' | 'date-asc' | 'updatedAt';
export type ActivityStatusFilter = 'all' | 'pending' | 'approved';

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Done';
export type WorkType = 'Paid' | 'In-Kind' | 'Volunteer';
export type TaskType = 'Time-Based' | 'Milestone';

export type ActivityStatus = 'Pending' | 'Approved';

export type RRuleEndCondition = {
    type: 'count';
    value: number;
} | {
    type: 'date';
    value: string;
};

export type RecurrenceRule = {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0=SU, 1=MO, ..., 6=SA
  endCondition: RRuleEndCondition;
};

export interface Tab {
  id: TabId;
  label: string;
}

export interface FormFieldProps<T> {
  id: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  instructions?: React.ReactNode;
  placeholder?: string;
  options?: { value: string; label: string }[];
  wordLimit?: number;
  className?: string;
  ariaLabel?: string;
}
