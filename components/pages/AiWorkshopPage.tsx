

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { produce } from 'immer';
import { Content } from '@google/genai';
import { useAppContext } from '../../context/AppContext';
import { Page, Task, FormData as Project, AiPersonaName, Member, BudgetItem } from '../../types';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { 
    initialTaskData, 
    PROJECT_ASSESSABLE_FIELDS
} from '../../constants';
import { getAiResponse } from '../../services/aiService';
import TaskEditor from '../task/TaskEditor';
import DisciplineIntegrationPanel from '../ai/DisciplineIntegrationPanel';
import * as api from '../../services/api';

interface AiWorkshopPageProps {
  onNavigate: (page: Page) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text?: string;
  isCreation?: boolean;
  isImprovement?: boolean;
  isIntegration?: boolean;
  isDisciplineIntegration?: boolean;
}

interface AssessableItem {
  id: string;
  title?: string;
  description: string;
  wordLimit?: number;
  [key: string]: any;
}

// Represents the structure the AI is now asked to generate for workplans.
interface AiGeneratedMilestone {
    title: string;
    description: string;
    startDate: string; // YYYY-MM-DD
    dueDate: string; // YYYY-MM-DD
    tasks: {
        title: string;
        description: string;
        estimatedHours: number;
        startDate: string; // YYYY-MM-DD
        dueDate: string; // YYYY-MM-DD
    }[];
}

const formatFieldKey = (key?: string): string => {
  if (!key) return 'Section';
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};


