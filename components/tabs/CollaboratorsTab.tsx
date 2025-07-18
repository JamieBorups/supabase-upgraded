import React, { useState } from 'react';
import { FormData, Collaborator } from '../../types';
import FormField from '../ui/FormField';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';

interface Props {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const CollaboratorsTab: React.FC<Props> = ({ formData, onChange }) => {
    const { state: { members } } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [role, setRole] = useState('');
    
    const assignedMemberIds = new Set(formData.collaboratorDetails.map(c => c.memberId));
    const availableMembers = members.filter(m => !assignedMemberIds.has(m.id));

    const handleAddCollaborator = () => {
        if (selectedMemberId && role) {
            const newCollaborator: Collaborator = {
                memberId: selectedMemberId,
                role: role
            };
            onChange('collaboratorDetails', [...formData.collaboratorDetails, newCollaborator]);
            setSelectedMemberId('');
            setRole('');
            setIsModalOpen(false);
        }
    }

    const handleRemoveCollaborator = (memberId: string) => {
        onChange('collaboratorDetails', formData.collaboratorDetails.filter(c => c.memberId !== memberId));
    }

    const getMember = (memberId: string) => {
        return members.find(m => m.id === memberId);
    }

  return (
    <div className="space-y-8">
      <FormField label="Who will be working with you on the project? Explain why you chose to work with them and what they bring to the project" htmlFor="whoWillWork">
          <TextareaWithCounter
            id="whoWillWork"
            rows={8}
            value={formData.whoWillWork}
            onChange={e => onChange('whoWillWork', e.target.value)}
            wordLimit={750}
            />
      </FormField>

      <FormField label="If the artists/participants are still to be confirmed, explain how selection will be determined." htmlFor="howSelectionDetermined">
          <TextareaWithCounter
            id="howSelectionDetermined"
            rows={3}
            value={formData.howSelectionDetermined}
            onChange={e => onChange('howSelectionDetermined', e.target.value)}
            wordLimit={100}
            />
      </FormField>

      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border-subtle)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-heading)'}}>Assign Collaborators</h3>
        
        <FormField label="Click the button below to assign a member from your collective to this project." htmlFor="assignMemberBtn">
            <button type="button" onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                <i className="fa-solid fa-user-plus mr-2"></i>
                Assign Member
            </button>
        </FormField>
        
        {formData.collaboratorDetails.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-default)'}}>Assigned Collaborators:</h4>
            <ul className="divide-y" style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)', borderColor: 'var(--color-border-subtle)', borderRadius: '0.375rem' }}>
              {formData.collaboratorDetails.map(c => {
                  const member = getMember(c.memberId);
                  return (
                    <li key={c.memberId} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold" style={{ color: 'var(--color-text-heading)'}}>{member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'}</span>
                            <span className="text-sm ml-2" style={{ color: 'var(--color-text-muted)'}}>- {c.role}</span>
                          </div>
                          <button onClick={() => handleRemoveCollaborator(c.memberId)} className="text-sm font-medium transition-colors" style={{ color: 'var(--color-status-error-text)'}}>Remove</button>
                        </div>
                        {member && (
                            <div className="mt-3 pl-3 space-y-3" style={{ borderLeft: '2px solid var(--color-border-subtle)'}}>
                                {member.shortBio && (
                                <div>
                                    <h4 className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)'}}>Short Bio</h4>
                                    <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--color-text-default)'}}>{member.shortBio}</p>
                                </div>
                                )}
                                {member.artistBio && (
                                <div>
                                    <h4 className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)'}}>Full Artist Bio</h4>
                                    <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--color-text-default)'}}>{member.artistBio}</p>
                                </div>
                                )}
                                {!member.shortBio && !member.artistBio && (
                                <p className="text-sm italic" style={{ color: 'var(--color-text-muted)'}}>No bio available for this member.</p>
                                )}
                            </div>
                        )}
                    </li>
                  )
              })}
            </ul>
          </div>
        )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
              <div className="p-6 rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: 'var(--color-surface-card)'}}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-heading)'}}>Assign Member to Project</h3>
                  <div className="space-y-4">
                      <Select
                          value={selectedMemberId}
                          onChange={e => setSelectedMemberId(e.target.value)}
                          options={[
                              { value: '', label: 'Select a member...' },
                              ...availableMembers.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))
                          ]}
                       />
                      <Input 
                        placeholder="Role in this Project" 
                        value={role} 
                        onChange={e => setRole(e.target.value)}
                      />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                      <button type="button" onClick={handleAddCollaborator} className="btn btn-primary">Assign to Project</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CollaboratorsTab;