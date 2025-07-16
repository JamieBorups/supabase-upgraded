
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { TicketType } from '../../types';
import { initialTicketTypeData } from '../../constants';
import ConfirmationModal from '../ui/ConfirmationModal';
import TicketTypeList from './TicketTypeList';
import TicketTypeEditor from './TicketTypeEditor';
import TicketTypeViewer from './TicketTypeViewer';
import * as api from '../../services/api';

type ViewMode = 'list' | 'edit' | 'view';

const TicketManager: React.FC = () => {
  const { state, dispatch, notify } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentTicketType, setCurrentTicketType] = useState<TicketType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketTypeToDelete, setTicketTypeToDelete] = useState<string | null>(null);

  const handleAddTicketType = () => {
    const now = new Date().toISOString();
    setCurrentTicketType({ ...initialTicketTypeData, id: `new_tt_${Date.now()}`, createdAt: now, updatedAt: now });
    setViewMode('edit');
  };

  const handleEditTicketType = (id: string) => {
    const ticketType = state.ticketTypes.find(tt => tt.id === id);
    if (ticketType) {
      setCurrentTicketType(ticketType);
      setViewMode('edit');
    }
  };
  
  const handleViewTicketType = (id: string) => {
    const ticketType = state.ticketTypes.find(tt => tt.id === id);
    if (ticketType) {
      setCurrentTicketType(ticketType);
      setViewMode('view');
    }
  };

  const handleDeleteTicketType = (id: string) => {
    setTicketTypeToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!ticketTypeToDelete) return;
    try {
        await api.deleteTicketType(ticketTypeToDelete);
        dispatch({ type: 'DELETE_TICKET_TYPE', payload: ticketTypeToDelete });
        notify('Ticket type deleted.', 'success');
    } catch (error: any) {
        notify(`Error deleting ticket type: ${error.message}`, 'error');
    }
    setIsDeleteModalOpen(false);
    setTicketTypeToDelete(null);
  };

  const handleSave = async (ticketTypeToSave: TicketType) => {
    const isNew = ticketTypeToSave.id.startsWith('new_');
    try {
        if (isNew) {
            const newTicketType = await api.addTicketType(ticketTypeToSave);
            dispatch({ type: 'ADD_TICKET_TYPE', payload: newTicketType });
        } else {
            const updatedTicketType = await api.updateTicketType(ticketTypeToSave.id, ticketTypeToSave);
            dispatch({ type: 'UPDATE_TICKET_TYPE', payload: updatedTicketType });
        }
        notify(`Ticket type ${isNew ? 'created' : 'updated'} successfully.`, 'success');
        setViewMode('list');
        setCurrentTicketType(null);
    } catch (error: any) {
        notify(`Error saving ticket type: ${error.message}`, 'error');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentTicketType(null);
  };

  return (
    <>
      {viewMode === 'list' && (
        <TicketTypeList 
          ticketTypes={state.ticketTypes}
          onAdd={handleAddTicketType}
          onEdit={handleEditTicketType}
          onDelete={handleDeleteTicketType}
          onView={handleViewTicketType}
        />
      )}
      {viewMode === 'edit' && currentTicketType && (
        <TicketTypeEditor
          key={currentTicketType.id}
          ticketType={currentTicketType}
          onSave={handleSave}
          onCancel={handleBackToList}
        />
      )}
      {viewMode === 'view' && currentTicketType && (
        <TicketTypeViewer
            ticketType={currentTicketType}
            onBack={handleBackToList}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Ticket Type"
          message="Are you sure? Deleting this ticket type will also remove it from any events it has been assigned to. This action cannot be undone."
        />
      )}
    </>
  );
};

export default TicketManager;
