


import { marked, type Token } from 'marked';
import { OtfApplication, OtfBoardMember, OtfSeniorStaff, OtfCollaborator, OtfProjectPlanItem, OtfBudgetItem, OtfQuote } from '../types';

// --- PDFMAKE INITIALIZATION ---
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

// --- UTILITY FUNCTIONS ---
const formatCurrency = (value: number | null | undefined) => (value || 0).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
const yesNo = (val?: boolean) => (val === true ? 'Yes' : (val === false ? 'No' : 'N/A'));
const na = (val: any) => (val !== null && val !== undefined && val !== '') ? String(val) : 'N/A';

// --- MARKDOWN TO PDFMAKE CONVERSION ---
function decodeEntities(encodedString: string): string {
    if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = encodedString;
        return textArea.value;
    }
    return encodedString.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#32;/g, ' ').replace(/&nbsp;/g, '\u00A0');
}

function parseInlineTokens(tokens: Token[]): any[] {
    const content: any[] = [];
    tokens.forEach(token => {
        switch (token.type) {
            case 'strong': content.push({ text: decodeEntities(token.text), bold: true }); break;
            case 'em': content.push({ text: decodeEntities(token.text), italics: true }); break;
            case 'link': content.push({ text: decodeEntities(token.text), link: token.href, style: 'link' }); break;
            case 'codespan': content.push({ text: decodeEntities(token.text), style: 'code_inline' }); break;
            case 'text': content.push({ text: decodeEntities(token.text) }); break;
            default: content.push({ text: (token as any).raw }); break;
        }
    });
    return content;
}

function parseBlockTokens(tokens: Token[]): any[] {
    const elements: any[] = [];
    tokens.forEach(token => {
        switch (token.type) {
            case 'paragraph': elements.push({ text: parseInlineTokens(token.tokens), style: 'p' }); break;
            case 'heading': elements.push({ text: parseInlineTokens(token.tokens), style: `h${token.depth + 1}` }); break;
            case 'list': elements.push({ [token.ordered ? 'ol' : 'ul']: token.items.map(item => parseBlockTokens(item.tokens)), style: 'p', margin: [10, 5, 0, 5] }); break;
            case 'blockquote': elements.push({ stack: parseBlockTokens(token.tokens), style: 'blockquote' }); break;
            case 'hr': elements.push({ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#cbd5e1' }], margin: [0, 10, 0, 10] }); break;
            case 'code': elements.push({ text: token.text, style: 'code_block' }); break;
            case 'text':
                if (token.tokens) {
                    elements.push({ text: parseInlineTokens(token.tokens), style: 'p' });
                } else {
                    elements.push({ text: decodeEntities(token.text), style: 'p' });
                }
                break;
            case 'space': break;
            default:
                console.warn('Unhandled markdown token type:', token.type);
                elements.push({ text: token.raw, style: 'p' });
                break;
        }
    });
    return elements;
}

function markdownToPdfmake(markdownText: string | null | undefined): any[] {
    if (!markdownText || typeof markdownText !== 'string' || markdownText.trim() === '') {
        return [{ text: 'N/A', style: 'italic', margin: [0, 0, 0, 10] }];
    }
    const tokens = marked.lexer(markdownText);
    return parseBlockTokens(tokens);
}

// --- PDF BUILDER CLASS ---
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
            defaultStyle: { fontSize: 10 }
        };

        this.docDefinition.content.push({ text: docTitle, style: 'h1' });
        if (projectTitle) { this.docDefinition.content.push({ text: projectTitle, style: 'h2', margin: [0, 0, 0, 5] }); }
        this.docDefinition.content.push({ text: `Report Generated: ${new Date().toLocaleDateString()}`, style: 'small', margin: [0, 0, 0, 25] });
    }

    addSectionTitle(title: string) {
        this.docDefinition.content.push({ text: title, style: 'h2' });
        this.docDefinition.content.push({ canvas: [{ type: 'line', x1: 0, y1: 2, x2: 515, y2: 2, lineWidth: 1.5, lineColor: '#0d9488' }], margin: [0, 0, 0, 15] });
    }
    addSubSectionTitle(title: string) { this.docDefinition.content.push({ text: title, style: 'h3' }); }
    addMinorSectionTitle(title: string) { this.docDefinition.content.push({ text: title, style: 'h4' }); }
    addMarkdown(markdownText: string | null | undefined) { this.docDefinition.content.push(...markdownToPdfmake(markdownText)); }
    addList(items: string[]) { if (!items || items.length === 0) return; this.docDefinition.content.push({ ul: items.map(item => ({ text: item })), style: 'p' }); }
    addTable(head: string[], body: any[][], widths: (string|number)[] = Array(head.length).fill('*')) {
        this.docDefinition.content.push({
            style: 'tableStyle',
            table: { headerRows: 1, widths, body: [head.map(h => ({ text: h, style: 'tableHeader' })), ...body.map(row => row.map(cell => (typeof cell === 'object' && cell !== null && !Array.isArray(cell)) ? cell : String(cell)))] },
            layout: 'lightHorizontalLines'
        });
    }
    addDefinition(term: string, definition: string | undefined | null) {
        if (definition === undefined || definition === null || definition.trim() === '') return;
        this.docDefinition.content.push({
            text: [{ text: `${term}: `, bold: true }, definition],
            style: 'p'
        });
    }
    save(fileName: string) {
        try { pdfMake.createPdf(this.docDefinition).download(fileName); } catch (error: any) {
            console.error("PDF Generation Error:", error);
            alert(`PDF generation failed: ${error.message}. See console for details.`);
        }
    }
}


