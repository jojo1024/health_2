import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { consultationService } from '../services/api';
import { Consultation, ReimbursementStatus } from '../types';

// État initial
export interface ConsultationState {
  consultations: Consultation[];
  selectedConsultationId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConsultationState = {
  consultations: [],
  selectedConsultationId: null,
  loading: false,
  error: null,
};

// Type pour les erreurs API
interface ApiError {
  message: string;
}

// Thunk pour récupérer toutes les consultations
export const fetchConsultations = createAsyncThunk<
  Consultation[],
  void,
  { rejectValue: string }
>('consultations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await consultationService.getAllConsultations();
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération des consultations');
  }
});

// Thunk pour récupérer une consultation par son ID
export const fetchConsultationById = createAsyncThunk<
  Consultation,
  string,
  { rejectValue: string }
>('consultations/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await consultationService.getConsultationById(id);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération de la consultation');
  }
});

// Thunk pour créer une nouvelle consultation
export const createConsultation = createAsyncThunk<
  Consultation,
  Partial<Consultation>,
  { rejectValue: string }
>('consultations/create', async (consultationData, { rejectWithValue }) => {
  try {
    return await consultationService.createConsultation(consultationData);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la création de la consultation');
  }
});

// Thunk pour mettre à jour une consultation
export const updateConsultation = createAsyncThunk<
  Consultation,
  { id: string; data: Partial<Consultation> },
  { rejectValue: string }
>('consultations/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await consultationService.updateConsultation(id, data);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la mise à jour de la consultation');
  }
});

// Thunk pour supprimer une consultation
export const deleteConsultation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('consultations/delete', async (id, { rejectWithValue }) => {
  try {
    await consultationService.deleteConsultation(id);
    return id;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la suppression de la consultation');
  }
});

// Thunk pour mettre à jour le statut de remboursement
export const updateReimbursementStatus = createAsyncThunk<
  Consultation,
  { id: string; status: ReimbursementStatus; notes?: string },
  { rejectValue: string }
>('consultations/updateReimbursementStatus', async ({ id, status, notes }, { rejectWithValue }) => {
  try {
    return await consultationService.updateReimbursementStatus(id, { status, notes });
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la mise à jour du statut de remboursement');
  }
});

// Slice Redux pour les consultations
export const consultationSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    setSelectedConsultationId: (state, action: PayloadAction<string | null>) => {
      state.selectedConsultationId = action.payload;
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
    // Gestion de fetchConsultations
    builder
      .addCase(fetchConsultations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsultations.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = action.payload;
      })
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de fetchConsultationById
      .addCase(fetchConsultationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsultationById.fulfilled, (state, action) => {
        state.loading = false;
        const consultation = action.payload;
        // Mettre à jour la consultation dans le tableau ou l'ajouter si elle n'existe pas
        const index = state.consultations.findIndex(c => c.id === consultation.id);
        if (index !== -1) {
          state.consultations[index] = consultation;
        } else {
          state.consultations.push(consultation);
        }
        state.selectedConsultationId = consultation.id;
      })
      .addCase(fetchConsultationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de createConsultation
      .addCase(createConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations.push(action.payload);
      })
      .addCase(createConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de updateConsultation
      .addCase(updateConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConsultation.fulfilled, (state, action) => {
        state.loading = false;
        const updatedConsultation = action.payload;
        const index = state.consultations.findIndex(c => c.id === updatedConsultation.id);
        if (index !== -1) {
          state.consultations[index] = updatedConsultation;
        }
      })
      .addCase(updateConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de deleteConsultation
      .addCase(deleteConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConsultation.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = state.consultations.filter(c => c.id !== action.payload);
        if (state.selectedConsultationId === action.payload) {
          state.selectedConsultationId = null;
        }
      })
      .addCase(deleteConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de updateReimbursementStatus
      .addCase(updateReimbursementStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReimbursementStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedConsultation = action.payload;
        const index = state.consultations.findIndex(c => c.id === updatedConsultation.id);
        if (index !== -1) {
          state.consultations[index] = updatedConsultation;
        }
      })
      .addCase(updateReimbursementStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      });
  }
});

// Exporter les actions
export const {
  setSelectedConsultationId,
  setLoading,
  setError,
  clearError
} = consultationSlice.actions;

// Sélecteurs
export const selectConsultations = (state: { consultations: ConsultationState }) =>
  state.consultations.consultations;

export const selectSelectedConsultationId = (state: { consultations: ConsultationState }) =>
  state.consultations.selectedConsultationId;

export const selectSelectedConsultation = (state: { consultations: ConsultationState }) => {
  const { consultations, selectedConsultationId } = state.consultations;
  return consultations.find(c => c.id === selectedConsultationId) || null;
};

export const selectConsultationById = (state: { consultations: ConsultationState }, id: string) => {
  return state.consultations.consultations.find(c => c.id === id) || null;
};

export const selectConsultationLoading = (state: { consultations: ConsultationState }) =>
  state.consultations.loading;

export const selectConsultationError = (state: { consultations: ConsultationState }) =>
  state.consultations.error;

export const selectPendingReimbursements = (state: { consultations: ConsultationState }) =>
  state.consultations.consultations.filter(c => c.reimbursementStatus === ReimbursementStatus.PENDING);

export const selectRecentConsultations = (state: { consultations: ConsultationState }, limit = 5) =>
  [...state.consultations.consultations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

export default consultationSlice.reducer;
