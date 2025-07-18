
import React, { useState, useMemo } from 'react';
import { Contact } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ContactListProps {
    onAddContact: () => void;
    onEditContact: (id: string) => void;
    onDeleteContact: (id: string) => void;
}

const ITEMS_PER_PAGE = 25;

const ContactList: React.FC<ContactListProps> = ({ onAddContact, onEditContact, onDeleteContact }) => {
    const { state } = useAppContext();
    const { contacts, settings } = state;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        contacts.forEach(contact => {
            contact.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort((a,b) => a.localeCompare(b));
    }, [contacts]);

    const contactTypeOptions = useMemo(() => [
        { value: '', label: 'All Types' },
        ...settings.media.contactTypes.map(t => ({ value: t.label, label: t.label }))
    ], [settings.media.contactTypes]);


    const filteredContacts = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return contacts.filter(contact => {
            const tagMatch = !selectedTag || contact.tags.includes(selectedTag);
            const typeMatch = !selectedType || contact.contactType === selectedType;
            const searchMatch = !searchTerm ||
                contact.firstName.toLowerCase().includes(lowerSearchTerm) ||
                contact.lastName.toLowerCase().includes(lowerSearchTerm) ||
                contact.organization.toLowerCase().includes(lowerSearchTerm) ||
                contact.email.toLowerCase().includes(lowerSearchTerm);
            return tagMatch && searchMatch && typeMatch;
        });
    }, [contacts, searchTerm, selectedTag, selectedType]);
    
    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredContacts, currentPage]);
    
    const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-200 pb-4 gap-4">
                <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
                <button onClick={onAddContact} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    <i className="fa fa-plus mr-2"></i>Add New Contact
                </button>
            </div>
            
            <p className="text-base mb-8 -mt-2" style={{ color: 'var(--color-text-muted)' }}>
                This section is your Customer Relationship Manager (CRM), a central database for all your external contacts. Use it to keep track of funders, media personnel, community partners, and other key stakeholders by logging interactions and associating them with specific projects.
            </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                    placeholder="Search by name, organization, email..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="md:col-span-1"
                />
                 <Select
                    value={selectedType}
                    onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
                    options={contactTypeOptions}
                />
                <Select
                    value={selectedTag}
                    onChange={e => { setSelectedTag(e.target.value); setCurrentPage(1); }}
                    options={[
                        { value: '', label: 'All Tags' },
                        ...allTags.map(tag => ({ value: tag, label: tag }))
                    ]}
                />
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Contact Info</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type & Tags</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {paginatedContacts.map(contact => (
                            <tr key={contact.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-slate-800">{contact.firstName} {contact.lastName}</div>
                                    <div className="text-sm text-slate-500">{contact.organization}</div>
                                    <div className="text-xs text-slate-400">{contact.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    <div><a href={`mailto:${contact.email}`} className="hover:text-teal-600">{contact.email}</a></div>
                                    <div>{contact.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1 items-center">
                                        {contact.contactType && (
                                            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-800 rounded-full">{contact.contactType}</span>
                                        )}
                                        {contact.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => onEditContact(contact.id)} className="text-teal-600 hover:text-teal-900 font-semibold">Edit</button>
                                    <button onClick={() => onDeleteContact(contact.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredContacts.length === 0 && (
                    <div className="text-center py-20">
                        <i className="fa-solid fa-address-book text-7xl text-slate-300"></i>
                        <h3 className="mt-6 text-xl font-medium text-slate-800">No Contacts Found</h3>
                        <p className="text-slate-500 mt-2 text-base">{contacts.length > 0 ? 'Try adjusting your search or filter.' : 'Add your first contact to get started!'}</p>
                    </div>
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-slate-600">Showing {paginatedContacts.length} of {filteredContacts.length} contacts</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">Prev</button>
                        <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactList;
