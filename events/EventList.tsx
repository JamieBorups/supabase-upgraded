
import React, { useState, useMemo } from 'react';
import { Event } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';

interface EventListProps {
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (id: string) => void;
  onDeleteEvent: (event: Event) => void;
  onViewEvent: (id: string) => void;
}

const EVENT_STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: '', label: 'All Statuses'},
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Postponed', label: 'Postponed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const EventStatusBadge: React.FC<{ status: Event['status']}> = ({ status }) => {
    const colorMap: Record<Event['status'], string> = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Confirmed: 'bg-green-100 text-green-800',
        Completed: 'bg-blue-100 text-blue-800',
        Postponed: 'bg-orange-100 text-orange-800',
        Cancelled: 'bg-red-100 text-red-800',
    }
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorMap[status]}`}>{status}</span>
}

const EventList: React.FC<EventListProps> = ({ events, onAddEvent, onEditEvent, onDeleteEvent, onViewEvent }) => {
    const { state: { projects, venues } } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [venueFilter, setVenueFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.projectTitle])), [projects]);
    const venueMap = useMemo(() => new Map(venues.map(v => [v.id, v.name])), [venues]);
    
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        events.forEach(event => {
            if (event.tags) {
                event.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events
            .filter(event => {
                if (event.isTemplate) return false;

                const searchLower = searchTerm.toLowerCase();
                const titleMatch = event.title.toLowerCase().includes(searchLower);
                const projectMatchFilter = !projectFilter || event.projectId === projectFilter;
                const venueMatchFilter = !venueFilter || event.venueId === venueFilter;
                const statusMatchFilter = !statusFilter || event.status === statusFilter;
                const tagMatch = !tagFilter || (event.tags && event.tags.includes(tagFilter));
                
                return projectMatchFilter && venueMatchFilter && statusMatchFilter && titleMatch && tagMatch;
            })
            .sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [events, searchTerm, projectFilter, venueFilter, statusFilter, tagFilter]);

    const renderEvent = (event: Event) => {
        const startDate = new Date(event.startDate + 'T00:00:00');
        
        return (
             <div key={event.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50">
                <div className="flex items-start gap-4">
                     <div className="flex-shrink-0 text-center bg-slate-100 p-3 rounded-lg w-20">
                        <div className="text-sm font-bold text-red-600 uppercase">{startDate.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-2xl font-extrabold text-slate-800">{startDate.toLocaleDateString('en-US', { day: '2-digit' })}</div>
                        <div className="text-xs text-slate-500">{startDate.toLocaleDateString('en-US', { year: 'numeric' })}</div>
                    </div>
                    <div>
                        <p className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                            {event.parentEventId && <i className="fa-solid fa-sync-alt fa-sm text-slate-400" title="Recurring Event Instance"></i>}
                            {event.title}
                        </p>
                        <p className="text-sm text-slate-600">{projectMap.get(event.projectId) || 'No Project'}</p>
                        <p className="text-sm text-slate-500 mt-1">
                            <i className="fa-solid fa-location-dot fa-fw mr-2 text-slate-400"></i>{venueMap.get(event.venueId) || 'Venue TBD'}
                            <span className="mx-2">|</span>
                            {!event.isAllDay && <><i className="fa-solid fa-clock fa-fw mr-2 text-slate-400"></i>{event.startTime} - {event.endTime}</>}
                            {event.isAllDay && 'All Day'}
                            {event.status === 'Completed' && event.actualAttendance && event.actualAttendance > 0 && (
                                <>
                                    <span className="mx-2">|</span>
                                    <i className="fa-solid fa-users fa-fw mr-2 text-slate-400"></i>
                                    {event.actualAttendance} attended
                                </>
                            )}
                        </p>
                        {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {event.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                    <EventStatusBadge status={event.status} />
                    <div className="flex items-center gap-2">
                        <button onClick={() => onViewEvent(event.id)} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-100">View</button>
                        <button onClick={() => onEditEvent(event.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Edit</button>
                        <button onClick={() => onDeleteEvent(event)} className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md shadow-sm hover:bg-red-200">Delete</button>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 flex-grow">
                <Input placeholder="Search by event title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} options={[{value: '', label: 'All Projects'}, ...projects.map(p => ({value: p.id, label: p.projectTitle}))]} />
                <Select value={venueFilter} onChange={e => setVenueFilter(e.target.value)} options={[{value: '', label: 'All Venues'}, ...venues.map(v => ({value: v.id, label: v.name}))]} />
                <Select value={tagFilter} onChange={e => setTagFilter(e.target.value)} options={[{value: '', label: 'All Tags'}, ...allTags.map(tag => ({value: tag, label: tag}))]} />
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={EVENT_STATUS_OPTIONS} />
            </div>
            <button onClick={onAddEvent} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <i className="fa-solid fa-plus mr-2"></i>Add New Event
            </button>
        </div>

        {filteredEvents.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
                <i className="fa-solid fa-calendar-xmark text-6xl text-slate-300"></i>
                <h3 className="mt-4 text-lg font-medium">No events found.</h3>
                <p className="mt-1">Click "Add New Event" to create one.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                {filteredEvents.map(event => renderEvent(event))}
            </div>
        )}
    </div>
  );
};
export default EventList;
