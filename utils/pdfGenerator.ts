




import { marked, type Token } from 'marked';
import { AppSettings, FormData, Member, Task, Report, Highlight, NewsRelease, SalesTransaction, EcoStarReport, ReportSectionContent, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, ProposalSnapshot, BudgetItem, Event, Venue, EventTicket, ResearchPlan, DetailedBudget } from '../types';
import { ARTISTIC_DISCIPLINES, ACTIVITY_TYPES, REVENUE_FIELDS, EXPENSE_FIELDS, initialBudget } from '../constants';

// --- PDFMAKE INITIALIZATION ---
// Use direct imports for robust bundling with Vite/Webpack.
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Manually assign the virtual font system to pdfmake instance.
// This is a critical step for modern build tools.
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;


// --- UTILITY FUNCTIONS ---

const formatCurrency = (value: number | null | undefined) => (value || 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const PERFORMANCE_CATEGORIES = new Set([
    'performance', 'concert', 'theatre', 'music', 'dance', 'public presentation'
]);


// --- MARKDOWN TO PDFMAKE CONVERSION ---

function decodeEntities(encodedString: string): string {
    if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = encodedString;
        return textArea.value;
    }
    // Basic fallback for non-browser environments
    return encodedString
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#32;/g, ' ').replace(/&nbsp;/g, '\u00A0');
}


// Handles inline elements like **bold**, *italic*, and `code`.
// Returns an array of styled text fragments for pdfmake's `text` property.
function parseInlineTokens(tokens: Token[]): any[] {
    const content: any[] = [];
    tokens.forEach(token => {
        switch (token.type) {
            case 'strong':
                content.push({ text: decodeEntities(token.text), bold: true });
                break;
            case 'em':
                content.push({ text: decodeEntities(token.text), italics: true });
                break;
            case 'link':
                content.push({ text: decodeEntities(token.text), link: token.href, style: 'link' });
                break;
            case 'codespan':
                content.push({ text: decodeEntities(token.text), style: 'code_inline' });
                break;
            case 'text':
                content.push({ text: decodeEntities(token.text) });
                break;
            default:
                // Fallback for unhandled inline tokens
                content.push({ text: (token as any).raw });
                break;
        }
    });
    return content;
}

// Recursively parses block-level tokens from `marked.lexer`.
function parseBlockTokens(tokens: Token[]): any[] {
    const elements: any[] = [];
    tokens.forEach(token => {
        switch (token.type) {
            case 'paragraph':
                elements.push({ text: parseInlineTokens(token.tokens), style: 'p' });
                break;
            case 'heading':
                elements.push({ text: parseInlineTokens(token.tokens), style: `h${token.depth + 1}` });
                break;
            case 'list':
                elements.push({
                    [token.ordered ? 'ol' : 'ul']: token.items.map(item => parseBlockTokens(item.tokens)),
                    style: 'p',
                    margin: [10, 5, 0, 5]
                });
                break;
            case 'blockquote':
                elements.push({
                    stack: parseBlockTokens(token.tokens),
                    style: 'blockquote'
                });
                break;
            case 'hr':
                elements.push({ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 10, 0, 10] });
                break;
            case 'code':
                elements.push({ text: token.text, style: 'code_block' });
                break;
            case 'text':
                // A 'text' token at the block level usually means it's part of a "loose" list item.
                if (token.tokens) {
                    elements.push({ text: parseInlineTokens(token.tokens), style: 'p' });
                } else {
                    elements.push({ text: decodeEntities(token.text), style: 'p' });
                }
                break;
            case 'space':
                // ignore
                break;
            default:
                console.warn('Unhandled markdown token type:', token.type);
                elements.push({ text: token.raw, style: 'p' });
                break;
        }
    });
    return elements;
}


