import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { consultationService } from '../services/api';
import { PatientAvecConsultations, PatientConsultations, ReimbursementStatus } from '../types';

// État initial
export interface ConsultationState {
  consultations: PatientAvecConsultations[];
  patientConsultations: PatientConsultations[];
  selectedConsultationId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConsultationState = {
  consultations: [],
  patientConsultations: [],
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
  PatientAvecConsultations[],
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
  PatientAvecConsultations,
  string,
  { rejectValue: string }
>('consultations/fetchById', async (idConsultation, { rejectWithValue }) => {
  try {
    return await consultationService.getConsultationById(idConsultation);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération de la consultation');
  }
});


// Thunk pour récupérer une consultation par son ID
export const fetchPatientConsultationById = createAsyncThunk<
  PatientAvecConsultations,
  number,
  { rejectValue: string }
>('consultations/fetchPatientById', async (idPatient, { rejectWithValue }) => {
  try {
    return await consultationService.getPatientConsultationById(idPatient);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération de la consultation');
  }
});


// Thunk pour créer une nouvelle consultation
export const createConsultation = createAsyncThunk<
  PatientAvecConsultations,
  any,
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
  PatientAvecConsultations,
  { idConsultation: string; data: Partial<PatientAvecConsultations> },
  { rejectValue: string }
>('consultations/update', async ({ idConsultation, data }, { rejectWithValue }) => {
  try {
    return await consultationService.updateConsultation(idConsultation, data);
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
>('consultations/delete', async (idConsultation, { rejectWithValue }) => {
  try {
    await consultationService.deleteConsultation(idConsultation);
    return idConsultation;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la suppression de la consultation');
  }
});

// Thunk pour mettre à jour le statut de remboursement
export const updateReimbursementStatus = createAsyncThunk<
  PatientAvecConsultations,
  { idConsultation: string; status: ReimbursementStatus; notes?: string },
  { rejectValue: string }
>('consultations/updateReimbursementStatus', async ({ idConsultation, status, notes }, { rejectWithValue }) => {
  try {
    return await consultationService.updateReimbursementStatus(idConsultation, { status, notes });
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
    setSelectedConsultationId: (state, action: PayloadAction<number | null>) => {
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
      .addCase(fetchConsultations.fulfilled, (state, action: any) => {
        state.loading = false;
        state.consultations = action.payload?.data;
      })
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

      .addCase(fetchPatientConsultationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientConsultationById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.patientConsultations = action.payload?.data;
      })
      .addCase(fetchPatientConsultationById.rejected, (state, action) => {
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
        const index = state.consultations.findIndex(c => c.idPatient === consultation.idPatient);
        if (index !== -1) {
          state.consultations[index] = consultation;
        } else {
          state.consultations.push(consultation);
        }
        state.selectedConsultationId = consultation.idPatient;
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
      .addCase(createConsultation.fulfilled, (state, action:any) => {
        state.loading = false;

        const newPatient = action.payload?.data as PatientAvecConsultations;

        const index = state.consultations.findIndex(
          (p) => p.idPatient === newPatient.idPatient
        );

        if (index !== -1) {
          // Remplace l'ancien patient
          state.consultations[index] = newPatient;
        } else {
          // Ajoute le nouveau patient
          state.consultations.push(newPatient);
        }
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
        const index = state.consultations.findIndex(c => c.idPatient === updatedConsultation.idPatient);
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
        state.consultations = state.consultations.filter(c => c.idPatient !== Number(action.payload));
        if (state.selectedConsultationId === Number(action.payload)) {
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
        const index = state.consultations.findIndex(c => c.idPatient === updatedConsultation.idPatient);
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
  return consultations.find(c => c.idPatient === selectedConsultationId) || null;
};

export const selectConsultationById = (state: { consultations: ConsultationState }, idConsultation: number) => {
  return state.consultations.consultations.find(c => c.idPatient === idConsultation) || null;
};

export const selectConsultationLoading = (state: { consultations: ConsultationState }) =>
  state.consultations.loading;

export const selectConsultationError = (state: { consultations: ConsultationState }) =>
  state.consultations.error;


export const selectRecentConsultations = (state: { consultations: ConsultationState }, limit = 5) =>
  [...state.consultations.consultations]
    .sort((a, b) => new Date(b.dateNaisPatient).getTime() - new Date(a.dateNaisPatient).getTime())
    .slice(0, limit);

export default consultationSlice.reducer;
