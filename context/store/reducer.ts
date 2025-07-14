import { AppState, Action } from '../../types.ts';
import { projectsReducer } from '../slices/projects.slice';
import { membersReducer } from '../slices/members.slice';
import { tasksReducer } from '../slices/tasks.slice';
import { reportsReducer } from '../slices/reports.slice';
import { mediaReducer } from '../slices/media.slice';
import { eventsReducer } from '../slices/events.slice';
import { salesReducer } from '../slices/sales.slice';
import { settingsReducer } from '../slices/settings.slice';
import { uiReducer } from '../slices/ui.slice';
import { ecostarReducer } from '../slices/ecostar.slice';
import { interestCompatibilityReducer } from '../slices/interestCompatibility.slice';
import { sdgReducer } from '../slices/sdg.slice';
import { recreationReducer } from '../slices/recreation.slice';

export const appReducer = (state: AppState, action: Action): AppState => {
    // Each reducer is responsible for its own slice of the state.
    // The new state is composed from the results of each reducer.
    const newState: AppState = {
        ...state, // Start with current state
        ...uiReducer(state, action),
        ...projectsReducer(state, action),
        ...membersReducer(state, action),
        ...tasksReducer(state, action),
        ...reportsReducer(state, action),
        ...mediaReducer(state, action),
        ...eventsReducer(state, action),
        ...salesReducer(state, action),
        ...settingsReducer(state, action),
        ...ecostarReducer(state, action),
        ...interestCompatibilityReducer(state, action),
        ...sdgReducer(state, action),
        ...recreationReducer(state, action),
    };
    return newState;
};
