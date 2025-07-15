
import {
    initialFormData,
    initialMemberData,
    initialTaskData,
    initialActivityData,
    initialReportData,
    initialVenueData,
    initialEventData,
    initialTicketTypeData,
    ARTISTIC_DISCIPLINES,
    PROVINCES,
    initialSettings,
    initialInventoryItem,
    initialSaleSession,
    initialItemListData,
    initialInventoryCategory,
    initialRecreationReportData
} from '../../../constants.ts';
import { Contact, Interaction, DirectExpense, Highlight, NewsRelease, TicketType, EventTicket, ProposalSnapshot, SalesTransaction, SaleListing, SalesTransactionItem, EcoStarReport, InterestCompatibilityReport, SdgAlignmentReport } from '../../../types.ts';

// Local initializers for models not in constants.ts
const initialHighlightData: Omit<Highlight, 'id'> = { projectId: '', title: '', url: '' };
const initialDirectExpenseData: Omit<DirectExpense, 'id'> = { projectId: '', budgetItemId: '', description: '', amount: 0, date: '' };
const initialNewsReleaseData: Omit<NewsRelease, 'id'> = {
    projectId: '', type: '', contactMemberId: '', headline: '', subhead: '', publishDate: '', publishedUrl: '',
    location: '', introduction: '', body: '', quotes: '', boilerplate: '', contactInfo: '', status: 'Draft',
    createdAt: '', updatedAt: ''
};
const initialEventTicketData: Omit<EventTicket, 'id'> = { eventId: '', ticketTypeId: '', price: 0, capacity: 0, soldCount: 0 };
const initialContactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
    firstName: '', lastName: '', email: '', phone: '', title: '', organization: '',
    contactType: '', associatedProjectIds: [],
    address: { street: '', city: '', province: 'MB', postalCode: '' },
    tags: [], notes: '',
};
const initialInteractionData: Omit<Interaction, 'id' | 'contactId'> = { date: '', type: 'Call', notes: '' };
const initialProposalSnapshotData: Omit<ProposalSnapshot, 'id'> = {
    projectId: '', createdAt: '', updatedAt: '', notes: '', projectData: initialFormData, tasks: [],
    calculatedMetrics: { projectedRevenue: 0, projectedAudience: 0, numberOfPresentations: 0, averageTicketPrice: 0, averagePctSold: 0, averageVenueCapacity: 0 }
};
const initialSalesTransactionData: Omit<SalesTransaction, 'id'| 'createdAt' | 'items'> = { saleSessionId: '', notes: '', subtotal: 0, taxes: 0, total: 0 };
const initialSalesTransactionItemData: Omit<SalesTransactionItem, 'id' | 'transactionId'> = { inventoryItemId: '', quantity: 0, pricePerItem: 0, itemTotal: 0, isVoucherRedemption: false };
const initialSaleListingData: Omit<SaleListing, 'id' | 'saleSessionId'> = { inventoryItemId: '' };
const initialEcoStarReportData: Omit<EcoStarReport, 'id' | 'projectId' | 'createdAt'> = {
    notes: '', environmentReport: null, customerReport: null, opportunityReport: null,
    solutionReport: null, teamReport: null, advantageReport: null, resultsReport: null, fullReportText: ''
};
const initialInterestCompatibilityReportData: Omit<InterestCompatibilityReport, 'id' | 'projectId' | 'createdAt'> = {
    notes: '', executiveSummary: '', stakeholderAnalysis: [], highCompatibilityAreas: [],
    potentialConflicts: [], actionableRecommendations: [], fullReportText: ''
};
const initialSdgAlignmentReportData: Omit<SdgAlignmentReport, 'id' | 'projectId' | 'createdAt'> = {
    notes: '', executiveSummary: '', detailedAnalysis: [], strategicRecommendations: [], fullReportText: ''
};


