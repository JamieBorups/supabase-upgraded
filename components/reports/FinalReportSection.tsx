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
        <h3 className="text-lg font-bold text-slate-800" style={{ color: 'var(--color-text-heading)' }}>{title}</h3>
        <div className="mt-4 space-y-6">{children}</div>
    </div>
);

const ReportField: React.FC<{ label?: string, instructions?: React.ReactNode, children: React.ReactNode }> = ({ label, instructions, children }) => (
    <div>
        {label && <div className="text-md font-semibold text-slate-800" style={{ color: 'var(--color-text-default)' }}>{label}</div>}
        {instructions && <div className="text-sm my-1 prose prose-slate max-w-none" style={{ color: 'var(--color-text-muted)' }}>{instructions}</div>}
        <div className="mt-2">
            {children}
        </div>
    </div>
);

interface FinalReportSectionProps {
    selectedProject: Project;
}

const FinalReportSection: React.FC<FinalReportSectionProps> = ({ selectedProject }) => {
  const { state, dispatch, notify } = useAppContext();
  const { members, tasks, activities, directExpenses, reports, highlights, newsReleases, settings, events, eventTickets, venues } = state;

  const [isEditing, setIsEditing] = useState(false);
  const [reportData, setReportData] = useState<Report | null>(null);
  const [tempReportData, setTempReportData] = useState<Report | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
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

  React.useEffect(() => {
    const existingReport = reports.find(r => r.projectId === selectedProject.id);
    if (existingReport) {
        setReportData(existingReport);
    } else {
        setReportData(null); // No report exists yet
    }
    setIsEditing(false);
    setTempReportData(null);
  }, [selectedProject, reports]);
  
  const handleCreateReport = () => {
    const newReport: Report = {
        ...initialReportData,
        id: `new_rep_${Date.now()}`,
        projectId: selectedProject.id,
    };
    setTempReportData(newReport);
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (!reportData) return;
    setTempReportData(reportData);
    setIsEditing(true);
  };
  
  const handleCancel = () => {
      setIsEditing(false);
      setTempReportData(null);
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
    setTempReportData(produce(tempReportData, draft => { (draft as any)[field] = value; }));
  };
  
  const handleImpactChange = (questionId: string, value: string) => {
    if (!tempReportData) return;
    setTempReportData(produce(tempReportData, draft => { draft.impactStatements[questionId] = value; }));
  };
  
  const handleGeneratePdf = async () => {
    if (!reportData) return;
    setIsGeneratingPdf(true);
    notify('Generating PDF...', 'info');
    try {
        await generateReportPdf(selectedProject, reportData, members, tasks, highlights, newsReleases, actuals, { IMPACT_QUESTIONS, IMPACT_OPTIONS, PEOPLE_INVOLVED_OPTIONS, GRANT_ACTIVITIES_OPTIONS }, settings, events, eventTickets, venues);
    } catch (error: any) {
        notify(`PDF Error: ${error.message}`, 'error');
    } finally {
        setIsGeneratingPdf(false);
    }
  };
  
  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="report-section-heading">Final Report</h2>
        </div>
        <p className="text-base mb-6 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
            The Final Report is a comprehensive summary of your project's outcomes, financials, and community impact. This section is where you can create, edit, and view the formal report often required by funders once a project's status is set to 'Completed'.
        </p>
        
        {!reportData && !isEditing && (
            <div className="text-center py-10 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                <p style={{ color: 'var(--color-text-muted)' }} className="mb-4">No final report has been created for this project yet.</p>
                <button onClick={handleCreateReport} className="btn btn-primary">Create Report</button>
            </div>
        )}
        
        {reportData && !isEditing && (
             <div className="flex justify-end gap-3 mb-4">
                <button onClick={handleEdit} className="btn btn-primary"><i className="fa-solid fa-pencil mr-2"></i>Edit Report</button>
                <button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="btn btn-secondary"><i className={`fa-solid ${isGeneratingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'} mr-2`}></i>{isGeneratingPdf ? 'Generating...' : 'Generate PDF'}</button>
            </div>
        )}

        {(isEditing && tempReportData) && (
            <div className="space-y-12">
                 <div className="flex justify-end gap-3 sticky top-20 z-10 py-2 -mx-4 px-4 backdrop-blur-sm" style={{ backgroundColor: 'hsla(0, 0%, 100%, 0.8)' }}>
                    <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary">Save Report</button>
                </div>
                
                <ReportField label="Briefly describe the project and its results."><TextareaWithCounter wordLimit={750} rows={10} value={tempReportData.projectResults} onChange={e => handleTempReportChange('projectResults', e.target.value)} /></ReportField>
                <ReportField label="Briefly describe how you spent the grant."><TextareaWithCounter wordLimit={300} rows={5} value={tempReportData.grantSpendingDescription} onChange={e => handleTempReportChange('grantSpendingDescription', e.target.value)} /></ReportField>
                <ReportField label="Were any adjustments made to the workplan?"><TextareaWithCounter wordLimit={200} rows={4} value={tempReportData.workplanAdjustments} onChange={e => handleTempReportChange('workplanAdjustments', e.target.value)} /></ReportField>
                <ReportField label="My activities actively involved individuals who identify as:" instructions="Select all that apply."><CheckboxGroup name="involvedPeople" options={PEOPLE_INVOLVED_OPTIONS} selectedValues={tempReportData.involvedPeople || []} onChange={value => handleTempReportChange('involvedPeople', value)} columns={2} /></ReportField>
                <ReportField label="The activities supported by this grant involved:" instructions="Select all that apply."><CheckboxGroup name="involvedActivities" options={GRANT_ACTIVITIES_OPTIONS} selectedValues={tempReportData.involvedActivities || []} onChange={value => handleTempReportChange('involvedActivities', value)} columns={2} /></ReportField>
                
                <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-heading)' }}>Impact Assessment</h3>
                    <div className="mt-4 space-y-6">
                         {IMPACT_QUESTIONS.map(q => (<ReportField key={q.id} label={q.label} instructions={q.instructions}><RadioGroup name={q.id} options={IMPACT_OPTIONS} selectedValue={tempReportData.impactStatements[q.id] || ''} onChange={value => handleImpactChange(q.id, value)} /></ReportField>))}
                    </div>
                </div>

                <ReportField label="What worked well with the grant program and what could be improved?"><TextareaWithCounter wordLimit={250} rows={4} value={tempReportData.feedback} onChange={e => handleTempReportChange('feedback', e.target.value)} /></ReportField>
                <ReportField label="Is there anything else you would like to share?"><TextareaWithCounter wordLimit={250} rows={4} value={tempReportData.additionalFeedback} onChange={e => handleTempReportChange('additionalFeedback', e.target.value)} /></ReportField>
            </div>
        )}
    </div>
  );
};

export default FinalReportSection;