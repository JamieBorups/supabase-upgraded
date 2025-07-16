import { TaskStatus, WorkType, TaskType, ProjectStatus, BudgetItemStatus, TaskSortOption, TaskStatusFilter, ActivitySortOption, ActivityStatusFilter, DateRangeFilter } from '../types.ts';

// --- OPTIONS FOR SELECTS AND CHECKBOXES ---

export const PROVINCES = [
    { value: 'Select', label: 'Select a province/territory' },
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
];

export const AVAILABILITY_OPTIONS = [
    { value: 'Select', label: 'Select availability' },
    { value: 'Full Time', label: 'Full Time' },
    { value: 'Part Time', label: 'Part Time' },
    { value: 'Contract', label: 'Contract' },
];

// Project Information
export const ARTISTIC_DISCIPLINES = [
  { value: 'craft', label: 'Craft' },
  { value: 'dance', label: 'Dance' },
  { value: 'inter-arts', label: 'Inter-Arts' },
  { value: 'literary', label: 'Literary Arts' },
  { value: 'media', label: 'Media Arts' },
  { value: 'music', label: 'Music' },
  { value: 'theatre', label: 'Theatre' },
  { value: 'visual', label: 'Visual Arts' },
  { value: 'other', label: 'Other' },
];

export const CRAFT_GENRES = [{ value: 'fibre', label: 'Fibre art' }, { value: 'ceramics', label: 'Ceramics' }, { value: 'glass', label: 'Glass' }, { value: 'metal', label: 'Metal' }, { value: 'wood', label: 'Wood' }, { value: 'other', label: 'Other' }];
export const DANCE_GENRES = [{ value: 'ballet', label: 'Ballet' }, { value: 'contemporary', label: 'Contemporary' }, { value: 'hip-hop', label: 'Hip hop' }, { value: 'indigenous-dance', label: 'Indigenous dance' }, { value: 'jazz', label: 'Jazz' }, { value: 'powwow', label: 'Powwow' }, { value: 'traditional-folk', label: 'Traditional/folk' }, { value: 'other', label: 'Other' }];
export const LITERARY_GENRES = [{ value: 'fiction', label: 'Fiction' }, { value: 'non-fiction', label: 'Non-fiction' }, { value: 'playwriting', label: 'Playwriting' }, { value: 'poetry', label: 'Poetry' }, { value: 'spoken-word', label: 'Spoken word' }, { value: 'storytelling', label: 'Storytelling' }, { value: 'other', label: 'Other' }];
export const MEDIA_GENRES = [{ value: 'animation', label: 'Animation' }, { value: 'documentary', label: 'Documentary' }, { value: 'experimental', label: 'Experimental' }, { value: 'film', label: 'Film' }, { value: 'holography', label: 'Holography' }, { value: 'interactive-media', label: 'Interactive media' }, { value: 'media-installation', label: 'Media installation' }, { value: 'new-media', label: 'New media' }, { value: 'radiophony-sound-art', label: 'Radiophony/sound art' }, { value: 'video', label: 'Video' }, { value: 'other', label: 'Other' }];
export const MUSIC_GENRES = [{ value: 'blues', label: 'Blues' }, { value: 'childrens', label: "Children's" }, { value: 'classical', label: 'Classical' }, { value: 'contemporary', label: 'Contemporary' }, { value: 'country', label: 'Country' }, { value: 'electronic', label: 'Electronic' }, { value: 'experimental', label: 'Experimental' }, { value: 'folk', label: 'Folk' }, { value: 'hip-hop', label: 'Hip hop' }, { value: 'indigenous', label: 'Indigenous' }, { value: 'jazz', label: 'Jazz' }, { value: 'pop', label: 'Pop' }, { value: 'rock', label: 'Rock' }, { value: 'roots', label: 'Roots' }, { value: 'sound-art', label: 'Sound art' }, { value: 'traditional', label: 'Traditional' }, { value: 'world', label: 'World' }, { value: 'other', label: 'Other' }];
export const THEATRE_GENRES = [{ value: 'collective-creation', label: 'Collective creation' }, { value: 'contemporary', label: 'Contemporary' }, { value: 'experimental', label: 'Experimental' }, { value: 'indigenous-theatre', label: 'Indigenous theatre' }, { value: 'mime', label: 'Mime' }, { value: 'multidisciplinary', label: 'Multidisciplinary' }, { value: 'musical-theatre', label: 'Musical theatre' }, { value: 'puppetry', label: 'Puppetry' }, { value: 'tya', label: 'Theatre for Young Audiences (TYA)' }, { value: 'traditional', label: 'Traditional' }, { value: 'other', label: 'Other' }];
export const VISUAL_ARTS_GENRES = [{ value: 'drawing', label: 'Drawing' }, { value: 'installation', label: 'Installation' }, { value: 'painting', label: 'Painting' }, { value: 'performance-art', label: 'Performance art' }, { value: 'printmaking', label: 'Printmaking' }, { value: 'public-art', label: 'Public art' }, { value: 'sculpture', label: 'Sculpture' }, { value: 'other', label: 'Other' }];

