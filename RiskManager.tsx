
import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { useAppContext } from './context/AppContext.tsx';
import { Risk, RiskLevel, FormData as Project } from './types.ts';
import * as api from './services/api.ts';
import FormField from './components/ui/FormField.tsx';
import ProjectFilter from './components/ui/ProjectFilter.tsx';
import { Textarea } from './components/ui/Textarea.tsx';
import { Input } from './components/ui/Input.tsx';
import { Select } from './components/ui/Select.tsx';
import ConfirmationModal from './components/ui/ConfirmationModal.tsx';
import { initialRiskData } from './constants.ts';
import { RISK_LEVEL_OPTIONS } from './constants.ts';

// --- Risk Editor Modal ---
interface RiskEditorModalProps {
    risk: Omit<Risk, 'id' | 'createdAt' | 'projectId'> | Risk;
    onSave: (risk: Omit<Risk, 'id' | 'createdAt' | 'projectId'> | Risk) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const RiskEditorModal: React.FC<RiskEditorModalProps> = ({ risk, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState(risk);

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-slate-800">{'id' in formData ? 'Edit' : 'Add'} Risk</h3>
                <div className="space-y-4">
                    <FormField label="Heading" htmlFor="heading" required><Input id="heading" value={formData.heading} onChange={e => handleChange('heading', e.target.value)} /></FormField>
                    <FormField label="Risk" htmlFor="riskDescription"><Textarea id="riskDescription" value={formData.riskDescription} onChange={e => handleChange('riskDescription', e.target.value)} rows={4} /></FormField>
                    <FormField label="Mitigation Plan" htmlFor="mitigationPlan"><Textarea id="mitigationPlan" value={formData.mitigationPlan} onChange={e => handleChange('mitigationPlan', e.target.value)} rows={4} /></FormField>
                    <FormField label="Risk Level" htmlFor="riskLevel"><Select id="riskLevel" value={formData.riskLevel} onChange={e => handleChange('riskLevel', e.target.value as RiskLevel)} options={RISK_LEVEL_OPTIONS} /></FormField>
                    <FormField label="Additional Notes" htmlFor="additionalNotes"><Textarea id="additionalNotes" value={formData.additionalNotes} onChange={e => handleChange('additionalNotes', e.target.value)} rows={3} /></FormField>
                </div>
                <div className="mt-8 flex justify-end space-x-3 pt-5 border-t">
                    <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSaving}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Risk'}</button>
                </div>
            </form>
        </div>
    );
};