// Main entry function for converting markdown.
function markdownToPdfmake(markdownText: string | null | undefined): any[] {
    if (!markdownText || typeof markdownText !== 'string' || markdownText.trim() === '') {
        return [{ text: 'N/A', style: 'italic', margin: [0, 0, 0, 10] }];
    }
    const tokens = marked.lexer(markdownText);
    return parseBlockTokens(tokens);
}


/**
 * A builder class that creates a pdfmake document definition object.
 * This declarative approach is more robust and maintainable than manual coordinate management.
 */
class PdfBuilder {
    docDefinition: any;

    constructor(docTitle: string, projectTitle?: string) {
        this.docDefinition = {
            content: [],
            styles: {
                h1: { fontSize: 18, bold: true, color: '#1e293b', margin: [0, 0, 0, 5] },
                h2: { fontSize: 16, bold: true, color: '#334155', margin: [0, 15, 0, 5] },
                h3: { fontSize: 13, bold: true, color: '#475569', margin: [0, 12, 0, 4] },
                h4: { fontSize: 11, bold: true, color: '#475569', margin: [0, 10, 0, 2] },
                p: { fontSize: 10, color: '#334155', lineHeight: 1.35, margin: [0, 0, 0, 10] },
                link: { color: '#0d9488', decoration: 'underline' },
                blockquote: { margin: [20, 5, 0, 5], color: '#475569' },
                code_block: { fontSize: 9, color: '#334155', backgroundColor: '#f1f5f9', margin: [0, 5, 0, 10], preserveLeadingSpaces: true },
                code_inline: { color: '#be123c', backgroundColor: '#f1f5f9' },
                small: { fontSize: 8, color: '#64748b' },
                italic: { italics: true, color: '#64748b' },
                tableHeader: { bold: true, fontSize: 9, color: 'black', fillColor: '#f1f5f9' },
                tableStyle: { margin: [0, 5, 0, 15], fontSize: 9 }
            },
            defaultStyle: {
                fontSize: 10
            }
        };

        this.docDefinition.content.push({ text: docTitle, style: 'h1' });
        if (projectTitle) {
            this.docDefinition.content.push({ text: projectTitle, style: 'h2', margin: [0, 0, 0, 5] });
        }
        this.docDefinition.content.push({ text: `Report Generated: ${new Date().toLocaleDateString()}`, style: 'small', margin: [0, 0, 0, 25] });
    }

    addSectionTitle(title: string) {
        this.docDefinition.content.push({ text: title, style: 'h2' });
        this.docDefinition.content.push({
            canvas: [{ type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 1.5, lineColor: '#0d9488' }],
            margin: [0, 0, 0, 15]
        });
    }

    addSubSectionTitle(title: string) {
        this.docDefinition.content.push({ text: title, style: 'h3' });
    }
    
    addMinorSectionTitle(title: string) {
        this.docDefinition.content.push({ text: title, style: 'h4' });
    }

    addParagraph(text: string | null | undefined) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            this.docDefinition.content.push({ text: 'N/A', style: 'italic' });
            return;
        }
        this.docDefinition.content.push({ text: text.trim(), style: 'p' });
    }

    addMarkdown(markdownText: string | null | undefined) {
        const content = markdownToPdfmake(markdownText);
        this.docDefinition.content.push(...content);
    }

    addList(items: string[]) {
        if (!items || items.length === 0) return;
        this.docDefinition.content.push({
            ul: items.map(item => ({ text: item })),
            style: 'p'
        });
    }

    addTable(head: string[], body: any[][], widths: (string|number)[] = Array(head.length).fill('*')) {
        const tableBody = [
            head.map(h => ({ text: h, style: 'tableHeader' })),
            ...body.map(row => row.map(cell => (typeof cell === 'object' && cell !== null && !Array.isArray(cell)) ? cell : String(cell)))
        ];
        this.docDefinition.content.push({
            style: 'tableStyle',
            table: {
                headerRows: 1,
                widths,
                body: tableBody
            },
            layout: 'lightHorizontalLines'
        });
    }
    
    save(fileName: string) {
        try {
            pdfMake.createPdf(this.docDefinition).download(fileName);
        } catch (error: any) {
            console.error("PDF Generation Error:", error);
            alert(`PDF generation failed: ${error.message}. See console for details.`);
        }
    }
}