export const ACTIVITY_TYPES = [
  { value: 'Select', label: 'Select...' },
  { value: 'creation', label: 'Creation' },
  { value: 'production', label: 'Production' },
  { value: 'public presentation', label: 'Public presentation' },
  { value: 'training', label: 'Training' },
  { value: 'workshop', label: 'Workshop' },
];

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Terminated', label: 'Terminated' },
];

// Budget
export const BUDGET_ITEM_STATUS_OPTIONS: { value: BudgetItemStatus; label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Denied', label: 'Denied' },
];

// Tasks
export const TASK_STATUSES: { value: TaskStatus | string; label: string }[] = [
    { value: 'Backlog', label: 'Backlog' },
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
];

export const WORK_TYPES: { value: WorkType; label: string }[] = [
    { value: 'Paid', label: 'Paid' },
    { value: 'In-Kind', label: 'In-Kind' },
    { value: 'Volunteer', label: 'Volunteer' },
];

export const TASK_TYPES: { value: TaskType, label: string }[] = [
    { value: 'Time-Based', label: 'Time-Based (Track Hours)' },
    { value: 'Milestone', label: 'Milestone (Checklist Item)' },
];

export const TASK_SORT_OPTIONS: { value: TaskSortOption; label: string }[] = [
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'assignee', label: 'Assignee' },
];

export const TASK_STATUS_FILTER_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'dueThisWeek', label: 'Due This Week' },
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
];

// Activities
export const ACTIVITY_SORT_OPTIONS: { value: ActivitySortOption; label: string }[] = [
    { value: 'date-desc', label: 'Date (Newest First)' },
    { value: 'date-asc', label: 'Date (Oldest First)' },
    { value: 'updatedAt', label: 'Last Updated' },
];

export const ACTIVITY_STATUS_FILTER_OPTIONS: { value: ActivityStatusFilter; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
];

// Other
export const DATE_RANGE_FILTER_OPTIONS: { value: DateRangeFilter, label: string }[] = [
    { value: 'all', label: 'All Time'},
    { value: 'last7days', label: 'Last 7 Days'},
    { value: 'last30days', label: 'Last 30 Days'},
    { value: 'thisMonth', label: 'This Month'},
];

// Reports
export const PEOPLE_INVOLVED_OPTIONS = [
    { value: 'indigenous', label: '... Indigenous (First Nations, Métis, Inuit)' },
    { value: 'racialized', label: '... racialized persons' },
    { value: 'deaf-disability', label: '... Deaf persons, persons with disabilities' },
    { value: '2slgbtqia', label: '... 2SLGBTQIA+ persons' },
    { value: 'francophone', label: '... francophones' },
];

export const GRANT_ACTIVITIES_OPTIONS = [
    { value: 'regional-areas', label: '... took place in regional areas (outside of Winnipeg)' },
    { value: 'northern-areas', label: '... took place in northern areas' },
    { value: 'youth', label: '... engaged youth (under 25)' },
    { value: 'community-arts', label: '... involved community arts / social engagement practices' },
    { value: 'environmental-themes', label: '... explored environmental or climate change themes' },
];

export const IMPACT_QUESTIONS = [
    { id: 'q1', label: 'Without this grant, working on this project would not have been possible' },
    { id: 'q2', label: 'As a result of the activities funded by this grant, I am thinking more clearly about my artistic practice' },
    { id: 'q3', label: 'This grant has allowed me to (further) develop my artistic skills', instructions: 'This may include improving existing skills and learning new skills' },
    { id: 'q4', label: 'This grant provided an opportunity to experiment, explore, and take artistic risk' },
    { id: 'q5', label: 'My artistic career will benefit and/or has already benefited from this grant' },
    { id: 'q6', label: 'This grant provided an opportunity for artistic collaboration that would not have been possible otherwise' },
    { id: 'q7', label: 'This grant made it possible to deepen connections with past collaborators' },
    { id: 'q8', label: 'This grant made it possible to build relationships with new collaborators' },
    { id: 'q9', label: 'This grant created further artistic opportunities for me', instructions: 'Consider, for instance: Were any meaningful connections developed with other artists or organizations? Did you gain access to additional funding and/or other resources?' },
    { id: 'q10', label: 'This project created new opportunities for the participants involved', instructions: 'Consider, for instance: increased ability for creative self-expression, access to new skills' },
    { id: 'q11', label: 'This project created new opportunities for the community in which it took place', instructions: 'Consider, for instance: providing a voice to an underserved and/or marginalized communities; providing an artistic outlet to communities facing a barrier, creating a platform for meaningful community exchange and engagement, strengthening community bonds' },
];

export const IMPACT_OPTIONS = [
    { value: '1', label: '1 - Strongly Disagree' },
    { value: '2', label: '2 - Disagree' },
    { value: '3', label: '3 - Neutral' },
    { value: '4', label: '4 - Agree' },
    { value: '5', label: '5 - Strongly Agree' },
    { value: 'na', label: "Does not apply" },
];