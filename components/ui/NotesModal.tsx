

import React, { useState } from 'react';
import FormField from './FormField';
import { TextareaWithCounter } from './TextareaWithCounter';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notes: string) => void;
    title: string;
}

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, onSave, title }) => {
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        onSave(notes);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-bold text-slate-800" id="modal-title">{title}</h3>
                <div className="mt-4">
                    <FormField label="Add Optional Notes" htmlFor="snapshot_notes" instructions="Add context to this snapshot (e.g., 'Version submitted to Canada Council').">
                        <TextareaWithCounter
                            id="snapshot_notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            wordLimit={150}
                            rows={4}
                        />
                    </FormField>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700"
                    >
                        Save Snapshot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotesModal;