// --- CALCULATION FUNCTIONS ---

const calculateTicketRevenue = (projectId: string, allEvents: Event[], allVenues: Venue[], allEventTickets: EventTicket[]) => {
    const defaultResult = {
        numberOfPresentations: 0, averageVenueCapacity: 0, projectedAudience: 0,
        averagePctSold: 0, projectedRevenue: 0, averageTicketPrice: 0,
    };
    if (!projectId || !allEvents || !allVenues || !allEventTickets) return defaultResult;
    const plannedProjectEvents = allEvents.filter(event =>
        event.projectId === projectId && !event.isTemplate && event.status !== 'Cancelled' &&
        PERFORMANCE_CATEGORIES.has((event.category || '').toLowerCase())
    );
    if (plannedProjectEvents.length === 0) return defaultResult;

    const plannedEventIds = new Set(plannedProjectEvents.map(event => event.id));
    const ticketsForSale = allEventTickets.filter(ticket => plannedEventIds.has(ticket.eventId));
    const totalProjectedRevenue = ticketsForSale.reduce((sum, ticket) => sum + (ticket.price || 0) * (ticket.capacity || 0), 0);
    const totalProjectedAudience = ticketsForSale.reduce((sum, ticket) => sum + (ticket.capacity || 0), 0);
    const weightedAverageTicketPrice = totalProjectedAudience > 0 ? totalProjectedRevenue / totalProjectedAudience : 0;
    
    let totalVenueCapacityAcrossAllShows = 0;
    let sumOfVenueCapacitiesForAveraging = 0;
    plannedProjectEvents.forEach(event => {
        const venue = allVenues.find(v => v.id === event.venueId);
        if (venue) {
            totalVenueCapacityAcrossAllShows += venue.capacity || 0;
            sumOfVenueCapacitiesForAveraging += venue.capacity || 0;
        }
    });

    return {
        numberOfPresentations: plannedProjectEvents.length,
        averageVenueCapacity: Math.round(plannedProjectEvents.length > 0 ? sumOfVenueCapacitiesForAveraging / plannedProjectEvents.length : 0),
        projectedAudience: totalProjectedAudience,
        averagePctSold: totalVenueCapacityAcrossAllShows > 0 ? (totalProjectedAudience / totalVenueCapacityAcrossAllShows) * 100 : 0,
        projectedRevenue: totalProjectedRevenue,
        averageTicketPrice: weightedAverageTicketPrice,
    };
};

const calculateBudgetTotals = (budget: DetailedBudget | undefined | null) => {
    const safeBudget = budget || initialBudget;
    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const sumActuals = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    const filterAndSum = (items: BudgetItem[] = []) => items.filter(item => item.status !== 'Denied').reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalGrants = filterAndSum(safeBudget.revenues.grants);
    const totalSales = filterAndSum(safeBudget.revenues.sales);
    const totalFundraising = filterAndSum(safeBudget.revenues.fundraising);
    const totalContributions = filterAndSum(safeBudget.revenues.contributions);

    const totalRevenue = totalGrants + totalSales + totalFundraising + totalContributions;
    
    const totalActualRevenue = sumActuals(safeBudget.revenues.grants) + sumActuals(safeBudget.revenues.sales) + sumActuals(safeBudget.revenues.fundraising) + sumActuals(safeBudget.revenues.contributions) + (safeBudget.revenues.tickets?.actualRevenue || 0);

    const totalExpenses = Object.values(safeBudget.expenses).reduce((sum, category) => sum + sumAmounts(category as BudgetItem[]), 0);

    return { totalRevenue, totalActualRevenue, totalExpenses };
};


