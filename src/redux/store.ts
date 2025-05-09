import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import prescriptionReducer from './prescriptionSlice';
import patientReducer from './patientSlice';
import doctorReducer from './doctorSlice';
import consultationReducer from './consultationSlice';
import authReducer from './authSlice';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
  prescriptions: prescriptionReducer,
  patients: patientReducer,
  doctors: doctorReducer,
  consultations: consultationReducer,
  auth: authReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(thunk),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
