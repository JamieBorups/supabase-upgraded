


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { produce } from 'immer';
import { FormData as Project, Report } from '../../types';
import { Select } from '../ui/Select';
import FormField from '../ui/FormField';
import ProjectInfoView from '../view/ProjectInfoView';
import ReportBudgetView from '../view/ReportBudgetView';
import { 
    initialReportData, 
    PEOPLE_INVOLVED_OPTIONS, 
    GRANT_ACTIVITIES_OPTIONS,
    IMPACT_QUESTIONS,
    IMPACT_OPTIONS
} from '../../constants';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { RadioGroup } from '../ui/RadioGroup';
import { generateReportPdf } from '../../utils/pdfGenerator';
import { useAppContext } from '../../context/AppContext';
import * as api from '../../services/api';

const ReportSection: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className="" }) => (
    <div className={`mb-12 ${className}`}>
        <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">{title}</h2>
        <div className="space-y-6">{children}</div>
    </div>
);

const ReportField: React.FC<{ label?: string, instructions?: React.ReactNode, children: React.ReactNode }> = ({ label, instructions, children }) => (
    <div>
        {label && <div className="text-md font-semibold text-slate-800">{label}</div>}
        {instructions && <div className="text-sm text-slate-500 my-1 prose prose-slate max-w-none">{instructions}</div>}
        <div className="mt-2">
            {children}
        </div>
    </div>
);

interface FinalReportTabProps {
    selectedProject: Project | null;
}

