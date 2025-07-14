

import React, { useMemo, useState } from 'react';
import { Task, Activity } from '../../types';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useAppContext } from '../../context/AppContext';

interface TaskTimesheetProps {
  onAddActivityForTask: (taskId: string) => void;
  onEditActivity: (activityId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  selectedProjectId: string;
}

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const TaskTimesheet: React.FC<TaskTimesheetProps> = ({ onAddActivityForTask, onEditActivity, onDeleteActivity, selectedProjectId }) => {
  const { state } = useAppContext();
  const { tasks, activities, members } = state;
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, `${m.firstName} ${m.lastName}`])), [members]);

  const memberOptions = useMemo(() => [
    { value: '', label: 'All Members' },
    ...members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))
  ], [members]);
  
  const activitiesByTaskId = useMemo(() => {
    const map = new Map<string, Activity[]>();
    activities.forEach(activity => {
      if (!map.has(activity.taskId)) {
          map.set(activity.taskId, []);
      }
      map.get(activity.taskId)!.push(activity);
    });
    map.forEach(activityList => activityList.sort((a,b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()));
    return map;
  }, [activities]);

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
            newSet.delete(taskId);
        } else {
            newSet.add(taskId);
        }
        return newSet;
    });
  };

  const { milestoneGroups, unparentedTasks } = useMemo(() => {
    if (!selectedProjectId) {
      return { milestoneGroups: [], unparentedTasks: [] };
    }
    
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
    
    const taskFinancials = new Map<string, { loggedHours: number; value: number }>();
    activities
      .forEach(activity => {
        const task = tasks.find(t => t.id === activity.taskId);
        if (task && task.projectId === selectedProjectId) {
          const current = taskFinancials.get(task.id) || { loggedHours: 0, value: 0 };
          const hours = activity.hours || 0;
          current.loggedHours += hours;
          current.value += hours * (task.hourlyRate || 0);
          taskFinancials.set(task.id, current);
        }
      });
      
    const milestones = projectTasks
        .filter(t => t.taskType === 'Milestone')
        .sort((a, b) => (a.orderBy || 0) - (b.orderBy || 0));
        
    const tasksByParent = projectTasks.reduce((acc, task) => {
        if(task.taskType !== 'Milestone') {
            const parentId = task.parentTaskId || 'unparented';
            if (!acc[parentId]) acc[parentId] = [];
            acc[parentId].push(task);
        }
        return acc;
    }, {} as Record<string, Task[]>);

    Object.values(tasksByParent).forEach(group => group.sort((a,b) => (a.orderBy || 0) - (b.orderBy || 0)));

    const groups = milestones.map(milestone => {
        const childTasks = tasksByParent[milestone.id] || [];
        const aggregates = childTasks.reduce((totals, task) => {
            const financials = taskFinancials.get(task.id) || { loggedHours: 0, value: 0 };
            totals.estimatedHours += task.estimatedHours || 0;
            totals.loggedHours += financials.loggedHours;
            totals.value += financials.value;
            return totals;
        }, { estimatedHours: 0, loggedHours: 0, value: 0 });

        return { milestone, tasks: childTasks, ...aggregates };
    });
    
    const unparented = tasksByParent['unparented'] || [];

    return { milestoneGroups: groups, unparentedTasks: unparented };

  }, [selectedProjectId, tasks, activities]);

  if (!selectedProjectId) {
    return (
      <div className="text-center py-20">
        <i className="fa-solid fa-folder-open text-7xl text-slate-300"></i>
        <h3 className="mt-6 text-xl font-medium text-slate-800">Please select a project</h3>
        <p className="text-slate-500 mt-2 text-base">Choose a project from the dropdown above to view its timesheet.</p>
      </div>
    );
  }
  
  const renderTaskRows = (tasksToRender: Task[]) => {
    return tasksToRender.map(task => {
        const isExpanded = expandedTaskIds.has(task.id);
        const taskActivities = activitiesByTaskId.get(task.id) || [];
        const financials = taskActivities.reduce((acc, a) => {
            const hours = a.hours || 0;
            acc.loggedHours += hours;
            acc.value += hours * (task.hourlyRate || 0);
            return acc;
        }, {loggedHours: 0, value: 0});

        const remainingHours = (task.estimatedHours || 0) - financials.loggedHours;
        return (
            <React.Fragment key={task.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleTaskExpansion(task.id)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30" disabled={taskActivities.length === 0} title={taskActivities.length > 0 ? "View Activities" : "No Activities Logged"}>
                                <i className={`fa-solid fa-chevron-right text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}></i>
                            </button>
                            <div className="text-sm font-medium text-slate-900">{task.title}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{task.estimatedHours.toFixed(2)}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold text-right">{financials.loggedHours.toFixed(2)}h</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${remainingHours < 0 ? 'text-red-600' : 'text-green-600'}`}>{remainingHours.toFixed(2)}h</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 text-right">{formatCurrency(financials.value)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => onAddActivityForTask(task.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700" title="Log time for this task"><i className="fa-solid fa-plus-circle mr-2"></i>Log Time</button></td>
                </tr>
                {isExpanded && taskActivities.length > 0 && (
                    <tr className="bg-slate-50">
                        <td colSpan={6} className="p-0">
                             <div className="px-10 py-3">
                                <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Activity Logs</h4>
                                <table className="min-w-full text-xs">
                                    <thead className="text-left text-slate-500">
                                        <tr><th className="py-1 pr-4">Member</th><th className="py-1 pr-4">Date</th><th className="py-1 pr-4 w-full">Description</th><th className="py-1 pr-4 text-right">Hours</th><th className="py-1"></th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {taskActivities.map(act => (
                                            <tr key={act.id}>
                                                <td className="py-2 pr-4 font-medium">{memberMap.get(act.memberId)}</td>
                                                <td className="py-2 pr-4">{new Date(act.endDate).toLocaleDateString()}</td>
                                                <td className="py-2 pr-4 w-full text-slate-600">{act.description}</td>
                                                <td className="py-2 pr-4 text-right font-semibold">{act.hours.toFixed(2)}h</td>
                                                <td className="py-2 text-right space-x-2">
                                                    <button onClick={() => onEditActivity(act.id)} className="text-slate-400 hover:text-teal-600"><i className="fa-solid fa-pencil"></i></button>
                                                    <button onClick={() => onDeleteActivity(act.id)} className="text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-6">
        <div className="w-full md:w-auto md:max-w-xs">
           <Select value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} options={memberOptions} />
        </div>
      </div>
      
      {milestoneGroups.length === 0 && unparentedTasks.length === 0 ? (
           <div className="text-center py-20">
            <i className="fa-solid fa-clock-rotate-left text-7xl text-slate-300"></i>
            <h3 className="mt-6 text-xl font-medium text-slate-800">No time-based tasks found.</h3>
            <p className="text-slate-500 mt-2 text-base">This project has no tasks that can have time logged against them.</p>
          </div>
      ) : (
        <table className="min-w-full">
            <thead className="bg-slate-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-3/6">Task</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Est. Hours</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Logged Hours</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Remaining</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-1/6">Value</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider w-[120px]">Actions</th>
                </tr>
            </thead>
            {milestoneGroups.map(({ milestone, tasks: childTasks, estimatedHours, loggedHours, value }) => (
                <tbody key={milestone.id} className="divide-y divide-slate-200">
                    <tr className="bg-slate-100 border-t-2 border-slate-300">
                        <td colSpan={6} className="px-4 py-3 font-bold text-lg text-slate-800">
                            <i className="fa-solid fa-flag-checkered text-teal-600 mr-3"></i>
                            {milestone.title}
                        </td>
                    </tr>
                    {renderTaskRows(childTasks)}
                     <tr className="bg-slate-100 font-bold">
                        <td className="px-6 py-3 text-left text-slate-800">Milestone Total</td>
                        <td className="px-6 py-3 text-right text-slate-600">{estimatedHours.toFixed(2)}h</td>
                        <td className="px-6 py-3 text-right text-slate-800">{loggedHours.toFixed(2)}h</td>
                        <td className={`px-6 py-3 text-right ${(estimatedHours - loggedHours) < 0 ? 'text-red-600' : 'text-green-600'}`}>{(estimatedHours - loggedHours).toFixed(2)}h</td>
                        <td className="px-6 py-3 text-right text-blue-700">{formatCurrency(value)}</td>
                        <td></td>
                    </tr>
                </tbody>
            ))}
        </table>
      )}
    </div>
  );
};

export default TaskTimesheet;