export const allSchemaConfigs = [
    {
        key: 'project',
        title: 'Project Data Model',
        description: 'Represents a single artistic project. This is the central data object.',
        dataObject: initialFormData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the project.' },
            { key: 'projectTitle', desc: 'The official title of the project.' },
            { key: 'status', desc: 'Current status of the project (e.g., Active, Completed).' },
            { key: 'artisticDisciplines', desc: 'Array of primary artistic disciplines.' },
            { key: 'craftGenres', desc: 'Array of selected Craft genres.' },
            { key: 'danceGenres', desc: 'Array of selected Dance genres.' },
            { key: 'literaryGenres', desc: 'Array of selected Literary genres.' },
            { key: 'mediaGenres', desc: 'Array of selected Media Arts genres.' },
            { key: 'musicGenres', desc: 'Array of selected Music genres.' },
            { key: 'theatreGenres', desc: 'Array of selected Theatre genres.' },
            { key: 'visualArtsGenres', desc: 'Array of selected Visual Arts genres.' },
            { key: 'otherArtisticDisciplineSpecify', desc: 'User-specified string for "Other" discipline.' },
            { key: 'projectStartDate', desc: 'The official start date of the project activities.' },
            { key: 'projectEndDate', desc: 'The official end date of the project activities.' },
            { key: 'activityType', desc: 'The primary type of activity (e.g., public presentation).' },
            { key: 'background', desc: 'Background information about the artist or collective.' },
            { key: 'projectDescription', desc: 'A detailed description of the project.' },
            { key: 'audience', desc: 'Description of the target audience and outreach plan.' },
            { key: 'paymentAndConditions', desc: 'Details on artist fees and working conditions.' },
            { key: 'permissionConfirmationFiles', desc: 'List of uploaded file objects for permissions (client-side only).' },
            { key: 'schedule', desc: 'Detailed schedule or timeline of project activities.' },
            { key: 'culturalIntegrity', desc: 'Statement on the project\'s approach to cultural integrity.' },
            { key: 'communityImpact', desc: 'Description of the project\'s impact on the community.' },
            { key: 'organizationalRationale', desc: 'Rationale for the project from an organizational perspective.' },
            { key: 'artisticDevelopment', desc: 'How the project contributes to artistic growth.' },
            { key: 'additionalInfo', desc: 'Any other relevant information.' },
            { key: 'whoWillWork', desc: 'Description of the team and collaborators.' },
            { key: 'howSelectionDetermined', desc: 'Explanation of the collaborator selection process.' },
            { key: 'collaboratorDetails', desc: 'Array of objects linking Members to this project by role.' },
            { key: 'budget', desc: 'Nested object containing all revenue and expense categories for the project.' },
            { key: 'imageUrl', desc: 'URL for a representative project image.' },
            { key: 'estimatedSales', desc: 'DEPRECATED: Estimated sales revenue, now calculated from Sale Sessions.' },
            { key: 'estimatedSalesDate', desc: 'DEPRECATED: Date of the estimated sales projection.' },
            { key: 'actualSales', desc: 'DEPRECATED: Actual sales revenue, now calculated from Sales Transactions.' },
            { key: 'actualSalesDate', desc: 'DEPRECATED: Date of the actual sales calculation.' },
        ]
    },
    {
        key: 'member',
        title: 'Member Data Model',
        description: 'Represents a single member of the collective.',
        dataObject: initialMemberData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the member.' },
            { key: 'memberId', desc: 'An optional, user-defined ID for the member.' },
            { key: 'firstName', desc: 'Member\'s first name.' },
            { key: 'lastName', desc: 'Member\'s last name.' },
            { key: 'email', desc: 'Member\'s primary email address.' },
            { key: 'province', desc: 'Member\'s province or territory.' },
            { key: 'city', desc: 'Member\'s city.' },
            { key: 'postalCode', desc: 'Member\'s postal code.' },
            { key: 'imageUrl', desc: 'URL for the member\'s profile picture.' },
            { key: 'shortBio', desc: 'A brief, one-paragraph biography.' },
            { key: 'artistBio', desc: 'A longer, formal artist biography.' },
            { key: 'availability', desc: 'Member\'s general availability (e.g., Full Time, Contract).' },
        ]
    },
    {
        key: 'task',
        title: 'Task Data Model',
        description: 'Represents a single task or milestone within a project.',
        dataObject: initialTaskData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the task.' },
            { key: 'taskCode', desc: 'A short, unique code for the task (e.g., PROJ-01).' },
            { key: 'projectId', desc: 'The ID of the project this task belongs to.' },
            { key: 'title', desc: 'The title of the task.' },
            { key: 'description', desc: 'A detailed description of the task.' },
            { key: 'assignedMemberId', desc: 'The ID of the member this task is assigned to.' },
            { key: 'status', desc: 'Current status of the task (e.g., To Do, In Progress).' },
            { key: 'startDate', desc: 'The planned start date for the task.' },
            { key: 'dueDate', desc: 'The planned due date for the task.' },
            { key: 'taskType', desc: 'Type of task: Time-Based (logs hours) or Milestone (checklist).' },
            { key: 'parentTaskId', desc: 'The ID of the parent milestone task this task falls under.' },
            { key: 'isComplete', desc: 'A boolean flag for Milestone tasks.' },
            { key: 'estimatedHours', desc: 'Estimated hours for time-based tasks.' },
            { key: 'actualHours', desc: 'Actual hours logged (calculated from activities).' },
            { key: 'budgetItemId', desc: 'ID of the expense line item this task is linked to.' },
            { key: 'workType', desc: 'The type of work: Paid, In-Kind, or Volunteer.' },
            { key: 'hourlyRate', desc: 'The monetary rate or value per hour for this task.' },
            { key: 'updatedAt', desc: 'Timestamp of the last update.' },
            { key: 'orderBy', desc: 'Integer used for custom sorting of tasks and milestones.' },
        ]
    },
    {
        key: 'activity',
        title: 'Activity Data Model',
        description: 'Represents a single time log entry against a Task by a Member.',
        dataObject: initialActivityData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the activity log.' },
            { key: 'taskId', desc: 'The ID of the Task this activity is for.' },
            { key: 'memberId', desc: 'The ID of the Member who performed the work.' },
            { key: 'description', desc: 'A description of the work performed.' },
            { key: 'startDate', desc: 'Start date of the activity period.' },
            { key: 'endDate', desc: 'End date of the activity period.' },
            { key: 'startTime', desc: 'Optional start time of the work.' },
            { key: 'endTime', desc: 'Optional end time of the work.' },
            { key: 'hours', desc: 'Number of hours worked.' },
            { key: 'status', desc: 'Approval status: Pending or Approved.' },
            { key: 'createdAt', desc: 'Timestamp of creation.' },
            { key: 'updatedAt', desc: 'Timestamp of the last update.' },
        ]
    },
    {
        key: 'direct_expense',
        title: 'Direct Expense Data Model',
        description: 'Represents a direct, non-time-based expense linked to a project budget line.',
        dataObject: initialDirectExpenseData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the direct expense.' },
            { key: 'projectId', desc: 'The ID of the project this expense belongs to.' },
            { key: 'budgetItemId', desc: 'The ID of the budget line item this expense is for.' },
            { key: 'description', desc: 'Description of what was purchased.' },
            { key: 'amount', desc: 'The monetary amount of the expense.' },
            { key: 'date', desc: 'The date the expense was incurred.' },
        ]
    },
    {
        key: 'report',
        title: 'Report Data Model',
        description: 'Stores the narrative content for a project\'s final report.',
        dataObject: initialReportData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the report.' },
            { key: 'projectId', desc: 'The ID of the project this report is for.' },
            { key: 'projectResults', desc: 'Narrative on the project\'s results.' },
            { key: 'grantSpendingDescription', desc: 'Narrative on how grant funds were spent.' },
            { key: 'workplanAdjustments', desc: 'Narrative on any changes to the original workplan.' },
            { key: 'involvedPeople', desc: 'Array of strings representing community reach demographics.' },
            { key: 'involvedActivities', desc: 'Array of strings representing community involvement types.' },
            { key: 'impactStatements', desc: 'Record object storing answers to impact assessment questions.' },
            { key: 'feedback', desc: 'User feedback on the grant program.' },
            { key: 'additionalFeedback', desc: 'Any other closing thoughts from the user.' },
        ]
    },
    {
        key: 'highlight',
        title: 'Highlight Data Model',
        description: 'A simple link to an external resource (e.g., press, video) for a project.',
        dataObject: initialHighlightData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the highlight.' },
            { key: 'projectId', desc: 'The ID of the project this highlight is for.' },
            { key: 'title', desc: 'The title of the linked resource.' },
            { key: 'url', desc: 'The URL of the external resource.' },
        ]
    },
    {
        key: 'news_release',
        title: 'News Release Data Model',
        description: 'Stores all content for a single news release or communication.',
        dataObject: initialNewsReleaseData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' },
            { key: 'projectId', desc: 'The ID of the project this release is about.' },
            { key: 'type', desc: 'Type of communication (e.g., News Release).' },
            { key: 'contactMemberId', desc: 'ID of the member to list as the contact person.' },
            { key: 'headline', desc: 'The main headline.' },
            { key: 'subhead', desc: 'The secondary headline.' },
            { key: 'publishDate', desc: 'The official publish date.' },
            { key: 'publishedUrl', desc: 'URL of the final published piece.' },
            { key: 'location', desc: 'Dateline location (e.g., Winnipeg, MB).' },
            { key: 'introduction', desc: 'The introductory paragraph.' },
            { key: 'body', desc: 'The main body text.' },
            { key: 'quotes', desc: 'Pull quotes for media use.' },
            { key: 'boilerplate', desc: 'Standard "About Us" paragraph.' },
            { key: 'contactInfo', desc: 'Default contact info if no member is selected.' },
            { key: 'status', desc: 'Workflow status: Draft, For Review, or Approved.' },
            { key: 'createdAt', desc: 'Timestamp of creation.' },
            { key: 'updatedAt', desc: 'Timestamp of the last update.' },
        ]
    },
    {
        key: 'venue',
        title: 'Venue Data Model',
        description: 'Represents a single venue where events can take place.',
        dataObject: initialVenueData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the venue.' },
            { key: 'name', desc: 'The official name of the venue.' },
            { key: 'isVirtual', desc: 'Flag to indicate if the venue is online/virtual.' },
            { key: 'status', desc: 'Current status (e.g., Potential, Confirmed).' },
            { key: 'address', desc: 'Nested object for the physical address.' },
            { key: 'capacity', desc: 'The seating or standing capacity of the venue.' },
            { key: 'url', desc: 'The official website URL for the venue.' },
            { key: 'contactName', desc: 'Name of the primary contact person.' },
            { key: 'contactTitle', desc: 'Job title of the contact person.' },
            { key: 'contactEmail', desc: 'Email address for the contact person.' },
            { key: 'contactPhone', desc: 'Phone number for the contact person.' },
            { key: 'notes', desc: 'Internal notes about the venue.' },
            { key: 'defaultCostType', desc: 'Default cost type: free, rented, or in_kind.' },
            { key: 'defaultCost', desc: 'Default monetary cost or value.' },
            { key: 'defaultCostPeriod', desc: 'Default period for the cost: per_day, per_hour, flat_rate.' },
            { key: 'createdAt', desc: 'Timestamp of creation.' },
            { key: 'updatedAt', desc: 'Timestamp of the last update.' },
        ]
    },
    {
        key: 'event',
        title: 'Event Data Model',
        description: 'Represents a single event, such as a performance or workshop.',
        dataObject: initialEventData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the event.' },
            { key: 'projectId', desc: 'The ID of the project this event belongs to.' },
            { key: 'venueId', desc: 'The ID of the venue where the event will take place.' },
            { key: 'title', desc: 'The public title of the event.' },
            { key: 'description', desc: 'A public-facing description of the event.' },
            { key: 'status', desc: 'The current status of the event (e.g., Pending, Confirmed).' },
            { key: 'category', desc: 'A user-defined category for the event (e.g., Performance, Workshop).' },
            { key: 'tags', desc: 'Array of string tags for filtering.' },
            { key: 'isAllDay', desc: 'Flag for all-day events, which hides time inputs.' },
            { key: 'startDate', desc: 'The start date of the event.' },
            { key: 'endDate', desc: 'The end date of the event (for multi-day events).' },
            { key: 'startTime', desc: 'The start time in HH:MM format.' },
            { key: 'endTime', desc: 'The end time in HH:MM format.' },
            { key: 'notes', desc: 'Internal notes about the event.' },
            { key: 'actualAttendance', desc: 'Optional field for the actual number of attendees after the event.' },
            { key: 'assignedMembers', desc: 'Array of members assigned to roles for this event.' },
            { key: 'venueCostOverride', desc: 'Optional nested object to override the venue\'s default cost for this specific event.' },
            { key: 'isTemplate', desc: 'Flag indicating this is a parent template for a recurring series.' },
            { key: 'parentEventId', desc: 'ID of the parent template if this is a recurring instance.' },
            { key: 'isOverride', desc: 'Flag indicating a recurring instance has been modified independently.' },
            { key: 'recurrenceRule', desc: 'Optional object defining the recurrence rule for a template.' },
            { key: 'createdAt', desc: 'Timestamp of creation.' },
            { key: 'updatedAt', desc: 'Timestamp of the last update.' },
        ]
    },
    {
        key: 'ticket_type',
        title: 'Ticket Type Data Model',
        description: 'Represents a reusable type of ticket (e.g., General Admission, Student).',
        dataObject: { ...initialTicketTypeData, id: '', createdAt: '', updatedAt: '' },
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the ticket type.' },
            { key: 'name', desc: 'The name of the ticket type.' },
            { key: 'description', desc: 'An optional description.' },
            { key: 'defaultPrice', desc: 'The default price for this ticket type.' },
            { key: 'isFree', desc: 'Boolean flag indicating if the ticket is free.' },
            { key: 'createdAt', desc: 'Timestamp of creation.' },
            { key: 'updatedAt', desc: 'Timestamp of last update.' },
        ]
    },
    {
        key: 'event_ticket',
        title: 'Event Ticket Data Model',
        description: 'Links a Ticket Type to an Event, defining its price and capacity for that specific event.',
        dataObject: initialEventTicketData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for this specific event-ticket link.' },
            { key: 'eventId', desc: 'ID of the associated Event.' },
            { key: 'ticketTypeId', desc: 'ID of the associated Ticket Type.' },
            { key: 'price', desc: 'The price for this ticket at this event (can override default).' },
            { key: 'capacity', desc: 'The number of these tickets available for this event.' },
            { key: 'soldCount', desc: 'The number of tickets sold (for future use).' },
        ]
    },
    {
        key: 'proposal_snapshot',
        title: 'Proposal Snapshot Data Model',
        description: 'A point-in-time, read-only copy of a project\'s data for archival or grant submission.',
        dataObject: initialProposalSnapshotData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the snapshot.' },
            { key: 'projectId', desc: 'ID of the source project.' },
            { key: 'createdAt', desc: 'Timestamp of when the snapshot was created.' },
            { key: 'updatedAt', desc: 'Timestamp of when the snapshot was last updated with fresh data.' },
            { key: 'notes', desc: 'User-added notes for context (e.g., "Version submitted to MAC").' },
            { key: 'projectData', desc: 'A deep, read-only copy of the entire Project (FormData) object at the time of creation.' },
            { key: 'tasks', desc: 'A deep, read-only copy of all associated tasks at the time of creation.' },
            { key: 'calculatedMetrics', desc: 'A read-only copy of the calculated budget/ticket metrics (projected revenue, audience, etc.) at the time of creation.' },
        ]
    },
    {
        key: 'contact',
        title: 'Contact Data Model (CRM)',
        description: 'Represents an external contact (e.g., media, funder, venue).',
        dataObject: initialContactData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the contact.' },
            { key: 'firstName', desc: 'Contact\'s first name.' },
            { key: 'lastName', desc: 'Contact\'s last name.' },
            { key: 'email', desc: 'Contact\'s primary email address.' },
            { key: 'phone', desc: 'Contact\'s phone number.' },
            { key: 'title', desc: 'Contact\'s professional title (e.g., Journalist).' },
            { key: 'organization', desc: 'The organization the contact belongs to.' },
            { key: 'contactType', desc: 'High-level category (e.g., Media, Funder).' },
            { key: 'associatedProjectIds', desc: 'Array of project IDs this contact is linked to.' },
            { key: 'address', desc: 'Nested object for mailing address (street, city, province, postalCode).' },
            { key: 'tags', desc: 'Array of user-defined tags for filtering.' },
            { key: 'notes', desc: 'General purpose notes field.' },
            { key: 'createdAt', desc: 'Timestamp of creation.' },
            { key: 'updatedAt', desc: 'Timestamp of last update.' },
        ]
    },
    {
        key: 'interaction',
        title: 'Interaction Data Model (CRM)',
        description: 'Represents a single interaction (e.g., a call, email) with a Contact.',
        dataObject: initialInteractionData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier for the interaction.' },
            { key: 'contactId', desc: 'The ID of the contact this interaction belongs to.' },
            { key: 'date', desc: 'The date of the interaction.' },
            { key: 'type', desc: 'The type of interaction (Email, Call, Meeting, Note).' },
            { key: 'notes', desc: 'Detailed notes about the interaction.' },
        ]
    },
     {
        key: 'inventory_category',
        title: 'Inventory Category Data Model',
        description: 'A category for organizing inventory items.',
        dataObject: { ...initialInventoryCategory, id: '', createdAt: '' },
        fieldConfig: [ { key: 'id', desc: 'Unique identifier.' }, { key: 'name', desc: 'Name of the category.' }, { key: 'createdAt', desc: 'Timestamp.' } ]
    },
    {
        key: 'inventory_item',
        title: 'Inventory Item Data Model',
        description: 'Represents a single item for sale or use.',
        dataObject: { ...initialInventoryItem, id: '', createdAt: '', updatedAt: '' },
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'categoryId', desc: 'Link to an Inventory Category.' }, { key: 'createdAt', desc: 'Timestamp.' },
            { key: 'updatedAt', desc: 'Timestamp.' }, { key: 'name', desc: 'Name of the item.' }, { key: 'description', desc: 'Item description.' },
            { key: 'sku', desc: 'Stock Keeping Unit.' }, { key: 'costPrice', desc: 'How much the item costs to acquire.' },
            { key: 'salePrice', desc: 'How much the item is sold for.' }, { key: 'currentStock', desc: 'Current quantity on hand.' }, { key: 'trackStock', desc: 'Whether to decrement stock on sale.' }
        ]
    },
    {
        key: 'sale_session',
        title: 'Sale Session Data Model',
        description: 'A container for a specific sales period or context.',
        dataObject: { ...initialSaleSession, id: '', createdAt: '', updatedAt: '' },
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'name', desc: 'Name of the session.' }, { key: 'expectedRevenue', desc: 'Revenue goal for the session.' },
            { key: 'createdAt', desc: 'Timestamp.' }, { key: 'updatedAt', desc: 'Timestamp.' }, { key: 'organizerType', desc: 'Internal or partner.' },
            { key: 'associationType', desc: 'Link to an event, project, or general.' }, { key: 'projectId', desc: 'Linked project ID.' },
            { key: 'eventId', desc: 'Linked event ID.' }, { key: 'partnerName', desc: 'Name of partner organization.' },
            { key: 'partnerContactId', desc: 'Linked contact ID for partner.' }
        ]
    },
     {
        key: 'sale_listing',
        title: 'Sale Listing Data Model',
        description: 'Links an inventory item to a sale session, making it available for sale.',
        dataObject: initialSaleListingData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'saleSessionId', desc: 'Linked sale session ID.' }, { key: 'inventoryItemId', desc: 'Linked inventory item ID.' },
        ]
    },
    {
        key: 'sales_transaction',
        title: 'Sales Transaction Data Model',
        description: 'The header for a single sales transaction (a receipt).',
        dataObject: initialSalesTransactionData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'saleSessionId', desc: 'Linked sale session ID.' }, { key: 'createdAt', desc: 'Timestamp.' },
            { key: 'notes', desc: 'Notes about the transaction.' }, { key: 'subtotal', desc: 'Sum of item totals before tax.' },
            { key: 'taxes', desc: 'Total tax amount.' }, { key: 'total', desc: 'Final total (subtotal + taxes).' }
        ]
    },
    {
        key: 'sales_transaction_item',
        title: 'Sales Transaction Item Data Model',
        description: 'A line item within a sales transaction.',
        dataObject: initialSalesTransactionItemData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'transactionId', desc: 'Linked transaction ID.' }, { key: 'inventoryItemId', desc: 'Linked inventory item ID.' },
            { key: 'quantity', desc: 'Number of items sold.' }, { key: 'pricePerItem', desc: 'Historical price at time of sale.' },
            { key: 'itemTotal', desc: 'Total for this line (quantity * pricePerItem).' }, { key: 'isVoucherRedemption', desc: 'Flag for promotional voucher redemptions.' }
        ]
    },
    {
        key: 'item_list',
        title: 'Item List Data Model',
        description: 'A printable menu or price list for an event, composed of inventory items.',
        dataObject: { ...initialItemListData, id: '', createdAt: '', updatedAt: '' },
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'name', desc: 'Name of the list.' }, { key: 'eventId', desc: 'Linked event ID (optional).' },
            { key: 'itemOrder', desc: 'JSON array of inventory item IDs in display order.' }, { key: 'createdAt', desc: 'Timestamp.' }, { key: 'updatedAt', desc: 'Timestamp.' }
        ]
    },
    {
        key: 'settings',
        title: 'Application Settings Model',
        description: 'Represents all configurable options in the Settings page.',
        dataObject: initialSettings,
        fieldConfig: [
            { key: 'general', desc: 'General app settings like collective name and currency.' },
            { key: 'projects', desc: 'Settings for projects, like custom statuses.' },
            { key: 'members', desc: 'Settings for members, like custom roles.' },
            { key: 'tasks', desc: 'Settings for tasks, like default rates.' },
            { key: 'ai', desc: 'Settings for AI, including personas and master switch.' },
            { key: 'budget', desc: 'Settings for budget, like custom labels.' },
            { key: 'media', desc: 'Settings for media, like boilerplate and communication types.' },
            { key: 'events', desc: 'Settings for events, like custom venue statuses.' },
            { key: 'gallery', desc: 'Settings for the splash screen image URLs.' },
            { key: 'sales', desc: 'Settings for sales, including tax rates.' },
        ]
    },
    {
        key: 'ecostar_report',
        title: 'ECO-STAR Report Data Model',
        description: 'Stores a generated ECO-STAR report.',
        dataObject: initialEcoStarReportData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'projectId', desc: 'Associated project ID.' },
            { key: 'createdAt', desc: 'Timestamp.' }, { key: 'notes', desc: 'User notes.' },
            { key: 'environmentReport', desc: 'JSON object for Environment section.' }, { key: 'customerReport', desc: 'JSON object for Customer section.' },
            { key: 'opportunityReport', desc: 'JSON object for Opportunity section.' }, { key: 'solutionReport', desc: 'JSON object for Solution section.' },
            { key: 'teamReport', desc: 'JSON object for Team section.' }, { key: 'advantageReport', desc: 'JSON object for Advantage section.' },
            { key: 'resultsReport', desc: 'JSON object for Results section.' }, { key: 'fullReportText', desc: 'Full report as an HTML string.' }
        ]
    },
    {
        key: 'interest_compatibility_report',
        title: 'Interest Compatibility Report Data Model',
        description: 'Stores a generated Interest Compatibility report.',
        dataObject: initialInterestCompatibilityReportData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'projectId', desc: 'Associated project ID.' },
            { key: 'createdAt', desc: 'Timestamp.' }, { key: 'notes', desc: 'User notes.' },
            { key: 'executiveSummary', desc: 'Report\'s executive summary.' }, { key: 'stakeholderAnalysis', desc: 'Array of stakeholder analyses.' },
            { key: 'highCompatibilityAreas', desc: 'Array of identified synergies.' }, { key: 'potentialConflicts', desc: 'Array of identified conflicts.' },
            { key: 'actionableRecommendations', desc: 'Array of recommendations.' }, { key: 'fullReportText', desc: 'Full report as an HTML string.' }
        ]
    },
    {
        key: 'sdg_alignment_report',
        title: 'SDG Alignment Report Data Model',
        description: 'Stores a generated SDG Alignment report.',
        dataObject: initialSdgAlignmentReportData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'projectId', desc: 'Associated project ID.' },
            { key: 'createdAt', desc: 'Timestamp.' }, { key: 'notes', desc: 'User notes.' },
            { key: 'executiveSummary', desc: 'Report\'s executive summary.' }, { key: 'detailedAnalysis', desc: 'Array of SDG goal analyses.' },
            { key: 'strategicRecommendations', desc: 'Array of recommendations.' }, { key: 'fullReportText', desc: 'Full report as an HTML string.' }
        ]
    },
    {
        key: 'recreation_framework_report',
        title: 'Recreation Framework Report Data Model',
        description: 'Stores a generated Framework for Recreation report.',
        dataObject: initialRecreationReportData,
        fieldConfig: [
            { key: 'id', desc: 'Unique identifier.' }, { key: 'projectId', desc: 'Associated project ID.' },
            { key: 'createdAt', desc: 'Timestamp.' }, { key: 'notes', desc: 'User notes.' },
            { key: 'executiveSummary', desc: 'Report\'s executive summary.' }, { key: 'activeLiving', desc: 'Narrative for Active Living goal.' },
            { key: 'inclusionAndAccess', desc: 'Narrative for Inclusion and Access goal.' }, { key: 'connectingPeopleWithNature', desc: 'Narrative for Connecting with Nature goal.' },
            { key: 'supportiveEnvironments', desc: 'Narrative for Supportive Environments goal.' }, { key: 'recreationCapacity', desc: 'Narrative for Recreation Capacity goal.' },
            { key: 'closingSection', desc: 'Concluding narrative.' }, { key: 'fullReportText', desc: 'Full report as an HTML string.' }
        ]
    }
];