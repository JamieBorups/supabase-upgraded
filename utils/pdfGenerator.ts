import { 
    AppSettings, FormData as Project, Member, Task, Report, Highlight, NewsRelease, 
    SalesTransaction, ProposalSnapshot, Event, Venue, EventTicket, AppContextType, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, ResearchPlan, EcoStarReport, OtfApplication, JobDescription
} from '../types';
import { PEOPLE_INVOLVED_OPTIONS, GRANT_ACTIVITIES_OPTIONS, IMPACT_QUESTIONS, IMPACT_OPTIONS } from '../constants';

// Declare jspdf as a global variable to be used from the script tag in index.html
declare const jspdf: any;

/**
 * A from-scratch PDF builder that creates free-flowing, document-style reports without tables for layout.
 * It manages its own Y-coordinate, text wrapping, and page breaks to prevent layout issues.
 */
class PdfBuilder {
    doc: any; // jsPDF instance
    y: number;
    pageHeight: number;
    pageWidth: number;
    margin: number;
    lineHeightRatio: number;
    fontSizes: { h1: number, h2: number, h3: number, h4: number, p: number, small: number };

    constructor(docTitle: string, projectTitle?: string) {
        this.doc = new jspdf.jsPDF('p', 'pt', 'a4');
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
        const docTitleLines = this.doc.splitTextToSize(docTitle, this.pageWidth - this.margin * 2);
        docTitleLines.forEach((line: string) => {
            this.doc.text(line, this.margin, this.y);
            this.y += this.fontSizes.h1 * this.lineHeightRatio;
        });


        if (projectTitle) {
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(this.fontSizes.h2);
            this.doc.setTextColor('#475569'); // slate-600
            const projectTitleLines = this.doc.splitTextToSize(projectTitle, this.pageWidth - this.margin * 2);
            projectTitleLines.forEach((line: string) => {
                this.doc.text(line, this.margin, this.y);
                this.y += this.fontSizes.h2 * this.lineHeightRatio;
            });
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
        // 1. Calculate required dimensions
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h2);
        const lines = this.doc.splitTextToSize(title, this.pageWidth - this.margin * 2);
        const lineHeight = this.fontSizes.h2 * this.lineHeightRatio;
        const textHeight = lines.length * lineHeight;
        
        // Total height: top margin + text block height + space to line + line width + bottom margin
        const requiredHeight = 15 + textHeight + 3 + 1.5 + 15;
        
        // 2. Check for page break
        this.checkPageBreak(requiredHeight);

        // 3. Draw elements
        this.y += 15; // Top margin
        
        this.doc.setTextColor('#1e293b');
        lines.forEach((line: string) => {
            this.doc.text(line, this.margin, this.y);
            this.y += lineHeight;
        });
        
        const lastLineBaselineY = this.y - lineHeight;
        const underlineY = lastLineBaselineY + 3; // 3pt below the baseline
        
        this.doc.setDrawColor('#0d9488'); // teal-600
        this.doc.setLineWidth(1.5);
        this.doc.line(this.margin, underlineY, this.pageWidth - this.margin, underlineY);
        
        this.y = underlineY + 15;
    }

