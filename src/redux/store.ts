import { configureStore } from '@reduxjs/toolkit';
import prescriptionReducer from './prescriptionSlice';
import patientReducer from './patientSlice';
import doctorReducer from './doctorSlice';
import consultationReducer from './consultationSlice';

export const store = configureStore({
  reducer: {
    prescriptions: prescriptionReducer,
    patients: patientReducer,
    doctors: doctorReducer,
    consultations: consultationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
