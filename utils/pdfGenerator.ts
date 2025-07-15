

import jsPDF from 'jspdf';
import { AppSettings, FormData, Member, Task, Report, Highlight, NewsRelease, SalesTransaction, InventoryItem, SaleSession, EcoStarReport, ReportSectionContent, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, ProposalSnapshot, BudgetItem, Event, Venue, EventTicket, ResearchPlan } from '../types';
import { ARTISTIC_DISCIPLINES, ACTIVITY_TYPES } from '../constants';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

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
        this.doc.text(docTitle, this.margin, this.y);
        this.y += this.fontSizes.h1 * this.lineHeightRatio;

        if (projectTitle) {
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(this.fontSizes.h2);
            this.doc.setTextColor('#475569'); // slate-600
            this.doc.text(projectTitle, this.margin, this.y);
            this.y += this.fontSizes.h2 * this.lineHeightRatio;
        }

        this.doc.setFontSize(this.fontSizes.small);
        this.doc.setTextColor('#64748b'); // slate-500
        this.doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, this.margin, this.y);
        
        this.y += (this.fontSizes.small * this.lineHeightRatio) + 25;
    }

    private checkPageBreak(requiredHeight: number): void {
        if (this.y + requiredHeight > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.y = this.margin;
        }
    }
    
    addSectionTitle(title: string) {
        const titleHeight = this.fontSizes.h2 * this.lineHeightRatio;
        // Prevent widow titles by ensuring there's space for the title and a few lines of text
        this.checkPageBreak(titleHeight + 30); 

        this.y += 15; // Top margin for section
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h2);
        this.doc.setTextColor('#1e293b');
        this.doc.text(title, this.margin, this.y);
        
        this.y += (this.fontSizes.h2 * this.lineHeightRatio) * 0.5;
        this.doc.setDrawColor('#0d9488'); // teal-600
        this.doc.setLineWidth(1.5);
        this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
        this.y += 15; // Space after line
    }

    addSubSectionTitle(title: string) {
        const titleHeight = this.fontSizes.h3 * this.lineHeightRatio;
        // Prevent widow subtitles
        this.checkPageBreak(titleHeight + 20); 
        this.y += 12; // Top margin
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h3);
        this.doc.setTextColor('#334155'); // slate-700
        this.doc.text(title, this.margin, this.y);
        this.y += (this.fontSizes.h3 * this.lineHeightRatio);
    }
    
    addMinorSectionTitle(title: string) {
        const titleHeight = this.fontSizes.h4 * this.lineHeightRatio;
        this.checkPageBreak(titleHeight + 15);
        this.y += 10;
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h4);
        this.doc.setTextColor('#475569'); // slate-600
        this.doc.text(title, this.margin, this.y);
        this.y += (this.fontSizes.h4 * this.lineHeightRatio)
    }

    addParagraph(text: string | null | undefined) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            this.addText('N/A', this.fontSizes.p, 'italic', {top: 4, bottom: 12});
            return;
        }

        // Helper to render a single line with inline bolding
        const renderLineWithBold = (line: string) => {
            const lineHeight = this.fontSizes.p * this.lineHeightRatio;
            this.checkPageBreak(lineHeight);
            
            const parts = line.split('**');
            let currentX = this.margin;
            
            parts.forEach((part, index) => {
                if (part === '') return;
                
                const isBold = index % 2 !== 0;
                this.doc.setFontSize(this.fontSizes.p);
                this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                
                this.doc.text(part, currentX, this.y);
                currentX += this.doc.getStringUnitWidth(part) * this.fontSizes.p / this.doc.internal.scaleFactor;
            });
            
            this.y += lineHeight;
        }

        const blocks = text.split(/\n\s*\n/);
        
        blocks.forEach(block => {
            if (block.trim() === '') return;
            
            const trimmedBlock = block.trim();
            const listItems = trimmedBlock.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
            
            // Check for a line that is entirely bold (like a subheading)
            if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**')) {
                this.addText(trimmedBlock.slice(2, -2), this.fontSizes.h4, 'bold', { top: 8, bottom: 2 });
            // Check if the majority of the block consists of list items
            } else if (listItems.length > 0 && listItems.length >= (trimmedBlock.split('\n').length * 0.8)) {
                this.y += 4; // Top spacing for list block
                listItems.forEach(item => {
                    const content = `•  ${item.trim().substring(item.trim().indexOf(' ')).trim()}`;
                    const wrappedLines = this.doc.splitTextToSize(content, this.pageWidth - this.margin * 2);
                    wrappedLines.forEach(line => renderLineWithBold(line));
                });
                this.y += 8; // Bottom spacing for list block
            // Handle as a normal paragraph
            } else {
                 this.y += 4; // Top spacing for paragraph
                 const wrappedLines = this.doc.splitTextToSize(trimmedBlock, this.pageWidth - this.margin * 2);
                 wrappedLines.forEach(line => renderLineWithBold(line));
                 this.y += 8; // Bottom spacing for paragraph
            }
        });
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

    save(fileName: string) {
        this.doc.save(fileName);
    }
}


// --- Report Generation Functions ---

export const generateResearchPlanPdf = (plan: ResearchPlan, projectTitle: string) => {
    if (!plan) throw new Error("Research Plan data is missing.");
    
    const builder = new PdfBuilder('Community-Based Research Plan', projectTitle);
    
    builder.addSectionTitle('Title and Overview');
    builder.addParagraph(plan.titleAndOverview);

    builder.addSectionTitle('Community Engagement and Context');
    builder.addParagraph(plan.communityEngagement);

    builder.addSectionTitle('Research Questions and Objectives');
    builder.addParagraph(plan.researchQuestions);

    builder.addSectionTitle('Research Design and Methodology');
    builder.addParagraph(plan.designAndMethodology);

    builder.addSectionTitle('Ethical Considerations and Protocols');
    builder.addParagraph(plan.ethicalConsiderations);

    builder.addSectionTitle('Knowledge Mobilization and Dissemination');
    builder.addParagraph(plan.knowledgeMobilization);

    builder.addSectionTitle('Project Management and Timeline');
    builder.addParagraph(plan.projectManagement);

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
    const totalTicketRevenue = ticketCalcs?.projectedRevenue || 0;
    const totalRevenue = totalGrants + totalTicketRevenue + totalSales + totalFundraising + totalContributions;
    
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
         if (items.length > 0) {
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


// --- Legacy stubs for other reports that can be upgraded later ---
export const generateReportPdf = (project: FormData, report: Report, members: Member[], tasks: Task[], highlights: Highlight[], newsReleases: NewsRelease[], actuals: Map<string, number>, options: any, settings: AppSettings) => {
    console.error("generateReportPdf needs to be updated to use the new PdfBuilder.");
    alert("This PDF generator is not yet updated. Please check back later.");
};

export const generateSalesPdf = (options: any) => {
    console.error("generateSalesPdf needs to be updated to use the new PdfBuilder.");
    alert("This PDF generator is not yet updated. Please check back later.");
};