    addSubSectionTitle(title: string) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h3);
        this.doc.setTextColor('#334155');
        this.addText(title, this.fontSizes.h3, 'bold', {top: 12, bottom: 0});
    }
    
    addMinorSectionTitle(title: string) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h4);
        this.doc.setTextColor('#475569');
        this.addText(title, this.fontSizes.h4, 'bold', {top: 10, bottom: 0});
    }

    addParagraph(text: string | null | undefined) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            this.doc.setFont('helvetica', 'italic');
            this.doc.setFontSize(this.fontSizes.p);
            this.doc.setTextColor('#94a3b8');
            this.addText('N/A', this.fontSizes.p, 'italic', {top: 4, bottom: 12});
            return;
        }
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(this.fontSizes.p);
        this.doc.setTextColor('#334155');
        this.addText(text, this.fontSizes.p, 'normal', { top: 4, bottom: 12 });
    }

    private addText(text: string, fontSize: number, fontStyle: 'normal' | 'bold' | 'italic', spacing: { top: number, bottom: number }) {
        this.doc.setFont('helvetica', fontStyle);
        this.doc.setFontSize(fontSize);
        const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2);
        const lineHeight = fontSize * this.lineHeightRatio;
        const textHeight = lines.length * lineHeight;
        
        // This is the core logic that prevents text from being split awkwardly.
        // It checks line by line if a page break is needed.
        this.y += spacing.top;
        lines.forEach((line: string) => {
            this.checkPageBreak(lineHeight);
            this.doc.text(line, this.margin, this.y);
            this.y += lineHeight;
        });
        this.y += spacing.bottom;
    }

    addList(items: (string | null | undefined)[]) {
        if (!items || items.length === 0) {
            this.addParagraph('N/A');
            return;
        };
        const listContent = items.filter(Boolean).map(item => `•  ${item}`).join('\n');
        this.addParagraph(listContent);
    }

    save(fileName: string) {
        // Sanitize filename
        const safeFileName = fileName.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
        this.doc.save(`${safeFileName}.pdf`);
    }
}

const formatCurrency = (value: number | undefined | null) => {
    const num = value || 0;
    return num.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
};

// --- Supplemental Reports ---

export const generateEcoStarPdf = async (report: EcoStarReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    
    const builder = new PdfBuilder('ECO-STAR Supplemental Report', projectTitle);
    const sections: { key: keyof EcoStarReport; label: string; }[] = [
        { key: 'environmentReport', label: 'E – Environment' }, { key: 'customerReport', label: 'C – Customer' },
        { key: 'opportunityReport', label: 'O – Opportunity' }, { key: 'solutionReport', label: 'S – Solution' },
        { key: 'teamReport', label: 'T – Team' }, { key: 'advantageReport', label: 'A – Advantage' },
        { key: 'resultsReport', label: 'R – Results' },
    ];
    
    sections.forEach(section => {
        const content = report[section.key] as any;
        if (content) {
            builder.addSectionTitle(section.label);
            builder.addSubSectionTitle('Summary');
            builder.addParagraph(content.summary);

            builder.addSubSectionTitle('Key Considerations');
            builder.addList(content.keyConsiderations);
            
            builder.addSubSectionTitle('Follow-up Questions');
            if (Array.isArray(content.followUpQuestions) && content.followUpQuestions.length > 0) {
                content.followUpQuestions.forEach((qa: any) => {
                    builder.addMinorSectionTitle(qa.question);
                    builder.addParagraph(qa.sampleAnswer);
                });
            } else {
                 builder.addParagraph('N/A');
            }
        }
    });

    builder.save(`ECO-STAR-Report-${projectTitle}`);
};

export const generateInterestCompatibilityPdf = async (report: InterestCompatibilityReport, projectTitle: string) => {
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
    
    builder.save(`Interest-Compatibility-Report-${projectTitle}`);
};

