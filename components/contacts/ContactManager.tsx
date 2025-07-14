
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Contact } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';
import ContactList from './ContactList';
import ContactEditor from './ContactEditor';
import * as api from '../../services/api';

const initialContactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    organization: '',
    contactType: '',
    associatedProjectIds: [],
    address: { street: '', city: '', province: 'MB', postalCode: '' },
    tags: [],
    notes: '',
};

type ViewMode = 'list' | 'edit';

const ContactManager: React.FC = () => {
    const { state, dispatch, notify } = useAppContext();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [currentContact, setCurrentContact] = useState<Contact | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [contactToSave, setContactToSave] = useState<Contact | null>(null);

    const handleAddContact = () => {
        const now = new Date().toISOString();
        const newContact: Contact = {
            ...initialContactData,
            id: `new_contact_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        setCurrentContact(newContact);
        setViewMode('edit');
    };
    
    const handleEditContact = (id: string) => {
        const contactToEdit = state.contacts.find(c => c.id === id);
        if (contactToEdit) {
            setCurrentContact(contactToEdit);
            setViewMode('edit');
        }
    };
    
    const handleDeleteContact = (id: string) => {
        setContactToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteContact = async () => {
        if (!contactToDelete) return;
        try {
            await api.deleteContact(contactToDelete);
            dispatch({ type: 'DELETE_CONTACT', payload: contactToDelete });
            notify('Contact deleted successfully.', 'success');
        } catch (error: any) {
            notify(`Error deleting contact: ${error.message}`, 'error');
        }
        setIsDeleteModalOpen(false);
        setContactToDelete(null);
    };

    const handleSaveContact = (contact: Contact) => {
        const isNew = contact.id.startsWith('new_');

        if (isNew && contact.email) {
            const emailExists = state.contacts.some(c => c.email.toLowerCase() === contact.email.toLowerCase());
            if (emailExists) {
                setContactToSave(contact);
                setIsDuplicateModalOpen(true);
                return;
            }
        }
        
        saveContact(contact, isNew);
    };

    const confirmSaveDuplicate = () => {
        if(contactToSave) {
            saveContact(contactToSave, true);
        }
        setIsDuplicateModalOpen(false);
        setContactToSave(null);
    };

    const saveContact = async (contact: Contact, isNew: boolean) => {
        try {
            if (isNew) {
                const newContact = await api.addContact(contact);
                dispatch({ type: 'ADD_CONTACT', payload: newContact });
            } else {
                const updatedContact = await api.updateContact(contact.id, contact);
                dispatch({ type: 'UPDATE_CONTACT', payload: updatedContact });
            }
            notify(isNew ? 'Contact created!' : 'Contact updated!', 'success');
            setViewMode('list');
            setCurrentContact(null);
        } catch (error: any) {
            notify(`Error saving contact: ${error.message}`, 'error');
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setCurrentContact(null);
    };
    
    const renderContent = () => {
        switch(viewMode) {
            case 'edit':
                return currentContact && (
                    <ContactEditor
                        key={currentContact.id}
                        contact={currentContact}
                        onSave={handleSaveContact}
                        onCancel={handleBackToList}
                    />
                );
            case 'list':
            default:
                return (
                    <ContactList
                        onAddContact={handleAddContact}
                        onEditContact={handleEditContact}
                        onDeleteContact={handleDeleteContact}
                    />
                );
        }
    };

    return (
        <div>
            {renderContent()}
            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDeleteContact}
                    title="Delete Contact"
                    message="Are you sure you want to delete this contact and all of its logged interactions? This action cannot be undone."
                    confirmButtonText="Delete Contact"
                />
            )}
             {isDuplicateModalOpen && (
                <ConfirmationModal
                    isOpen={isDuplicateModalOpen}
                    onClose={() => setIsDuplicateModalOpen(false)}
                    onConfirm={confirmSaveDuplicate}
                    title="Duplicate Email Found"
                    message="A contact with this email address already exists. Are you sure you want to create a new contact with the same email?"
                    confirmButtonText="Yes, Create Contact"
                />
            )}
        </div>
    );
};

export default ContactManager;
