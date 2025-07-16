
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Venue } from '../../types';
import { initialVenueData } from '../../constants';
import ConfirmationModal from '../ui/ConfirmationModal';
import VenueList from './VenueList';
import VenueEditor from './VenueEditor';
import VenueViewer from './VenueViewer';
import * as api from '../../services/api';

type ViewMode = 'list' | 'edit' | 'view';

const VenueManager: React.FC = () => {
  const { state, dispatch, notify } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null);

  const handleAddVenue = () => {
    const now = new Date().toISOString();
    setCurrentVenue({ ...initialVenueData, id: `new_venue_${Date.now()}`, createdAt: now, updatedAt: now });
    setViewMode('edit');
  };

  const handleEditVenue = (id: string) => {
    const venue = state.venues.find(v => v.id === id);
    if (venue) {
      setCurrentVenue(venue);
      setViewMode('edit');
    }
  };
  
  const handleViewVenue = (id: string) => {
    const venue = state.venues.find(v => v.id === id);
    if (venue) {
      setCurrentVenue(venue);
      setViewMode('view');
    }
  };

  const handleDeleteVenue = (id: string) => {
    setVenueToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;
    try {
        await api.deleteVenue(venueToDelete);
        dispatch({ type: 'DELETE_VENUE', payload: venueToDelete });
        notify('Venue deleted.', 'success');
    } catch (error: any) {
        notify(`Error deleting venue: ${error.message}`, 'error');
    }
    setIsDeleteModalOpen(false);
    setVenueToDelete(null);
  };

  const handleSaveVenue = async (venueToSave: Venue) => {
    const isNew = venueToSave.id.startsWith('new_');
    try {
        if (isNew) {
            const newVenue = await api.addVenue(venueToSave);
            dispatch({ type: 'ADD_VENUE', payload: newVenue });
        } else {
            const updatedVenue = await api.updateVenue(venueToSave.id, venueToSave);
            dispatch({ type: 'UPDATE_VENUE', payload: updatedVenue });
        }
        notify(`Venue ${isNew ? 'added' : 'updated'} successfully.`, 'success');
        setViewMode('list');
        setCurrentVenue(null);
    } catch(error: any) {
        notify(`Error saving venue: ${error.message}`, 'error');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentVenue(null);
  };

  return (
    <>
      {viewMode === 'list' && (
        <VenueList 
          venues={state.venues}
          onAddVenue={handleAddVenue}
          onEditVenue={handleEditVenue}
          onDeleteVenue={handleDeleteVenue}
          onViewVenue={handleViewVenue}
        />
      )}
      {viewMode === 'edit' && currentVenue && (
        <VenueEditor
          key={currentVenue.id}
          venue={currentVenue}
          onSave={handleSaveVenue}
          onCancel={handleBackToList}
        />
      )}
      {viewMode === 'view' && currentVenue && (
        <VenueViewer
          venue={currentVenue}
          onBack={handleBackToList}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteVenue}
          title="Delete Venue"
          message="Are you sure you want to delete this venue? It will be unlinked from any associated events. This action cannot be undone."
        />
      )}
    </>
  );
};

export default VenueManager;
