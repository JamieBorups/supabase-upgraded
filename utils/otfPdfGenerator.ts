
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OtfApplication } from '../types';

const formatCurrency = (value: number | null | undefined) => (value || 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

/**
 * A from-scratch PDF builder that creates free-flowing, document-style reports without tables for layout.
 * It manages its own Y-coordinate, text wrapping, and page breaks to prevent layout issues.
 * This class is a direct copy of the superior PdfBuilder from the main generator to ensure style consistency.
 */
class OtfPdfBuilder {
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

    addTable(head: string[][], body: (string|number|React.ReactNode)[][]) {
        this.checkPageBreak(40);
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


export const generateOtfPdf = (app: OtfApplication) => {
    const builder = new OtfPdfBuilder('Ontario Trillium Foundation - Seed Grant Application', app.title);

    // Organization Information
    builder.addSectionTitle('Organization Information');
    builder.addSubSectionTitle('Mission Statement');
    builder.addParagraph(app.missionStatement);
    builder.addSubSectionTitle('Typical Activities');
    builder.addParagraph(app.activitiesDescription);

    // Project Information
    builder.addSectionTitle('Project Information');
    builder.addSubSectionTitle('Project Description');
    builder.addParagraph(app.projDescription);
    builder.addSubSectionTitle('Why and Who Benefits');
    builder.addParagraph(app.projWhyAndWhoBenefits);
    builder.addSubSectionTitle('Impact Explanation');
    builder.addParagraph(app.projImpactExplanation);

    // Project Plan
    builder.addSectionTitle('Project Plan');
    if (app.projectPlan && app.projectPlan.length > 0) {
        builder.addTable(
            [['Deliverable', 'Key Task', 'Timing']],
            app.projectPlan.map(p => [p.deliverable, p.keyTask, p.timing])
        );
    }

    // Justification
    builder.addSectionTitle('Justification');
    builder.addParagraph(app.justificationIntro);
    if(app.projectPlan) {
        app.projectPlan.forEach(item => {
            if (item.justification) {
                builder.addMinorSectionTitle(`Justification for: ${item.deliverable}`);
                builder.addParagraph(item.justification);
            }
        });
    }
    builder.addParagraph(app.justificationOutro);


    // Board of Directors
    if (app.boardMembers && app.boardMembers.length > 0) {
        builder.addSectionTitle('Board of Directors');
        builder.addTable(
            [['Name', 'Position', 'Term Start', 'Term End']],
            app.boardMembers.map(m => [`${m.firstName} ${m.lastName}`, m.position, m.termStartDate, m.termEndDate])
        );
    }

    // Project Budget
    builder.addSectionTitle('Project Budget');
    if (app.budgetItems && app.budgetItems.length > 0) {
        const subtotal = app.budgetItems.filter(i => i.category !== 'Overhead and Administration Costs').reduce((sum, i) => sum + (i.requestedAmount || 0), 0);
        const adminFee = subtotal * 0.15;
        const total = subtotal + adminFee;

        builder.addTable(
            [['Category', 'Item', 'Cost Breakdown', 'Amount']],
            app.budgetItems.map(item => [item.category, item.itemDescription, item.costBreakdown, formatCurrency(item.requestedAmount || 0)])
        );
        
        builder.y += 10;
        builder.addParagraph(`Subtotal: ${formatCurrency(subtotal)}`);
        builder.addParagraph(`Overhead & Admin (15%): ${formatCurrency(adminFee)}`);
        builder.addParagraph(`Total: ${formatCurrency(total)}`, { fontStyle: 'bold' });
    }


    const safeFileName = app.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 30);
    builder.save(`OTF-Application-${safeFileName}-${new Date().toISOString().split('T')[0]}.pdf`);
};