// --- MAIN PDF GENERATION FUNCTION ---
export const generateOtfPdf = (app: OtfApplication) => {
    const builder = new PdfBuilder('Ontario Trillium Foundation - Seed Grant Application', app.title);
    
    // --- ORGANIZATION INFORMATION ---
    builder.addSectionTitle('Organization Information');
    builder.addSubSectionTitle('Basic Idea & Mission');
    builder.addDefinition('Basic Idea', app.basicIdea);
    builder.addDefinition('Mission Statement', app.missionStatement);
    builder.addDefinition('Typical Activities', app.activitiesDescription);
    
    builder.addSubSectionTitle('Organizational Details');
    builder.addTable([], [['Sector', na(app.sector)], ['People Served Annually', na(app.peopleServedAnnually)], ['Paid Staff', na(app.paidStaffCount)], ['Volunteers', na(app.volunteerCount)],], [150, '*']);
    
    builder.addSubSectionTitle('Population Served');
    builder.addDefinition('Languages', na((app.languagePopulationServed || []).join(', ')));
    builder.addDefinition('Genders', na((app.genderPopulationServed || []).join(', ')));
    builder.addDefinition('Lived Experience', na((app.livedExperiencePopulationServed || []).join(', ')));
    builder.addDefinition('Identity Groups', na((app.identityPopulationServed || []).join(', ')));
    builder.addDefinition('Leadership Reflects Community', na(app.leadershipReflectsCommunity));

    builder.addSubSectionTitle('Bilingual Services');
    builder.addTable([], [['Offers Bilingual Services', yesNo(app.offersBilingualServices)], ...(app.offersBilingualServices ? [['Bilingual Mandate Type', na(app.bilingualMandateType)]] : []), ['Serves Francophone Population', yesNo(app.servesFrancophonePopulation)], ...(app.servesFrancophonePopulation ? [['% of People Served in French', `${na(app.frenchServicesPeoplePercentage)}%`], ['% of Programs in French', `${na(app.frenchProgramsPercentage)}%`]] : []),], [150, '*']);
    
    // --- FINANCIAL HEALTH & GOVERNANCE ---
    builder.addSectionTitle('Financial Health & Governance');
    builder.addDefinition('Financial Statement URL', app.financialStatementUrl);
    builder.addDefinition('Has Surplus or Deficit?', yesNo(app.hasSurplusOrDeficit));
    if (app.hasSurplusOrDeficit) { builder.addDefinition('Surplus/Deficit Info URL', app.surplusDeficitInfoUrl); }
    builder.addDefinition('By-Laws URL', app.byLawsUrl);
    
    builder.addSubSectionTitle('Board of Directors');
    builder.addDefinition('Has Minimum of Three Board Members?', yesNo(app.hasMinThreeBoardMembers));
    if (app.boardMembers && app.boardMembers.length > 0) {
        builder.addTable(['Name', 'Position', 'Term Start', 'Term End', "Arm's Length"], app.boardMembers.map(m => [`${m.firstName} ${m.lastName}`, m.position, m.termStartDate, m.termEndDate, yesNo(m.isArmsLength)]));
    }
    
    builder.addSubSectionTitle('Senior Staff');
    builder.addDefinition('Has Paid Senior Staff?', yesNo(app.hasSeniorStaff));
    if (app.hasSeniorStaff && app.seniorStaff && app.seniorStaff.length > 0) {
        builder.addTable(['Name', 'Position', "Arm's Length"], app.seniorStaff.map(s => [`${s.firstName} ${s.lastName}`, s.position, yesNo(s.isArmsLength)]));
    }

    // --- PROJECT INFORMATION ---
    builder.addSectionTitle('Project Information');
    builder.addDefinition('OTF Supports Used', (app.otfSupportsUsed || []).join(', '));
    builder.addDefinition('Funding Priority', app.projFundingPriority);
    builder.addDefinition('Project Objective', app.projObjective);
    builder.addDefinition('Project Description', app.projDescription);
    if(app.projImpactExplanation) builder.addDefinition('Impact Explanation', app.projImpactExplanation);
    builder.addDefinition('Why and Who Benefits', app.projWhyAndWhoBenefits);
    builder.addDefinition('Barriers Explanation', app.projBarriersExplanation);
    
    builder.addSubSectionTitle('Project Details');
    builder.addTable([], [['Benefiting Age Group', na(app.projAgeGroup)], ['Benefiting Language Group', na(app.projLanguage)], ['Benefiting Gender Group', na(app.projGender)], ['Benefiting Lived Experience Group', na(app.projLivedExperience)], ['Benefiting Identity Group', na(app.projIdentity)], ['Community Size', na(app.projCommunitySize)], ['OTF Catchment', na(app.projOtfCatchment)], ['Census Division', na(app.projCensusDivision)], ['Start Date', na(app.projStartDate)], ['Requested Term (months)', na(app.projRequestedTerm)]], [150, '*']);
    
    builder.addSubSectionTitle('Anticipated Results');
    builder.addTable([], [['Beneficiaries', na(app.projAnticipatedBeneficiaries)], ['Programs Impacted', na(app.projProgramsImpacted)], ['Staff/Volunteers Trained', na(app.projStaffVolunteersTrained)], ['Plans/Reports Created', na(app.projPlansReportsCreated)], ['Pilot Participants', na(app.projPilotParticipants)],], ['*', '*']);
    
    builder.addSubSectionTitle('Collaborative Application');
    builder.addDefinition('Is this a collaborative application?', yesNo(app.isCollaborativeApplication));
    if (app.isCollaborativeApplication) {
        builder.addDefinition('Collaborative Agreement URL', app.collaborativeAgreementUrl);
        builder.addDefinition('Collaborators', (app.collaborators || []).map(c => c.organizationName).join(', '));
    }
    
    builder.addSubSectionTitle('Larger Project Details');
    builder.addDefinition('Is this part of a larger project?', yesNo(app.isLargerProject));
    if (app.isLargerProject) {
        builder.addTable([], [['Total Cost of Larger Project', formatCurrency(app.largerProjectTotalCost)], ['Secured Funding for Larger Project', formatCurrency(app.largerProjectSecuredFunding)]], ['*', '*']);
        if (app.largerProjectFundingSources && app.largerProjectFundingSources.length > 0) {
            builder.addMinorSectionTitle('Funding Sources');
            builder.addTable(['Source', 'Usage of Funds'], app.largerProjectFundingSources.map(f => [f.source, f.usageOfFunds]));
        }
        builder.addDefinition('Plan for Unsecured Funds', app.largerProjectUnsecuredFundingPlan);
    }
    
    // --- PROJECT PLAN & BUDGET ---
    builder.addSectionTitle('Project Plan');
    builder.addMarkdown(app.justificationIntro);
    if (app.projectPlan && app.projectPlan.length > 0) {
        app.projectPlan.forEach(item => {
            builder.addSubSectionTitle(`Deliverable: ${item.deliverable}`);
            builder.addDefinition('Key Task', item.keyTask);
            builder.addDefinition('Timing', item.timing);
            builder.addDefinition('Justification', item.justification);
        });
    }
    builder.addMarkdown(app.justificationOutro);
    
    builder.addSectionTitle('Budget');
    if (app.budgetItems && app.budgetItems.length > 0) {
        const subtotal = app.budgetItems.filter(i => i.category !== 'Overhead and Administration Costs').reduce((sum, i) => sum + (i.requestedAmount || 0), 0);
        const adminFee = subtotal * 0.15;
        const total = subtotal + adminFee;

        builder.addTable(
            ['Category', 'Item', 'Cost Breakdown', 'Amount'],
            app.budgetItems.filter(item => item.category !== 'Overhead and Administration Costs').map(item => [item.category, item.itemDescription, item.costBreakdown, formatCurrency(item.requestedAmount || 0)]),
            ['auto', '*', '*', 'auto']
        );
        builder.addTable([], [['Subtotal', formatCurrency(subtotal)], ['Overhead & Administration (15%)', formatCurrency(adminFee)], [{text: 'Total Request', bold: true}, {text: formatCurrency(total), bold: true}]], ['*', 'auto']);
    }

    builder.addSectionTitle('Equipment & Quotes');
    builder.addDefinition('Plan to purchase equipment?', yesNo(app.planToPurchaseEquipment));
    if (app.planToPurchaseEquipment && app.equipmentPhotos && app.equipmentPhotos.length > 0) {
        builder.addMinorSectionTitle('Equipment Photos/Links');
        app.equipmentPhotos.forEach(p => builder.addDefinition(p.description, p.url));
    }
    builder.addDefinition('Requires Quotes?', yesNo(app.requiresQuotes));
    if (app.requiresQuotes && app.quotes && app.quotes.length > 0) {
        builder.addMinorSectionTitle('Quotes');
        app.quotes.forEach(q => builder.addDefinition(q.description, q.fileUrl));
    }
    
    // --- FINAL DESCRIPTION & ACKNOWLEDGEMENTS ---
    builder.addSectionTitle('Final Description & Acknowledgements');
    builder.addDefinition('Final Project Description (for public use)', app.projFinalDescription);
    builder.addList([
        app.confirmFinancialManagement ? '✓ I confirm that the organization has financial management and conflict of interest policies in place.' : '✗ Confirmation needed: Financial management policies.',
        app.confirmInfoCorrect ? '✓ I confirm that all the organization information provided is correct, up-to-date and complete.' : '✗ Confirmation needed: Information correctness.',
        app.confirmFinancialsUpdated ? '✓ I confirm that the correct type and year of financial statements have been uploaded and the Board of Directors table has been updated.' : '✗ Confirmation needed: Financials and Board info updated.'
    ]);
    
    const safeFileName = `OTF-Application-${app.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    builder.save(`${safeFileName}.pdf`);
};
