import { configureStore } from '@reduxjs/toolkit';

import { api } from '../api/api';
import chatReducer from './chatSlice';

/**
 * A factory, not a singleton: in the App Router a module-level store would be
 * shared between every request the server renders.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      chat: chatReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
