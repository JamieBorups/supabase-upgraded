
import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../../types';
import { useAppContext } from '../../context/AppContext';

const getStatusBadge = (status: TaskStatus | string) => {
    const baseClasses = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusMap: Record<string, string> = {
        'Done': "bg-green-100 text-green-800",
        'In Progress': "bg-blue-100 text-blue-800",
        'To Do': "bg-yellow-100 text-yellow-800",
        'Backlog': "bg-slate-100 text-slate-800",
    };
    return `${baseClasses} ${statusMap[status] || statusMap['Backlog']}`;
}

const TaskCard: React.FC<{ task: Task; onEditTask: (id: string) => void; onDeleteTask: (id: string) => void; }> = ({ task, onEditTask, onDeleteTask }) => (
    <div className="bg-white border border-slate-200 rounded-md p-3 flex justify-between items-center shadow-sm">
        <div>
            <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
            <p className="text-xs text-slate-500">Due: {task.dueDate || 'N/A'}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className={getStatusBadge(task.status)}>{task.status}</span>
            <div className="flex items-center gap-2">
                <button onClick={() => onEditTask(task.id)} className="px-2 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded">Edit</button>
                <button onClick={() => onDeleteTask(task.id)} className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded">Delete</button>
            </div>
        </div>
    </div>
);

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  selectedProjectId: string;
}

const TaskList: React.FC<TaskListProps> = ({ onAddTask, onEditTask, onDeleteTask, selectedProjectId }) => {
  const { state: { tasks } } = useAppContext();

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [selectedProjectId, tasks]);

  const { milestoneGroups, unparentedTasks, hasTasks } = useMemo(() => {
    if (projectTasks.length === 0) {
      return { milestoneGroups: [], unparentedTasks: [], hasTasks: false };
    }
    
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

    Object.keys(tasksByParent).forEach(parentId => {
        tasksByParent[parentId].sort((a,b) => (a.orderBy || 0) - (b.orderBy || 0));
    });

    const groups = milestones.map(milestone => ({
        milestone,
        tasks: tasksByParent[milestone.id] || []
    }));
    
    const unparented = tasksByParent['unparented'] || [];

    return { milestoneGroups: groups, unparentedTasks: unparented, hasTasks: true };
  }, [projectTasks]);

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={onAddTask}
          disabled={!selectedProjectId}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
          title={!selectedProjectId ? "Please select a project to add a task" : "Add New Task"}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Add Task
        </button>
      </div>

      {!selectedProjectId ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-check-double text-7xl text-slate-300"></i>
          <h3 className="mt-6 text-xl font-medium text-slate-800">Select a project</h3>
          <p className="text-slate-500 mt-2 text-base">Choose a project from the dropdown above to view its tasks.</p>
        </div>
      ) : !hasTasks ? (
        <div className="text-center py-20">
          <i className="fa-solid fa-check-double text-7xl text-slate-300"></i>
          <h3 className="mt-6 text-xl font-medium text-slate-800">No tasks found</h3>
          <p className="text-slate-500 mt-2 text-base">Click "Add Task" to create the first task for this project.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {milestoneGroups.map(({ milestone, tasks: childTasks }) => (
            <details key={milestone.id} className="bg-slate-100 border border-slate-200 rounded-lg open:shadow-lg" open>
              <summary className="p-4 font-bold text-lg text-slate-800 cursor-pointer flex justify-between items-center hover:bg-slate-200/70 transition-colors">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-flag-checkered text-teal-600"></i>
                  {milestone.title}
                </div>
                <div className="flex items-center gap-4">
                  <span className={getStatusBadge(milestone.status)}>{milestone.status}</span>
                  <i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i>
                </div>
              </summary>
              <div className="p-4 border-t border-slate-200 bg-white">
                <p className="text-sm text-slate-600 mb-4">{milestone.description || 'No description for this milestone.'}</p>
                {childTasks.length > 0 ? (
                  <div className="space-y-2">
                    {childTasks.map(task => (
                      <TaskCard key={task.id} task={task} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-500">No tasks are assigned to this milestone.</p>
                )}
              </div>
            </details>
          ))}
          {unparentedTasks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-700 border-t pt-4">Top-Level Tasks (Not in a Milestone)</h3>
              <div className="space-y-2 mt-2">
                {unparentedTasks.map(task => (
                  <TaskCard key={task.id} task={task} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
