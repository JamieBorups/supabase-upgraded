
import { AppSettings, JobDescription } from '../types';

declare const jspdf: any;

/**
 * A dedicated PDF builder for creating a document of job descriptions.
 * It ensures each job description starts on a new page.
 */
class JobDescriptionPdfBuilder {
    doc: any;
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

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(this.fontSizes.h1);
        this.doc.setTextColor('#1e293b');
        const docTitleLines = this.doc.splitTextToSize(docTitle, this.pageWidth - this.margin * 2);
        docTitleLines.forEach((line: string) => {
            this.doc.text(line, this.margin, this.y);
            this.y += this.fontSizes.h1 * this.lineHeightRatio;
        });

        if (projectTitle) {
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(this.fontSizes.h2);
            this.doc.setTextColor('#475569');
            const projectTitleLines = this.doc.splitTextToSize(projectTitle, this.pageWidth - this.margin * 2);
            projectTitleLines.forEach((line: string) => {
                this.doc.text(line, this.margin, this.y);
                this.y += this.fontSizes.h2 * this.lineHeightRatio;
            });
        }

        this.doc.setFontSize(this.fontSizes.small);
        this.doc.setTextColor('#64748b');
        this.doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, this.margin, this.y);
        
        this.y += (this.fontSizes.small * this.lineHeightRatio) + 25;
    }

    private checkPageBreak(requiredHeight: number): void {
        if (this.y + requiredHeight > this.pageHeight - this.margin) {
            this.doc.addPage();
            this.y = this.margin;
        }
    }

    private addText(text: string, fontSize: number, fontStyle: 'normal' | 'bold' | 'italic', spacing: { top: number, bottom: number }, color: string = '#334155') {
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

    private addConditionalSection(title: string, content: string | string[] | undefined | null) {
        if (!content || (Array.isArray(content) && content.length === 0) || (typeof content === 'string' && content.trim() === '')) {
            return; // Skip empty sections
        }
        
        this.addSubSectionTitle(title);
        if (Array.isArray(content)) {
            this.addList(content);
        } else {
            this.addParagraph(content);
        }
    }

    addSectionTitle(title: string) {
        this.addText(title, this.fontSizes.h2, 'bold', { top: 15, bottom: 5 }, '#1e293b');
        const underlineY = this.y - 5;
        this.checkPageBreak(5);
        this.doc.setDrawColor('#0d9488');
        this.doc.setLineWidth(1.5);
        this.doc.line(this.margin, underlineY, this.pageWidth - this.margin, underlineY);
        this.y = underlineY + 15;
    }

    addSubSectionTitle(title: string) {
        this.addText(title, this.fontSizes.h3, 'bold', { top: 12, bottom: 0 }, '#334155');
    }

    addParagraph(text: string | null | undefined) {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return;
        }
        this.addText(text, this.fontSizes.p, 'normal', { top: 4, bottom: 12 }, '#334155');
    }

    addList(items: (string | null | undefined)[]) {
        if (!items || items.length === 0) {
            return;
        };
        const listContent = items.filter(Boolean).map(item => `•  ${item}`).join('\n');
        this.addParagraph(listContent);
    }
    
    addJobDescription(jd: JobDescription) {
        this.addSectionTitle(jd.title);
        this.addSubSectionTitle(`Seniority: ${jd.seniorityLevel}`);
        
        this.addConditionalSection('Project Tagline', jd.projectTagline);
        this.addConditionalSection('Project Summary', jd.projectSummary);
        
        this.addConditionalSection('About the Organization', jd.aboutOrg);
        this.addConditionalSection('Role Summary', jd.summary);
        this.addConditionalSection('Key Responsibilities', jd.responsibilities);
        this.addConditionalSection('Qualifications', jd.qualifications);
        
        this.addConditionalSection('Hard Skills', jd.hardSkills);
        this.addConditionalSection('Soft Skills', jd.softSkills);
        
        this.addConditionalSection('Volunteer Benefits', jd.volunteerBenefits);
        this.addConditionalSection('Time Commitment & Logistics', jd.timeCommitment);
        this.addConditionalSection('How to Apply', jd.applicationProcess);
        this.addConditionalSection('Join Us', jd.callToAction);
    }

    save(fileName: string) {
        const safeFileName = fileName.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
        this.doc.save(`${safeFileName}.pdf`);
    }
}


export const generateJobDescriptionsPdf = async (jobDescriptions: JobDescription[], projectTitle: string) => {
    const builder = new JobDescriptionPdfBuilder('Volunteer Job Descriptions', projectTitle);

    jobDescriptions.forEach((jd, index) => {
        if (index > 0) {
            builder.doc.addPage();
            builder.y = builder.margin;
        }
        builder.addJobDescription(jd);
    });

    builder.save(`Volunteer-Job-Descriptions-${projectTitle}`);
};