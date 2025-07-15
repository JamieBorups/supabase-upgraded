
import jsPDF from 'jspdf';
import { AppSettings, FormData, Member, Task, Report, Highlight, NewsRelease, SalesTransaction, InventoryItem, SaleSession, EcoStarReport, ReportSectionContent, InterestCompatibilityReport, SdgAlignmentReport, RecreationFrameworkReport, KpiReport } from '../types';

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
            this.doc.setFont('helvetica', 'italic');
            this.doc.setFontSize(this.fontSizes.p);
            this.doc.setTextColor('#94a3b8'); // slate-400
            this.addText('N/A', this.fontSizes.p, 'italic', {top: 4, bottom: 12});
            return;
        }

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(this.fontSizes.p);
        this.doc.setTextColor('#334155');
        this.addText(text, this.fontSizes.p, 'normal', { top: 4, bottom: 12 });
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


// --- Report Generation Functions (Rewritten to use the new builder) ---

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

export const generateKpiPdf = (report: KpiReport, projectTitle: string) => {
    if (!report || typeof report !== 'object') {
        throw new Error("Report data is missing or corrupted.");
    }

    const builder = new PdfBuilder('Key Performance Indicator (KPI) Report', projectTitle);
    
    if (report.notes) {
        builder.addSectionTitle('Notes');
        builder.addParagraph(report.notes);
    }
    
    if (report.kpiData && Array.isArray(report.kpiData)) {
        builder.addSectionTitle('Key Performance Indicators');
        
        report.kpiData.forEach(kpi => {
            if (kpi.kpiDetails) {
                builder.addSubSectionTitle(`${kpi.kpiDetails.kpiId}: ${kpi.kpiDetails.title}`);
                
                builder.addMinorSectionTitle('Description');
                builder.addParagraph(kpi.kpiDetails.description);

                if (kpi.relevanceNotes) {
                    builder.addMinorSectionTitle('Relevance to Project');
                    builder.addParagraph(kpi.relevanceNotes);
                }
                
                if (kpi.targetValue) {
                    builder.addMinorSectionTitle('Target Value');
                    builder.addParagraph(kpi.targetValue);
                }
                
                if (kpi.currentValue) {
                    builder.addMinorSectionTitle('Current Value');
                    builder.addParagraph(kpi.currentValue);
                }
            }
        });
    } else {
        builder.addSectionTitle('Key Performance Indicators');
        builder.addParagraph('No detailed KPI data was saved with this report.');
    }

    builder.save(`KPI-Report-${projectTitle.slice(0, 15)}-${new Date().toISOString().split('T')[0]}.pdf`);
};


// --- Legacy stubs for other reports that can be upgraded later ---
export const generateReportPdf = (project: FormData, report: Report, members: Member[], tasks: Task[], highlights: Highlight[], newsReleases: NewsRelease[], actuals: Map<string, number>, options: any, settings: AppSettings) => {
    console.error("generateReportPdf needs to be updated to use the new PdfBuilder.");
    alert("This PDF generator is not yet updated. Please check back later.");
};

export const generateSalesPdf = (options: any) => {
    console.error("generateSalesPdf needs to be updated to use the new PdfBuilder.");
    alert("This PDF generator is not yet updated. Please check back later.");
};
