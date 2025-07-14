

import React, { useState, useEffect, useMemo } from 'react';
import { RRule, Weekday, Frequency } from 'rrule';
import { RecurrenceRule, RRuleEndCondition } from '../../types';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';

interface RecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: RecurrenceRule) => void;
    startDate: string;
    existingRule: RecurrenceRule | null;
}

const WEEKDAYS = [
    { name: 'Sunday', short: 'SU', jsDay: 0 },
    { name: 'Monday', short: 'MO', jsDay: 1 },
    { name: 'Tuesday', short: 'TU', jsDay: 2 },
    { name: 'Wednesday', short: 'WE', jsDay: 3 },
    { name: 'Thursday', short: 'TH', jsDay: 4 },
    { name: 'Friday', short: 'FR', jsDay: 5 },
    { name: 'Saturday', short: 'SA', jsDay: 6 },
];

const RecurrenceModal: React.FC<RecurrenceModalProps> = ({ isOpen, onClose, onSave, startDate, existingRule }) => {
    const [frequency, setFrequency] = useState<RecurrenceRule['frequency']>(existingRule?.frequency || 'weekly');
    const [interval, setInterval] = useState<number>(existingRule?.interval || 1);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(existingRule?.daysOfWeek || (startDate ? [new Date(startDate + 'T12:00:00Z').getDay()] : []));
    const [endCondition, setEndCondition] = useState<RRuleEndCondition>(existingRule?.endCondition || { type: 'count', value: 10 });
    
    useEffect(() => {
        if(existingRule) {
            setFrequency(existingRule.frequency);
            setInterval(existingRule.interval);
            setDaysOfWeek(existingRule.daysOfWeek || []);
            setEndCondition(existingRule.endCondition);
        } else if (startDate) {
            setDaysOfWeek([new Date(startDate + 'T12:00:00Z').getDay()]);
        }
    }, [existingRule, startDate]);
    
    const { text: summaryText, endDate: calculatedEndDate } = useMemo(() => {
        if (!startDate) return { text: "Please set a start date for the event first.", endDate: '' };
        try {
            const jsToRruleDayMap: { [key: number]: Weekday } = {
                0: RRule.SU, 1: RRule.MO, 2: RRule.TU, 3: RRule.WE, 4: RRule.TH, 5: RRule.FR, 6: RRule.SA,
            };

            const getRRuleFrequency = (freq: 'daily' | 'weekly' | 'monthly'): Frequency => {
                switch(freq) {
                    case 'daily': return Frequency.DAILY;
                    case 'weekly': return Frequency.WEEKLY;
                    case 'monthly': return Frequency.MONTHLY;
                }
            };
            
            const rruleWeekdays = (frequency === 'weekly' && daysOfWeek.length > 0) ? daysOfWeek.map(d => jsToRruleDayMap[d]) : undefined;
            
            const rrule = new RRule({
                freq: getRRuleFrequency(frequency),
                interval: interval, byweekday: rruleWeekdays,
                dtstart: new Date(startDate + 'T12:00:00Z'),
                until: endCondition.type === 'date' ? new Date(endCondition.value as string + 'T23:59:59Z') : null,
                count: endCondition.type === 'count' ? (endCondition.value as number) : null,
            });

            const allDates = rrule.all();
            const lastDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;

            return {
                text: `This will create ${allDates.length} events, ending on ${lastDate ? lastDate.toLocaleDateString() : 'N/A'}.`,
                endDate: lastDate ? lastDate.toISOString().split('T')[0] : ''
            };
        } catch(e: any) {
            return { text: `Error: ${e.message}`, endDate: '' };
        }
    }, [frequency, interval, daysOfWeek, startDate, endCondition]);
    
    useEffect(() => {
        // When the calculated end date changes, if the user has "On a specific date" selected, update its value.
        if (endCondition.type === 'date' && calculatedEndDate) {
            setEndCondition({ type: 'date', value: calculatedEndDate });
        }
    }, [calculatedEndDate, endCondition.type]);

    const handleEndConditionTypeChange = (type: string) => {
        if (type === 'count') {
            setEndCondition({ type: 'count', value: 10 });
        } else if (type === 'date') {
            setEndCondition({ type: 'date', value: calculatedEndDate || startDate });
        }
    };
    
    const handleSave = () => {
        const rule: RecurrenceRule = {
            frequency,
            interval,
            daysOfWeek,
            endCondition
        };
        onSave(rule);
    };

    const toggleDay = (day: number) => {
        setDaysOfWeek(prev => {
            const index = prev.indexOf(day);
            if(index > -1) {
                return prev.length > 1 ? prev.filter(d => d !== day) : prev;
            } else {
                return [...prev, day];
            }
        });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[70] flex justify-center items-center p-4">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                 <h2 className="text-2xl font-bold text-slate-800 mb-6">Set Recurrence</h2>
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField label="Repeats" htmlFor="repeats">
                            <Select id="repeats" value={frequency} onChange={e => setFrequency(e.target.value as any)} options={[{value: 'daily', label: 'Daily'}, {value: 'weekly', label: 'Weekly'}, {value: 'monthly', label: 'Monthly'}]} />
                        </FormField>
                         <FormField label={`Repeat every ${interval > 1 ? `${interval} ${frequency}` : frequency}`} htmlFor="interval">
                            <Input type="number" id="interval" value={interval} onChange={e => setInterval(parseInt(e.target.value, 10) || 1)} min="1"/>
                        </FormField>
                    </div>
                     
                    {frequency === 'weekly' && (
                        <FormField label="Repeat on" htmlFor="repeatOn">
                            <div className="flex gap-2">
                                {WEEKDAYS.map(day => (
                                    <button key={day.short} type="button" onClick={() => toggleDay(day.jsDay)} className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${daysOfWeek.includes(day.jsDay) ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                        {day.short.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </FormField>
                    )}
                     
                    <FormField label="Ends" htmlFor="ends">
                        <div className="p-4 border border-slate-300 rounded-md bg-slate-50 space-y-4">
                            <RadioGroup name="endConditionType" selectedValue={endCondition.type} onChange={handleEndConditionTypeChange} options={[ {value: 'count', label: 'After a number of occurrences'}, {value: 'date', label: 'On a specific date'} ]} />
                            {endCondition.type === 'count' && (
                                <div className="ml-8">
                                    <Input type="number" value={endCondition.value} onChange={e => setEndCondition({type: 'count', value: parseInt(e.target.value, 10) || 1})} min="1"/>
                                </div>
                            )}
                            {endCondition.type === 'date' && (
                                 <div className="ml-8">
                                    <Input type="date" value={endCondition.value} onChange={e => setEndCondition({type: 'date', value: e.target.value})}/>
                                </div>
                            )}
                        </div>
                    </FormField>
                    
                    <div className="p-3 bg-slate-100 rounded-md text-sm text-slate-700 text-center font-semibold">
                        {summaryText}
                    </div>
                 </div>

                 <div className="flex items-center justify-end pt-6 mt-6 border-t border-slate-200 space-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700">Set Recurrence</button>
                </div>
            </div>
        </div>
    );
};
export default RecurrenceModal;
