

import React from 'react';

interface EditRecurrenceChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChoose: (choice: 'one' | 'all') => void;
}

const EditRecurrenceChoiceModal: React.FC<EditRecurrenceChoiceModalProps> = ({ isOpen, onClose, onChoose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex justify-center items-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-bold text-slate-800" id="modal-title">
          Edit Recurring Event
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          This event is part of a series. How would you like to edit it?
        </p>
        
        <div className="mt-6 space-y-3">
             <button
                type="button"
                onClick={() => onChoose('one')}
                className="w-full text-left p-4 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-teal-500"
            >
                <p className="font-semibold text-slate-800">Edit Only This Occurrence</p>
                <p className="text-xs text-slate-500">Changes will only apply to this single event and it will be protected from future series-wide edits.</p>
            </button>
             <button
                type="button"
                onClick={() => onChoose('all')}
                className="w-full text-left p-4 bg-white border border-slate-300 rounded-md hover:bg-slate-100 hover:border-teal-500"
            >
                <p className="font-semibold text-slate-800">Edit The Entire Series</p>
                <p className="text-xs text-slate-500">Changes will apply to this and all other non-completed events in the series.</p>
            </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRecurrenceChoiceModal;