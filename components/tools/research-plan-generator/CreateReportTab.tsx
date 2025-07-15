
import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../../context/AppContext';
import { ResearchPlan } from '../../../types';
import FormField from '../../ui/FormField';
import { CheckboxGroup } from '../../ui/CheckboxGroup';
import ProjectFilter from '../../ui/ProjectFilter';
import { initialResearchPlanData } from '../../../constants';
import * as api from '../../../services/api';
import { EPISTEMOLOGY_OPTIONS, PEDAGOGY_OPTIONS, METHODOLOGY_OPTIONS, MIXED_METHOD_OPTIONS } from '../../../constants/research.options';
import { Input } from '../../ui/Input';


const RESEARCH_TYPE_OPTIONS = [
    { value: 'Arts-Based Research', label: 'Arts-Based Research' },
    { value: 'Indigenous Led/Co-Led Research', label: 'Indigenous Led/Co-Led Research' },
    { value: 'Social Sciences Research', label: 'Social Sciences Research' },
    { value: 'Creative Entrepreneurship Research', label: 'Creative Entrepreneurship Research' },
    { value: 'Oral History/Knowledge Transmission Research', label: 'Oral History/Knowledge Transmission Research' },
    { value: 'Climate Entrepreneurship Research', label: 'Climate Entrepreneurship Research' },
    { value: 'Creative Leadership Research', label: 'Creative Leadership Research' },
    { value: 'Other', label: 'Other (specify in notes)' },
];

const CheckboxSection: React.FC<{
    title: string;
    description: string;
    options: {value: string, label: string}[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}> = ({ title, description, options, selectedValues, onChange }) => {
    const [otherValue, setOtherValue] = useState('');
    const hasOther = options.some(opt => opt.value === 'Other');

    const handleCheckboxChange = (values: string[]) => {
        let finalValues = values;
        if (hasOther) {
            const otherIsSelected = values.includes('Other');
            const hasCustomOther = selectedValues.some(v => v.startsWith('Other:'));

            if (otherIsSelected && otherValue.trim()) {
                finalValues = values.filter(v => v !== 'Other').concat(`Other: ${otherValue.trim()}`);
            } else if (!otherIsSelected && hasCustomOther) {
                finalValues = values.filter(v => !v.startsWith('Other:'));
            }
        }
        onChange(finalValues);
    };

    const handleOtherTextBlur = () => {
        if (selectedValues.includes('Other')) {
            handleCheckboxChange(selectedValues);
        }
    };
    
    return (
        <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-600 mb-4">{description}</p>
            <CheckboxGroup
                name={title}
                options={options}
                selectedValues={selectedValues}
                onChange={handleCheckboxChange}
                columns={2}
            />
            {hasOther && selectedValues.includes('Other') && (
                 <div className="mt-2 pl-6">
                    <Input 
                        placeholder="Please specify other" 
                        value={otherValue}
                        onChange={e => setOtherValue(e.target.value)}
                        onBlur={handleOtherTextBlur}
                        className="text-sm"
                    />
                </div>
            )}
        </div>
    );
};


interface CreateReportTabProps {
    onSelectPlan: (plan: ResearchPlan) => void;
    onNewPlan: (plan: ResearchPlan) => void;
}

const CreateReportTab: React.FC<CreateReportTabProps> = ({ onSelectPlan, onNewPlan }) => {
    const { state, dispatch, notify } = useAppContext();
    const { projects, researchPlans } = state;
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selections, setSelections] = useState({
        researchTypes: [] as string[],
        epistemologies: [] as string[],
        pedagogies: [] as string[],
        methodologies: [] as string[],
        mixedMethods: [] as string[],
    });

    const existingPlansForProject = useMemo(() => {
        if (!selectedProjectId) return [];
        return researchPlans.filter(p => p.projectId === selectedProjectId);
    }, [selectedProjectId, researchPlans]);
    
    const handleSelectionChange = (field: keyof typeof selections, values: string[]) => {
        setSelections(prev => ({ ...prev, [field]: values }));
    }

    const handleStartNewPlan = async () => {
        if (!selectedProjectId) {
            notify('Please select a project first.', 'warning');
            return;
        }

        const newPlanData: Omit<ResearchPlan, 'id' | 'createdAt' | 'updatedAt'> = {
            ...initialResearchPlanData,
            projectId: selectedProjectId,
            ...selections,
        };

        try {
            const addedPlan = await api.addResearchPlan(newPlanData);
            dispatch({ type: 'ADD_RESEARCH_PLAN', payload: addedPlan });
            notify('New research plan created.', 'success');
            onNewPlan(addedPlan);
        } catch (error: any) {
            notify(`Error creating plan: ${error.message}`, 'error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <h2 className="text-xl font-bold text-slate-800">1. Select a Project</h2>
                <ProjectFilter value={selectedProjectId} onChange={setSelectedProjectId} allowAll={false} />
            </div>

            {selectedProjectId && (
                <>
                    <CheckboxSection title="2. Research Focus Areas" description="Select the primary focus for this research plan." options={RESEARCH_TYPE_OPTIONS} selectedValues={selections.researchTypes} onChange={v => handleSelectionChange('researchTypes', v)} />
                    <CheckboxSection title="3. Epistemologies (Ways of Knowing)" description="Select the philosophical underpinnings of your research." options={EPISTEMOLOGY_OPTIONS} selectedValues={selections.epistemologies} onChange={v => handleSelectionChange('epistemologies', v)} />
                    <CheckboxSection title="4. Pedagogies (Approaches to Learning)" description="Select approaches to teaching, learning, and knowledge transfer." options={PEDAGOGY_OPTIONS} selectedValues={selections.pedagogies} onChange={v => handleSelectionChange('pedagogies', v)} />
                    <CheckboxSection title="5. Methodologies (Research Strategies)" description="Select the overall strategies for your research." options={METHODOLOGY_OPTIONS} selectedValues={selections.methodologies} onChange={v => handleSelectionChange('methodologies', v)} />
                    <CheckboxSection title="6. Mixed-Methodological Approaches" description="Select if you are combining qualitative and quantitative methods." options={MIXED_METHOD_OPTIONS} selectedValues={selections.mixedMethods} onChange={v => handleSelectionChange('mixedMethods', v)} />
                    
                    <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                        <h2 className="text-xl font-bold text-slate-800">7. Start or Resume</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-r pr-6">
                                <h3 className="font-semibold text-slate-700 mb-2">Start a New Plan</h3>
                                <button
                                    onClick={handleStartNewPlan}
                                    className="w-full px-4 py-3 text-lg font-semibold text-white bg-teal-600 border border-transparent rounded-md shadow-lg hover:bg-teal-700"
                                >
                                    <i className="fa-solid fa-plus mr-2"></i>Create New Research Plan
                                </button>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">Resume an Existing Plan</h3>
                                {existingPlansForProject.length > 0 ? (
                                    <ul className="space-y-2">
                                        {existingPlansForProject.map(plan => (
                                            <li key={plan.id}>
                                                <button onClick={() => onSelectPlan(plan)} className="w-full text-left p-3 bg-white border rounded-md hover:bg-slate-100">
                                                    <p className="font-medium">Plan from {new Date(plan.createdAt).toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500 italic">{plan.notes || "No notes"}</p>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic mt-2">No existing plans for this project.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateReportTab;
