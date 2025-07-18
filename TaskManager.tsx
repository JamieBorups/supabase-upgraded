
import React, { useState } from 'react';
import TaskList from './components/task/TaskList.tsx';
import TaskEditor from './components/task/TaskEditor.tsx';
import WorkplanView from './components/task/WorkplanView.tsx';
import TaskTimesheet from './components/task/TaskTimesheet.tsx';
import ActivityEditor from './components/task/ActivityEditor.tsx';
import ConfirmationModal from './components/ui/ConfirmationModal.tsx';
import { initialTaskData, initialActivityData } from './constants.ts';
import { Task, TaskManagerView, Activity, TaskStatus } from './types.ts';
import FormField from './components/ui/FormField.tsx';
import { useAppContext } from './context/AppContext.tsx';
import * as api from './services/api.ts';
import ProjectFilter from './components/ui/ProjectFilter.tsx';

const TaskManager: React.FC = () => {
  const { state, dispatch, notify } = useAppContext();
  const { tasks, projects, members, activities } = state;
  const [view, setView] = useState<TaskManagerView>('timesheet');
  const [selectedProjectId, setSelectedProjectId] = useState(''); // '' for All Projects
  
  // State for Task Editor
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // State for Activity Editor
  const [isActivityEditorOpen, setIsActivityEditorOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  // State for Delete Modals
  const [isTaskDeleteModalOpen, setIsTaskDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isActivityDeleteModalOpen, setIsActivityDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  
  // Loading states
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [isTaskDeleting, setIsTaskDeleting] = useState(false);
  const [isActivitySaving, setIsActivitySaving] = useState(false);
  const [isActivityDeleting, setIsActivityDeleting] = useState(false);

  // --- Task Handlers ---
  const handleAddTask = () => {
    const project = projects.find(p => p.id === selectedProjectId);
    let taskCode = '';
    if (project) {
        const prefix = (project.projectTitle.match(/\b(\w)/g) || ['T']).join('').toUpperCase().substring(0, 4);
        const projectTasks = tasks.filter(t => t.projectId === selectedProjectId && t.taskCode?.startsWith(prefix));
        let maxNum = 0;
        projectTasks.forEach(t => {
            const numPart = t.taskCode?.split('-')[1];
            if (numPart) {
                const num = parseInt(numPart, 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        taskCode = `${prefix}-${maxNum + 1}`;
    } else {
        taskCode = `TASK-${tasks.filter(t => !t.projectId).length + 1}`;
    }
    
    // Calculate the next order value for a new top-level task in this project
    const topLevelTasks = tasks.filter(t => t.projectId === selectedProjectId && t.parentTaskId === null);
    const maxOrderBy = topLevelTasks.reduce((max, task) => Math.max(max, task.orderBy || 0), 0);
    
    const newTask: Task = { 
        ...initialTaskData, 
        id: `new_task_${Date.now()}`, 
        projectId: selectedProjectId,
        taskCode: taskCode,
        updatedAt: new Date().toISOString(),
        orderBy: maxOrderBy + 1,
    };
    setCurrentTask(newTask);
    setIsTaskEditorOpen(true);
  };
  
  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setCurrentTask(task);
      setIsTaskEditorOpen(true);
    }
  };

  const handleSaveTask = async (taskToSave: Task) => {
    setIsTaskSaving(true);
    const isNew = taskToSave.id.startsWith('new_');
    const finalTask = { ...taskToSave, updatedAt: new Date().toISOString() };
    try {
        if(isNew) {
            const addedTask = await api.addTask(finalTask);
            dispatch({ type: 'ADD_TASK', payload: addedTask });
        } else {
            const updatedTask = await api.updateTask(finalTask.id, finalTask);
            dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        }
        notify(`Task '${finalTask.title}' ${isNew ? 'created' : 'updated'}.`, 'success');
        setIsTaskEditorOpen(false);
        setCurrentTask(null);
    } catch(error: any) {
        notify(`Error saving task: ${error.message}`, 'error');
    } finally {
        setIsTaskSaving(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsTaskDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsTaskDeleting(true);
    try {
        await api.deleteTask(taskToDelete);
        dispatch({ type: 'DELETE_TASK', payload: taskToDelete });
        notify('Task and associated activities deleted.', 'success');
    } catch (error: any) {
        notify(`Error deleting task: ${error.message}`, 'error');
    } finally {
        setIsTaskDeleting(false);
        setIsTaskDeleteModalOpen(false);
        setTaskToDelete(null);
    }
  };
  
  const handleToggleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.taskType === 'Milestone') {
      const updatedTaskData = { 
          isComplete: !task.isComplete, 
          status: (!task.isComplete ? 'Done' : 'To Do') as TaskStatus,
          updatedAt: new Date().toISOString()
        };
        try {
            const updatedTask = await api.updateTask(taskId, updatedTaskData);
            dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
            notify(`Task marked as ${updatedTask.isComplete ? 'complete' : 'incomplete'}.`, 'success');
        } catch(error: any) {
            notify(`Error updating task: ${error.message}`, 'error');
        }
    }
  };

  // --- Activity Handlers ---
  const handleAddActivityForTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const today = new Date().toISOString().split('T')[0];
    const newActivity: Activity = {
        ...initialActivityData,
        id: `new_activity_${Date.now()}`,
        taskId: taskId,
        memberId: '', // No longer pre-fill
        startDate: today,
        endDate: today,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };
    setCurrentActivity(newActivity);
    setIsActivityEditorOpen(true);
  };

  const handleEditActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if(activity) {
      setCurrentActivity(activity);
      setIsActivityEditorOpen(true);
    }
  };

  const handleSaveActivity = async (activityToSave: Activity & { memberIds?: string[] }) => {
    setIsActivitySaving(true);
    const { memberIds, ...baseActivity } = activityToSave;
    const isNew = baseActivity.id.startsWith('new_');
    const now = new Date().toISOString();

    try {
        if(isNew && memberIds && memberIds.length > 0) {
            const activitiesToAdd = memberIds.map(memberId => ({
                ...baseActivity,
                id: `act_${Date.now()}_${Math.random()}`,
                memberId,
                status: 'Approved' as 'Approved',
                updatedAt: now,
                createdAt: now,
            }));
            const addedActivities = await api.addActivities(activitiesToAdd);
            dispatch({ type: 'ADD_ACTIVITIES', payload: addedActivities });
            notify(`${addedActivities.length} activity log(s) created.`, 'success');
        } else {
            const finalActivity = { ...baseActivity, updatedAt: now };
            const updatedActivity = await api.updateActivity(finalActivity.id, finalActivity);
            dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedActivity });
            notify('Activity updated.', 'success');
        }
        setIsActivityEditorOpen(false);
        setCurrentActivity(null);
    } catch (error: any) {
        notify(`Error saving activity: ${error.message}`, 'error');
    } finally {
        setIsActivitySaving(false);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivityToDelete(activityId);
    setIsActivityDeleteModalOpen(true);
  };
  
  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    setIsActivityDeleting(true);
    try {
        await api.deleteActivity(activityToDelete);
        dispatch({ type: 'DELETE_ACTIVITY', payload: activityToDelete });
        notify('Activity deleted successfully.', 'success');
    } catch(error: any) {
        notify(`Error deleting activity: ${error.message}`, 'error');
    } finally {
        setIsActivityDeleting(false);
        setIsActivityDeleteModalOpen(false);
        setActivityToDelete(null);
    }
  };
  
  const renderContent = () => {
    switch(view) {
      case 'workplan':
        return <WorkplanView selectedProjectId={selectedProjectId} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} />;
      case 'tasks':
        return (
          <TaskList
            selectedProjectId={selectedProjectId}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'timesheet':
        return (
          <TaskTimesheet
            selectedProjectId={selectedProjectId}
            onAddActivityForTask={handleAddActivityForTask}
            onEditActivity={handleEditActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        );
      default:
        return null;
    }
  };
  
  const tabViews: { key: TaskManagerView; label: string }[] = [
      { key: 'workplan', label: 'Workplan Report' },
      { key: 'tasks', label: 'Tasks' },
      { key: 'timesheet', label: 'Timesheet' }
  ];

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
      {isTaskEditorOpen && currentTask && <TaskEditor task={currentTask} onSave={handleSaveTask} onCancel={() => setIsTaskEditorOpen(false)} isSaving={isTaskSaving} />}
      {isActivityEditorOpen && currentActivity && <ActivityEditor activity={currentActivity} selectedProjectId={selectedProjectId} onSave={handleSaveActivity} onCancel={() => setIsActivityEditorOpen(false)} isSaving={isActivitySaving} />}
      {isTaskDeleteModalOpen && <ConfirmationModal isOpen={isTaskDeleteModalOpen} onClose={() => setIsTaskDeleteModalOpen(false)} onConfirm={confirmDeleteTask} title="Delete Task" message="Are you sure you want to delete this task? All associated time logs will also be deleted." confirmButtonText="Delete Task" isConfirming={isTaskDeleting} />}
      {isActivityDeleteModalOpen && <ConfirmationModal isOpen={isActivityDeleteModalOpen} onClose={() => setIsActivityDeleteModalOpen(false)} onConfirm={confirmDeleteActivity} title="Delete Activity" message="Are you sure you want to delete this activity log?" confirmButtonText="Delete Activity" isConfirming={isActivityDeleting} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Tasks & Timesheets</h1>
        <div className="w-full md:w-auto md:max-w-xs">
            <FormField label="Filter by Project" htmlFor="task_project_select" className="mb-0">
                <ProjectFilter
                  value={selectedProjectId}
                  onChange={setSelectedProjectId}
                />
            </FormField>
        </div>
      </div>

      <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabViews.map(v => (
                 <button
                    key={v.key}
                    type="button"
                    onClick={() => setView(v.key)}
                    className={`capitalize whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md ${
                    view === v.key
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    {v.label}
                </button>
            ))}
          </nav>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  )
}

export default TaskManager;
