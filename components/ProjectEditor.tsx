import React, { useState, useCallback } from 'react';
import { TABS } from '../constants';
import { FormData, TabId } from '../types';
import ProjectInformationTab from './tabs/ProjectInformationTab';
import CollaboratorsTab from './tabs/CollaboratorsTab';
import BudgetTab from './tabs/BudgetTab';
import { useAppContext } from '../context/AppContext';

interface ProjectEditorProps {
  project: FormData;
  onSave: (project: FormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onSave, onCancel, isSaving }) => {
  const { state: { members } } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabId>(TABS[0].id);
  const [formData, setFormData] = useState<FormData>(project);

  const handleFormChange = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projectInfo':
        return <ProjectInformationTab formData={formData} onChange={handleFormChange} />;
      case 'collaborators':
        return <CollaboratorsTab formData={formData} onChange={handleFormChange} />;
      case 'budget':
        return <BudgetTab formData={formData} onChange={handleFormChange} />;
      default:
        return <ProjectInformationTab formData={formData} onChange={handleFormChange} />;
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="shadow-lg rounded-xl p-6 sm:p-8" style={{ backgroundColor: 'var(--color-surface-card)' }}>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{formData.projectTitle || "Edit Project"}</h1>
        </div>
        
        <div className="border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm transition-all duration-200 rounded-t-md`}
                  style={{
                    borderColor: isActive ? 'var(--color-primary)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    backgroundColor: isActive ? 'var(--color-surface-muted)' : 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="py-8 -mx-6 sm:-mx-8 px-6 sm:px-8" style={{ backgroundColor: 'var(--color-surface-page)' }}>
          {renderTabContent()}
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t mt-8" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <button type='button' className='btn btn-secondary' onClick={() => activeTab !== TABS[0].id && setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)} disabled={activeTab === TABS[0].id}> Back</button>
          
          <div className="flex items-center space-x-4">
              <button type="button" onClick={onCancel} className="btn btn-secondary">
                  Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Saving...
                    </>
                  ) : 'Save Project'}
              </button>
          </div>

          <button type='button' className='btn btn-primary' onClick={() => activeTab !== TABS[TABS.length-1].id && setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)} disabled={activeTab === TABS[TABS.length - 1].id}>Next </button>
        </div>
      </div>
    </form>
  );
};

export default ProjectEditor;