const StagingPanel = ({ candidates, onAddSelectedTasks, isLoading }: { candidates: AiGeneratedMilestone[], onAddSelectedTasks: (selected: Map<number, Set<number>>) => void, isLoading: boolean }) => {
    // A map where key is milestone index and value is a set of selected task indices for that milestone
    const [selectedTasks, setSelectedTasks] = useState<Map<number, Set<number>>>(new Map());

    useEffect(() => {
        // Pre-select all tasks when candidates change
        const newMap = new Map<number, Set<number>>();
        candidates.forEach((milestone, milestoneIndex) => {
            const allTaskIndices = new Set<number>();
            if (milestone.tasks && Array.isArray(milestone.tasks)) {
                 for (let i = 0; i < milestone.tasks.length; i++) {
                    allTaskIndices.add(i);
                }
            }
            newMap.set(milestoneIndex, allTaskIndices);
        });
        setSelectedTasks(newMap);
    }, [candidates]);


    const handleTaskToggle = (milestoneIndex: number, taskIndex: number) => {
        setSelectedTasks(prev => {
            const newMap = new Map(prev);
            const milestoneTasks = new Set(newMap.get(milestoneIndex) || []);
            if (milestoneTasks.has(taskIndex)) {
                milestoneTasks.delete(taskIndex);
            } else {
                milestoneTasks.add(taskIndex);
            }
            newMap.set(milestoneIndex, milestoneTasks);
            return newMap;
        });
    };

    const handleMilestoneToggle = (milestoneIndex: number, totalTasks: number) => {
        setSelectedTasks(prev => {
            const newMap = new Map(prev);
            const milestoneTasks = newMap.get(milestoneIndex) || new Set();
            if (milestoneTasks.size === totalTasks) {
                newMap.set(milestoneIndex, new Set()); // Deselect all
            } else {
                const allTaskIndices = new Set<number>();
                for (let i = 0; i < totalTasks; i++) {
                    allTaskIndices.add(i);
                }
                newMap.set(milestoneIndex, allTaskIndices); // Select all
            }
            return newMap;
        });
    };

    const totalSelectedCount = Array.from(selectedTasks.values()).reduce((sum, set) => sum + set.size, 0);

    if (!candidates || candidates.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-blue-200 space-y-4">
            {candidates.map((milestone, milestoneIndex) => {
                const totalTasksInMilestone = milestone.tasks?.length || 0;
                const selectedCountInMilestone = selectedTasks.get(milestoneIndex)?.size || 0;
                const isMilestoneChecked = selectedCountInMilestone === totalTasksInMilestone && totalTasksInMilestone > 0;
                const isMilestoneIndeterminate = selectedCountInMilestone > 0 && selectedCountInMilestone < totalTasksInMilestone;

                return (
                    <div key={milestoneIndex} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex items-start gap-3 mb-3">
                             <input
                                type="checkbox"
                                className="h-5 w-5 mt-1 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                ref={el => { if (el) { el.indeterminate = isMilestoneIndeterminate; } }}
                                checked={isMilestoneChecked}
                                onChange={() => handleMilestoneToggle(milestoneIndex, totalTasksInMilestone)}
                                title={isMilestoneChecked ? 'Deselect All Tasks' : 'Select All Tasks'}
                             />
                             <div className="flex-grow">
                                <h5 className="font-bold text-slate-800 text-base">{milestone.title}</h5>
                                <p className="text-xs text-slate-500 mt-1">{milestone.description}</p>
                                <p className="text-xs text-slate-500 mt-1"><i className="fa-regular fa-calendar mr-1"></i>{milestone.startDate || 'N/A'} to {milestone.dueDate || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2 pl-8">
                            <h6 className="text-xs font-bold text-slate-500 uppercase">Tasks for this Milestone</h6>
                            {(milestone.tasks || []).map((task, taskIndex) => (
                                 <div key={taskIndex} className="flex items-start gap-3 p-2 rounded-md border border-slate-200 bg-white">
                                     <input 
                                        type="checkbox" 
                                        className="h-5 w-5 mt-1 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                                        checked={selectedTasks.get(milestoneIndex)?.has(taskIndex)}
                                        onChange={() => handleTaskToggle(milestoneIndex, taskIndex)}
                                     />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                                        <div className="flex text-xs text-slate-500 mt-1 gap-4">
                                            {task.estimatedHours > 0 && (
                                                <span><i className="fa-regular fa-clock mr-1"></i>{task.estimatedHours}h</span>
                                            )}
                                            {(task.startDate || task.dueDate) && (
                                                <span><i className="fa-regular fa-calendar mr-1"></i>{task.startDate} to {task.dueDate}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(milestone.tasks || []).length === 0 && <p className="text-sm italic text-slate-400">No sub-tasks suggested for this milestone.</p>}
                        </div>
                    </div>
                );
            })}
             <div className="pt-4 border-t border-blue-200">
                <button
                    onClick={() => onAddSelectedTasks(selectedTasks)}
                    disabled={isLoading || totalSelectedCount === 0}
                    className="w-full mt-2 px-4 py-3 text-base font-bold text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
                >
                    <i className="fa-solid fa-check-double mr-2"></i>
                    Add {totalSelectedCount} Selected Task{totalSelectedCount !== 1 && 's'} to Project
                </button>
            </div>
        </div>
    );
};


const AiWorkshopPage: React.FC<AiWorkshopPageProps> = ({ onNavigate }) => {
  const { state, dispatch, notify } = useAppContext();
  const { activeWorkshopItem, projects, tasks, members } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  
  const [creationCandidates, setCreationCandidates] = useState<AiGeneratedMilestone[] | null>([]);
  const [improvementCandidate, setImprovementCandidate] = useState<{ title: string; description: string } | null>(null);
  const [integrationCandidate, setIntegrationCandidate] = useState<string | null>(null);
  const [disciplineSuggestions, setDisciplineSuggestions] = useState<Partial<Project> | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Data Preparation ---
  const { 
    itemData, 
    assessableItem, 
    aiPersona, 
    backPage, 
    isNewItem, 
    displayName,
    previousField,
    nextField,
    previousTask,
    nextTask,
  } = useMemo(() => {
    if (!activeWorkshopItem) {
      return { itemData: null, assessableItem: null, aiPersona: 'main' as AiPersonaName, backPage: 'home' as Page, isNewItem: false, displayName: 'Item', previousField: null, nextField: null, previousTask: null, nextTask: null };
    }

    let previousField = null;
    let nextField = null;

    if (activeWorkshopItem.type === 'project') {
      const currentIndex = PROJECT_ASSESSABLE_FIELDS.findIndex(f => f.key === activeWorkshopItem.fieldKey);
      if (currentIndex !== -1) {
          previousField = currentIndex > 0 ? PROJECT_ASSESSABLE_FIELDS[currentIndex - 1] : null;
          nextField = currentIndex < PROJECT_ASSESSABLE_FIELDS.length - 1 ? PROJECT_ASSESSABLE_FIELDS[currentIndex + 1] : null;
      }
    }
    
    if (activeWorkshopItem.type === 'task') {
      const isNew = activeWorkshopItem.itemId.startsWith('new_');
      let task: Task;
      let project: Project | undefined;
      let previousTask: Task | null = null;
      let nextTask: Task | null = null;

      if (isNew) {
        const projectId = activeWorkshopItem.itemId.substring(4);
        project = projects.find(p => p.id === projectId);
        task = { ...initialTaskData, id: activeWorkshopItem.itemId, projectId, title: "Suggest initial tasks for project" };
      } else {
        task = tasks.find(t => t.id === activeWorkshopItem.itemId)!;
        project = projects.find(p => p.id === task?.projectId);

        if (project) {
          const projectTasks = tasks.filter(t => t.projectId === project!.id).sort((a,b) => (a.taskCode || '').localeCompare(b.taskCode || ''));
          const currentIndex = projectTasks.findIndex(t => t.id === task.id);
          if (currentIndex !== -1) {
            previousTask = currentIndex > 0 ? projectTasks[currentIndex - 1] : null;
            nextTask = currentIndex < projectTasks.length - 1 ? projectTasks[currentIndex + 1] : null;
          }
        }
      }
      return { itemData: { task, project }, assessableItem: task, aiPersona: 'tasks' as AiPersonaName, backPage: 'taskAssessor' as Page, isNewItem: isNew, displayName: 'Task', previousField, nextField, previousTask, nextTask };
    }

    if (activeWorkshopItem.type === 'project') {
        const project = projects.find(p => p.id === activeWorkshopItem.itemId)!;
        const fieldKey = activeWorkshopItem.fieldKey;
        const label = activeWorkshopItem.fieldLabel || formatFieldKey(fieldKey);

        const fieldInfo = PROJECT_ASSESSABLE_FIELDS.find(f => f.key === fieldKey);
        let itemDescription = '';
        if(fieldKey !== 'artisticDisciplinesAndGenres' && typeof (project as any)[fieldKey] === 'string'){
            itemDescription = (project as any)[fieldKey] || ''
        } else if (fieldKey === 'artisticDisciplinesAndGenres') {
            const getGenreSummary = (project: Project): string => {
                if (!project.artisticDisciplines || project.artisticDisciplines.length === 0) return 'No disciplines selected...';
                
                return project.artisticDisciplines.map(key => {
                    const discipline = state.settings.projects.disciplines.find(d => d.id === key);
                    return discipline?.name || key;
                }).join(', ');
            };
            itemDescription = getGenreSummary(project);
        }
      
        return {
            itemData: project,
            assessableItem: { id: fieldKey, description: itemDescription, wordLimit: fieldInfo?.wordLimit },
            aiPersona: 'projects' as AiPersonaName,
            backPage: 'projectAssessor' as Page,
            isNewItem: false,
            displayName: label,
            previousField,
            nextField,
            previousTask: null,
            nextTask: null,
        };
    }

    return { itemData: null, assessableItem: null, aiPersona: 'main' as AiPersonaName, backPage: 'home' as Page, isNewItem: false, displayName: 'Item', previousField: null, nextField: null, previousTask: null, nextTask: null };
  }, [activeWorkshopItem, projects, tasks, members, state.settings.projects.disciplines]);

  // --- State and Effects ---
  useEffect(() => {
    let initialMessage = `Welcome to the ${displayName} Workshop! Use an action button or type your own prompt.`;
    if (activeWorkshopItem?.type === 'task' && isNewItem && itemData) {
        const project = (itemData as { project?: Project }).project;
        if (project) {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            if (projectTasks.length > 0) {
                const taskList = projectTasks.map(t => `- ${t.taskCode}: ${t.title} (${t.status})`).join('\n');
                initialMessage = `Welcome to the ${displayName} Workshop! This project already has some tasks. You can ask me to suggest additional tasks to complete the workplan.\n\n**Existing Tasks:**\n${taskList}`;
            }
        }
    }
    
    setConversation([{ id: `sys_${Date.now()}`, sender: 'system', text: initialMessage }]);
    setCreationCandidates([]);
    setImprovementCandidate(null);
    setIntegrationCandidate(null);
    setDisciplineSuggestions(null);
    setIsLoading(false);
    setUserInput('');
}, [activeWorkshopItem?.itemId, activeWorkshopItem?.type === 'project' ? activeWorkshopItem.fieldKey : undefined]); // Critical change: only reset when the core item changes.

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // --- Handlers ---
  const handleBack = () => {
    dispatch({ type: 'SET_ACTIVE_WORKSHOP_ITEM', payload: null });
    onNavigate(backPage);
  };
  
  const handleAiRequest = async (prompt: string, userMessageText: string) => {
    if (!assessableItem) return;
    setIsLoading(true);
    setCreationCandidates([]);
    setImprovementCandidate(null);
    setIntegrationCandidate(null);
    setDisciplineSuggestions(null);

    const updatedConversation = produce(conversation, draft => {
      draft.push({ id: `user_${Date.now()}`, sender: 'user', text: userMessageText });
    });
    setConversation(updatedConversation);

    const history = updatedConversation.filter(m => m.sender !== 'system' && m.text).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text as string }]
    }));

    try {
      const apiResult = await getAiResponse(aiPersona, prompt, state.settings.ai, history);
      
      let textResult = apiResult.text;
      let isCreator = false;
      let isImprover = false;
      let isDiscipline = false;

      if (activeWorkshopItem?.type === 'project') {
          try {
             let jsonString = textResult.trim().match(/```(\w*)?\s*\n?(.*?)\n?\s*```$/s)?.[2] || textResult;
             const parsed = JSON.parse(jsonString);

             if(parsed.artisticDisciplines) {
                isDiscipline = true;
                setDisciplineSuggestions(parsed);
                textResult = "I've analyzed your project and suggested some artistic disciplines and genres. Please review and integrate the ones that fit.";
             } else {
                setIntegrationCandidate(textResult);
             }
          } catch(e) {
            setIntegrationCandidate(textResult);
          }
        
        setConversation(produce(updatedConversation, draft => {
          draft.push({ id: `ai_${Date.now()}`, sender: 'ai', text: `Here is a suggested revision. You can edit it below before accepting.`, isIntegration: !isDiscipline, isDisciplineIntegration: isDiscipline });
        }));

      } else { // Task logic
        try {
          let jsonString = textResult.trim().match(/```(\w*)?\s*\n?(.*?)\n?\s*```$/s)?.[2] || textResult;
          const parsed = JSON.parse(jsonString);
          
          if (Array.isArray(parsed) && parsed.length > 0) {
              if (parsed[0].hasOwnProperty('tasks')) { // New hierarchical structure
                  isCreator = true;
                  setCreationCandidates(parsed);
                  textResult = `Here is the workplan I've prepared. You can review and edit each milestone and task before creating them.`;
              } else if (parsed[0].hasOwnProperty('title')) { // Old flat task list structure for backwards compatibility
                  isCreator = true;
                  // Wrap flat task list into a single milestone for display
                  setCreationCandidates([{ title: "Suggested Tasks", description: "Tasks generated based on your request.", startDate: '', dueDate: '', tasks: parsed }]);
                  textResult = `Here are the tasks I've prepared. You can review and edit each one before creating them.`;
              }
          } else if (typeof parsed === 'object' && parsed !== null && 'title' in parsed && 'description' in parsed) {
              isImprover = true;
              setImprovementCandidate({ title: parsed.title, description: parsed.description });
              textResult = `I've drafted an improved version of the task title and description. You can review and edit it below before integrating the changes.`;
          }
        } catch (e) { /* Not JSON, treat as plain text for tasks */ }
        
        setConversation(produce(updatedConversation, draft => {
          draft.push({ id: `ai_${Date.now()}`, sender: 'ai', text: textResult, isCreation: isCreator, isImprovement: isImprover });
        }));
      }

    } catch (error: any) {
        console.error("Error calling AI function:", error);
        setConversation(produce(updatedConversation, draft => {
            draft.push({ id: `ai_err_${Date.now()}`, sender: 'ai', text: `Error: ${error.message}` });
        }));
    } finally {
        setIsLoading(false);
    }
  };

  const handleActionClick = (action: { prompt: string; userMessage: string; }) => {
    handleAiRequest(action.prompt, action.userMessage);
  };

  const handleAddSelectedTasks = async (selections: Map<number, Set<number>>) => {
    const project = (itemData as { project?: Project }).project;
    if (!project || !creationCandidates) return;
    setIsLoading(true);

    const now = new Date().toISOString();
    const createdMilestonesMap = new Map<number, Task>();
    const tasksToCreate: Omit<Task, 'id'>[] = [];

    const taskCodePrefix = (project.projectTitle.match(/\b(\w)/g) || ['T']).join('').toUpperCase().substring(0, 4);
    const projectTasks = tasks.filter(t => t.projectId === project.id && t.taskCode?.startsWith(taskCodePrefix));
    let currentTaskNumber = projectTasks.reduce((max, task) => {
         const numPart = task.taskCode?.split('-')[1];
         if (numPart) {
            const num = parseInt(numPart, 10);
            if (!isNaN(num) && num > max) return num;
         }
         return max;
    }, 0);
    
    let milestoneOrderBy = tasks.filter(t => t.projectId === project.id && t.taskType === 'Milestone').reduce((max, t) => Math.max(max, t.orderBy || 0), 0);

    try {
        for (const [milestoneIndex, taskIndices] of selections.entries()) {
            if (taskIndices.size === 0) continue;

            let parentMilestone = createdMilestonesMap.get(milestoneIndex);
            if (!parentMilestone) {
                const milestoneCandidate = creationCandidates[milestoneIndex];
                milestoneOrderBy += 10;
                currentTaskNumber++;
                const milestoneTaskData: Task = {
                    ...initialTaskData,
                    projectId: project.id,
                    title: milestoneCandidate.title,
                    description: milestoneCandidate.description,
                    startDate: milestoneCandidate.startDate || null,
                    dueDate: milestoneCandidate.dueDate || null,
                    taskType: 'Milestone',
                    status: 'To Do',
                    orderBy: milestoneOrderBy,
                    taskCode: `${taskCodePrefix}-${currentTaskNumber}`,
                    updatedAt: now,
                    id: '', // Will be ignored by DB insert
                };
                parentMilestone = await api.addTask(milestoneTaskData);
                createdMilestonesMap.set(milestoneIndex, parentMilestone);
            }
            
            let taskOrderBy = 0;
            for (const taskIndex of taskIndices) {
                const taskCandidate = creationCandidates[milestoneIndex].tasks[taskIndex];
                taskOrderBy += 1;
                currentTaskNumber++;
                tasksToCreate.push({
                    ...initialTaskData,
                    ...taskCandidate,
                    projectId: project.id,
                    parentTaskId: parentMilestone.id,
                    orderBy: taskOrderBy,
                    taskCode: `${taskCodePrefix}-${currentTaskNumber}`,
                    updatedAt: now,
                });
            }
        }
        
        if (tasksToCreate.length > 0) {
            const createdChildTasks = await api.addTasks(tasksToCreate as Task[]);
            dispatch({ type: 'ADD_TASKS', payload: createdChildTasks });
        }
        
        if (createdMilestonesMap.size > 0) {
             dispatch({ type: 'ADD_TASKS', payload: Array.from(createdMilestonesMap.values()) });
        }

        notify(`${tasksToCreate.length} task(s) and ${createdMilestonesMap.size} milestone(s) created!`, 'success');
        setCreationCandidates(null);

    } catch (error: any) {
        notify(`Error creating tasks: ${error.message}`, 'error');
    } finally {
        setIsLoading(false);
    }
};
  
  const handleNavigateTask = (task: Task | null) => {
      if (!task) return;
      dispatch({
          type: 'SET_ACTIVE_WORKSHOP_ITEM',
          payload: { type: 'task', itemId: task.id }
      });
  };

  const handleNavigateSection = (field: { key: string, label: string } | null) => {
      if (!field || !activeWorkshopItem || activeWorkshopItem.type !== 'project') return;
      dispatch({
          type: 'SET_ACTIVE_WORKSHOP_ITEM',
          payload: {
              type: 'project',
              itemId: activeWorkshopItem.itemId,
              fieldKey: field.key,
              fieldLabel: field.label
          }
      });
  };

  // --- Dynamic Content Generation ---
  const { renderItemPanel, generateContextPrompt, actionButtons } = useMemo(() => {
    if (activeWorkshopItem?.type === 'task') {
      const { task, project } = itemData as { task: Task, project?: Project };
      return {
        renderItemPanel: () => (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-700">Current Task</h3>
            <p className="text-sm"><strong className="font-semibold">Project:</strong> {project?.projectTitle}</p>
            <p className="text-sm"><strong className="font-semibold">Code:</strong> {task.taskCode}</p>
            <p className="text-sm"><strong className="font-semibold">Title:</strong> {task.title}</p>
            <p className="text-sm"><strong className="font-semibold">Description:</strong> {task.description}</p>
          </div>
        ),
        generateContextPrompt: (basePrompt: string) => {
            const context = {
                project: project ? { title: project.projectTitle, description: project.projectDescription, schedule: project.schedule, projectStartDate: project.projectStartDate, projectEndDate: project.projectEndDate } : null,
                parentTask: isNewItem ? null : { title: task.title, description: task.description, startDate: task.startDate, dueDate: task.dueDate },
                fullWorkplan: project ? tasks.filter(t => t.projectId === project.id).map(t => ({ taskCode: t.taskCode, title: t.title, status: t.status })) : [],
                availableMembers: members.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`})),
                budgetLineItems: project?.budget ? Object.values(project.budget.expenses).flat().map(i => ({id: i.id, description: i.description || i.source})) : [],
            };
            return `${basePrompt}\n\n### CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
        },
        actionButtons: isNewItem ? [
             { 
                 label: "Suggest Workplan", 
                 prompt: `You are an expert project manager. Based on the provided project context, which may include an existing workplan, generate a comprehensive list of milestones and their associated tasks to complete the project. Your response MUST be ONLY a single, valid JSON array of objects, where each object represents a milestone.

Each milestone object must strictly follow this TypeScript interface:
{ 
  "title": string; 
  "description": string; 
  "startDate": "YYYY-MM-DD"; 
  "dueDate": "YYYY-MM-DD"; 
  "tasks": { 
    "title": string; 
    "description": string; 
    "estimatedHours": number; 
    "startDate": "YYYY-MM-DD"; 
    "dueDate": "YYYY-MM-DD"; 
  }[]; 
}

Crucial instructions for date generation:
1. You MUST provide a valid "YYYY-MM-DD" string for every 'startDate' and 'dueDate' field for both milestones AND tasks. Do not use null or empty strings.
2. All dates must be logically sequenced and fall within the project's overall start and end dates provided in the context.
3. Each task's start and due dates MUST fall within the start and due dates of its parent milestone.
4. Do not duplicate tasks already present in the context's 'fullWorkplan'.`, 
                 userMessage: "Suggest a workplan for this project." 
             }
        ] : [
            { 
                label: "Break Down Task", 
                prompt: `Break down the provided parent task into smaller, actionable sub-tasks. Your response MUST be ONLY a single, valid JSON array of objects. Each object must strictly follow this TypeScript interface: { "title": string; "description": string; "estimatedHours": number; }. The start and due dates for sub-tasks must fall within the parent task's date range.`, 
                userMessage: "Break this task down into smaller sub-tasks." 
            },
            { 
                label: "Improve this Task", 
                prompt: `You are an expert project manager. Your goal is to improve the clarity and actionability of a task. Rewrite the provided task's title and description. Your response MUST be ONLY a single, valid JSON object following this TypeScript interface: { "title": string; "description": string; }. Do not add any other text or explanation.`, 
                userMessage: "Improve the title and description for this task." 
            }
        ]
      }
    }
    
    if (activeWorkshopItem && activeWorkshopItem.type === 'project' && assessableItem) {
        const project = itemData as Project;
        const field = assessableItem as AssessableItem;
        const { wordLimit = 500, description } = field;
        const hasContent = description && description.trim().length > 0;
        const isDisciplineField = activeWorkshopItem.fieldKey === 'artisticDisciplinesAndGenres';

        const dynamicActions = [
            {
                label: `Condense to Fit (${wordLimit} words)`,
                prompt: `You are an expert editor. The following text must be condensed to fit a word limit of approximately ${wordLimit} words. Summarize this text for the grant application field "${displayName}", preserving its core message, tone, and essential details, while being as concise as possible. Respond only with the condensed text.\n\n[Original Text]:\n${description}`,
                userMessage: `Condense the "${displayName}" section to fit the ${wordLimit} word limit.`
            },
            {
                label: `Expand Content (to ${wordLimit} words)`,
                prompt: `You are an expert grant writer. Expand upon the following ideas for the grant application field "${displayName}" to create a more detailed and compelling narrative, up to a maximum of ${wordLimit} words. Elaborate on the key points and provide more descriptive language. Respond only with the expanded text.\n\n[Original Text]:\n${description}`,
                userMessage: `Expand on the ideas in the "${displayName}" section.`
            },
            {
                label: "Improve Clarity",
                prompt: `You are an expert grant writer. Rewrite the following text for the grant application field "${displayName}" to improve its clarity, impact, and professionalism. Maintain a similar length. Respond only with the rewritten text.\n\n[Original Text]:\n${description}`,
                userMessage: `Improve the clarity of the "${displayName}" section.`
            },
            {
                label: "Suggest Disciplines & Genres",
                prompt: `Based on the project's title and description, suggest relevant artistic disciplines and specific genres. Your response MUST be ONLY a single, valid JSON object following this TypeScript interface:
{
  "artisticDisciplines": string[]; // e.g., ["craft", "music"]
  "craftGenres"?: string[];
  "danceGenres"?: string[];
  "literaryGenres"?: string[];
  "mediaGenres"?: string[];
  "musicGenres"?: string[];
  "theatreGenres"?: string[];
  "visualArtsGenres"?: string[];
}
Choose from the available values provided in the context. Do not invent new ones.`,
                userMessage: "Suggest artistic disciplines and genres for this project."
            }
        ];
        
        const actionButtons = isDisciplineField 
            ? [dynamicActions[3]] 
            : hasContent 
                ? [dynamicActions[0], dynamicActions[1], dynamicActions[2]] 
                : [dynamicActions[1]];

        return {
            renderItemPanel: () => (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-700">Current Section: {displayName}</h3>
                    <p className="text-sm"><strong className="font-semibold">Project:</strong> {project.projectTitle}</p>
                    {wordLimit && <p className="text-sm"><strong className="font-semibold">Word Limit:</strong> {wordLimit}</p>}
                    <p className="text-sm"><strong className="font-semibold">Content:</strong> {field.description || 'This section has no content yet.'}</p>
                </div>
            ),
            generateContextPrompt: (basePrompt: string) => {
                const context = { project: { title: project.projectTitle, description: project.projectDescription }, fieldToAnalyze: { name: displayName, content: field.description, wordLimit } };
                return `${basePrompt}\n\n### CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
            },
            actionButtons,
        }
    }
    return { renderItemPanel: () => null, generateContextPrompt: (p: string) => p, actionButtons: [] };
  }, [itemData, assessableItem, activeWorkshopItem, isNewItem, tasks, members, displayName]);
  
  if (!activeWorkshopItem || !assessableItem) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-700">No item selected for workshop.</h2>
            <button onClick={handleBack} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md">Go Back</button>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-slate-900">AI Workshop</h1>
            <div className="flex items-center gap-3">
                {activeWorkshopItem?.type === 'project' && !activeWorkshopItem.fieldKey.startsWith('ECOSTAR_') ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleNavigateSection(previousField)} disabled={!previousField || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                        </button>
                        <button onClick={() => handleNavigateSection(nextField)} disabled={!nextField || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next <i className="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                ) : activeWorkshopItem?.type === 'task' ? (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleNavigateTask(previousTask)} disabled={!previousTask || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i className="fa-solid fa-arrow-left mr-2"></i> Previous Task
                        </button>
                        <button onClick={() => handleNavigateTask(nextTask)} disabled={!nextTask || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next Task <i className="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                ) : null }
                <button onClick={handleBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"><i className="fa-solid fa-arrow-left mr-2"></i>Back</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200 self-start">{renderItemPanel()}</div>

            <div className="lg:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col">
                <h3 className="font-bold text-lg text-blue-800 mb-4 flex-shrink-0">AI Coach</h3>
                <div ref={chatEndRef} className="flex-grow bg-white rounded-md p-3 text-sm text-slate-700 space-y-4 overflow-y-auto min-h-96 max-h-[65vh]">
                    {conversation.map(msg => (
                        <div key={msg.id}>
                            {msg.sender === 'system' && <p className="text-xs text-center italic text-slate-500 p-2 bg-slate-100 rounded-md"><pre className="whitespace-pre-wrap font-sans">{msg.text}</pre></p>}
                            {msg.sender === 'user' && <p className="text-right"><span className="bg-slate-200 rounded-lg px-3 py-2 inline-block max-w-xl">{msg.text}</span></p>}
                            {msg.sender === 'ai' && (
                                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                                    {msg.isCreation && creationCandidates && creationCandidates.length > 0 && (
                                        <StagingPanel candidates={creationCandidates} onAddSelectedTasks={handleAddSelectedTasks} isLoading={isLoading} />
                                    )}
                                    {msg.isImprovement && improvementCandidate && (
                                        <ImprovementPanel
                                            candidate={improvementCandidate}
                                            onIntegrate={(updatedData) => {
                                                if (activeWorkshopItem?.type === 'task') {
                                                    dispatch({ type: 'UPDATE_TASK_PARTIAL', payload: { taskId: activeWorkshopItem.itemId, data: updatedData } });
                                                    notify('Task improved successfully!', 'success');
                                                    setImprovementCandidate(null);
                                                }
                                            }}
                                            isLoading={isLoading}
                                        />
                                    )}
                                    {msg.isIntegration && integrationCandidate && (
                                        <IntegrationPanel
                                            candidate={integrationCandidate}
                                            onIntegrate={(newText) => {
                                                if (activeWorkshopItem?.type === 'project') {
                                                    dispatch({ type: 'UPDATE_PROJECT_PARTIAL', payload: { projectId: activeWorkshopItem.itemId, data: { [activeWorkshopItem.fieldKey]: newText } } });
                                                    notify(`"${displayName}" section updated!`, 'success');
                                                    setIntegrationCandidate(null);
                                                }
                                            }}
                                            isLoading={isLoading}
                                            wordLimit={assessableItem && 'wordLimit' in assessableItem ? assessableItem.wordLimit || 0 : 0}
                                        />
                                    )}
                                     {msg.isDisciplineIntegration && disciplineSuggestions && itemData && (
                                        <DisciplineIntegrationPanel
                                            project={itemData as Project}
                                            suggestions={disciplineSuggestions}
                                            onIntegrate={(updatedData) => {
                                                 if (activeWorkshopItem?.type === 'project') {
                                                    dispatch({ type: 'UPDATE_PROJECT_PARTIAL', payload: { projectId: activeWorkshopItem.itemId, data: updatedData }});
                                                    notify('Disciplines & Genres updated!', 'success');
                                                    setDisciplineSuggestions(null);
                                                 }
                                            }}
                                            isLoading={isLoading}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && <div className="flex items-center gap-2 text-slate-500 p-2"><i className="fa-solid fa-spinner fa-spin"></i><span>AI is thinking...</span></div>}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200 flex flex-col gap-2">
                     <div className="flex items-center gap-2 flex-wrap">
                        {actionButtons.map(action => (
                            <button key={action.label} onClick={() => handleActionClick({ ...action, prompt: generateContextPrompt(action.prompt)})} disabled={isLoading} className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:bg-slate-400">
                                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>{action.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleAiRequest(generateContextPrompt(userInput), userInput); setUserInput(''); }} className="flex gap-2">
                        <Input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Type a follow-up message..." className="flex-grow" disabled={isLoading} />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">Send</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

const ImprovementPanel = ({ candidate, onIntegrate, isLoading }: { candidate: { title: string; description: string; }, onIntegrate: (data: { title: string; description: string; }) => void, isLoading: boolean }) => {
    const [editedTitle, setEditedTitle] = useState(candidate.title);
    const [editedDescription, setEditedDescription] = useState(candidate.description);

    const handleIntegrate = () => {
        onIntegrate({ title: editedTitle, description: editedDescription });
    };

    return (
        <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
            <h4 className="font-bold text-slate-800">Suggested Improvement:</h4>
            <div className="space-y-2">
                <div>
                    <label className="text-xs font-semibold text-slate-600">Title</label>
                    <Input 
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600">Description</label>
                    <TextareaWithCounter 
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        wordLimit={150}
                        className="mt-1"
                    />
                </div>
            </div>
            <button
                onClick={handleIntegrate}
                disabled={isLoading}
                className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
            >
                <i className="fa-solid fa-check-circle mr-2"></i>Integrate Changes
            </button>
        </div>
    );
};

const IntegrationPanel = ({ candidate, onIntegrate, isLoading, wordLimit }: { candidate: string, onIntegrate: (newText: string) => void, isLoading: boolean, wordLimit: number }) => {
    const [editedText, setEditedText] = useState(candidate);

    const handleIntegrate = () => {
        onIntegrate(editedText);
    };

    return (
        <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
            <h4 className="font-bold text-slate-800">Suggested Revision:</h4>
            <TextareaWithCounter 
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={10}
                wordLimit={wordLimit}
                className="mt-1"
            />
            <button
                onClick={handleIntegrate}
                disabled={isLoading}
                className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
            >
                <i className="fa-solid fa-check-circle mr-2"></i>Integrate Changes
            </button>
        </div>
    );
};


export default AiWorkshopPage;
