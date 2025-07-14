


import { AppState } from '../../types.ts';
import { projectsInitialState } from '../slices/projects.slice';
import { membersInitialState } from '../slices/members.slice';
import { tasksInitialState } from '../slices/tasks.slice';
import { reportsInitialState } from '../slices/reports.slice';
import { mediaInitialState } from '../slices/media.slice';
import { eventsInitialState } from '../slices/events.slice';
import { salesInitialState } from '../slices/sales.slice';
import { settingsInitialState } from '../slices/settings.slice';
import { uiInitialState } from '../slices/ui.slice';
import { ecostarInitialState } from '../slices/ecostar.slice';
import { interestCompatibilityInitialState } from '../slices/interestCompatibility.slice.ts';
import { sdgInitialState } from '../slices/sdg.slice.ts';
import { recreationInitialState } from '../slices/recreation.slice.ts';

export const initialState: AppState = {
    ...uiInitialState,
    ...projectsInitialState,
    ...membersInitialState,
    ...tasksInitialState,
    ...reportsInitialState,
    ...mediaInitialState,
    ...eventsInitialState,
    ...salesInitialState,
    ...settingsInitialState,
    ...ecostarInitialState,
    ...interestCompatibilityInitialState,
    ...sdgInitialState,
    ...recreationInitialState,
};