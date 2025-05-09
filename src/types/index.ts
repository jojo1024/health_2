export enum DoctorSpecialty {
  GENERAL = "GENERALISTE",
  SPECIALIST = "SPECIALISTE"
}

export enum SpecialistType {
  CARDIOLOGY = "Cardiologie",
  DERMATOLOGY = "Dermatologie",
  NEUROLOGY = "Neurologie",
  ORTHOPEDICS = "Orthopédie",
  OPHTHALMOLOGY = "Ophtalmologie",
  GYNECOLOGY = "Gynécologie",
  PEDIATRICS = "Pédiatrie",
  PSYCHIATRY = "Psychiatrie",
  OTHER = "Autre"
}

export interface Utilisateur {
  idUtilisateur: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
}

interface RootObject {
  idUtilisateur: number;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  adressePatient: string;
  ethniePatient: string;
  dateNaisPatient: string;
  sexePatient: string;
  groupeSanguinPatient: string;
}

export interface Patient extends Utilisateur {
  idPatient: string;
  adressePatient: string;
  ethniePatient: string;
  dateNaisPatient: Date;
  sexePatient: string;
  groupeSanguinPatient: string;
}

export interface Doctor extends Utilisateur {
  idPersSoignant: string;
  typePersSoignant: string;
  specPersSoignant: string; // only if specialty is SPECIALIST
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  notes: string;
  prescriptions: string[];
  specialistReferrals: SpecialistReferral[];
  reimbursementStatus: ReimbursementStatus;
  reimbursementAmount: number | null;
  reimbursementDate: string | null;
}

export interface Constantes {
  tension: string;
  temperature: string;
}

export interface DocumentConsultation {
  type: string;
  filename: string;
  // ajoutez d'autres champs si nécessaire, ex: url, dateAjout, etc.
}

// Détail d’une seule consultation, noms de champs inchangés

export interface PatientConsultations {
  idPatient: number;
  adressePatient: string;
  ethniePatient: string;
  dateNaisPatient: string;
  sexePatient: string;
  groupeSanguinPatient: string;
  nomPatient: string;
  prenomPatient: string;
  telephonePatient: string;
  idConsultation: number;
  motifConsultation: string;
  constantes: Constantes;
  detailConsultation: string;
  ordonnance: string;
  documentsConsultations: DocumentsConsultation[];
  dateConsultation: string;
  nomSoignant: string;
  prenomSoignant: string;
  telephoneSoignant: string;
}

interface DocumentsConsultation {
  type: string;
  filename: string;
}

export interface PatientAvecConsultations {
  idPatient: number;
  adressePatient: string;
  ethniePatient: string;
  dateNaisPatient: Date;
  sexePatient: 'M' | 'F';
  groupeSanguinPatient: string;
  nomPatient: string;
  prenomPatient: string;
  telephonePatient: string;
  consultations: ConsultationRegroupee[];
}

export interface ConsultationRegroupee {
  idConsultation: number;
  motifConsultation: string;
  constantes: Constantes | null;
  detailConsultation: string;
  ordonnance: string;
  documentsConsultations: DocumentConsultation[];
  dateConsultation: Date;
  nomSoignant: string;
  prenomSoignant: string;
  telephoneSoignant: string;
  nomPatient: string;
  prenomPatient: string;
  telephonePatient: string;
}

export interface SpecialistReferral {
  id: string;
  consultationId: string;
  specialistType: SpecialistType;
  specialistId?: string; // Optional, may be assigned later
  reason: string;
  isCompleted: boolean;
  completionDate?: string;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  date: string;
  notes?: string; // Updated to be optional
  medications: Medication[];
  // Fields from backend join queries
  patientName?: string; // New field
  doctorName?: string; // New field
  // Timestamps from MySQL
  createdAt?: string; // New field
  updatedAt?: string; // New field
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export enum ReimbursementStatus {
  PENDING = "En attente",
  APPROVED = "Approuvé",
  REJECTED = "Rejeté",
  PARTIAL = "Partiellement remboursé",
  COMPLETED = "Remboursé"
}

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: UserRole;
//   doctorId?: string; // For doctors
//   profilePicture?: string; // URL to profile picture
//   phoneNumber: string; // Added phoneNumber field
// }

export interface User {
  idUtilisateur: number;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  typeUtilisateur: UserRole;
  adressePatient: string;
  ethniePatient: string;
  dateNaisPatient: string;
  sexePatient: string;
  groupeSanguinPatient: string;
  typePersSoignant: null;
  specPersSoignant: null;
}

export enum UserRole {
  ADMIN = "ADMIN",
  DOCTOR = "PERSONNEL_SOIGNANT",
  PATIENT = "PATIENT",
}

export enum AuthStep {
  PHONE_INPUT = "PHONE_INPUT",
  CODE_VERIFICATION = "CODE_VERIFICATION",
  COMPLETED = "COMPLETED"
}

export interface UserInfo {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentStep: AuthStep; // Added step tracking
  phoneNumber: string | null; // Added phone number storage
  verificationCode: string | null; // Added verification code storage
}

export interface PrescriptionDetail extends Prescription {
  patient: Patient;
  doctor: Doctor;
}

// Interface pour les demandes d'autorisation médecin-patient
export interface AuthorizationRequest {
  id: string;
  doctorId: string;
  patientId: string;
  requestDate: string;
  status: AuthorizationStatus;
  verificationCode: string;
  codeExpiryDate: string;
}

export enum AuthorizationStatus {
  PENDING = "En attente",
  APPROVED = "Approuvé",
  REJECTED = "Rejeté",
  EXPIRED = "Expiré"
}

export interface PatientChild {
  id: string;
  patientId: string;
  childPatientId: string;
  relationship: string;
}

// Interface adaptée selon le schéma Zod attendu par le backend
export interface ConsultationBackendPayload {
  idPatient: number;
  idPersSoignant: number;
  motifConsultation: string;
  constantes?: {
    temperature?: number;
    tension?: {
      systolique?: number;
      diastolique?: number;
    };
  };
  detailConsultation: string;
  ordonnance: string;
  documentsConsultations?: Array<{
    type: string;
    url: string;
    data?: string;
  }>;
}