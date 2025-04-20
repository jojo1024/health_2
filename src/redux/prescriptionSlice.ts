import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { prescriptionService } from '../services/api';
import { Prescription } from '../types';

// État initial
export interface PrescriptionState {
  prescriptions: Prescription[];
  selectedPrescriptionId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescriptions: [],
  selectedPrescriptionId: null,
  loading: false,
  error: null,
};

// Type pour les erreurs API
interface ApiError {
  message: string;
}

// Thunk pour récupérer toutes les prescriptions
export const fetchPrescriptions = createAsyncThunk<
  Prescription[],
  void,
  { rejectValue: string }
>('prescriptions/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await prescriptionService.getAllPrescriptions();
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération des prescriptions');
  }
});

// Thunk pour récupérer une prescription par son ID
export const fetchPrescriptionById = createAsyncThunk<
  Prescription,
  string,
  { rejectValue: string }
>('prescriptions/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await prescriptionService.getPrescriptionById(id);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération de la prescription');
  }
});

// Thunk pour créer une nouvelle prescription
export const createPrescription = createAsyncThunk<
  Prescription,
  Partial<Prescription>,
  { rejectValue: string }
>('prescriptions/create', async (prescriptionData, { rejectWithValue }) => {
  try {
    return await prescriptionService.createPrescription(prescriptionData);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la création de la prescription');
  }
});

// Thunk pour mettre à jour une prescription
export const updatePrescription = createAsyncThunk<
  Prescription,
  { id: string; data: Partial<Prescription> },
  { rejectValue: string }
>('prescriptions/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await prescriptionService.updatePrescription(id, data);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la mise à jour de la prescription');
  }
});

// Thunk pour supprimer une prescription
export const deletePrescription = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('prescriptions/delete', async (id, { rejectWithValue }) => {
  try {
    await prescriptionService.deletePrescription(id);
    return id;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la suppression de la prescription');
  }
});

// Slice Redux pour les prescriptions
export const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    setSelectedPrescriptionId: (state, action: PayloadAction<string | null>) => {
      state.selectedPrescriptionId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Gestion de fetchPrescriptions
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de fetchPrescriptionById
      .addCase(fetchPrescriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptionById.fulfilled, (state, action) => {
        state.loading = false;
        const prescription = action.payload;
        // Mettre à jour la prescription dans le tableau ou l'ajouter si elle n'existe pas
        const index = state.prescriptions.findIndex(p => p.id === prescription.id);
        if (index !== -1) {
          state.prescriptions[index] = prescription;
        } else {
          state.prescriptions.push(prescription);
        }
        state.selectedPrescriptionId = prescription.id;
      })
      .addCase(fetchPrescriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de createPrescription
      .addCase(createPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions.push(action.payload);
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de updatePrescription
      .addCase(updatePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPrescription = action.payload;
        const index = state.prescriptions.findIndex(p => p.id === updatedPrescription.id);
        if (index !== -1) {
          state.prescriptions[index] = updatedPrescription;
        }
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de deletePrescription
      .addCase(deletePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = state.prescriptions.filter(p => p.id !== action.payload);
        if (state.selectedPrescriptionId === action.payload) {
          state.selectedPrescriptionId = null;
        }
      })
      .addCase(deletePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      });
  }
});

// Exporter les actions
export const {
  setSelectedPrescriptionId,
  setLoading,
  setError,
  clearError
} = prescriptionSlice.actions;

// Sélecteurs
export const selectPrescriptions = (state: { prescriptions: PrescriptionState }) =>
  state.prescriptions.prescriptions;

export const selectSelectedPrescriptionId = (state: { prescriptions: PrescriptionState }) =>
  state.prescriptions.selectedPrescriptionId;

export const selectSelectedPrescription = (state: { prescriptions: PrescriptionState }) => {
  const { prescriptions, selectedPrescriptionId } = state.prescriptions;
  return prescriptions.find(p => p.id === selectedPrescriptionId) || null;
};

export const selectPrescriptionById = (state: { prescriptions: PrescriptionState }, id: string) => {
  return state.prescriptions.prescriptions.find(p => p.id === id) || null;
};

export const selectPrescriptionLoading = (state: { prescriptions: PrescriptionState }) =>
  state.prescriptions.loading;

export const selectPrescriptionError = (state: { prescriptions: PrescriptionState }) =>
  state.prescriptions.error;

export default prescriptionSlice.reducer;
