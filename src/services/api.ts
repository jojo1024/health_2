/**
 * Service API pour communiquer avec le backend
 */

import { ConsultationBackendPayload } from "../types";

// URL de base de l'API
const API_URL = 'https://lomeko.wookami.com/api';
// export const API_URL = 'http://localhost:50010/api';
// export const API_URL_DOC = 'http://localhost:50010/document';
export const API_URL_DOC = 'https://lomeko.wookami.com/document';

// Interface pour les options de fetchAPI
interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

// Fonction générique pour faire des requêtes API
const fetchAPI = async <T>(endpoint: string, options: FetchOptions): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`Erreur API (${endpoint}):`, error);
    throw error;
  }
};

// Types communs pour l'API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Service pour les prescriptions
export const prescriptionService = {
  // Récupérer toutes les prescriptions
  getAllPrescriptions: async () => {
    return fetchAPI<any[]>('/prescriptions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer une prescription par son ID
  getPrescriptionById: async (id: string) => {
    return fetchAPI<any>(`/prescriptions/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Créer une nouvelle prescription
  createPrescription: async (prescriptionData: any) => {
    return fetchAPI<any>('/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionData)
    });
  },

  // Mettre à jour une prescription
  updatePrescription: async (id: string, prescriptionData: any) => {
    return fetchAPI<any>(`/prescriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionData)
    });
  },

  // Supprimer une prescription
  deletePrescription: async (id: string) => {
    return fetchAPI<{ message: string }>(`/prescriptions/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer les prescriptions d'un patient
  getPrescriptionsByPatientId: async (patientId: string) => {
    return fetchAPI<any[]>(`/prescriptions/patient/${patientId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Service pour les patients
export const patientService = {
  // Récupérer tous les patients
  getAllPatients: async () => {
    return fetchAPI<any[]>('/patients/fetchAll', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer un patient par son ID
  getPatientById: async (id: string) => {
    return fetchAPI<any>(`/patients/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getPatientsByMedecinId: async (idPersSoignant: number) => {
    return fetchAPI<any>(`/patients/fetchAllByDoctor/${idPersSoignant}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Créer un nouveau patient
  createPatient: async (patientData: any) => {
    return fetchAPI<any>('/patients/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
  },

  // Mettre à jour un patient
  updatePatient: async (patientData: any) => {
    return fetchAPI<any>(`/patients/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
  },

  // Supprimer un patient
  deletePatient: async (id: string) => {
    return fetchAPI<{ message: string }>(`/patients/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Rechercher des patients
  searchPatients: async (searchTerm: string) => {
    return fetchAPI<any[]>(`/patients/search?term=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer les consultations d'un patient
  getPatientConsultations: async (patientId: string) => {
    return fetchAPI<any[]>(`/patients/${patientId}/consultations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer les prescriptions d'un patient
  getPatientPrescriptions: async (patientId: string) => {
    return fetchAPI<any[]>(`/patients/${patientId}/prescriptions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Obtenir des statistiques sur les patients
  getPatientStatistics: async () => {
    return fetchAPI<any>('/patients/statistics', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const authService = {
  // Envoyer le code par sms
  requestPinCode: async (phoneNumber: string) => {
    return fetchAPI<any>('/auth/request-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telephoneUtilisateur: `225${phoneNumber.replace(/\s/g, "")}`
      })
    });
  },
  // Vérifier le code envoyé par  sms
  verifyCode: async (phoneNumber: string, code: string) => {
    return fetchAPI<any>('/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telephoneUtilisateur: `225${phoneNumber.replace(/\s/g, "")}`,
        code
      })
    });
  },
}

// Service pour les médecins
export const doctorService = {
  // Récupérer tous les médecins
  getAllDoctors: async () => {
    return fetchAPI<any[]>('/personnels-soignants/fetchAll', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer un médecin par son ID
  getDoctorById: async (id: string) => {
    return fetchAPI<any>(`/personnels-soignants/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Créer un nouveau médecin
  createDoctor: async (doctorData: any) => {
    return fetchAPI<any>('/personnels-soignants/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });
  },

  // Mettre à jour un médecin
  updateDoctor: async (doctorData: any) => {
    return fetchAPI<any>(`/personnels-soignants/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });
  },

  // Supprimer un médecin
  deleteDoctor: async (id: string) => {
    return fetchAPI<{ message: string }>(`/personnels-soignants/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Rechercher des médecins
  searchDoctors: async (searchTerm: string) => {
    return fetchAPI<any[]>(`/doctors/search?term=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer les patients d'un médecin
  getDoctorPatients: async (doctorId: string) => {
    return fetchAPI<any[]>(`/doctors/${doctorId}/patients`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer les consultations d'un médecin
  getDoctorConsultations: async (doctorId: string) => {
    return fetchAPI<any[]>(`/doctors/${doctorId}/consultations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer les prescriptions d'un médecin
  getDoctorPrescriptions: async (doctorId: string) => {
    return fetchAPI<any[]>(`/doctors/${doctorId}/prescriptions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Obtenir des statistiques sur les médecins
  getDoctorStatistics: async () => {
    return fetchAPI<any>('/doctors/statistics', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Service pour les consultations
export const consultationService = {
  // Récupérer toutes les consultations
  getAllConsultations: async () => {
    return fetchAPI<any[]>('/consultations/fetchAll', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Récupérer une consultation par son ID
  getConsultationById: async (id: string) => {
    return fetchAPI<any>(`/consultations/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getPatientConsultationById: async (idPatient: number) => {
    return fetchAPI<any>(`/consultations/fetchByPatient/${idPatient}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Créer une nouvelle consultation
  createConsultation: async (consultationData: ConsultationBackendPayload) => {
    return fetchAPI<any>('/consultations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    });
  },

  // Mettre à jour une consultation
  updateConsultation: async (id: string, consultationData: any) => {
    return fetchAPI<any>(`/consultations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    });
  },

  // Supprimer une consultation
  deleteConsultation: async (id: string) => {
    return fetchAPI<{ message: string }>(`/consultations/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Rechercher des consultations
  searchConsultations: async (searchTerm: string) => {
    return fetchAPI<any[]>(`/consultations/search?term=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Mettre à jour le statut de remboursement d'une consultation
  updateReimbursementStatus: async (id: string, reimbursementData: any) => {
    return fetchAPI<any>(`/consultations/${id}/reimbursement`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reimbursementData)
    });
  },

  // Obtenir des statistiques sur les consultations
  getConsultationStatistics: async () => {
    return fetchAPI<any>('/consultations/statistics', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Exporter les services
export default {
  prescriptionService,
  patientService,
  doctorService,
  consultationService
};
