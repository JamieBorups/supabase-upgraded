import React from 'react';
import { FormData } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface CollaboratorsViewProps {
    project: FormData;
}

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)'}}>{label}</h3>
        {value && <div className="mt-1" style={{ color: 'var(--color-text-default)'}}>{value}</div>}
        {children && <div className="mt-1" style={{ color: 'var(--color-text-default)'}}>{children}</div>}
    </div>
);


const CollaboratorsView: React.FC<CollaboratorsViewProps> = ({ project }) => {
    const { state: { members } } = useAppContext();
    
    return (
        <section>
            <h2 className="text-2xl font-bold border-b-2 pb-2 mb-6" style={{ color: 'var(--color-text-heading)', borderColor: 'var(--color-primary)'}}>Collaborators</h2>

            <ViewField label="Project Team Description">
                <p className="whitespace-pre-wrap">{project.whoWillWork || 'N/A'}</p>
            </ViewField>

            <ViewField label="Selection Process">
                <p className="whitespace-pre-wrap">{project.howSelectionDetermined || 'N/A'}</p>
            </ViewField>

            {project.collaboratorDetails.length > 0 && (
                <ViewField label="Assigned Collaborators & Biographies">
                    <ul className="divide-y rounded-md border mt-2" style={{ borderColor: 'var(--color-border-subtle)'}}>
                        {project.collaboratorDetails.map(c => {
                             const member = members.find(m => m.id === c.memberId);
                             if (!member) return (
                                <li key={c.memberId} className="px-4 py-4">
                                    <span className="font-semibold">Unknown Member</span> - <span style={{ color: 'var(--color-text-muted)'}}>{c.role}</span>
                                </li>
                             );

                             return (
                                <li key={c.memberId} className="px-4 py-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-lg" style={{ color: 'var(--color-text-heading)'}}>{member.firstName} {member.lastName}</span>
                                        <span className="text-sm" style={{ color: 'var(--color-text-muted)'}}>{c.role}</span>
                                    </div>
                                    {member.shortBio && (
                                        <div className="mt-3">
                                            <h4 className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)'}}>Short Bio</h4>
                                            <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--color-text-default)'}}>{member.shortBio}</p>
                                        </div>
                                    )}
                                    {member.artistBio && (
                                        <div className="mt-3">
                                            <h4 className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)'}}>Full Artist Bio</h4>
                                            <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--color-text-default)'}}>{member.artistBio}</p>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </ViewField>
            )}

        </section>
    );
};

export default CollaboratorsView;