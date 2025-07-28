
import { 
    AppSettings, FormData as Project, Member, Task, Report, Highlight, NewsRelease, 
    SalesTransaction, ProposalSnapshot, Event, Venue, EventTicket, AppContextType, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, ResearchPlan, EcoStarReport, OtfApplication, NohfcApplication, ComprehensiveEcoStarReport, EcoStarPerspective, ReportSectionContent
} from '../types';
import { PEOPLE_INVOLVED_OPTIONS, GRANT_ACTIVITIES_OPTIONS, IMPACT_QUESTIONS, IMPACT_OPTIONS } from '../constants';

// Declare jspdf as a global variable to be used from the script tag in index.html
declare const jspdf: any;

/**
 * A from-scratch PDF builder that creates free-flowing, document-style reports.
 * It manages its own Y-coordinate, text wrapping, and page breaks to prevent layout issues.
 * Now includes a powerful table generator.
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

    checkPageBreak(requiredHeight: number): void {
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

    addText(text: string, fontSize: number, fontStyle: 'normal' | 'bold' | 'italic', spacing: { top: number, bottom: number }, color: string = '#334155') {
        this.doc.setFont('helvetica', fontStyle);
        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(color);
        const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2);
        const lineHeight = fontSize * this.lineHeightRatio;
        
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
    
    addTable(headers: string[], rows: (string | number)[][], options: { columnStyles?: { width?: number, align?: 'left' | 'center' | 'right' }[] } = {}) {
        const tableWidth = this.pageWidth - this.margin * 2;
        const padding = 5;
        const headerFontSize = this.fontSizes.p;
        const rowFontSize = this.fontSizes.p;
        const lineHeight = rowFontSize * 1.2; // Use a slightly smaller line height for tables

        // 1. Calculate Column Widths
        const numColumns = headers.length;
        let columnWidths: number[] = [];
        if (options.columnStyles && options.columnStyles.length === numColumns) {
            const totalWidth = options.columnStyles.reduce((sum, style) => sum + (style.width || 0), 0);
            if(totalWidth > 0 && totalWidth <= 1) { // Proportional widths
                 columnWidths = options.columnStyles.map(style => (style.width || 1 / numColumns) * tableWidth);
            } else { // Fixed widths
                 columnWidths = options.columnStyles.map(style => style.width || tableWidth / numColumns);
            }
        } else {
            columnWidths = Array(numColumns).fill(tableWidth / numColumns);
        }
        
        const columnAligns = (options.columnStyles || []).map(style => style.align || 'left');

        const drawHeader = () => {
            this.doc.setFont('helvetica', 'bold');
            this.doc.setFontSize(headerFontSize);
            this.doc.setTextColor('#334155'); // slate-700
            this.doc.setFillColor('#f1f5f9'); // slate-100
            
            // Calculate header height
            let maxHeaderLines = 0;
            const wrappedHeaders = headers.map((header, i) => {
                const lines = this.doc.splitTextToSize(header, columnWidths[i] - padding * 2);
                if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
                return lines;
            });
            const headerHeight = maxHeaderLines * lineHeight + padding * 2;

            this.checkPageBreak(headerHeight);
            
            // Draw header background and bottom border
            this.doc.rect(this.margin, this.y, tableWidth, headerHeight, 'F');
            this.doc.setDrawColor('#cbd5e1'); // slate-300
            this.doc.line(this.margin, this.y + headerHeight, this.margin + tableWidth, this.y + headerHeight);
            
            // Draw header text and vertical lines
            let x = this.margin;
            wrappedHeaders.forEach((lines, i) => {
                this.doc.text(lines, x + padding, this.y + padding + rowFontSize);
                x += columnWidths[i];
                if (i < numColumns - 1) {
                    this.doc.line(x, this.y, x, this.y + headerHeight);
                }
            });

            this.y += headerHeight;
        };

        drawHeader(); // Draw the initial header

        // 2. Draw Rows
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(rowFontSize);
        this.doc.setTextColor('#334155');

        rows.forEach((row, rowIndex) => {
            let maxRowLines = 0;
            const wrappedRow = row.map((cell, i) => {
                const text = String(cell || '');
                const lines = this.doc.splitTextToSize(text, columnWidths[i] - padding * 2);
                if (lines.length > maxRowLines) maxRowLines = lines.length;
                return lines;
            });
            const rowHeight = maxRowLines * lineHeight + padding * 2;

            // Check for page break and repeat header if necessary
            if (this.y + rowHeight > this.pageHeight - this.margin) {
                this.doc.addPage();
                this.y = this.margin;
                drawHeader();
            }

            // Zebra striping
            if (rowIndex % 2 !== 0) {
                 this.doc.setFillColor('#f8fafc'); // slate-50
                 this.doc.rect(this.margin, this.y, tableWidth, rowHeight, 'F');
            }

            // Draw row text and vertical lines
            let x = this.margin;
            wrappedRow.forEach((lines, i) => {
                const align = columnAligns[i];
                let textX = x + padding;
                if (align === 'right') textX = x + columnWidths[i] - padding;
                else if (align === 'center') textX = x + columnWidths[i] / 2;
                
                this.doc.text(lines, textX, this.y + padding + rowFontSize, { align: align });
                
                x += columnWidths[i];
                if (i < numColumns - 1) {
                    this.doc.setDrawColor('#e2e8f0'); // slate-200
                    this.doc.line(x, this.y, x, this.y + rowHeight);
                }
            });
            
            this.y += rowHeight;
            // Draw bottom border for the row
            this.doc.setDrawColor('#e2e8f0');
            this.doc.line(this.margin, this.y, this.margin + tableWidth, this.y);
        });

        this.y += 20; // Add some space after the table
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

export const generateEcoStarPdf = async (report: EcoStarReport | ComprehensiveEcoStarReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') throw new Error("Report data is missing or corrupted.");
    
    const isComprehensive = 'individual' in report || 'collective' in report || 'nonprofit' in report || 'municipal' in report;

    if (isComprehensive) {
        const comprehensiveReport = report as ComprehensiveEcoStarReport;
        const builder = new PdfBuilder('Comprehensive ECO-STAR Report', projectTitle);
        
        const perspectives: EcoStarPerspective[] = ['individual', 'collective', 'nonprofit', 'municipal'];
        
        perspectives.forEach(p => {
            const perspectiveReport = comprehensiveReport[p];
            if (perspectiveReport) {
                const perspectiveLabels: Record<EcoStarPerspective, string> = {
                    individual: 'Individual Artist Perspective',
                    collective: 'Ad-hoc Collective Perspective',
                    nonprofit: 'Incorporated Non-Profit Perspective',
                    municipal: 'Municipal Recreation Board Perspective'
                };
                builder.addSectionTitle(perspectiveLabels[p]);

                const sections: { key: keyof EcoStarReport; label: string; }[] = [
                    { key: 'environmentReport', label: 'E – Environment' }, { key: 'customerReport', label: 'C – Customer' },
                    { key: 'opportunityReport', label: 'O – Opportunity' }, { key: 'solutionReport', label: 'S – Solution' },
                    { key: 'teamReport', label: 'T – Team' }, { key: 'advantageReport', label: 'A – Advantage' },
                    { key: 'resultsReport', label: 'R – Results' },
                ];
                
                sections.forEach(section => {
                    const content = (perspectiveReport as any)[section.key] as ReportSectionContent | null;
                    if (content) {
                        builder.addSubSectionTitle(section.label);
                        builder.addMinorSectionTitle('Summary');
                        builder.addParagraph(content.summary);
                        builder.addMinorSectionTitle('Key Considerations');
                        builder.addList(content.keyConsiderations);
                    }
                });
            }
        });
        builder.save(`Comprehensive-ECO-STAR-Report-${projectTitle}`);

    } else {
        const singleReport = report as EcoStarReport;
        const builder = new PdfBuilder('ECO-STAR Supplemental Report', projectTitle);
        const sections: { key: keyof EcoStarReport; label: string; }[] = [
            { key: 'environmentReport', label: 'E – Environment' }, { key: 'customerReport', label: 'C – Customer' },
            { key: 'opportunityReport', label: 'O – Opportunity' }, { key: 'solutionReport', label: 'S – Solution' },
            { key: 'teamReport', label: 'T – Team' }, { key: 'advantageReport', label: 'A – Advantage' },
            { key: 'resultsReport', label: 'R – Results' },
        ];
        
        sections.forEach(section => {
            const content = (singleReport as any)[section.key] as any;
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
    }
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
    builder.addSectionTitle('Project Management');
    builder.addParagraph(plan.projectManagement);
    builder.addSectionTitle('Sustainability');
    builder.addParagraph(plan.sustainability);
    builder.addSectionTitle('Risks and Risk Mitigation');
    builder.addParagraph(plan.risksAndMitigation);
    builder.addSectionTitle('Project Evaluation');
    builder.addParagraph(plan.projectEvaluation);

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
        const headers = ['Deliverable', 'Key Task', 'Timing', 'Justification'];
        const rows = app.projectPlan.map(item => [
            item.deliverable,
            item.keyTask,
            item.timing,
            item.justification
        ]);
        builder.addTable(headers, rows, {
            columnStyles: [
                { width: 0.2 }, { width: 0.3 }, { width: 0.15 }, { width: 0.35 },
            ]
        });
    }

    builder.addSectionTitle('Budget');
    if (app.budgetItems && app.budgetItems.length > 0) {
        const headers = ['Category', 'Item', 'Cost Breakdown', 'Requested Amount'];
        const rows = app.budgetItems.map(item => [
            item.category,
            item.itemDescription,
            item.costBreakdown,
            formatCurrency(item.requestedAmount)
        ]);
        builder.addTable(headers, rows, {
            columnStyles: [
                { width: 0.25 }, { width: 0.25 }, { width: 0.35 }, { width: 0.15, align: 'right' },
            ]
        });
    }

    builder.save(`OTF-Application-${app.title}`);
}

export const generateNohfcPdf = async (app: NohfcApplication, projectTitle: string) => {
    const builder = new PdfBuilder('NOHFC Application Draft', projectTitle);
    
    builder.addSectionTitle('Section 1: About the Project');
    builder.addSubSectionTitle('1a. Organization Description');
    builder.addParagraph(app.question_1a);
    builder.addSubSectionTitle('1b. Enhanced Organization Description');
    builder.addParagraph(app.question_1b);
    builder.addSubSectionTitle('1c. Why is the project being undertaken?');
    builder.addParagraph(app.question_1c);
    builder.addSubSectionTitle('1d. Enhanced: Why is the project being undertaken?');
    builder.addParagraph(app.question_1d);
    builder.addSubSectionTitle('1e. Is the project identified in a planning process such as a current community or organizational plan? Please explain.');
    builder.addParagraph(app.question_1e);
    builder.addSubSectionTitle('1f. Enhanced: Is the project identified in a planning process?');
    builder.addParagraph(app.question_1f);
    builder.addSubSectionTitle('2a. What are the key activities that will be undertaken to complete the project?');
    builder.addParagraph(app.question_2a);
    builder.addSubSectionTitle('2b. Enhanced: Key project activities');
    builder.addParagraph(app.question_2b);

    builder.addSectionTitle('Section 2: Project Outcomes and Benefits');
    builder.addSubSectionTitle('3a. What are the expected outcomes and benefits of the project?');
    builder.addParagraph(app.question_3a);
    builder.addSubSectionTitle('3b. Enhanced: Expected outcomes and benefits');
    builder.addParagraph(app.question_3b);
    
    builder.addSectionTitle('Section 3: Technical, Managerial and Financial Capacity');
    builder.addSubSectionTitle('4a. Please identify the technical, managerial and financial capacity for implementing the project:');
    builder.addParagraph(app.question_4a);
    builder.addSubSectionTitle('4b. Enhanced: Capacity for implementing');
    builder.addParagraph(app.question_4b);
    builder.addSubSectionTitle('5a. Please identify the technical, managerial and financial capacity for sustaining the facility:');
    builder.addParagraph(app.question_5a);
    builder.addSubSectionTitle('5b. Enhanced: Capacity for sustaining');
    builder.addParagraph(app.question_5b);
    builder.addSubSectionTitle('6a. Please explain how the project builds on and optimizes the capacity and efficiency of existing infrastructure.');
    builder.addParagraph(app.question_6a);
    builder.addSubSectionTitle('6b. Enhanced: Optimizing existing infrastructure');
    builder.addParagraph(app.question_6b);
    
    builder.addSectionTitle('Section 4: Justification');
    builder.addSubSectionTitle('7a. Why is NOHFC funding necessary for the completion of the project?');
    builder.addParagraph(app.question_7a);
    builder.addSubSectionTitle('7b. Enhanced: Need for NOHFC funding');
    builder.addParagraph(app.question_7b);
    builder.addSubSectionTitle('8a. In addition to the funding sources identified herein , have you approached or applied to any other funding programs?');
    builder.addParagraph(app.question_8a);
    builder.addSubSectionTitle('8b. Enhanced: Other funding applications');
    builder.addParagraph(app.question_8b);

    builder.addSectionTitle('Project Budget');
    if (app.budgetItems && app.budgetItems.length > 0) {
        const headers = ['Category', 'Item', 'Cost Breakdown', 'Requested Amount', 'Justification'];
        const rows = app.budgetItems.map(item => [
            item.category,
            item.itemDescription,
            item.costBreakdown,
            formatCurrency(item.requestedAmount),
            item.justification
        ]);
        builder.addTable(headers, rows, {
            columnStyles: [
                { width: 0.15 }, { width: 0.20 }, { width: 0.20 }, { width: 0.15, align: 'right' }, { width: 0.30 }
            ]
        });

        const subtotal = app.budgetItems.reduce((sum, item) => sum + (item.requestedAmount || 0), 0);
        const adminFee = subtotal * 0.15;
        const total = subtotal + adminFee;

        const lineHeight = builder.fontSizes.p * builder.lineHeightRatio;
        builder.checkPageBreak(3 * lineHeight + 20); // Check space for 3 lines + padding
        builder.y += 20;

        const labelX = builder.pageWidth - builder.margin - 200;
        const valueX = builder.pageWidth - builder.margin;
        
        builder.doc.setFont('helvetica', 'normal');
        builder.doc.setFontSize(builder.fontSizes.p);
        
        builder.doc.text('Subtotal:', labelX, builder.y);
        builder.doc.text(formatCurrency(subtotal), valueX, builder.y, { align: 'right' });
        builder.y += lineHeight;
        
        builder.doc.text('Administrative Fee (15%):', labelX, builder.y);
        builder.doc.text(formatCurrency(adminFee), valueX, builder.y, { align: 'right' });
        builder.y += lineHeight;

        builder.doc.setDrawColor('#475569'); // slate-600
        builder.doc.setLineWidth(0.5);
        builder.doc.line(labelX, builder.y, valueX, builder.y);
        builder.y += 5;

        builder.doc.setFont('helvetica', 'bold');
        builder.doc.text('Total NOHFC Request:', labelX, builder.y);
        builder.doc.text(formatCurrency(total), valueX, builder.y, { align: 'right' });
        builder.y += lineHeight + 5;
    }

    builder.save(`NOHFC-Application-${app.title}`);
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