export const generateSdgPdf = async (report: SdgAlignmentReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') {
        throw new Error("Report data is missing or corrupted.");
    }
    
    const builder = new PdfBuilder('SDG Alignment Report', projectTitle);
    
    if (report.executiveSummary) {
        builder.addSectionTitle('Executive Summary');
        builder.addParagraph(report.executiveSummary);
    }
    
    const analysisItems = report.detailedAnalysis;
    if (Array.isArray(analysisItems) && analysisItems.length > 0) {
        builder.addSectionTitle('Detailed SDG Analysis');
        analysisItems.forEach(goal => {
            if (typeof goal !== 'object' || goal === null) return;
            
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
    
    builder.save(`SDG-Alignment-Report-${projectTitle}`);
};

export const generateRecreationFrameworkPdf = async (report: RecreationFrameworkReport, projectTitle: string) => {
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

    builder.save(`Recreation-Framework-Report-${projectTitle}`);
};

export const generateResearchPlanPdf = async (plan: ResearchPlan, projectTitle: string) => {
    const builder = new PdfBuilder('Research Plan', projectTitle);
    builder.addParagraph(plan.notes);
    builder.addSectionTitle('Overview');
    builder.addParagraph(plan.titleAndOverview);
    builder.addSectionTitle('Research Questions');
    builder.addParagraph(plan.researchQuestions);
    builder.addSectionTitle('Community Engagement');
    builder.addParagraph(plan.communityEngagement);
    builder.addSectionTitle('Design & Methodology');
    builder.addParagraph(plan.designAndMethodology);
    builder.addSectionTitle('Ethical Considerations');
    builder.addParagraph(plan.ethicalConsiderations);
    builder.addSectionTitle('Knowledge Mobilization');
    builder.addParagraph(plan.knowledgeMobilization);

    builder.save(`Research-Plan-${projectTitle}`);
}

export const generateOtfPdf = async (app: OtfApplication, projectTitle: string) => {
    const builder = new PdfBuilder('OTF Application Draft', projectTitle);
    
    builder.addSectionTitle('Organization Information');
    builder.addSubSectionTitle('Mission');
    builder.addParagraph(app.missionStatement);
    builder.addSubSectionTitle('Typical Activities');
    builder.addParagraph(app.activitiesDescription);

    builder.addSectionTitle('Project Information');
    builder.addParagraph(app.projDescription);
    builder.addSubSectionTitle('Funding Priority & Objective');
    builder.addParagraph(`Priority: ${app.projFundingPriority}`);
    builder.addParagraph(`Objective: ${app.projObjective}`);
    
    builder.addSectionTitle('Project Plan');
    if (app.projectPlan && app.projectPlan.length > 0) {
        app.projectPlan.forEach(item => {
            builder.addSubSectionTitle(item.deliverable);
            builder.addMinorSectionTitle('Key Task');
            builder.addParagraph(item.keyTask);
            builder.addMinorSectionTitle('Timing');
            builder.addParagraph(item.timing);
            builder.addMinorSectionTitle('Justification');
            builder.addParagraph(item.justification);
        });
    }

    builder.addSectionTitle('Budget');
    if (app.budgetItems && app.budgetItems.length > 0) {
        app.budgetItems.forEach(item => {
            builder.addSubSectionTitle(`${item.category}: ${item.itemDescription}`);
            builder.addParagraph(`Cost Breakdown: ${item.costBreakdown}`);
            builder.addParagraph(`Amount: ${formatCurrency(item.requestedAmount)}`);
        });
    }

    builder.save(`OTF-Application-${app.title}`);
}

export const generateJobDescriptionsPdf = async (jobDescriptions: JobDescription[], projectTitle: string) => {
    const builder = new PdfBuilder('Project Job Descriptions', projectTitle);

    jobDescriptions.forEach(jd => {
        const seniorityText = `Seniority: ${jd.seniorityLevel}`;
        builder.addSectionTitle(jd.title);
        builder.addSubSectionTitle(seniorityText);
        
        builder.addMinorSectionTitle('Summary');
        builder.addParagraph(jd.summary);

        builder.addMinorSectionTitle('Key Responsibilities');
        builder.addList(jd.responsibilities);

        builder.addMinorSectionTitle('Qualifications');
        builder.addList(jd.qualifications);

        builder.addMinorSectionTitle('Hard Skills');
        builder.addParagraph(jd.hardSkills.join(', '));
        
        builder.addMinorSectionTitle('Soft Skills');
        builder.addParagraph(jd.softSkills.join(', '));
    });

    builder.save(`Job-Descriptions-${projectTitle}`);
};

// --- Dynamic Reports ---

export const generateReportPdf = async (
    project: Project, report: Report, members: Member[], tasks: Task[], highlights: Highlight[], newsReleases: NewsRelease[],
    actuals: Map<string, number>, settings: AppSettings, events: Event[], eventTickets: EventTicket[], venues: Venue[]
) => {
    const builder = new PdfBuilder('Final Report', project.projectTitle);

    builder.addSectionTitle('Project Results');
    builder.addParagraph(report.projectResults);

    builder.addSectionTitle('Financial Report');
    builder.addParagraph(report.grantSpendingDescription);

    builder.addSectionTitle('Workplan Adjustments');
    builder.addParagraph(report.workplanAdjustments);

    builder.addSectionTitle('Community Reach');
    builder.addSubSectionTitle('Individuals Involved');
    builder.addList(report.involvedPeople.map(p => PEOPLE_INVOLVED_OPTIONS.find(o => o.value === p)?.label || p));
    
    builder.addSubSectionTitle('Activities Involved');
    builder.addList(report.involvedActivities.map(a => GRANT_ACTIVITIES_OPTIONS.find(o => o.value === a)?.label || a));
    
    builder.addSectionTitle('Impact Assessment');
    IMPACT_QUESTIONS.forEach(q => {
        const answer = report.impactStatements[q.id];
        const answerLabel = IMPACT_OPTIONS.find(opt => opt.value === answer)?.label || 'Not answered';
        builder.addSubSectionTitle(q.label);
        builder.addParagraph(answerLabel);
    });

    builder.save(`Final-Report-${project.projectTitle}`);
};

export const generateSalesPdf = async (options: {
    title: string;
    summary?: { label: string; value: string; }[];
    itemBreakdown?: any[];
    vouchersBreakdown?: any[];
    transactions?: any[];
    itemMap: Map<string, any>;
    sessionMap: Map<string, any>;
}) => {
    const builder = new PdfBuilder(options.title);

    if (options.summary) {
        builder.addSectionTitle('Summary');
        options.summary.forEach((item: {label: string, value: string}) => {
            builder.addParagraph(`${item.label}: ${item.value}`);
        });
    }

    if (options.itemBreakdown && options.itemBreakdown.length > 0) {
        builder.addSectionTitle('Item Sales Breakdown');
        builder.addParagraph(
            options.itemBreakdown.map((item: any) => 
                `${item.name}: ${item.quantity} sold for ${formatCurrency(item.totalRevenue)} (Profit: ${formatCurrency(item.profit)})`
            ).join('\n')
        );
    }
    
    if (options.transactions && options.transactions.length > 0) {
        builder.addSectionTitle('Transaction Log');
        options.transactions.forEach((tx: any) => {
            const itemsText = tx.items.map((item: any) => `${item.quantity}x ${options.itemMap.get(item.inventoryItemId)?.name || 'Unknown'}`).join(', ');
            builder.addMinorSectionTitle(`Transaction on ${new Date(tx.createdAt).toLocaleString()} - Total: ${formatCurrency(tx.total)}`);
            builder.addParagraph(`Items: ${itemsText}`);
        });
    }

    builder.save(`${options.title}`);
};

export const generateProposalSnapshotPdf = async (snapshot: ProposalSnapshot, context: AppContextType) => {
     const builder = new PdfBuilder('Proposal Snapshot', snapshot.projectData.projectTitle);
     builder.addParagraph(`Snapshot created on: ${new Date(snapshot.createdAt).toLocaleString()}`);
     builder.addParagraph(`Notes: ${snapshot.notes || 'N/A'}`);

     builder.addSectionTitle('Project Description');
     builder.addParagraph(snapshot.projectData.projectDescription);
     
     builder.addSectionTitle('Background');
     builder.addParagraph(snapshot.projectData.background);

     builder.addSectionTitle('Schedule');
     builder.addParagraph(snapshot.projectData.schedule);

     builder.save(`Snapshot-${snapshot.projectData.projectTitle}`);
};