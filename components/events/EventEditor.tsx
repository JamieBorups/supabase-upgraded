
import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { RRule, Frequency } from 'rrule';
import { Event, EventTicket, TicketType, RecurrenceRule, Venue, EventMemberAssignment } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import ToggleSwitch from '../ui/ToggleSwitch';
import { useAppContext } from '../../context/AppContext';
import RecurrenceModal from './RecurrenceModal';
import { RadioGroup } from '../ui/RadioGroup';
import TagInput from '../ui/TagInput';

interface EventEditorProps {
  event: Event;
  onSave: (event: Event, tickets: EventTicket[], recurrenceRule: RecurrenceRule | null) => void;
  onCancel: () => void;
}

const EVENT_STATUS_OPTIONS: { value: Event['status'], label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Postponed', label: 'Postponed' },
    { value: 'Cancelled', label: 'Cancelled' },
];

const COST_TYPE_OPTIONS = [
    { value: 'free', label: 'Free' },
    { value: 'rented', label: 'Rented (Cash Expense)' },
    { value: 'in_kind', label: 'In-Kind Contribution' },
];

const COST_PERIOD_OPTIONS = [
    { value: 'flat_rate', label: 'Flat Rate' },
    { value: 'per_day', label: 'Per Day' },
    { value: 'per_hour', label: 'Per Hour' },
];

const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