const FinalReportTab: React.FC<FinalReportTabProps> = ({ selectedProject }) => {
  const { state, dispatch, notify } = useAppContext();
  const { members, tasks, activities, directExpenses, reports, highlights, newsReleases, settings, events, eventTickets, venues } = state;

  const [isEditing, setIsEditing] = useState(false);
  const [reportData, setReportData] = useState<Report | null>(null);
  const [tempReportData, setTempReportData] = useState<Report | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const reportContentRef = useRef<HTMLDivElement>(null);

  const projectHighlights = useMemo(() => {
    if (!selectedProject) return [];
    return highlights.filter(h => h.projectId === selectedProject.id);
  }, [highlights, selectedProject]);

  const projectNewsReleases = useMemo(() => {
    if (!selectedProject) return [];
    return newsReleases.filter(nr => nr.projectId === selectedProject.id);
  }, [newsReleases, selectedProject]);
  
  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    return tasks.filter(t => t.projectId === selectedProject.id);
  }, [selectedProject, tasks]);

  const actuals = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedProject) return map;

    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    activities.forEach(activity => {
        const task = taskMap.get(activity.taskId);
        if (!task || task.projectId !== selectedProject.id || activity.status !== 'Approved' || !task.budgetItemId || task.workType !== 'Paid') {
            return;
        }
        const cost = (activity.hours || 0) * (task.hourlyRate || 0);
        map.set(task.budgetItemId, (map.get(task.budgetItemId) || 0) + cost);
    });

    directExpenses.forEach(expense => {
        if (expense.projectId !== selectedProject.id) return;
        map.set(expense.budgetItemId, (map.get(expense.budgetItemId) || 0) + expense.amount);
    });

    return map;
  }, [selectedProject, tasks, activities, directExpenses]);

  useEffect(() => {
    if (!selectedProject) {
      setReportData(null);
      setIsEditing(false);
      setTempReportData(null);
      return;
    }

    const existingReport = reports.find(r => r.projectId === selectedProject.id);
    if (existingReport) {
        setReportData(existingReport);
    } else {
        const newReport: Report = {
            ...initialReportData,
            id: `rep_${Date.now()}`,
            projectId: selectedProject.id,
            projectResults: selectedProject.projectDescription || '',
        };
        setReportData(newReport);
    }
    setIsEditing(false);
    setTempReportData(null);
  }, [selectedProject, reports]);
  
  const handleEdit = () => {
    setTempReportData(reportData);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
      setTempReportData(null);
      setIsEditing(false);
  };

  const handleSave = async () => {
      if (!tempReportData) return;
      
      try {
          const savedReport = await api.addOrUpdateReport(tempReportData);
          const actionType = state.reports.some(r => r.id === savedReport.id) ? 'UPDATE_REPORT' : 'ADD_REPORT';
          dispatch({ type: actionType, payload: savedReport });
          
          setIsEditing(false);
          setTempReportData(null);
          notify('Report saved successfully!', 'success');
      } catch (error: any) {
          notify(`Error saving report: ${error.message}`, 'error');
      }
  };

  const handleTempReportChange = (field: keyof Report, value: any) => {
    if (!tempReportData) return;
    setTempReportData(produce(tempReportData, draft => {
        (draft as any)[field] = value;
    }));
  };
  
  const handleImpactChange = (questionId: string, value: string) => {
    if (!tempReportData) return;
    setTempReportData(produce(tempReportData, draft => {
        draft.impactStatements[questionId] = value;
    }));
  };
  
  const handleGeneratePdf = async () => {
    if (!selectedProject || !reportData) {
        notify("Please select a project with a report to generate a PDF.", 'warning');
        return;
    }
    setIsGeneratingPdf(true);
    notify('Generating PDF...', 'info');
    try {
        await generateReportPdf(selectedProject, reportData, members, projectTasks, projectHighlights, projectNewsReleases, actuals, {
            IMPACT_QUESTIONS,
            IMPACT_OPTIONS,
            PEOPLE_INVOLVED_OPTIONS,
            GRANT_ACTIVITIES_OPTIONS,
        }, settings, events, eventTickets, venues);
    } catch (error: any) {
        console.error("Failed to generate PDF:", error);
        notify("An error occurred while generating the PDF. Please try again.", 'error');
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  if (!selectedProject) {
      return null;
  }
  
  if (!reportData) {
       return (
           <div className="text-center py-20">
              <i className="fa-solid fa-spinner fa-spin text-7xl text-slate-300"></i>
              <h3 className="mt-6 text-xl font-medium text-slate-800">Loading Report...</h3>
          </div>
      );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-teal-700">{selectedProject.projectTitle}</h2>
            <div className="flex items-center gap-3">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700">Save Report</button>
                    </>
                ) : (
                    <>
                        <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                            <i className="fa-solid fa-pencil mr-2"></i>Edit Report
                        </button>
                        <button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md shadow-sm hover:bg-rose-700 disabled:bg-slate-400">
                            <i className={`fa-solid ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>
                            {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                        </button>
                    </>
                )}
            </div>
        </div>

        <div ref={reportContentRef}>
            <ReportSection title="Project Description">
                <ReportField label="Briefly describe the project and its results.">
                    {isEditing && tempReportData ? (
                        <TextareaWithCounter wordLimit={750} rows={10} value={tempReportData.projectResults} onChange={e => handleTempReportChange('projectResults', e.target.value)} />
                    ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md whitespace-pre-wrap min-h-[10rem] prose prose-sm max-w-none">
                            {reportData.projectResults || <p className="italic text-slate-400">Not provided.</p>}
                        </div>
                    )}
                </ReportField>
            </ReportSection>
            
            <ReportSection title="Financial Report">
                <ReportField label="Briefly describe how you spent the grant.">
                     {isEditing && tempReportData ? (
                         <TextareaWithCounter wordLimit={300} rows={5} value={tempReportData.grantSpendingDescription} onChange={e => handleTempReportChange('grantSpendingDescription', e.target.value)} />
                     ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md whitespace-pre-wrap min-h-[6rem] prose prose-sm max-w-none">
                            {reportData.grantSpendingDescription || <p className="italic text-slate-400">Not provided.</p>}
                        </div>
                    )}
                </ReportField>
                <ReportBudgetView 
                    project={selectedProject} 
                    actuals={actuals} 
                    settings={settings} 
                    events={events}
                    eventTickets={eventTickets}
                    venues={venues}
                />
            </ReportSection>

            <ReportSection title="Workplan">
                 <ReportField label="Were any adjustments made to the workplan?">
                     {isEditing && tempReportData ? (
                        <TextareaWithCounter wordLimit={200} rows={4} value={tempReportData.workplanAdjustments} onChange={e => handleTempReportChange('workplanAdjustments', e.target.value)} />
                     ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md whitespace-pre-wrap min-h-[5rem] prose prose-sm max-w-none">
                            {reportData.workplanAdjustments || <p className="italic text-slate-400">Not provided.</p>}
                        </div>
                     )}
                </ReportField>
            </ReportSection>

            <ReportSection title="Community Reach">
                <ReportField label="My activities actively involved individuals who identify as:" instructions={isEditing ? "Select all that apply." : ""}>
                   {isEditing && tempReportData ? (
                        <CheckboxGroup name="involvedPeople" options={PEOPLE_INVOLVED_OPTIONS} selectedValues={tempReportData.involvedPeople || []} onChange={value => handleTempReportChange('involvedPeople', value)} columns={2} />
                   ) : (
                       <div className="p-4 bg-slate-50 border border-slate-200 rounded-md min-h-[5rem]">
                            {reportData.involvedPeople.length > 0 ? (
                                <ul className="list-disc list-inside text-slate-700 space-y-1">
                                    {reportData.involvedPeople.map(val => {
                                        const label = PEOPLE_INVOLVED_OPTIONS.find(opt => opt.value === val)?.label.replace('... ', '');
                                        return <li key={val}>{label}</li>;
                                    })}
                                </ul>
                            ) : (
                                <p className="italic text-slate-400">No items selected.</p>
                            )}
                        </div>
                   )}
                </ReportField>
                 <ReportField label="The activities supported by this grant involved:" instructions={isEditing ? "Select all that apply." : ""}>
                   {isEditing && tempReportData ? (
                        <CheckboxGroup name="involvedActivities" options={GRANT_ACTIVITIES_OPTIONS} selectedValues={tempReportData.involvedActivities || []} onChange={value => handleTempReportChange('involvedActivities', value)} columns={2} />
                   ) : (
                       <div className="p-4 bg-slate-50 border border-slate-200 rounded-md min-h-[5rem]">
                            {reportData.involvedActivities.length > 0 ? (
                                <ul className="list-disc list-inside text-slate-700 space-y-1">
                                    {reportData.involvedActivities.map(val => {
                                        const label = GRANT_ACTIVITIES_OPTIONS.find(opt => opt.value === val)?.label.replace('... ', '');
                                        return <li key={val}>{label}</li>;
                                    })}
                                </ul>
                            ) : (
                                <p className="italic text-slate-400">No items selected.</p>
                            )}
                        </div>
                   )}
                </ReportField>
            </ReportSection>

            <ReportSection title="Impact Assessment">
                {IMPACT_QUESTIONS.map(q => (
                    <ReportField key={q.id} label={q.label} instructions={q.instructions}>
                        {isEditing && tempReportData ? (
                            <RadioGroup
                                name={q.id}
                                options={IMPACT_OPTIONS}
                                selectedValue={tempReportData.impactStatements[q.id] || ''}
                                onChange={value => handleImpactChange(q.id, value)}
                            />
                        ) : (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                                {IMPACT_OPTIONS.find(opt => opt.value === reportData.impactStatements[q.id])?.label || <span className="italic text-slate-400">Not answered.</span>}
                            </div>
                        )}
                    </ReportField>
                ))}
            </ReportSection>
            
            <ReportSection title="Project Highlights & Media">
                <ReportField label="Project Highlights" instructions="Links to documentation of your project (e.g., photos, videos, press). Manage these in the main Highlights section.">
                   {projectHighlights.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            {projectHighlights.map(h => (
                                <li key={h.id}>
                                    <a href={h.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{h.title}</a>
                                </li>
                            ))}
                        </ul>
                   ) : (
                        <p className="text-slate-500 italic">No highlights added for this project.</p>
                   )}
                </ReportField>
                 <ReportField label="Official Communications" instructions="News Releases generated for this project. Manage these in the Media section.">
                   {projectNewsReleases.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2 pl-2">
                            {projectNewsReleases.map(nr => (
                                <li key={nr.id}>
                                    {nr.publishedUrl ? (
                                        <a href={nr.publishedUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 hover:underline">{nr.headline}</a>
                                    ) : (
                                        <span className="font-semibold">{nr.headline}</span>
                                    )}
                                    <span className="ml-2 text-xs text-white px-2 py-0.5 rounded-full bg-slate-500">{nr.status}</span>
                                </li>
                            ))}
                        </ul>
                   ) : (
                        <p className="text-slate-500 italic">No official communications created for this project.</p>
                   )}
                </ReportField>
            </ReportSection>

            <ReportSection title="Closing">
                <ReportField label="What worked well with the grant program and what could be improved?">
                   {isEditing && tempReportData ? (
                        <TextareaWithCounter wordLimit={250} rows={4} value={tempReportData.feedback} onChange={e => handleTempReportChange('feedback', e.target.value)} />
                   ) : (
                       <div className="p-4 bg-slate-50 border border-slate-200 rounded-md whitespace-pre-wrap min-h-[5rem] prose prose-sm max-w-none">
                            {reportData.feedback || <p className="italic text-slate-400">Not provided.</p>}
                        </div>
                   )}
                </ReportField>
                
                <ReportField label="Is there anything else you would like to share?">
                    {isEditing && tempReportData ? (
                        <TextareaWithCounter wordLimit={250} rows={4} value={tempReportData.additionalFeedback} onChange={e => handleTempReportChange('additionalFeedback', e.target.value)} />
                   ) : (
                       <div className="p-4 bg-slate-50 border border-slate-200 rounded-md whitespace-pre-wrap min-h-[5rem] prose prose-sm max-w-none">
                            {reportData.additionalFeedback || <p className="italic text-slate-400">Not provided.</p>}
                        </div>
                   )}
                </ReportField>
            </ReportSection>
        </div>
    </div>
  );
};

export default FinalReportTab;
