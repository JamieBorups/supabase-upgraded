

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import CreateReportTab from './research-plan-generator/CreateReportTab';
import EditReportTab from './research-plan-generator/EditReportTab';
import GenerateReportTab from './research-plan-generator/GenerateReportTab';
import { ResearchPlan } from '../../types';

const ResearchPlanGeneratorPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'generate'>('create');
    const [currentPlan, setCurrentPlan] = useState<ResearchPlan | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (state.researchPlanToEdit) {
            setCurrentPlan(state.researchPlanToEdit);
            setActiveTab('edit');
            dispatch({ type: 'SET_RESEARCH_PLAN_TO_EDIT', payload: null });
        }
    }, [state.researchPlanToEdit, dispatch]);

    const handleSelectPlan = (plan: ResearchPlan) => {
        setCurrentPlan(plan);
        setActiveTab('edit');
    };

    const handleNewPlan = (plan: ResearchPlan) => {
        setCurrentPlan(plan);
        setActiveTab('edit');
    };

    const handleFinishEditing = (updatedPlan: ResearchPlan) => {
        setCurrentPlan(updatedPlan);
        setActiveTab('generate');
        setIsDirty(false);
    };

    const handleBackToCreate = () => {
        if (isDirty) {
            if (window.confirm("You have unsaved changes. Are you sure you want to go back? Your changes will be lost.")) {
                setCurrentPlan(null);
                setActiveTab('create');
                setIsDirty(false);
            }
        } else {
            setCurrentPlan(null);
            setActiveTab('create');
        }
    };
    
    const handleSetDirty = (dirty: boolean) => {
        setIsDirty(dirty);
    }
    
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-bold text-slate-900">Research Plan Generator</h1>
            </div>

            {activeTab === 'create' && (
                <CreateReportTab onSelectPlan={handleSelectPlan} onNewPlan={handleNewPlan} />
            )}

            {activeTab === 'edit' && currentPlan && (
                <EditReportTab
                    plan={currentPlan}
                    onFinish={handleFinishEditing}
                    onBack={handleBackToCreate}
                    setDirty={handleSetDirty}
                />
            )}

            {activeTab === 'generate' && currentPlan && (
                <GenerateReportTab
                    plan={currentPlan}
                    onBack={() => setActiveTab('create')}
                />
            )}
        </div>
    );
};

export default ResearchPlanGeneratorPage;
