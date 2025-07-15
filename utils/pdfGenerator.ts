

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppSettings, FormData, Member, Task, Report, Highlight, NewsRelease, SalesTransaction, InventoryItem, SaleSession, EcoStarReport, ReportSectionContent, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, ProposalSnapshot, BudgetItem, Event, Venue, EventTicket, ResearchPlan, DetailedBudget } from '../types';
import { ARTISTIC_DISCIPLINES, ACTIVITY_TYPES, REVENUE_FIELDS, EXPENSE_FIELDS, initialBudget } from '../constants';
import { useTicketRevenueCalculations } from '../hooks/useBudgetCalculations';

const formatCurrency = (value: number | null | undefined) => (value || 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

/**
 * A from-scratch PDF builder that creates free-flowing, document-style reports without tables for layout.
 * It manages its own Y-coordinate, text wrapping, and page breaks to prevent layout issues.
 */
class PdfBuilder {
    doc: jsPDF;
    y: number;
    pageHeight: number;
    pageWidth: number;
    margin: number;
    lineHeightRatio: number;
    fontSizes: { h1: number, h2: number, h3: number, h4: number, p: number, small: number };

    constructor(docTitle: string, projectTitle?: string) {
        this.doc = new jsPDF('p', 'pt', 'a4');
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.margin = 40;
        this.lineHeightRatio = 1.35;
        this.fontSizes = { h1: 18, h2: 16, h3: 13, h4: 11, p: 10, small: 8 };
        this.y = this.margin;

        // --- Header ---
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h1);
        this.doc.setTextColor('#1e293b'); // slate-800
        
        this.doc.text(docTitle, this.margin, this.y, { maxWidth: this.pageWidth - this.margin * 2 });
        this.y += this.doc.getTextDimensions(docTitle, { maxWidth: this.pageWidth - this.margin * 2, fontSize: this.fontSizes.h1 }).h;


        if (projectTitle) {
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(this.fontSizes.h2);
            this.doc.setTextColor('#475569'); // slate-600
            
            this.y += 5; // Add some space before the subtitle
            this.doc.text(projectTitle, this.margin, this.y, { maxWidth: this.pageWidth - this.margin * 2 });
            this.y += this.doc.getTextDimensions(projectTitle, { maxWidth: this.pageWidth - this.margin * 2, fontSize: this.fontSizes.h2 }).h;
        }

        this.doc.setFontSize(this.fontSizes.small);
        this.doc.setTextColor('#64748b'); // slate-500
        this.doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, this.margin, this.y, { maxWidth: this.pageWidth - this.margin * 2 });
        
        this.y += (this.fontSizes.small * this.lineHeightRatio) + 25;
    }

    private checkPageBreak(requiredHeight: number): void {
        if (this.y + requiredHeight > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.y = this.margin;
        }
    }
    
    addSectionTitle(title: string) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h2);
        
        const titleHeight = this.doc.getTextDimensions(title, { maxWidth: this.pageWidth - this.margin * 2, fontSize: this.fontSizes.h2 }).h;
        this.checkPageBreak(titleHeight + 30); 

        this.y += 15; // Top margin for section
        this.doc.setTextColor('#1e293b');
        this.doc.text(title, this.margin, this.y, { maxWidth: this.pageWidth - this.margin * 2 });
        this.y += titleHeight;
        
        this.y += 5; // Space between text and line
        this.doc.setDrawColor('#0d9488'); // teal-600
        this.doc.setLineWidth(1.5);
        this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
        this.y += 15; // Space after line
    }

    addSubSectionTitle(title: string) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h3);
        const titleHeight = this.doc.getTextDimensions(title, { maxWidth: this.pageWidth - this.margin * 2, fontSize: this.fontSizes.h3 }).h;
        
        this.checkPageBreak(titleHeight + 20); 
        this.y += 12; // Top margin
        
        this.doc.setTextColor('#334155'); // slate-700
        this.doc.text(title, this.margin, this.y, { maxWidth: this.pageWidth - this.margin * 2 });
        this.y += titleHeight;
    }
    
    addMinorSectionTitle(title: string) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h4);
        const titleHeight = this.doc.getTextDimensions(title, { maxWidth: this.pageWidth - this.margin * 2, fontSize: this.fontSizes.h4 }).h;
        
        this.checkPageBreak(titleHeight + 15);
        this.y += 10;
        
        this.doc.setTextColor('#475569'); // slate-600
        this.doc.text(title, this.margin, this.y, { maxWidth: this.pageWidth - this.margin * 2 });
        this.y += titleHeight;
    }

    addParagraph(text: string | null | undefined, options: { top?: number, bottom?: number, color?: string, fontSize?: number, fontStyle?: 'normal' | 'bold' | 'italic' } = {}) {
        const { top = 4, bottom = 12, color = '#334155', fontSize = this.fontSizes.p, fontStyle = 'normal' } = options;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            this.doc.setTextColor('#94a3b8'); // slate-400
            this.addText('N/A', this.fontSizes.p, 'italic', {top: 4, bottom: 12});
            return;
        }
        
        this.doc.setTextColor(color);
        this.addText(text, fontSize, fontStyle, { top, bottom });
    }

    private addText(text: string, fontSize: number, fontStyle: 'normal' | 'bold' | 'italic', spacing: { top: number, bottom: number }) {
        this.y += spacing.top;
        this.doc.setFont('helvetica', fontStyle);
        this.doc.setFontSize(fontSize);
        
        const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2);
        const lineHeight = fontSize * this.lineHeightRatio;

        lines.forEach((line: string) => {
            this.checkPageBreak(lineHeight);
            this.doc.text(line, this.margin, this.y);
            this.y += lineHeight;
        });

        this.y += spacing.bottom;
    }

    addList(items: string[]) {
        if (!items || items.length === 0) return;
        const listContent = items.map(item => `•  ${item}`).join('\n');
        this.addParagraph(listContent);
    }

    addTable(head: string[][], body: (string|number)[][]) {
        this.y += 5;
        autoTable(this.doc, {
            head: head,
            body: body,
            startY: this.y,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold' },
            styles: { fontSize: 8 },
            margin: { left: this.margin, right: this.margin },
        });
        this.y = (this.doc as any).lastAutoTable.finalY + 15;
    }
    
    save(fileName: string) {
        this.doc.save(fileName);
    }
}


