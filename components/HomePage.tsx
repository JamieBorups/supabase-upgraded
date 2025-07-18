


import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Activity, BudgetItem, DetailedBudget, Event, Page, Task } from '../types';

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const MetricCard: React.FC<{ icon: string; value: number | string; label: string; color: string; }> = ({ icon, value, label, color }) => (
    <div className="p-5 rounded-xl shadow-md flex items-center gap-4 border-l-4" style={{ backgroundColor: 'var(--color-surface-card)', borderLeftColor: color }}>
        <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <i className={`${icon} text-2xl`} style={{ color }}></i>
        </div>
        <div>
            <div className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{value}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
        </div>
    </div>
);

const DashboardWidget: React.FC<{ title: string; icon: string; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = "" }) => (
    <div className={`shadow-lg rounded-xl p-6 ${className}`} style={{ backgroundColor: 'var(--color-surface-card)' }}>
        <h2 className="text-xl font-bold mb-4 pb-3 border-b flex items-center gap-3" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-border-subtle)' }}>
            <i className={`${icon}`} style={{ color: 'var(--color-primary)' }}></i>
            <span>{title}</span>
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

const WelcomeScreen: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <div className="text-center p-8 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <i className="fa-solid fa-rocket text-7xl" style={{ color: 'var(--color-primary)' }}></i>
            <h1 className="mt-6 text-4xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Welcome to The Arts Incubator!</h1>
            <p className="mt-3 text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>This tool is designed to help you manage your artistic projects from concept to completion. Ready to get started?</p>
            <div className="mt-8 flex justify-center items-center gap-4">
                <button
                    onClick={() => onNavigate('projects')}
                    className="btn btn-primary px-6 py-3 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Create Your First Project
                </button>
            </div>
        </div>
    );
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const { state, dispatch } = useAppContext();
    const { projects, members, tasks, activities, directExpenses, events, venues } = state;

    const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, { name: `${m.firstName} ${m.lastName}`, imageUrl: m.imageUrl }])), [members]);
    const venueMap = useMemo(() => new Map(venues.map(v => [v.id, v.name])), [venues]);

    const dashboardData = useMemo(() => {
        const approvedActivities = activities.filter(a => a.status === 'Approved');
        
        // --- DATA FOR TOP METRIC CARDS ---
        const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
        const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const activeTasksForDeadlines = tasks.filter(task => {
            const project = projects.find(p => p.id === task.projectId);
            return project?.status === 'Active';
        });

        const tasksDueThisWeek = activeTasksForDeadlines.filter(task => {
            if (task.isComplete || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate >= now && dueDate <= oneWeekFromNow;
        });
        
        const upcomingEvents = events
            .filter(event => {
                if (event.isTemplate || event.status === 'Completed' || event.status === 'Cancelled') {
                    return false;
                }
                const eventStartDate = new Date(event.startDate + 'T00:00:00');
                return eventStartDate >= startOfToday;
            })
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .slice(0, 3);


        // --- OPERATIONAL FINANCIALS (Active & On Hold) ---
        const operationalProjects = projects.filter(p => ['Active', 'On Hold'].includes(p.status));
        const operationalProjectIds = new Set(operationalProjects.map(p => p.id));
        const operationalTaskIds = new Set(tasks.filter(t => operationalProjectIds.has(t.projectId)).map(t => t.id));

        const calculateProjectBudgetedExpenses = (budget?: DetailedBudget | null): number => {
            if (!budget || !budget.expenses || typeof budget.expenses !== 'object') {
                return 0;
            }
            return Object.values(budget.expenses)
                .filter(arr => Array.isArray(arr))
                .flat()
                .reduce((sum, item) => item ? sum + (item.amount || 0) : sum, 0);
        };
        
        const totalBudgetedExpenses = operationalProjects.reduce((total, p) => total + calculateProjectBudgetedExpenses(p.budget), 0);
        
        const totalActualPaidExpenses = approvedActivities
            .filter(a => operationalTaskIds.has(a.taskId) && taskMap.get(a.taskId)?.workType === 'Paid')
            .reduce((total, activity) => total + ((activity.hours || 0) * (taskMap.get(activity.taskId)?.hourlyRate || 0)), 0)
            + directExpenses.filter(e => operationalProjectIds.has(e.projectId)).reduce((total, expense) => total + expense.amount, 0);

        // --- LIFETIME FINANCIALS (Active, On Hold, Completed) ---
        const lifetimeProjects = projects.filter(p => ['Active', 'On Hold', 'Completed'].includes(p.status));
        const lifetimeProjectIds = new Set(lifetimeProjects.map(p => p.id));
        const lifetimeTaskIds = new Set(tasks.filter(t => lifetimeProjectIds.has(t.projectId)).map(t => t.id));

        const totalLifetimeActualRevenue = lifetimeProjects.reduce((total, p) => {
            const budget = p.budget;
            if (!budget || !budget.revenues || typeof budget.revenues !== 'object') return total;
            
            const sumActuals = (items?: BudgetItem[]) => (items || []).reduce((s, i) => s + (i.actualAmount || 0), 0);
        
            const grants = sumActuals(budget.revenues.grants);
            const tickets = budget.revenues.tickets?.actualRevenue || 0;
            const sales = sumActuals(budget.revenues.sales);
            const fundraising = sumActuals(budget.revenues.fundraising);
            const contributions = sumActuals(budget.revenues.contributions);
            return total + grants + tickets + sales + fundraising + contributions;
        }, 0);

        const totalLifetimeActualExpenses = approvedActivities
            .filter(a => lifetimeTaskIds.has(a.taskId) && taskMap.get(a.taskId)?.workType === 'Paid')
            .reduce((total, activity) => total + ((activity.hours || 0) * (taskMap.get(activity.taskId)?.hourlyRate || 0)), 0)
            + directExpenses.filter(e => lifetimeProjectIds.has(e.projectId)).reduce((total, expense) => total + expense.amount, 0);

        // --- GENERAL METRICS (All Time) ---
        const totalHoursAllTime = approvedActivities.reduce((sum, a) => sum + (a.hours || 0), 0);
        const hoursByMember = new Map<string, number>();
        approvedActivities.forEach(a => {
            hoursByMember.set(a.memberId, (hoursByMember.get(a.memberId) || 0) + (a.hours || 0));
        });
        const topContributors = Array.from(hoursByMember.entries())
            .map(([memberId, hours]) => ({ memberId, hours }))
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 5);

        return {
            activeProjectsCount,
            completedProjectsCount,
            tasksDueThisWeek,
            totalBudgetedExpenses,
            totalActualPaidExpenses,
            totalLifetimeActualRevenue,
            totalLifetimeActualExpenses,
            totalHoursAllTime,
            topContributors,
            upcomingEvents,
        };
    }, [projects, tasks, activities, directExpenses, taskMap, events]);

    if (projects.length === 0) {
        return <WelcomeScreen onNavigate={onNavigate} />;
    }
    
    const topContributorMaxHours = dashboardData.topContributors.length > 0 ? dashboardData.topContributors[0].hours : 1;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>Global Dashboard</h1>
                <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>A high-level overview of all collective activity.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                <MetricCard icon="fa-solid fa-briefcase" value={dashboardData.activeProjectsCount} label="Active Projects" color="var(--color-primary)" />
                <MetricCard icon="fa-solid fa-check-double" value={dashboardData.completedProjectsCount} label="Completed Projects" color="var(--color-status-info-text)" />
                <MetricCard icon="fa-solid fa-list-check" value={dashboardData.tasksDueThisWeek.length} label="Tasks Due This Week" color="var(--color-status-warning-text)" />
                <MetricCard icon="fa-solid fa-users" value={members.length} label="Collective Members" color="#8b5cf6" />
                <MetricCard icon="fa-solid fa-hourglass-half" value={dashboardData.totalHoursAllTime.toFixed(1)} label="Total Hours Logged" color="var(--color-status-error-text)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                     <DashboardWidget title="Operational Financial Snapshot (Active & On Hold Projects)" icon="fa-solid fa-chart-pie">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>Total Budgeted Expenses</div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{formatCurrency(dashboardData.totalBudgetedExpenses)}</div>
                            </div>
                             <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>Total Actual Expenses</div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-status-info-text)' }}>{formatCurrency(dashboardData.totalActualPaidExpenses)}</div>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                                <div className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>Remaining Budget</div>
                                <div className={`text-2xl font-extrabold ${dashboardData.totalBudgetedExpenses - dashboardData.totalActualPaidExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(dashboardData.totalBudgetedExpenses - dashboardData.totalActualPaidExpenses)}
                                </div>
                            </div>
                        </div>
                    </DashboardWidget>

                    <DashboardWidget title="Lifetime Financial Summary" icon="fa-solid fa-landmark">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>Total Lifetime Revenue</div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{formatCurrency(dashboardData.totalLifetimeActualRevenue)}</div>
                            </div>
                             <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>Total Lifetime Expenses</div>
                                <div className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{formatCurrency(dashboardData.totalLifetimeActualExpenses)}</div>
                            </div>
                            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-border-subtle)' }}>
                                <div className="text-sm font-bold" style={{ color: 'var(--color-text-heading)' }}>Lifetime Net Result</div>
                                <div className={`text-2xl font-extrabold ${dashboardData.totalLifetimeActualRevenue - dashboardData.totalLifetimeActualExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(dashboardData.totalLifetimeActualRevenue - dashboardData.totalLifetimeActualExpenses)}
                                </div>
                            </div>
                        </div>
                    </DashboardWidget>

                    <DashboardWidget title="Upcoming Deadlines (Active Projects)" icon="fa-solid fa-calendar-check">
                         {dashboardData.tasksDueThisWeek.length > 0 ? (
                            <ul className="divide-y -mx-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                {dashboardData.tasksDueThisWeek.map(task => (
                                    <li key={task.id} className="px-6 py-3">
                                        <div className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{task.title}</div>
                                        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{projectMap.get(task.projectId)}</span>
                                            <span className="mx-1">|</span>
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Assigned to: {memberMap.get(task.assignedMemberId)?.name || "Unassigned"}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No tasks are due in the next 7 days.</p>
                        )}
                    </DashboardWidget>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                     <DashboardWidget title="Upcoming Events" icon="fa-solid fa-calendar-star">
                        {dashboardData.upcomingEvents.length > 0 ? (
                            <ul className="divide-y -mx-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
                                {dashboardData.upcomingEvents.map(event => {
                                    const startDate = new Date(event.startDate + 'T00:00:00');
                                    return (
                                        <li key={event.id} className="px-6 py-3 flex items-start gap-4 hover:bg-slate-50">
                                            <div className="flex-shrink-0 text-center p-2 rounded-md w-16" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                                <div className="text-sm font-bold uppercase" style={{ color: 'var(--color-status-error-text)' }}>{startDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                                                <div className="text-xl font-extrabold" style={{ color: 'var(--color-text-heading)' }}>{startDate.toLocaleDateString('en-US', { day: '2-digit' })}</div>
                                            </div>
                                            <div>
                                                <div className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{event.title}</div>
                                                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{projectMap.get(event.projectId) || 'No Project'}</span>
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                                    <i className="fa-solid fa-location-dot fa-fw mr-1"></i>
                                                    {venueMap.get(event.venueId) || 'Venue TBD'}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No upcoming events scheduled.</p>
                        )}
                    </DashboardWidget>
                    
                     <DashboardWidget title="Top Contributors (by Hours)" icon="fa-solid fa-award">
                        {dashboardData.topContributors.length > 0 ? (
                            <ul className="space-y-4">
                                {dashboardData.topContributors.map(({ memberId, hours }) => {
                                    const member = memberMap.get(memberId);
                                    const percentage = (hours / topContributorMaxHours) * 100;
                                    return (
                                        <li key={memberId}>
                                            <div className="flex items-center gap-3">
                                                <img className="h-9 w-9 rounded-full object-cover" src={member?.imageUrl || `https://ui-avatars.com/api/?name=${member?.name}&background=random`} alt="" />
                                                <div className="flex-grow">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{member?.name || 'Unknown Member'}</span>
                                                        <span className="font-bold" style={{ color: 'var(--color-text-default)' }}>{hours.toFixed(1)}h</span>
                                                    </div>
                                                    <div className="w-full rounded-full h-1.5 mt-1" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                                                        <div className="h-1.5 rounded-full" style={{ width: `${percentage}%`, backgroundColor: 'var(--color-status-error-text)' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No approved hours have been logged yet.</p>
                        )}
                    </DashboardWidget>
                </div>
            </div>
        </div>
    );
};

export default HomePage;