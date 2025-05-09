import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { patientService } from '../services/api';
import { Patient } from '../types';

export interface PatientState {
  patients: Patient[];
  selectedPatientId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  patients: [],
  selectedPatientId: null,
  loading: false,
  error: null,
};

// Type pour les erreurs API
interface ApiError {
  message: string;
}

// Thunk pour récupérer tous les patients
export const fetchPatients = createAsyncThunk<
  Patient[],
  void,
  { rejectValue: string }
>('patients/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await patientService.getAllPatients();
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération des patients');
  }
});

// Thunk pour récupérer un patient par son ID
export const fetchPatientById = createAsyncThunk<
  Patient,
  string,
  { rejectValue: string }
>('patients/fetchById', async (idUtilisateur, { rejectWithValue }) => {
  try {
    return await patientService.getPatientById(idUtilisateur);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération du patient');
  }
});

// Thunk pour récupérer un patient par son ID
export const fetchPatientsByMedecinId = createAsyncThunk<
  Patient,
  number,
  { rejectValue: string }
>('patients/fetchAllByDoctor', async (idPersSoignant, { rejectWithValue }) => {
  try {
    return await patientService.getPatientsByMedecinId(idPersSoignant);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération du patient');
  }
});

// Thunk pour créer un nouveau patient
export const createPatient = createAsyncThunk<
  Patient,
  Partial<Patient>,
  { rejectValue: string }
>('patients/create', async (patientData, { rejectWithValue }) => {
  try {
    return await patientService.createPatient(patientData);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la création du patient');
  }
});

// Thunk pour mettre à jour un patient
export const updatePatient = createAsyncThunk<
  Patient,
  { data: Partial<Patient> },
  { rejectValue: string }
>('patients/update', async ({ data }, { rejectWithValue }) => {
  try {
    return await patientService.updatePatient(data);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la mise à jour du patient');
  }
});

// Thunk pour supprimer un patient
export const deletePatient = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('patients/delete', async (idUtilisateur, { rejectWithValue }) => {
  try {
    await patientService.deletePatient(idUtilisateur);
    return idUtilisateur;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la suppression du patient');
  }
});

export const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSelectedPatientId: (state, action: PayloadAction<string | null>) => {
      state.selectedPatientId = action.payload;
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
    // Gestion de fetchPatients
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action: any) => {
        state.loading = false;
        state.patients = action.payload?.data;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

      // 
      .addCase(fetchPatientsByMedecinId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientsByMedecinId.fulfilled, (state, action: any) => {
        state.loading = false;
        state.patients = action.payload?.data;
      })
      .addCase(fetchPatientsByMedecinId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

      // Gestion de fetchPatientById
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        const patient = action.payload;
        // Mettre à jour le patient dans le tableau ou l'ajouter s'il n'existe pas
        const index = state.patients.findIndex(p => p.idUtilisateur === patient.idUtilisateur);
        if (index !== -1) {
          state.patients[index] = patient;
        } else {
          state.patients.push(patient);
        }
        state.selectedPatientId = patient.idUtilisateur;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

      // Gestion de createPatient
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action: any) => {
        console.log("🚀 ~ .addCase ~ action:", action)
        state.loading = false;
        state.patients.unshift(action.payload?.data);
      })
      .addCase(createPatient.rejected, (state, action) => {
        console.log("🚀 ~ .addCase ~ action:", action)
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

      // Gestion de updatePatient
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action: any) => {
        console.log("🚀 ~ .addCase ~ action:", action)
        state.loading = false;
        const updatedPatient = action.payload?.data;
        const index = state.patients.findIndex(p => p.idPatient === updatedPatient.idPatient);
        if (index !== -1) {
          state.patients[index] = updatedPatient;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

      // Gestion de deletePatient
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state, action: any) => {
        console.log("🚀 ~ .addCase ~ action:", action)
        state.loading = false;
        state.patients = state.patients.filter(p => p.idUtilisateur !== action.payload);
        if (state.selectedPatientId === action.payload?.data) {
          state.selectedPatientId = null;
        }
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      });
  }
});

export const {
  setSelectedPatientId,
  setLoading,
  setError,
  clearError
} = patientSlice.actions;

// Sélecteurs
export const selectPatients = (state: { patients: PatientState }) =>
  state.patients.patients;

export const selectSelectedPatientId = (state: { patients: PatientState }) =>
  state.patients.selectedPatientId;

export const selectSelectedPatient = (state: { patients: PatientState }) => {
  const { patients, selectedPatientId } = state.patients;
  return patients.find(p => p.idUtilisateur === selectedPatientId) || null;
};

export const selectPatientById = (state: { patients: PatientState }, idUtilisateur: string) => {
  return state.patients.patients.find(p => p.idUtilisateur === idUtilisateur) || null;
};

export const selectPatientLoading = (state: { patients: PatientState }) =>
  state.patients.loading;

export const selectPatientError = (state: { patients: PatientState }) =>
  state.patients.error;

export default patientSlice.reducer;