// --- Report Generation Functions ---

export const generateResearchPlanPdf = (plan: ResearchPlan, projectTitle: string) => {
    if (!plan) throw new Error("Research Plan data is missing.");
    
    const builder = new PdfBuilder('Community-Based Research Plan', projectTitle);
    
    builder.addSectionTitle('Overview');
    builder.addParagraph(plan.titleAndOverview);

    if (plan.communities && plan.communities.length > 0) {
        builder.addSectionTitle('Participating Communities');
        builder.addTable(
            [['Community', 'Region', 'Country', 'Organization']],
            plan.communities.map(c => [c.communityName, c.provinceState, c.country, c.organization || 'N/A'])
        );
    }
    
    builder.addSectionTitle('Research Questions and Objectives');
    builder.addParagraph(plan.researchQuestions);

    builder.addSectionTitle('Community Engagement and Context');
    builder.addParagraph(plan.communityEngagement);

    builder.addSectionTitle('Research Design and Methodology');
    builder.addParagraph(plan.designAndMethodology);

    builder.addSectionTitle('Ethical Considerations and Protocols');
    builder.addParagraph(plan.ethicalConsiderations);

    builder.addSectionTitle('Knowledge Mobilization and Dissemination');
    builder.addParagraph(plan.knowledgeMobilization);

    builder.addSectionTitle('Project Management and Timeline');
    builder.addParagraph(plan.projectManagement);

    if (plan.sustainability) {
        builder.addSectionTitle('Sustainability');
        builder.addParagraph(plan.sustainability);
    }

    builder.addSectionTitle('Project Evaluation');
    builder.addParagraph(plan.projectEvaluation);

    const safeFileName = projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    builder.save(`Research-Plan-${safeFileName}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateEcoStarPdf = (report: EcoStarReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    
    const builder = new PdfBuilder('ECO-STAR Supplemental Report', projectTitle);
    const sections: { key: keyof EcoStarReport; label: string; }[] = [
        { key: 'environmentReport', label: 'E – Environment' }, { key: 'customerReport', label: 'C – Customer' },
        { key: 'opportunityReport', label: 'O – Opportunity' }, { key: 'solutionReport', label: 'S – Solution' },
        { key: 'teamReport', label: 'T – Team' }, { key: 'advantageReport', label: 'A – Advantage' },
        { key: 'resultsReport', label: 'R – Results' },
    ];
    
    sections.forEach(section => {
        const content = report[section.key] as ReportSectionContent | null;
        if (content) {
            builder.addSectionTitle(section.label);
            builder.addSubSectionTitle('Summary');
            builder.addParagraph(content.summary);
            builder.addSubSectionTitle('Key Considerations');
            builder.addList(content.keyConsiderations);
            builder.addSubSectionTitle('Follow-up Questions');
            if (Array.isArray(content.followUpQuestions) && content.followUpQuestions.length > 0) {
                content.followUpQuestions.forEach(qa => {
                    builder.addMinorSectionTitle(qa.question);
                    builder.addParagraph(qa.sampleAnswer);
                });
            } else {
                 builder.addParagraph('N/A');
            }
        }
    });

    builder.save(`ECO-STAR-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateInterestCompatibilityPdf = (report: InterestCompatibilityReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    
    const builder = new PdfBuilder('Interest Compatibility Report', projectTitle);
    
    if (report.executiveSummary) {
        builder.addSectionTitle('Executive Summary');
        builder.addParagraph(report.executiveSummary);
    }
    if (Array.isArray(report.stakeholderAnalysis)) {
        builder.addSectionTitle('Stakeholder Analysis');
        report.stakeholderAnalysis.forEach(s => {
            builder.addSubSectionTitle(`${s.name} - (${s.role})`);
            builder.addList(s.interests);
        });
    }
    if (Array.isArray(report.highCompatibilityAreas)) {
        builder.addSectionTitle('High Compatibility Areas');
        report.highCompatibilityAreas.forEach(item => {
            builder.addSubSectionTitle(item.area);
            builder.addMinorSectionTitle(`Stakeholders: ${(item.stakeholders || []).join(', ')}`);
            builder.addParagraph(item.insight);
            builder.addMinorSectionTitle('Follow-up Questions');
            builder.addList(item.followUpQuestions);
        });
    }
    if (Array.isArray(report.potentialConflicts)) {
        builder.addSectionTitle('Potential Conflicts');
        report.potentialConflicts.forEach(item => {
            builder.addSubSectionTitle(item.area);
            builder.addMinorSectionTitle(`Stakeholders: ${(item.stakeholders || []).join(', ')}`);
            builder.addParagraph(item.insight);
            builder.addMinorSectionTitle('Mitigation');
            builder.addParagraph(item.mitigation);
            builder.addMinorSectionTitle('Follow-up Questions');
            builder.addList(item.followUpQuestions);
        });
    }
    if (Array.isArray(report.actionableRecommendations)) {
        builder.addSectionTitle('Actionable Recommendations');
        builder.addList(report.actionableRecommendations);
    }
    
    builder.save(`Interest-Compatibility-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateSdgPdf = (report: SdgAlignmentReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') {
        throw new Error("Report data is missing or corrupted.");
    }
    
    const builder = new PdfBuilder('SDG Alignment Report', projectTitle);
    
    if (report.executiveSummary) {
        builder.addSectionTitle('Executive Summary');
        builder.addParagraph(report.executiveSummary);
    }
    
    const analysisItems = report.detailedAnalysis;
    if (!Array.isArray(analysisItems)) {
        console.error("Corrupted SDG Report Data:", report);
        builder.addParagraph('[Error: Detailed analysis data is corrupted and cannot be displayed.]');
    } else if (analysisItems.length > 0) {
        builder.addSectionTitle('Detailed SDG Analysis');
        analysisItems.forEach(goal => {
            // Defensive check for malformed goal objects within the array.
            if (typeof goal !== 'object' || goal === null) {
                builder.addParagraph('[Error: An item in the detailed analysis was malformed and could not be displayed.]');
                return;
            }
            
            builder.addSubSectionTitle(`Goal ${goal.goalNumber || 'N/A'}: ${goal.goalTitle || 'Untitled Goal'}`);
            
            builder.addMinorSectionTitle('Alignment Narrative');
            builder.addParagraph(goal.alignmentNarrative);

            builder.addMinorSectionTitle('Strategic Value');
            builder.addParagraph(goal.strategicValue);

            builder.addMinorSectionTitle('Challenges & Mitigation');
            builder.addParagraph(goal.challengesAndMitigation);
        });
    }

    if (Array.isArray(report.strategicRecommendations) && report.strategicRecommendations.length > 0) {
        builder.addSectionTitle('Strategic Recommendations');
        report.strategicRecommendations.forEach(rec => builder.addParagraph(`• ${rec}`));
    }
    
    builder.save(`SDG-Alignment-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateRecreationFrameworkPdf = (report: RecreationFrameworkReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    
    const builder = new PdfBuilder('Framework for Recreation Report', projectTitle);

    const sections = [
        { key: 'executiveSummary' as const, label: 'Executive Summary' },
        { key: 'activeLiving' as const, label: 'Active Living' },
        { key: 'inclusionAndAccess' as const, label: 'Inclusion and Access' },
        { key: 'connectingPeopleWithNature' as const, label: 'Connecting People with Nature' },
        { key: 'supportiveEnvironments' as const, label: 'Supportive Environments' },
        { key: 'recreationCapacity' as const, label: 'Recreation Capacity' },
        { key: 'closingSection' as const, label: 'Closing Section' },
    ];

    if (report.notes) {
        builder.addSectionTitle('Notes');
        builder.addParagraph(report.notes);
    }
    
    sections.forEach(section => {
        const content = report[section.key];
        if (content) {
            builder.addSectionTitle(section.label);
            builder.addParagraph(content);
        }
    });

    builder.save(`Recreation-Framework-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateProposalSnapshotPdf = (
    snapshot: ProposalSnapshot,
    members: Member[],
    events: Event[],
    venues: Venue[],
    eventTickets: EventTicket[]
) => {
    const builder = new PdfBuilder('Proposal Snapshot', snapshot.projectData.projectTitle);
    
    builder.addSubSectionTitle('Snapshot Details');
    builder.addParagraph(`Created On: ${new Date(snapshot.createdAt).toLocaleString()}`);
    if (snapshot.updatedAt) {
        builder.addParagraph(`Updated On: ${new Date(snapshot.updatedAt).toLocaleString()}`);
    }
    builder.addParagraph(`Notes: ${snapshot.notes || 'N/A'}`);
    
    addProjectInfoToPdf(builder, snapshot.projectData);
    addCollaboratorsToPdf(builder, snapshot.projectData, members);
    addBudgetToPdf(builder, snapshot);
    addWorkplanToPdf(builder, snapshot.tasks);

    builder.save(`Proposal-Snapshot-${snapshot.projectData.projectTitle.slice(0, 15)}-${new Date(snapshot.createdAt).toISOString().split('T')[0]}.pdf`);
};

function addProjectInfoToPdf(builder: any, project: FormData) {
    builder.addSectionTitle('Project Information');
    const fields = [
        { label: 'Project Title', content: project.projectTitle },
        { label: 'Project Dates', content: `Start: ${project.projectStartDate || 'N/A'} | End: ${project.projectEndDate || 'N/A'}` },
        { label: 'Activity Type', content: ACTIVITY_TYPES.find(a => a.value === project.activityType)?.label || project.activityType },
        { label: 'Artistic Disciplines', content: (project.artisticDisciplines.map(d => ARTISTIC_DISCIPLINES.find(ad => ad.value === d)?.label || d)).join(', ') },
        { label: 'Background', content: project.background },
        { label: 'Project Description', content: project.projectDescription },
        { label: 'Audience & Outreach', content: project.audience },
        { label: 'Payment & Working Conditions', content: project.paymentAndConditions },
        { label: 'Schedule', content: project.schedule },
        { label: 'Cultural Integrity', content: project.culturalIntegrity },
        { label: 'Community Impact', content: project.communityImpact },
        { label: 'Organizational Rationale', content: project.organizationalRationale },
        { label: 'Artistic Development', content: project.artisticDevelopment },
    ];
    fields.forEach(field => {
        builder.addMinorSectionTitle(field.label);
        builder.addParagraph(field.content);
    });
}

function addCollaboratorsToPdf(builder: any, project: FormData, members: Member[]) {
    builder.addSectionTitle('Collaborators');
    builder.addMinorSectionTitle('Collaboration Rationale');
    builder.addParagraph(project.whoWillWork);

    if (project.collaboratorDetails && project.collaboratorDetails.length > 0) {
        builder.addMinorSectionTitle('Assigned Collaborators');
        project.collaboratorDetails.forEach(collab => {
            const member = members.find(m => m.id === collab.memberId);
            if(member) {
                builder.addSubSectionTitle(`${member.firstName} ${member.lastName} (${collab.role})`);
                builder.addParagraph(member.shortBio || member.artistBio || 'No bio provided.');
            }
        });
    }
}

function addBudgetToPdf(builder: any, snapshot: ProposalSnapshot) {
    builder.addSectionTitle('Proposed Budget');
    const budget = snapshot.projectData.budget;
    const ticketCalcs = snapshot.calculatedMetrics;
    if (!budget) {
        builder.addParagraph('No budget data available for this snapshot.');
        return;
    }
    
    const sumItems = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const totalGrants = sumItems(budget.revenues.grants);
    const totalSales = sumItems(budget.revenues.sales);
    const totalFundraising = sumItems(budget.revenues.fundraising);
    const totalContributions = sumItems(budget.revenues.contributions);
    const totalRevenueFromItems = totalGrants + totalSales + totalFundraising + totalContributions;
    const totalTicketRevenue = ticketCalcs?.projectedRevenue || 0;
    const totalRevenue = totalRevenueFromItems + totalTicketRevenue;
    
    const totalExpenses = Object.values(budget.expenses).reduce((sum, expenseCategory) => sum + sumItems(expenseCategory), 0);
    const balance = totalRevenue - totalExpenses;

    builder.addMinorSectionTitle('Budget Summary');
    builder.addParagraph(`Total Projected Revenue: ${formatCurrency(totalRevenue)}`);
    builder.addParagraph(`Total Projected Expenses: ${formatCurrency(totalExpenses)}`);
    builder.addParagraph(`Projected Balance: ${formatCurrency(balance)}`);

    builder.addSubSectionTitle('Revenue Breakdown');
    const revenueCategories = [
        { title: 'Grants', items: budget.revenues.grants },
        { title: 'Sales', items: budget.revenues.sales },
        { title: 'Fundraising', items: budget.revenues.fundraising },
        { title: 'Contributions', items: budget.revenues.contributions },
    ];
    revenueCategories.forEach(cat => {
        if(cat.items.length > 0) {
            builder.addMinorSectionTitle(cat.title);
            cat.items.forEach(item => builder.addParagraph(`${item.description || item.source}: ${formatCurrency(item.amount)}`));
        }
    });
    builder.addMinorSectionTitle('Tickets & Box Office');
    builder.addParagraph(`Projected Revenue: ${formatCurrency(totalTicketRevenue)}`);

    builder.addSubSectionTitle('Expense Breakdown');
    Object.entries(budget.expenses).forEach(([key, items]) => {
         if (Array.isArray(items) && items.length > 0) {
            builder.addMinorSectionTitle(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
            items.forEach(item => builder.addParagraph(`${item.description || item.source}: ${formatCurrency(item.amount)}`));
        }
    });
}

function addWorkplanToPdf(builder: any, tasks: Task[]) {
    builder.addSectionTitle('Workplan');
    const milestones = tasks.filter(t => t.taskType === 'Milestone').sort((a,b) => (a.orderBy || 0) - (b.orderBy || 0));
    const tasksByParent = tasks.reduce((acc, task) => {
        if (task.taskType !== 'Milestone') {
            const parentId = task.parentTaskId || 'unparented';
            if (!acc[parentId]) acc[parentId] = [];
            acc[parentId].push(task);
        }
        return acc;
    }, {} as Record<string, Task[]>);
    
    if (tasks.length === 0) {
        builder.addParagraph('No tasks defined in this snapshot.');
        return;
    }

    milestones.forEach(milestone => {
        builder.addSubSectionTitle(`${milestone.title} (Due: ${milestone.dueDate || 'N/A'})`);
        builder.addParagraph(milestone.description);
        const childTasks = tasksByParent[milestone.id] || [];
        if(childTasks.length > 0) {
            childTasks.forEach(task => builder.addParagraph(`  • Task: ${task.title} (Due: ${task.dueDate || 'N/A'})`));
        } else {
             builder.addParagraph('  • No sub-tasks for this milestone.');
        }
    });

    if (tasksByParent['unparented'] && tasksByParent['unparented'].length > 0) {
        builder.addSubSectionTitle('Other Tasks');
        tasksByParent['unparented'].forEach(task => builder.addParagraph(`  • ${task.title} (Due: ${task.dueDate || 'N/A'})`));
    }
}


export const generateReportPdf = (
    project: FormData,
    report: Report,
    members: Member[],
    tasks: Task[],
    highlights: Highlight[],
    newsReleases: NewsRelease[],
    actuals: Map<string, number>,
    options: any,
    settings: AppSettings,
    events: Event[],
    eventTickets: EventTicket[],
    venues: Venue[],
) => {
    const builder = new PdfBuilder('Final Report', project.projectTitle);
    
    const { revenueLabels, expenseLabels } = settings.budget;

    // Build field maps
    const revenueFieldMap = new Map(Object.values(REVENUE_FIELDS).flat().map(f => [f.key, (revenueLabels[f.key] !== undefined && revenueLabels[f.key] !== '') ? revenueLabels[f.key] : f.label]));
    const expenseFieldMap = new Map(Object.values(EXPENSE_FIELDS).flat().map(f => [f.key, (expenseLabels[f.key] !== undefined && expenseLabels[f.key] !== '') ? expenseLabels[f.key] : f.label]));

    // --- SECTION 1: Project Description ---
    builder.addSectionTitle("Project Description");
    builder.addParagraph(report.projectResults);

    // --- SECTION 2: Financial Report ---
    builder.addSectionTitle("Financial Report");
    builder.addParagraph(report.grantSpendingDescription);

    const budget = project.budget || initialBudget;
    
    // Re-implement useBudgetCalculations logic here
    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumActuals = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    const filterAndSum = (items: BudgetItem[] = []) => 
        items.filter(item => item.status !== 'Denied').reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalRevenueFromItems = filterAndSum(budget.revenues.grants) + filterAndSum(budget.revenues.sales) + filterAndSum(budget.revenues.fundraising) + filterAndSum(budget.revenues.contributions);
    const totalExpenses = Object.values(budget.expenses).reduce((sum, cat) => sum + sumAmounts(cat), 0);
    const totalActualRevenueFromItems = sumActuals(budget.revenues.grants) + sumActuals(budget.revenues.sales) + sumActuals(budget.revenues.fundraising) + sumActuals(budget.revenues.contributions);
    const totalTicketsActual = budget.revenues.tickets?.actualRevenue || 0;
    const totalActualRevenue = totalActualRevenueFromItems + totalTicketsActual;
    
    const ticketCalcs = useTicketRevenueCalculations(project.id, events, venues, eventTickets);
    
    const totalActualExpenses = Array.from(actuals.values()).reduce((sum, val) => sum + val, 0);
    const totalProjectedRevenue = totalRevenueFromItems + ticketCalcs.projectedRevenue;

    builder.addSubSectionTitle("Budget Summary");
    builder.addTable(
        [["", "Projected", "Actual"]],
        [
            ["Total Revenue", formatCurrency(totalProjectedRevenue), formatCurrency(totalActualRevenue)],
            ["Total Expenses", formatCurrency(totalExpenses), formatCurrency(totalActualExpenses)],
            ["Balance", formatCurrency(totalProjectedRevenue - totalExpenses), formatCurrency(totalActualRevenue - totalActualExpenses)],
        ]
    );

    builder.addSubSectionTitle("Revenue Details");
    builder.addTable(
        [['Source', 'Projected', 'Actual', 'Status']],
        [...budget.revenues.grants, ...budget.revenues.sales, ...budget.revenues.fundraising, ...budget.revenues.contributions].map(item => [
            revenueFieldMap.get(item.source) || item.source,
            formatCurrency(item.amount),
            formatCurrency(item.actualAmount),
            item.status || 'N/A'
        ]).concat([
            ["Tickets & Box Office", formatCurrency(ticketCalcs.projectedRevenue), formatCurrency(budget.revenues.tickets.actualRevenue), 'N/A']
        ])
    );
    
    builder.addSubSectionTitle("Expense Details");
     Object.entries(budget.expenses).forEach(([categoryKey, items]) => {
        if (Array.isArray(items) && items.length > 0) {
            builder.addMinorSectionTitle(categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
            builder.addTable(
                [['Expense', 'Projected', 'Actual', 'Description']],
                items.map(item => [
                    expenseFieldMap.get(item.source) || item.source,
                    formatCurrency(item.amount),
                    formatCurrency(actuals.get(item.id) || 0),
                    item.description || ''
                ])
            );
        }
    });

    // --- SECTION 3: Workplan ---
    builder.addSectionTitle("Workplan");
    builder.addParagraph(report.workplanAdjustments);

    // --- SECTION 4: Community Reach ---
    builder.addSectionTitle("Community Reach");
    if (Array.isArray(report.involvedPeople) && report.involvedPeople.length > 0) {
        builder.addSubSectionTitle("My activities actively involved individuals who identify as:");
        const peopleLabels = report.involvedPeople.map(val => options.PEOPLE_INVOLVED_OPTIONS.find((opt: any) => opt.value === val)?.label.replace('... ', '') || val);
        builder.addList(peopleLabels);
    }
    if (Array.isArray(report.involvedActivities) && report.involvedActivities.length > 0) {
        builder.addSubSectionTitle("The activities supported by this grant involved:");
        const activityLabels = report.involvedActivities.map(val => options.GRANT_ACTIVITIES_OPTIONS.find((opt: any) => opt.value === val)?.label.replace('... ', '') || val);
        builder.addList(activityLabels);
    }

    // --- SECTION 5: Impact Assessment ---
    builder.addSectionTitle("Impact Assessment");
    options.IMPACT_QUESTIONS.forEach((q: any) => {
        const answerValue = report.impactStatements[q.id];
        const answerLabel = options.IMPACT_OPTIONS.find((opt: any) => opt.value === answerValue)?.label || 'Not answered';
        builder.addMinorSectionTitle(q.label);
        builder.addParagraph(`Answer: ${answerLabel}`, { fontStyle: 'italic', color: '#475569' });
    });

    // --- SECTION 6: Project Highlights & Media ---
    builder.addSectionTitle("Project Highlights & Media");
    if (highlights.length > 0) {
        builder.addSubSectionTitle("Highlights");
        highlights.forEach(h => builder.addParagraph(`${h.title}: ${h.url}`));
    }
    if (newsReleases.length > 0) {
        builder.addSubSectionTitle("News Releases");
        newsReleases.forEach(nr => builder.addParagraph(`${nr.headline} (${nr.status})`));
    }

    // --- SECTION 7: Closing ---
    builder.addSectionTitle("Closing");
    builder.addSubSectionTitle("What worked well with the grant program and what could be improved?");
    builder.addParagraph(report.feedback);
    builder.addSubSectionTitle("Is there anything else you would like to share?");
    builder.addParagraph(report.additionalFeedback);

    const safeFileName = project.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    builder.save(`Final-Report-${safeFileName}.pdf`);
};

export const generateSalesPdf = (options: any) => {
    const { title, summary, itemBreakdown, vouchersBreakdown, transactions, itemMap } = options;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(title, 14, y);
    y += 10;

    if (summary) {
        doc.setFontSize(12);
        doc.text("Financial Summary", 14, y);
        y += 5;
        autoTable(doc, {
            body: summary.map((s:any) => [s.label, s.value]),
            startY: y,
            theme: 'plain',
            styles: { fontSize: 10 },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (itemBreakdown && itemBreakdown.length > 0) {
        doc.setFontSize(12);
        doc.text("Item Sales Breakdown", 14, y);
        y += 5;
        autoTable(doc, {
            head: [['Item', 'Qty', 'Cost/Unit', 'Price/Unit', 'Total Cost', 'Total Revenue', 'Profit']],
            body: itemBreakdown.map((item: any) => [
                item.name, item.quantity, formatCurrency(item.costPrice), formatCurrency(item.salePrice),
                formatCurrency(item.totalCost), formatCurrency(item.totalRevenue), formatCurrency(item.profit)
            ]),
            startY: y,
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    if (vouchersBreakdown && vouchersBreakdown.length > 0) {
        doc.setFontSize(12);
        doc.text("Voucher Redemptions (Promotional Cost)", 14, y);
        y += 5;
        autoTable(doc, {
            head: [['Item', 'Qty Redeemed', 'Cost/Unit', 'Total Cost']],
            body: vouchersBreakdown.map((item: any) => [
                item.name, item.quantity, formatCurrency(item.costPrice), formatCurrency(item.totalCost)
            ]),
            startY: y,
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (transactions && transactions.length > 0) {
        doc.setFontSize(12);
        doc.text("Full Transaction Log", 14, y);
        y += 5;
        const body = transactions.flatMap((tx: any) => [
            [{ content: `Transaction: ${tx.id.slice(-6)} - ${new Date(tx.createdAt).toLocaleString()}`, colSpan: 4, styles: { fontStyle: 'bold', fillColor: '#f1f5f9' } }],
            ...tx.items.map((item: any) => [
                itemMap.get(item.inventoryItemId)?.name || 'Unknown Item',
                item.quantity,
                formatCurrency(item.pricePerItem),
                formatCurrency(item.itemTotal)
            ]),
            [{ content: `Subtotal: ${formatCurrency(tx.subtotal)} | Taxes: ${formatCurrency(tx.taxes)} | Total: ${formatCurrency(tx.total)}`, colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } }]
        ]);
        autoTable(doc, {
            head: [['Item', 'Qty', 'Price', 'Total']],
            body: body,
            startY: y,
        });
    }

    const safeFileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    doc.save(`${safeFileName}.pdf`);
};