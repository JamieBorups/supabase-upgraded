
import { FormData as ProjectData, Member, ProjectContextForAI, ResearchPlan } from '../types';

const createBudgetSummary = (budget: ProjectData['budget']) => {
    if (!budget) {
        return { totalRevenue: 0, totalExpenses: 0, expenseBreakdown: {} };
    }

    const sumItems = (items: any[]) => items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalRevenue = Object.values(budget.revenues).reduce((sum, category) => {
        if (Array.isArray(category)) {
            return sum + sumItems(category);
        }
        if (typeof category === 'object' && category !== null && 'actualRevenue' in category) {
            return sum + (category.actualRevenue || 0);
        }
        return sum;
    }, 0);

    const totalExpenses = Object.values(budget.expenses).reduce((sum, category) => sum + sumItems(category), 0);

    const expenseBreakdown: Record<string, number> = {};
    Object.entries(budget.expenses).forEach(([categoryKey, items]) => {
        expenseBreakdown[categoryKey] = sumItems(items);
    });

    return { totalRevenue, totalExpenses, expenseBreakdown };
};

export const getInterestCompatibilityContext = (project: ProjectData, members: Member[], researchPlans: ResearchPlan[]): ProjectContextForAI => {
    const collaboratorDetails = project.collaboratorDetails.map(c => {
        const member = members.find(m => m.id === c.memberId);
        return {
            name: member ? `${member.firstName} ${member.lastName}` : 'Unknown Member',
            role: c.role,
            bio: member?.shortBio || member?.artistBio || 'No bio provided.',
        };
    });

    const budgetSummary = createBudgetSummary(project.budget);

    const latestResearchPlan = researchPlans
        .filter(plan => plan.projectId === project.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const context: ProjectContextForAI = {
        projectTitle: project.projectTitle,
        projectDescription: project.projectDescription,
        background: project.background,
        schedule: project.schedule,
        audience: project.audience,
        collaborators: collaboratorDetails,
        budgetSummary: budgetSummary,
    };

    if (latestResearchPlan) {
        context.researchPlanContext = {
            titleAndOverview: latestResearchPlan.titleAndOverview,
            researchQuestions: latestResearchPlan.researchQuestions,
            communityEngagement: latestResearchPlan.communityEngagement,
            designAndMethodology: latestResearchPlan.designAndMethodology,
            ethicalConsiderations: latestResearchPlan.ethicalConsiderations,
        };
    }

    return context;
};