// --- Main Risk Manager Component ---
const RiskManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [introText, setIntroText] = useState('');
    const [isIntroDirty, setIsIntroDirty] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentRisk, setCurrentRisk] = useState<Omit<Risk, 'id' | 'createdAt' | 'projectId'> | Risk | null>(null);
    const [riskToDelete, setRiskToDelete] = useState<Risk | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const selectedProject = useMemo(() => state.projects.find(p => p.id === selectedProjectId), [selectedProjectId, state.projects]);
    const projectRisks = useMemo(() => state.risks.filter(r => r.projectId === selectedProjectId), [selectedProjectId, state.risks]);

    useEffect(() => {
        if (selectedProject) {
            setIntroText(selectedProject.riskIntroText || '');
            setIsIntroDirty(false);
        } else {
            setIntroText('');
            setIsIntroDirty(false);
        }
    }, [selectedProject]);

    const handleSaveIntro = async () => {
        if (!selectedProject) return;
        try {
            await api.updateProject(selectedProject.id, { ...selectedProject, riskIntroText: introText });
            dispatch({ type: 'UPDATE_PROJECT_PARTIAL', payload: { projectId: selectedProject.id, data: { riskIntroText: introText } } });
            notify('Introduction saved.', 'success');
            setIsIntroDirty(false);
        } catch (e: any) {
            notify(`Error: ${e.message}`, 'error');
        }
    };
    
    const handleSaveRisk = async (risk: Omit<Risk, 'id'|'createdAt'|'projectId'> | Risk) => {
        if (!selectedProjectId) return;
        setIsSaving(true);
        try {
            if ('id' in risk) {
                const updatedRisk = await api.updateRisk(risk.id, risk);
                dispatch({ type: 'UPDATE_RISK', payload: updatedRisk });
                notify('Risk updated.', 'success');
            } else {
                const newRisk = await api.addRisk({ ...risk, projectId: selectedProjectId });
                dispatch({ type: 'ADD_RISK', payload: newRisk });
                notify('Risk added.', 'success');
            }
            setIsEditorOpen(false);
            setCurrentRisk(null);
        } catch (e: any) {
            notify(`Error: ${e.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteRisk = async () => {
        if (!riskToDelete) return;
        try {
            await api.deleteRisk(riskToDelete.id);
            dispatch({ type: 'DELETE_RISK', payload: riskToDelete.id });
            notify('Risk deleted.', 'success');
        } catch (e: any) {
             notify(`Error: ${e.message}`, 'error');
        }
        setRiskToDelete(null);
    };

    const getRiskLevelColor = (level: RiskLevel) => {
        switch(level) {
            case 'Low': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            {isEditorOpen && currentRisk && <RiskEditorModal risk={currentRisk} onSave={handleSaveRisk} onCancel={() => setIsEditorOpen(false)} isSaving={isSaving} />}
            {riskToDelete && <ConfirmationModal isOpen={true} onClose={() => setRiskToDelete(null)} onConfirm={confirmDeleteRisk} title="Delete Risk" message="Are you sure you want to delete this risk?" />}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Risk Management</h1>
                 <div className="w-full md:w-auto md:max-w-xs">
                    <ProjectFilter value={selectedProjectId} onChange={setSelectedProjectId} allowAll={false} />
                </div>
            </div>

            {!selectedProject ? (
                <div className="text-center py-20"><p>Please select a project to manage its risks.</p></div>
            ) : (
                <div className="space-y-8">
                    <FormField label="Introductory Text" htmlFor="intro_text" instructions="This text will appear at the beginning of the 'Risks and Risk Mitigation' section in your Research Plan.">
                        <Textarea id="intro_text" value={introText} onChange={e => { setIntroText(e.target.value); setIsIntroDirty(true); }} rows={4} />
                        {isIntroDirty && (
                            <div className="text-right mt-2">
                                <button onClick={handleSaveIntro} className="btn btn-primary">Save Introduction</button>
                            </div>
                        )}
                    </FormField>
                    
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">Risks</h2>
                            <button onClick={() => { setCurrentRisk(initialRiskData); setIsEditorOpen(true); }} className="btn btn-primary"><i className="fa-solid fa-plus mr-2"></i>Add New Risk</button>
                        </div>
                        <div className="space-y-3">
                            {projectRisks.length > 0 ? projectRisks.map(risk => (
                                <details key={risk.id} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                                    <summary className="font-semibold text-lg text-slate-800 cursor-pointer list-none flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {risk.heading}
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getRiskLevelColor(risk.riskLevel)}`}>{risk.riskLevel}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => { e.preventDefault(); setCurrentRisk(risk); setIsEditorOpen(true); }} className="btn btn-secondary text-xs">Edit</button>
                                            <button onClick={(e) => { e.preventDefault(); setRiskToDelete(risk); }} className="btn btn-danger text-xs">Delete</button>
                                            <i className="fa-solid fa-chevron-down transform transition-transform details-arrow"></i>
                                        </div>
                                    </summary>
                                    <div className="mt-4 pt-4 border-t border-slate-300 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div><h4 className="font-semibold text-slate-600">Risk Description</h4><p className="mt-1 whitespace-pre-wrap">{risk.riskDescription}</p></div>
                                        <div><h4 className="font-semibold text-slate-600">Mitigation Plan</h4><p className="mt-1 whitespace-pre-wrap">{risk.mitigationPlan}</p></div>
                                        {risk.additionalNotes && <div className="md:col-span-2"><h4 className="font-semibold text-slate-600">Additional Notes</h4><p className="mt-1 whitespace-pre-wrap">{risk.additionalNotes}</p></div>}
                                    </div>
                                </details>
                            )) : (
                                <p className="text-center italic text-slate-500 py-8">No risks have been added for this project yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskManager;