// --- REPORT GENERATION FUNCTIONS ---

export const generateResearchPlanPdf = (plan: ResearchPlan, projectTitle: string) => {
    if (!plan) throw new Error("Research Plan data is missing.");
    const builder = new PdfBuilder('Community-Based Research Plan', projectTitle);
    
    builder.addSectionTitle('Overview'); builder.addMarkdown(plan.titleAndOverview);
    if (plan.communities && plan.communities.length > 0) {
        builder.addSectionTitle('Participating Communities');
        builder.addTable(['Community', 'Region', 'Country', 'Organization'], plan.communities.map(c => [c.communityName, c.provinceState, c.country, c.organization || 'N/A']));
    }
    builder.addSectionTitle('Research Questions and Objectives'); builder.addMarkdown(plan.researchQuestions);
    builder.addSectionTitle('Community Engagement and Context'); builder.addMarkdown(plan.communityEngagement);
    builder.addSectionTitle('Research Design and Methodology'); builder.addMarkdown(plan.designAndMethodology);
    if (plan.artisticAlignmentAndDevelopment) { builder.addSectionTitle('Artistic Alignment & Development'); builder.addMarkdown(plan.artisticAlignmentAndDevelopment); }
    builder.addSectionTitle('Ethical Considerations and Protocols'); builder.addMarkdown(plan.ethicalConsiderations);
    builder.addSectionTitle('Knowledge Mobilization and Dissemination'); builder.addMarkdown(plan.knowledgeMobilization);
    builder.addSectionTitle('Project Management and Timeline'); builder.addMarkdown(plan.projectManagement);
    if (plan.sustainability) { builder.addSectionTitle('Sustainability'); builder.addMarkdown(plan.sustainability); }
    builder.addSectionTitle('Project Evaluation'); builder.addMarkdown(plan.projectEvaluation);

    const safeFileName = projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    builder.save(`Research-Plan-${safeFileName}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateEcoStarPdf = (report: EcoStarReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    const builder = new PdfBuilder('ECO-STAR Supplemental Report', projectTitle);
    const sections: { key: keyof EcoStarReport; label: string; }[] = [
        { key: 'environmentReport', label: 'E – Environment' }, { key: 'customerReport', label: 'C – Customer' }, { key: 'opportunityReport', label: 'O – Opportunity' },
        { key: 'solutionReport', label: 'S – Solution' }, { key: 'teamReport', label: 'T – Team' }, { key: 'advantageReport', label: 'A – Advantage' }, { key: 'resultsReport', label: 'R – Results' },
    ];
    
    sections.forEach(section => {
        const content = report[section.key] as ReportSectionContent | null;
        if (content) {
            builder.addSectionTitle(section.label);
            builder.addSubSectionTitle('Summary'); builder.addMarkdown(content.summary);
            builder.addSubSectionTitle('Key Considerations'); builder.addMarkdown(content.keyConsiderations.map(c => `* ${c}`).join('\n'));
            builder.addSubSectionTitle('Follow-up Questions');
            if (Array.isArray(content.followUpQuestions) && content.followUpQuestions.length > 0) {
                content.followUpQuestions.forEach(qa => { builder.addMinorSectionTitle(qa.question); builder.addMarkdown(qa.sampleAnswer); });
            } else { builder.addParagraph('N/A'); }
        }
    });
    builder.save(`ECO-STAR-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateInterestCompatibilityPdf = (report: InterestCompatibilityReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    const builder = new PdfBuilder('Interest Compatibility Report', projectTitle);
    
    if (report.executiveSummary) { builder.addSectionTitle('Executive Summary'); builder.addMarkdown(report.executiveSummary); }
    if (Array.isArray(report.stakeholderAnalysis)) {
        builder.addSectionTitle('Stakeholder Analysis');
        report.stakeholderAnalysis.forEach(s => { builder.addSubSectionTitle(`${s.name} - (${s.role})`); builder.addMarkdown(s.interests.map(i => `* ${i}`).join('\n')); });
    }
    if (Array.isArray(report.highCompatibilityAreas)) {
        builder.addSectionTitle('High Compatibility Areas');
        report.highCompatibilityAreas.forEach(item => { builder.addSubSectionTitle(item.area); builder.addMinorSectionTitle(`Stakeholders: ${(item.stakeholders || []).join(', ')}`); builder.addMarkdown(item.insight); builder.addMinorSectionTitle('Follow-up Questions'); builder.addMarkdown(item.followUpQuestions.map(q => `* ${q}`).join('\n')); });
    }
    if (Array.isArray(report.potentialConflicts)) {
        builder.addSectionTitle('Potential Conflicts');
        report.potentialConflicts.forEach(item => { builder.addSubSectionTitle(item.area); builder.addMinorSectionTitle(`Stakeholders: ${(item.stakeholders || []).join(', ')}`); builder.addMarkdown(item.insight); builder.addMinorSectionTitle('Mitigation'); builder.addMarkdown(item.mitigation); builder.addMinorSectionTitle('Follow-up Questions'); builder.addMarkdown(item.followUpQuestions.map(q => `* ${q}`).join('\n')); });
    }
    if (Array.isArray(report.actionableRecommendations)) { builder.addSectionTitle('Actionable Recommendations'); builder.addMarkdown(report.actionableRecommendations.map(r => `* ${r}`).join('\n')); }
    
    builder.save(`Interest-Compatibility-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateSdgPdf = (report: SdgAlignmentReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    const builder = new PdfBuilder('SDG Alignment Report', projectTitle);
    
    if (report.executiveSummary) { builder.addSectionTitle('Executive Summary'); builder.addMarkdown(report.executiveSummary); }
    const analysisItems = report.detailedAnalysis;
    if (Array.isArray(analysisItems) && analysisItems.length > 0) {
        builder.addSectionTitle('Detailed SDG Analysis');
        analysisItems.forEach(goal => { builder.addSubSectionTitle(`Goal ${goal.goalNumber || 'N/A'}: ${goal.goalTitle || 'Untitled Goal'}`); builder.addMinorSectionTitle('Alignment Narrative'); builder.addMarkdown(goal.alignmentNarrative); builder.addMinorSectionTitle('Strategic Value'); builder.addMarkdown(goal.strategicValue); builder.addMinorSectionTitle('Challenges & Mitigation'); builder.addMarkdown(goal.challengesAndMitigation); });
    }
    if (Array.isArray(report.strategicRecommendations) && report.strategicRecommendations.length > 0) {
        builder.addSectionTitle('Strategic Recommendations'); builder.addMarkdown(report.strategicRecommendations.map(rec => `* ${rec}`).join('\n'));
    }
    builder.save(`SDG-Alignment-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateRecreationFrameworkPdf = (report: RecreationFrameworkReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    const builder = new PdfBuilder('Framework for Recreation Report', projectTitle);
    const sections = [
        { key: 'executiveSummary' as const, label: 'Executive Summary' }, { key: 'activeLiving' as const, label: 'Active Living' },
        { key: 'inclusionAndAccess' as const, label: 'Inclusion and Access' }, { key: 'connectingPeopleWithNature' as const, label: 'Connecting People with Nature' },
        { key: 'supportiveEnvironments' as const, label: 'Supportive Environments' }, { key: 'recreationCapacity' as const, label: 'Recreation Capacity' }, { key: 'closingSection' as const, label: 'Closing Section' },
    ];
    if (report.notes) { builder.addSectionTitle('Notes'); builder.addMarkdown(report.notes); }
    sections.forEach(section => { const content = report[section.key]; if (content) { builder.addSectionTitle(section.label); builder.addMarkdown(content); } });
    builder.save(`Recreation-Framework-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateProposalSnapshotPdf = (snapshot: ProposalSnapshot, members: Member[]) => {
    const builder = new PdfBuilder('Proposal Snapshot', snapshot.projectData.projectTitle);
    
    builder.addSubSectionTitle('Snapshot Details');
    builder.addParagraph(`Created On: ${new Date(snapshot.createdAt).toLocaleString()}`);
    if (snapshot.updatedAt) builder.addParagraph(`Updated On: ${new Date(snapshot.updatedAt).toLocaleString()}`);
    builder.addMarkdown(`**Notes:** ${snapshot.notes || 'N/A'}`);
    
    // Project Info
    builder.addSectionTitle('Project Information');
    builder.addMinorSectionTitle('Project Title'); builder.addMarkdown(snapshot.projectData.projectTitle);
    builder.addMinorSectionTitle('Activity Type'); builder.addParagraph(ACTIVITY_TYPES.find(a => a.value === snapshot.projectData.activityType)?.label || snapshot.projectData.activityType);
    builder.addMinorSectionTitle('Artistic Disciplines'); builder.addParagraph((snapshot.projectData.artisticDisciplines.map(d => ARTISTIC_DISCIPLINES.find(ad => ad.value === d)?.label || d)).join(', '));
    builder.addMinorSectionTitle('Background'); builder.addMarkdown(snapshot.projectData.background);
    builder.addMinorSectionTitle('Project Description'); builder.addMarkdown(snapshot.projectData.projectDescription);
    
    // Collaborators
    builder.addSectionTitle('Collaborators');
    builder.addMinorSectionTitle('Collaboration Rationale'); builder.addMarkdown(snapshot.projectData.whoWillWork);
    if (snapshot.projectData.collaboratorDetails && snapshot.projectData.collaboratorDetails.length > 0) {
        builder.addMinorSectionTitle('Assigned Collaborators');
        snapshot.projectData.collaboratorDetails.forEach(c => {
            const member = members.find(mem => mem.id === c.memberId);
            if (member) {
                builder.addSubSectionTitle(`${member.firstName} ${member.lastName} (${c.role})`);
                builder.addMarkdown(member.shortBio || member.artistBio || 'No bio provided.');
            }
        });
    }
    
    // Budget
    builder.addSectionTitle('Proposed Budget');
    const budget = snapshot.projectData.budget || initialBudget;
    const ticketCalcs = snapshot.calculatedMetrics || { projectedRevenue: 0 };
    const totals = calculateBudgetTotals(budget);
    const totalRevenue = totals.totalRevenue + ticketCalcs.projectedRevenue;
    const totalExpenses = totals.totalExpenses;
    builder.addMinorSectionTitle('Budget Summary');
    builder.addTable(['Category', 'Amount'], [['Total Projected Revenue', formatCurrency(totalRevenue)], ['Total Projected Expenses', formatCurrency(totalExpenses)], ['Projected Balance', formatCurrency(totalRevenue - totalExpenses)]]);
    
    // Workplan
    builder.addSectionTitle('Workplan');
    snapshot.tasks.filter(t => t.taskType === 'Milestone').forEach(milestone => {
        builder.addSubSectionTitle(`${milestone.title} (Due: ${milestone.dueDate || 'N/A'})`);
        builder.addMarkdown(milestone.description);
    });

    builder.save(`Proposal-Snapshot-${snapshot.projectData.projectTitle.slice(0, 15)}-${new Date(snapshot.createdAt).toISOString().split('T')[0]}.pdf`);
};

export const generateReportPdf = (
    project: FormData, report: Report, members: Member[], tasks: Task[], highlights: Highlight[], newsReleases: NewsRelease[],
    actuals: Map<string, number>, options: any, settings: AppSettings, events: Event[], eventTickets: EventTicket[], venues: Venue[]
) => {
    const builder = new PdfBuilder('Final Report', project.projectTitle);
    
    builder.addSectionTitle("Project Description"); builder.addMarkdown(report.projectResults);
    builder.addSectionTitle("Financial Report"); builder.addMarkdown(report.grantSpendingDescription);

    const budgetTotals = calculateBudgetTotals(project.budget);
    const ticketCalcs = calculateTicketRevenue(project.id, events, venues, eventTickets);
    const totalActualExpenses = Array.from(actuals.values()).reduce((sum, val) => sum + val, 0);
    const totalProjectedRevenue = budgetTotals.totalRevenue + ticketCalcs.projectedRevenue;
    
    builder.addSubSectionTitle("Budget Summary");
    const summaryBody = [
        ['Total Revenue', formatCurrency(totalProjectedRevenue), formatCurrency(budgetTotals.totalActualRevenue)],
        ['Total Expenses', formatCurrency(budgetTotals.totalExpenses), formatCurrency(totalActualExpenses)],
        ['Balance', formatCurrency(totalProjectedRevenue - budgetTotals.totalExpenses), formatCurrency(budgetTotals.totalActualRevenue - totalActualExpenses)]
    ];
    builder.addTable(['', 'Projected', 'Actual'], summaryBody);
    
    builder.addSectionTitle("Workplan"); builder.addMarkdown(report.workplanAdjustments);
    builder.addSectionTitle("Community Reach"); builder.addList(report.involvedPeople.map(val => options.PEOPLE_INVOLVED_OPTIONS.find((opt: any) => opt.value === val)?.label.replace('... ', '') || val));

    const safeFileName = project.projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    builder.save(`Final-Report-${safeFileName}.pdf`);
};

export const generateSalesPdf = (options: any) => {
    const { title, summary, itemBreakdown, vouchersBreakdown, transactions, itemMap } = options;
    const builder = new PdfBuilder(title);

    if (summary) { builder.addSectionTitle("Financial Summary"); builder.addTable(['Metric', 'Value'], summary.map((s:any) => [s.label, s.value])); }
    if (itemBreakdown && itemBreakdown.length > 0) {
        builder.addSectionTitle("Item Sales Breakdown");
        builder.addTable(['Item', 'Qty', 'Cost/Unit', 'Price/Unit', 'Total Cost', 'Total Revenue', 'Profit'], itemBreakdown.map((item: any) => [item.name, item.quantity, formatCurrency(item.costPrice), formatCurrency(item.salePrice), formatCurrency(item.totalCost), formatCurrency(item.totalRevenue), formatCurrency(item.profit)]));
    }
    if (vouchersBreakdown && vouchersBreakdown.length > 0) {
        builder.addSectionTitle("Voucher Redemptions (Promotional Cost)");
        builder.addTable(['Item', 'Qty Redeemed', 'Cost/Unit', 'Total Cost'], vouchersBreakdown.map((item: any) => [item.name, item.quantity, formatCurrency(item.costPrice), formatCurrency(item.totalCost)]));
    }
    if (transactions && transactions.length > 0) {
        builder.addSectionTitle("Full Transaction Log");
        transactions.forEach((tx: any) => {
            builder.addSubSectionTitle(`Transaction: ${tx.id.slice(-6)} - ${new Date(tx.createdAt).toLocaleString()}`);
            builder.addTable(['Item', 'Qty', 'Price', 'Total'], tx.items.map((item: any) => [itemMap.get(item.inventoryItemId)?.name || 'Unknown Item', item.quantity, formatCurrency(item.pricePerItem), formatCurrency(item.itemTotal)]));
            builder.addParagraph(`Subtotal: ${formatCurrency(tx.subtotal)} | Taxes: ${formatCurrency(tx.taxes)} | Total: ${formatCurrency(tx.total)}`);
        });
    }
    
    const safeFileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    builder.save(`${safeFileName}.pdf`);
};