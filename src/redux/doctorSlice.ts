import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doctorService } from '../services/api';
import { Doctor } from '../types';

// État initial
export interface DoctorState {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  selectedDoctorId: null,
  loading: false,
  error: null,
};

// Type pour les erreurs API
interface ApiError {
  message: string;
}

// Thunk pour récupérer tous les médecins
export const fetchDoctors = createAsyncThunk<
  Doctor[],
  void,
  { rejectValue: string }
>('doctors/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await doctorService.getAllDoctors();
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération des médecins');
  }
});

// Thunk pour récupérer un médecin par son ID
export const fetchDoctorById = createAsyncThunk<
  Doctor,
  string,
  { rejectValue: string }
>('doctors/fetchById', async (idPersSoignant, { rejectWithValue }) => {
  try {
    return await doctorService.getDoctorById(idPersSoignant);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la récupération du médecin');
  }
});

// Thunk pour créer un nouveau médecin
export const createDoctor = createAsyncThunk<
  Doctor,
  Partial<Doctor>,
  { rejectValue: string }
>('doctors/create', async (doctorData, { rejectWithValue }) => {
  try {
    return await doctorService.createDoctor(doctorData);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la création du médecin');
  }
});

// Thunk pour mettre à jour un médecin
export const updateDoctor = createAsyncThunk<
  Doctor,
  { data: Partial<Doctor> },
  { rejectValue: string }
>('doctors/update', async ({ data }, { rejectWithValue }) => {
  try {
    return await doctorService.updateDoctor(data);
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la mise à jour du médecin');
  }
});

// Thunk pour supprimer un médecin
export const deleteDoctor = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('doctors/delete', async (idPersSoignant, { rejectWithValue }) => {
  try {
    await doctorService.deleteDoctor(idPersSoignant);
    return idPersSoignant;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || 'Erreur lors de la suppression du médecin');
  }
});

// Slice Redux pour les médecins
export const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setSelectedDoctorId: (state, action: PayloadAction<string | null>) => {
      state.selectedDoctorId = action.payload;
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
    // Gestion de fetchDoctors
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action:any) => {
        state.loading = false;
        state.doctors = action.payload?.data;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de fetchDoctorById
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        const doctor = action.payload;
        // Mettre à jour le médecin dans le tableau ou l'ajouter s'il n'existe pas
        const index = state.doctors.findIndex(d => d.idPersSoignant === doctor.idPersSoignant);
        if (index !== -1) {
          state.doctors[index] = doctor;
        } else {
          state.doctors.push(doctor);
        }
        state.selectedDoctorId = doctor.idPersSoignant;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de createDoctor
      .addCase(createDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctor.fulfilled, (state, action:any) => {
        state.loading = false;
        state.doctors.unshift(action.payload?.data);
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de updateDoctor
      .addCase(updateDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action:any) => {
        state.loading = false;
        const updatedDoctor = action.payload?.data;
        const index = state.doctors.findIndex(d => d.idPersSoignant === updatedDoctor.idPersSoignant);
        if (index !== -1) {
          state.doctors[index] = updatedDoctor;
        }
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      })

    // Gestion de deleteDoctor
      .addCase(deleteDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = state.doctors.filter(d => d.idPersSoignant !== action.payload);
        if (state.selectedDoctorId === action.payload) {
          state.selectedDoctorId = null;
        }
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Une erreur est survenue';
      });
  }
});

// Exporter les actions
export const {
  setSelectedDoctorId,
  setLoading,
  setError,
  clearError
} = doctorSlice.actions;

// Sélecteurs
export const selectDoctors = (state: { doctors: DoctorState }) =>
  state.doctors.doctors;

export const selectSelectedDoctorId = (state: { doctors: DoctorState }) =>
  state.doctors.selectedDoctorId;

export const selectSelectedDoctor = (state: { doctors: DoctorState }) => {
  const { doctors, selectedDoctorId } = state.doctors;
  return doctors.find(d => d.idPersSoignant === selectedDoctorId) || null;
};

export const selectDoctorById = (state: { doctors: DoctorState }, idPersSoignant: string) => {
  return state.doctors.doctors.find(d => d.idPersSoignant === idPersSoignant) || null;
};

export const selectDoctorLoading = (state: { doctors: DoctorState }) =>
  state.doctors.loading;

export const selectDoctorError = (state: { doctors: DoctorState }) =>
  state.doctors.error;

export default doctorSlice.reducer;
