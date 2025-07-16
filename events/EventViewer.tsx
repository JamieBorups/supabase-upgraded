
import React, { useMemo } from 'react';
import { Event } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface EventViewerProps {
    event: Event;
    onBack: () => void;
}

const ViewField: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className = '' }) => (
    <div className={className}>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className="mt-1 text-slate-800">{value}</div>
    </div>
);

const EventViewer: React.FC<EventViewerProps> = ({ event, onBack }) => {
    const { state } = useAppContext();
    const { projects, venues, ticketTypes, eventTickets } = state;

    const project = useMemo(() => projects.find(p => p.id === event.projectId), [projects, event.projectId]);
    const venue = useMemo(() => venues.find(v => v.id === event.venueId), [venues, event.venueId]);
    const tickets = useMemo(() => eventTickets.filter(t => t.eventId === event.id), [eventTickets, event.id]);

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
                    <p className="text-sm text-slate-500">Project: <span className="font-semibold text-teal-600">{project?.projectTitle || 'N/A'}</span></p>
                </div>
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Back to List
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <ViewField label="Description" value={<p className="whitespace-pre-wrap">{event.description}</p>} />
                    {event.notes && <ViewField label="Internal Notes" value={<p className="whitespace-pre-wrap">{event.notes}</p>} />}
                </div>
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                        <ViewField label="Status" value={event.status} />
                        <ViewField label="Venue" value={venue?.name || 'Venue TBD'} />
                        <ViewField label="Date(s)" value={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`} />
                        <ViewField label="Time" value={event.isAllDay ? 'All Day' : `${event.startTime} - ${event.endTime}`} />
                        {event.actualAttendance > 0 && <ViewField label="Actual Attendance" value={event.actualAttendance} />}
                    </div>
                     {tickets.length > 0 && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Tickets</h3>
                            <ul className="divide-y divide-slate-200">
                                {tickets.map(ticket => {
                                    const ticketType = ticketTypes.find(tt => tt.id === ticket.ticketTypeId);
                                    return (
                                        <li key={ticket.id} className="py-2 flex justify-between">
                                            <span>{ticketType?.name}</span>
                                            <span className="font-semibold">{ticket.capacity} available</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventViewer;
