
import React, { useState } from 'react';
import { produce } from 'immer';
import { useAppContext } from '../../context/AppContext';
import { AppSettings, CustomStatus } from '../../types';
import ListEditor from '../ui/ListEditor';
import * as api from '../../services/api';

const EventSettings: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [statuses, setStatuses] = useState<CustomStatus[]>(state.settings.events.venueTypes);
    const [isDirty, setIsDirty] = useState(false);

    const handleStatusesChange = (newStatuses: CustomStatus[]) => {
        setStatuses(newStatuses);
        setIsDirty(true);
    };

    const handleSave = async () => {
        const newSettings = produce(state.settings, draft => {
            draft.events.venueTypes = statuses;
        });
        try {
            await api.updateSettings(newSettings);
            dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
            setIsDirty(false);
            notify('Venue settings saved!', 'success');
        } catch (error: any) {
            notify(`Error saving settings: ${error.message}`, 'error');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Events & Venues Settings</h2>
            <p className="mt-1 text-sm text-slate-500">Customize reusable options for your venues.</p>
            <div className="mt-8 p-4 border border-slate-200 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-800">Custom Venue Statuses</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Define the statuses for your venues (e.g., Potential, Confirmed, Scouting).</p>
                <ListEditor 
                    items={statuses}
                    onChange={handleStatusesChange}
                    itemLabel="Status"
                    withColor={true}
                />
            </div>
            <div className="mt-8 pt-5 border-t border-slate-200">
                <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    Save Venue Settings
                </button>
            </div>
        </div>
    );
};

export default EventSettings;