const EventEditor: React.FC<EventEditorProps> = ({ event, onSave, onCancel }) => {
    const { state, notify } = useAppContext();
    const { projects, venues, ticketTypes, eventTickets, members } = state;
    const [formData, setFormData] = useState<Event>(event);
    
    const [stagedTickets, setStagedTickets] = useState<EventTicket[]>(() => 
        eventTickets.filter(et => et.eventId === event.id)
    );
    const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('');
    const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
    const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(event.recurrenceRule);
    const [isCostOverridden, setIsCostOverridden] = useState(!!event.venueCostOverride);

    // State for assigning members
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [memberRole, setMemberRole] = useState('');


    const selectedVenue = useMemo(() => venues.find(v => v.id === formData.venueId), [formData.venueId, venues]);
    const assignedMemberIds = new Set((formData.assignedMembers || []).map(m => m.memberId));
    const availableMembers = members.filter(m => !assignedMemberIds.has(m.id));

    const handleChange = <K extends keyof Event>(field: K, value: Event[K]) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleStartDateChange = (date: string) => {
        const isNew = event.id.startsWith('new_');
        // Only autofill for new, single (non-recurring) events
        if (isNew && !recurrenceRule) {
             if (!formData.endDate || new Date(formData.endDate) < new Date(date)) {
                setFormData(prev => ({
                    ...prev,
                    startDate: date,
                    endDate: date
                }));
            } else {
                 setFormData(prev => ({ ...prev, startDate: date }));
            }
        } else {
            handleChange('startDate', date);
        }
    };

    const handleVenueChange = (venueId: string | null) => {
        handleChange('venueId', venueId);
        // If cost was overridden, reset it when venue changes, as the default is now different
        if(isCostOverridden) {
            setIsCostOverridden(false);
            handleChange('venueCostOverride', null);
        }
    };
    
    const handleCostOverrideChange = <K extends keyof NonNullable<Event['venueCostOverride']>>(field: K, value: NonNullable<Event['venueCostOverride']>[K]) => {
        const base = formData.venueCostOverride || {
            costType: 'free',
            cost: 0,
            period: 'flat_rate',
            notes: '',
        };
        const newOverride = { ...base };
        newOverride[field] = value;
        handleChange('venueCostOverride', newOverride);
    }
    
    const handleAddStagedTicket = () => {
        if (!selectedTicketTypeId) return;
        
        const ticketType = ticketTypes.find(tt => tt.id === selectedTicketTypeId);
        if (!ticketType) return;
        
        if (stagedTickets.some(st => st.ticketTypeId === selectedTicketTypeId)) {
            notify('This ticket type is already assigned to the event.', 'warning');
            return;
        }

        const venueCapacity = selectedVenue?.capacity ?? 0;

        const newEventTicket: EventTicket = {
            id: `et_${Date.now()}_${Math.random()}`,
            eventId: formData.id,
            ticketTypeId: selectedTicketTypeId,
            price: ticketType.defaultPrice,
            capacity: venueCapacity,
            soldCount: 0,
        };
        
        setStagedTickets(prev => [...prev, newEventTicket]);
        setSelectedTicketTypeId('');
    };

    const handleUpdateStagedTicket = (index: number, field: 'capacity', value: number) => {
        setStagedTickets(produce(draft => {
            draft[index][field] = value;
        }));
    };

    const handleRemoveStagedTicket = (index: number) => {
        setStagedTickets(produce(draft => {
            draft.splice(index, 1);
        }));
    };
    
    const handleAddMember = () => {
        if (selectedMemberId) {
            const newAssignment: EventMemberAssignment = {
                memberId: selectedMemberId,
                role: memberRole.trim(),
            };
            handleChange('assignedMembers', [...(formData.assignedMembers || []), newAssignment]);
            setSelectedMemberId('');
            setMemberRole('');
            setIsMemberModalOpen(false);
        }
    };
    
    const handleRemoveMember = (memberId: string) => {
        handleChange('assignedMembers', (formData.assignedMembers || []).filter(m => m.memberId !== memberId));
    };

    const ticketTypeMap = useMemo(() => new Map(ticketTypes.map(tt => [tt.id, tt])), [ticketTypes]);
    const availableTicketTypes = useMemo(() => {
        const assignedTypeIds = new Set(stagedTickets.map(st => st.ticketTypeId));
        return ticketTypes.filter(tt => !assignedTypeIds.has(tt.id));
    }, [ticketTypes, stagedTickets]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, stagedTickets, recurrenceRule);
    };

    const handleSaveRecurrence = (rule: RecurrenceRule) => {
        setRecurrenceRule(rule);
        setIsRecurrenceModalOpen(false);
    }
    
    const handleClearRecurrence = () => {
        setRecurrenceRule(null);
        notify('Recurrence cleared. Save the event to apply changes.', 'info');
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() !== 'textarea') {
                e.preventDefault();
            }
        }
    };

    return (
        <form onSubmit={handleSave} onKeyDown={handleKeyDown} className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            {isRecurrenceModalOpen && (
                <RecurrenceModal
                    isOpen={isRecurrenceModalOpen}
                    onClose={() => setIsRecurrenceModalOpen(false)}
                    onSave={handleSaveRecurrence}
                    startDate={formData.startDate}
                    existingRule={recurrenceRule}
                />
            )}
            {isMemberModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Assign Member to Event</h3>
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
                                placeholder="Role (e.g., Performer, Volunteer) - optional" 
                                value={memberRole} 
                                onChange={e => setMemberRole(e.target.value)}
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200">Cancel</button>
                            <button type="button" onClick={handleAddMember} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700">Assign to Event</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-900">{formData.id.startsWith('event_') ? "Edit Event" : "Add New Event"}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <FormField label="Event Title" htmlFor="eventName" required>
                        <Input id="eventName" value={formData.title} onChange={e => handleChange('title', e.target.value)} />
                    </FormField>
                    <FormField label="Project" htmlFor="project">
                        <Select id="project" value={formData.projectId || ''} onChange={e => handleChange('projectId', e.target.value || null)} options={[{value: '', label: 'Select Project... (Optional)'}, ...projects.map(p => ({value: p.id, label: p.projectTitle}))]} />
                    </FormField>
                    <FormField label="Venue" htmlFor="venue">
                        <Select id="venue" value={formData.venueId || ''} onChange={e => handleVenueChange(e.target.value || null)} options={[{value: '', label: 'Select Venue... (Optional)'}, ...venues.map(v => ({value: v.id, label: v.name}))]} />
                    </FormField>
                    <FormField label="Public Description" htmlFor="eventDescription" instructions="This will be displayed on public-facing materials.">
                        <TextareaWithCounter id="eventDescription" rows={5} value={formData.description} onChange={e => handleChange('description', e.target.value)} wordLimit={250} />
                    </FormField>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <FormField label="Status" htmlFor="status" required>
                            <Select id="status" value={formData.status} onChange={e => handleChange('status', e.target.value as Event['status'])} options={EVENT_STATUS_OPTIONS} />
                        </FormField>
                         <FormField label="Category" htmlFor="category" instructions="e.g., Performance, Workshop">
                            <Input id="category" value={formData.category} onChange={e => handleChange('category', e.target.value)} />
                        </FormField>
                    </div>

                    <FormField label="Tags" htmlFor="tags" instructions="Add descriptive tags to help categorize and filter this event.">
                        <TagInput tags={formData.tags || []} onChange={tags => handleChange('tags', tags)} />
                    </FormField>

                    {formData.status === 'Completed' && (
                        <FormField label="Actual Attendance" htmlFor="actualAttendance" instructions="Enter the total number of people who attended the event.">
                            <Input type="number" id="actualAttendance" value={formData.actualAttendance || ''} onChange={e => handleChange('actualAttendance', parseInt(e.target.value, 10) || 0)} />
                        </FormField>
                    )}
                     <FormField label="Internal Notes" htmlFor="notes">
                        <TextareaWithCounter id="notes" rows={3} value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} wordLimit={200} />
                    </FormField>
                </div>
                
                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700">Date & Time</h3>
                     <ToggleSwitch id="isAllDay" checked={formData.isAllDay} onChange={checked => handleChange('isAllDay', checked)} label="This is an all-day event"/>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField label="Start Date" htmlFor="startDate"><Input type="date" id="startDate" value={formData.startDate} onChange={e => handleStartDateChange(e.target.value)} /></FormField>
                        <FormField label="End Date" htmlFor="endDate"><Input type="date" id="endDate" value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} /></FormField>
                     </div>
                     {!formData.isAllDay && (
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Start Time" htmlFor="startTime"><Input type="time" id="startTime" value={formData.startTime} onChange={e => handleChange('startTime', e.target.value)} /></FormField>
                            <FormField label="End Time" htmlFor="endTime"><Input type="time" id="endTime" value={formData.endTime} onChange={e => handleChange('endTime', e.target.value)} /></FormField>
                        </div>
                     )}
                </div>
                
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700">Assigned Members</h3>
                    <button type="button" onClick={() => setIsMemberModalOpen(true)} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"><i className="fa-solid fa-plus mr-2"></i>Assign Member</button>
                    {(formData.assignedMembers || []).length > 0 ? (
                        <ul className="divide-y divide-slate-200">
                           {(formData.assignedMembers || []).map(assignment => {
                               const member = members.find(m => m.id === assignment.memberId);
                               return (
                                   <li key={assignment.memberId} className="py-2 flex justify-between items-center">
                                       <div>
                                           <span className="font-semibold text-slate-800">{member ? `${member.firstName} ${member.lastName}`: 'Unknown'}</span>
                                           {assignment.role ? (
                                                <span className="text-sm text-slate-600 ml-2">- {assignment.role}</span>
                                           ) : (
                                                <span className="text-sm text-slate-500 italic ml-2">- No role assigned</span>
                                           )}
                                       </div>
                                       <button type="button" onClick={() => handleRemoveMember(assignment.memberId)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                                   </li>
                               )
                           })}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500 italic text-center">No members assigned to this event.</p>
                    )}
                 </div>
                
                {selectedVenue && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg text-slate-700">Venue Cost</h3>
                         <div className="text-sm bg-slate-200 p-2 rounded-md">
                            Default for this venue: 
                            <span className="font-bold"> {formatCurrency(selectedVenue.defaultCost)} ({selectedVenue.defaultCostType})</span>
                        </div>
                        <ToggleSwitch id="overrideCost" checked={isCostOverridden} onChange={setIsCostOverridden} label="Override default cost for this event" />
                        {isCostOverridden && (
                            <div className="space-y-3 pl-4 border-l-2 border-slate-300">
                                <RadioGroup name="costType" selectedValue={formData.venueCostOverride?.costType || 'free'} onChange={val => handleCostOverrideChange('costType', val as any)} options={COST_TYPE_OPTIONS} />
                                {formData.venueCostOverride?.costType !== 'free' && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <FormField label="Cost" htmlFor="cost"><Input type="number" id="cost" value={formData.venueCostOverride?.cost || ''} onChange={e => handleCostOverrideChange('cost', parseFloat(e.target.value) || 0)} /></FormField>
                                        <FormField label="Period" htmlFor="period"><Select id="period" value={formData.venueCostOverride?.period || 'flat_rate'} onChange={e => handleCostOverrideChange('period', e.target.value as any)} options={COST_PERIOD_OPTIONS} /></FormField>
                                    </div>
                                )}
                                <FormField label="Notes" htmlFor="override_notes"><Input id="override_notes" value={formData.venueCostOverride?.notes || ''} onChange={e => handleCostOverrideChange('notes', e.target.value)} placeholder="e.g., Discounted rate for non-profit" /></FormField>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700">Tickets Available</h3>
                    {stagedTickets.length > 0 &&
                        <div className="space-y-2 border-t pt-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase">
                                <div className="col-span-5">Ticket Type</div>
                                <div className="col-span-3 text-right">Price</div>
                                <div className="col-span-3">Tickets Available</div>
                            </div>
                            {stagedTickets.map((ticket, index) => {
                                const ticketType = ticketTypeMap.get(ticket.ticketTypeId);
                                return (
                                    <div key={ticket.ticketTypeId} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-5 text-sm font-medium text-slate-800">{ticketType?.name}</div>
                                        <div className="col-span-3 text-right text-sm">
                                            <div className="p-2 bg-white border border-slate-300 rounded-md text-slate-800 text-right h-10 flex items-center justify-end">
                                               {ticketType?.isFree ? 'Free' : formatCurrency(ticket.price)}
                                            </div>
                                        </div>
                                        <div className="col-span-3">
                                            <Input 
                                                type="number" 
                                                value={ticket.capacity || ''} 
                                                onChange={e => handleUpdateStagedTicket(index, 'capacity', parseInt(e.target.value, 10) || 0)} 
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button type="button" onClick={() => handleRemoveStagedTicket(index)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"><i className="fa-solid fa-trash-alt fa-fw"></i></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    }
                    <div className="flex items-center gap-2 pt-3 border-t">
                        <Select value={selectedTicketTypeId} onChange={e => setSelectedTicketTypeId(e.target.value)} options={[{value: '', label: 'Select a ticket type...'}, ...availableTicketTypes.map(tt => ({value: tt.id, label: tt.name}))]} className="flex-grow"/>
                        <button type="button" onClick={handleAddStagedTicket} disabled={!selectedTicketTypeId} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400"><i className="fa-solid fa-plus"></i> Assign</button>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700">Recurrence</h3>
                    <p className="text-xs text-slate-500">Set up a recurring schedule for this event. The event details above will be used as a template for all occurrences.</p>
                    {recurrenceRule ? (
                         <div className="p-3 bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
                            <p className="font-semibold text-sm">This event repeats.</p>
                            <button type="button" onClick={handleClearRecurrence} className="text-xs font-semibold text-red-600 hover:underline">Clear Recurrence</button>
                         </div>
                    ): (
                        <p className="text-sm italic text-slate-500">This is a one-time event.</p>
                    )}
                    <button type="button" onClick={() => setIsRecurrenceModalOpen(true)} className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md shadow-sm hover:bg-slate-700">
                       {recurrenceRule ? 'Edit' : 'Set Up'} Recurrence Schedule
                    </button>
                </div>
            </div>
            </div>

            <div className="flex items-center justify-end pt-8 mt-8 border-t border-slate-200 space-x-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700">Save Event</button>
            </div>
        </form>
    );
};

export default EventEditor;
