// This file now acts as a "barrel" to re-export all the modular API functions.
// This allows other parts of the application to continue importing from 'services/api'
// without needing to know about the internal file structure.

export * from './api_slices/settings';
export * from './api_slices/projects';
export * from './api_slices/members';
export * from './api_slices/tasks';
export * from './api_slices/events';
export * from './api_slices/crm';
export * from './api_slices/sales';
export * from './api_slices/reports';
export * from './api_slices/ecostar';
export * from './api_slices/interestCompatibility';
export * from './api_slices/sdg';
export * from './api_slices/recreation';
