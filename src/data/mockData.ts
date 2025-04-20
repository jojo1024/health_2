import { v4 as uuidv4 } from 'uuid';
import { format, subDays, subMonths, subYears, addMinutes } from 'date-fns';
import {
  Patient,
  Doctor,
  Consultation,
  Prescription,
  SpecialistReferral,
  DoctorSpecialty,
  SpecialistType,
  ReimbursementStatus,
  Medication,
  User,
  UserRole,
  PatientChild,
  AuthorizationRequest,
  AuthorizationStatus
} from '../types';

// Helper function to get persistent IDs
const getPersistentId = (key: string): string => {
  if (typeof window === 'undefined') return uuidv4();

  const storedId = localStorage.getItem(`persistentId_${key}`);
  if (storedId) {
    return storedId;
  }
  const newId = uuidv4();
  localStorage.setItem(`persistentId_${key}`, newId);
  return newId;
};

// Force reset all IDs for debugging - set this to true to reset all IDs
const FORCE_RESET_IDS = false;

// Fonction pour vérifier si les IDs dans le localStorage sont valides
const validateLocalStorageIds = () => {
  if (typeof window === 'undefined') return;

  // Check if we need to force reset all IDs
  if (FORCE_RESET_IDS) {
    console.log("Force resetting all IDs...");
    clearAllPersistedIds();
    return;
  }

  // Vérifier si on a au moins un ID de patient valide
  const defaultPatientId = localStorage.getItem('defaultPatientId');
  const defaultConsultationId = localStorage.getItem('defaultConsultationId');
  const defaultPrescriptionId = localStorage.getItem('defaultPrescriptionId');

  console.log("Validating localStorage IDs:", {
    defaultPatientId,
    defaultConsultationId,
    defaultPrescriptionId
  });

  if (!defaultPatientId || !defaultConsultationId || !defaultPrescriptionId) {
    // Si aucun ID par défaut n'est trouvé, réinitialisons tous les IDs
    console.log("Réinitialisation des IDs...");
    clearAllPersistedIds();
  }
};

// Helper to clear all persisted IDs
const clearAllPersistedIds = () => {
  if (typeof window === 'undefined') return;

  const keysToRemove = [
    'persistentId_patient1', 'persistentId_patient2', 'persistentId_patient3',
    'persistentId_patient4', 'persistentId_patient5', 'persistentId_patient6',
    'persistentId_doctor1', 'persistentId_doctor2', 'persistentId_doctor3',
    'persistentId_doctor4', 'persistentId_doctor5',
    'persistentId_consultation1', 'persistentId_consultation2', 'persistentId_consultation3',
    'persistentId_consultation4', 'persistentId_consultation5',
    'persistentId_prescription1', 'persistentId_prescription2', 'persistentId_prescription3',
    'persistentId_prescription4',
    'persistentId_medication1', 'persistentId_medication2', 'persistentId_medication3',
    'persistentId_medication4', 'persistentId_medication5',
    'defaultPatientId', 'defaultConsultationId', 'defaultPrescriptionId'
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Exécuter la validation au chargement
validateLocalStorageIds();

// Generate some doctor IDs first to reference them in patients
const doctorId1 = getPersistentId('doctor1');
const doctorId2 = getPersistentId('doctor2');
const doctorId3 = getPersistentId('doctor3');
const doctorId4 = getPersistentId('doctor4');
const doctorId5 = getPersistentId('doctor5');

// Generate some patient IDs
const patientId1 = getPersistentId('patient1');
const patientId2 = getPersistentId('patient2');
const patientId3 = getPersistentId('patient3');
const patientId4 = getPersistentId('patient4');
const patientId5 = getPersistentId('patient5');
const patientId6 = getPersistentId('patient6');

// Store the first patient ID for default access
if (typeof window !== 'undefined') {
  localStorage.setItem('defaultPatientId', patientId1);
}

// Define mock doctors
export const doctors: Doctor[] = [
  {
    id: doctorId1,
    firstName: 'Jean',
    lastName: 'Dupont',
    dateOfBirth: format(subYears(new Date(), 45), 'yyyy-MM-dd'),
    phoneNumber: '0123456789',
    email: 'jean.dupont@exemple.fr',
    address: '15 rue de la Médecine, 75001 Paris',
    licenseNumber: 'MD12345',
    specialty: DoctorSpecialty.GENERAL,
    isAlsoPatient: false
  },
  {
    id: doctorId2,
    firstName: 'Marie',
    lastName: 'Laurent',
    dateOfBirth: format(subYears(new Date(), 38), 'yyyy-MM-dd'),
    phoneNumber: '0123456790',
    email: 'marie.laurent@exemple.fr',
    address: '25 avenue de la Santé, 75008 Paris',
    licenseNumber: 'MD67890',
    specialty: DoctorSpecialty.SPECIALIST,
    specialistType: SpecialistType.CARDIOLOGY,
    isAlsoPatient: true,
    patientId: patientId5
  },
  {
    id: doctorId3,
    firstName: 'Pierre',
    lastName: 'Martin',
    dateOfBirth: format(subYears(new Date(), 52), 'yyyy-MM-dd'),
    phoneNumber: '0123456791',
    email: 'pierre.martin@exemple.fr',
    address: '8 rue des Soins, 75015 Paris',
    licenseNumber: 'MD24680',
    specialty: DoctorSpecialty.SPECIALIST,
    specialistType: SpecialistType.DERMATOLOGY,
    isAlsoPatient: false
  },
  {
    id: doctorId4,
    firstName: 'Sophie',
    lastName: 'Bernard',
    dateOfBirth: format(subYears(new Date(), 41), 'yyyy-MM-dd'),
    phoneNumber: '0123456792',
    email: 'sophie.bernard@exemple.fr',
    address: '42 boulevard Médical, 75006 Paris',
    licenseNumber: 'MD13579',
    specialty: DoctorSpecialty.GENERAL,
    isAlsoPatient: true,
    patientId: patientId6
  },
  {
    id: doctorId5,
    firstName: 'Michel',
    lastName: 'Petit',
    dateOfBirth: format(subYears(new Date(), 60), 'yyyy-MM-dd'),
    phoneNumber: '0123456793',
    email: 'michel.petit@exemple.fr',
    address: '5 place de la Clinique, 75016 Paris',
    licenseNumber: 'MD97531',
    specialty: DoctorSpecialty.SPECIALIST,
    specialistType: SpecialistType.OPHTHALMOLOGY,
    isAlsoPatient: false
  }
];

// Define mock patients
export const patients: Patient[] = [
  {
    id: patientId1,
    firstName: 'Lucie',
    lastName: 'Dubois',
    dateOfBirth: format(subYears(new Date(), 35), 'yyyy-MM-dd'),
    phoneNumber: '0678901234',
    email: 'lucie.dubois@exemple.fr',
    address: '10 rue du Patient, 75010 Paris',
    socialSecurityNumber: '1850123456789',
    primaryDoctorId: doctorId1
  },
  {
    id: patientId2,
    firstName: 'Thomas',
    lastName: 'Moreau',
    dateOfBirth: format(subYears(new Date(), 42), 'yyyy-MM-dd'),
    phoneNumber: '0678901235',
    email: 'thomas.moreau@exemple.fr',
    address: '22 avenue de l\'Assuré, 75011 Paris',
    socialSecurityNumber: '1780987654321',
    primaryDoctorId: doctorId1
  },
  {
    id: patientId3,
    firstName: 'Camille',
    lastName: 'Leroy',
    dateOfBirth: format(subYears(new Date(), 28), 'yyyy-MM-dd'),
    phoneNumber: '0678901236',
    email: 'camille.leroy@exemple.fr',
    address: '7 rue de la Santé, 75005 Paris',
    socialSecurityNumber: '1930123456789',
    primaryDoctorId: doctorId4
  },
  {
    id: patientId4,
    firstName: 'Antoine',
    lastName: 'Girard',
    dateOfBirth: format(subYears(new Date(), 50), 'yyyy-MM-dd'),
    phoneNumber: '0678901237',
    email: 'antoine.girard@exemple.fr',
    address: '18 boulevard des Malades, 75009 Paris',
    socialSecurityNumber: '1700123456789',
    primaryDoctorId: null
  },
  {
    id: patientId5, // This is also a doctor (doctorId2)
    firstName: 'Marie',
    lastName: 'Laurent',
    dateOfBirth: format(subYears(new Date(), 38), 'yyyy-MM-dd'),
    phoneNumber: '0123456790',
    email: 'marie.laurent@exemple.fr',
    address: '25 avenue de la Santé, 75008 Paris',
    socialSecurityNumber: '1820123456789',
    primaryDoctorId: doctorId1
  },
  {
    id: patientId6, // This is also a doctor (doctorId4)
    firstName: 'Sophie',
    lastName: 'Bernard',
    dateOfBirth: format(subYears(new Date(), 41), 'yyyy-MM-dd'),
    phoneNumber: '0123456792',
    email: 'sophie.bernard@exemple.fr',
    address: '42 boulevard Médical, 75006 Paris',
    socialSecurityNumber: '1800123456789',
    primaryDoctorId: doctorId1
  }
];

// Define relationships between patients (parent-child)
export const patientRelationships: PatientChild[] = [
  {
    id: uuidv4(),
    patientId: patientId1, // Lucie Dubois est le parent
    childPatientId: patientId3, // de Camille Leroy
    relationship: "Parent"
  }
];

// Mock authorization requests between doctors and patients
export const authorizationRequests: AuthorizationRequest[] = [
  {
    id: uuidv4(),
    doctorId: doctorId1,
    patientId: patientId2,
    requestDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    status: AuthorizationStatus.PENDING,
    verificationCode: '1234',
    codeExpiryDate: format(addMinutes(subDays(new Date(), 2), 15), 'yyyy-MM-dd HH:mm:ss')
  },
  {
    id: uuidv4(),
    doctorId: doctorId2,
    patientId: patientId1,
    requestDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    status: AuthorizationStatus.APPROVED,
    verificationCode: '5678',
    codeExpiryDate: format(addMinutes(subDays(new Date(), 5), 15), 'yyyy-MM-dd HH:mm:ss')
  }
];

// Create consultation IDs
const consultationId1 = getPersistentId('consultation1');
const consultationId2 = getPersistentId('consultation2');
const consultationId3 = getPersistentId('consultation3');
const consultationId4 = getPersistentId('consultation4');
const consultationId5 = getPersistentId('consultation5');

// Store the first consultation ID for default access
if (typeof window !== 'undefined') {
  localStorage.setItem('defaultConsultationId', consultationId1);
}

// Create medication IDs
const medicationId1 = getPersistentId('medication1');
const medicationId2 = getPersistentId('medication2');
const medicationId3 = getPersistentId('medication3');
const medicationId4 = getPersistentId('medication4');
const medicationId5 = getPersistentId('medication5');

// Define mock specialist referrals
export const specialistReferrals: SpecialistReferral[] = [
  {
    id: uuidv4(),
    consultationId: consultationId1,
    specialistType: SpecialistType.CARDIOLOGY,
    specialistId: doctorId2,
    reason: 'Suspicion d\'hypertension artérielle',
    isCompleted: true,
    completionDate: format(subDays(new Date(), 15), 'yyyy-MM-dd')
  },
  {
    id: uuidv4(),
    consultationId: consultationId2,
    specialistType: SpecialistType.OPHTHALMOLOGY,
    specialistId: doctorId5,
    reason: 'Baisse d\'acuité visuelle',
    isCompleted: false
  },
  {
    id: uuidv4(),
    consultationId: consultationId3,
    specialistType: SpecialistType.DERMATOLOGY,
    specialistId: doctorId3,
    reason: 'Examen de grains de beauté suspects',
    isCompleted: true,
    completionDate: format(subDays(new Date(), 5), 'yyyy-MM-dd')
  }
];

// Define mock medications
export const medications: Medication[] = [
  {
    id: medicationId1,
    name: 'Paracétamol',
    dosage: '500mg',
    frequency: '3 fois par jour',
    duration: '5 jours',
    instructions: 'À prendre pendant les repas'
  },
  {
    id: medicationId2,
    name: 'Amoxicilline',
    dosage: '1g',
    frequency: '2 fois par jour',
    duration: '7 jours',
    instructions: 'À prendre à jeun'
  },
  {
    id: medicationId3,
    name: 'Ibuprofène',
    dosage: '400mg',
    frequency: '3 fois par jour',
    duration: '3 jours',
    instructions: 'À prendre pendant les repas'
  },
  {
    id: medicationId4,
    name: 'Loratadine',
    dosage: '10mg',
    frequency: '1 fois par jour',
    duration: '15 jours',
    instructions: 'À prendre le matin'
  },
  {
    id: medicationId5,
    name: 'Oméprazole',
    dosage: '20mg',
    frequency: '1 fois par jour',
    duration: '30 jours',
    instructions: 'À prendre avant le petit déjeuner'
  }
];

// Create prescription IDs
const prescriptionId1 = getPersistentId('prescription1');
const prescriptionId2 = getPersistentId('prescription2');
const prescriptionId3 = getPersistentId('prescription3');
const prescriptionId4 = getPersistentId('prescription4');

// Store the first prescription ID for default access
if (typeof window !== 'undefined') {
  localStorage.setItem('defaultPrescriptionId', prescriptionId1);
}

// Define mock prescriptions
export const prescriptions: Prescription[] = [
  {
    id: prescriptionId1,
    consultationId: consultationId1,
    patientId: patientId1,
    doctorId: doctorId1,
    medications: [medications[0], medications[2]],
    date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: 'Traitement pour douleurs lombaires'
  },
  {
    id: prescriptionId2,
    consultationId: consultationId2,
    patientId: patientId2,
    doctorId: doctorId1,
    medications: [medications[1]],
    date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    notes: 'Traitement pour infection ORL'
  },
  {
    id: prescriptionId3,
    consultationId: consultationId3,
    patientId: patientId3,
    doctorId: doctorId4,
    medications: [medications[3]],
    date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    notes: 'Traitement pour allergie saisonnière'
  },
  {
    id: prescriptionId4,
    consultationId: consultationId4,
    patientId: patientId4,
    doctorId: doctorId1,
    medications: [medications[4]],
    date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    notes: 'Traitement pour reflux gastrique'
  }
];

// Define mock consultations
export const consultations: Consultation[] = [
  {
    id: consultationId1,
    patientId: patientId1,
    doctorId: doctorId1,
    date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: 'Douleurs lombaires suite à un effort physique. Prescription d\'antalgiques et d\'anti-inflammatoires. Référence vers un cardiologue pour vérifier l\'hypertension.',
    prescriptions: [prescriptions[0].id],
    specialistReferrals: [specialistReferrals[0]],
    reimbursementStatus: ReimbursementStatus.COMPLETED,
    reimbursementAmount: 25.0,
    reimbursementDate: format(subDays(new Date(), 25), 'yyyy-MM-dd')
  },
  {
    id: consultationId2,
    patientId: patientId2,
    doctorId: doctorId1,
    date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    notes: 'Infection ORL avec fièvre. Prescription d\'antibiotiques. Référence vers un ophtalmologue pour vérifier la baisse d\'acuité visuelle.',
    prescriptions: [prescriptions[1].id],
    specialistReferrals: [specialistReferrals[1]],
    reimbursementStatus: ReimbursementStatus.APPROVED,
    reimbursementAmount: 25.0,
    reimbursementDate: null
  },
  {
    id: consultationId3,
    patientId: patientId3,
    doctorId: doctorId4,
    date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    notes: 'Allergie saisonnière. Prescription d\'antihistaminiques. Référence vers un dermatologue pour examen de grains de beauté.',
    prescriptions: [prescriptions[2].id],
    specialistReferrals: [specialistReferrals[2]],
    reimbursementStatus: ReimbursementStatus.PENDING,
    reimbursementAmount: null,
    reimbursementDate: null
  },
  {
    id: consultationId4,
    patientId: patientId4,
    doctorId: doctorId1,
    date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    notes: 'Reflux gastrique. Prescription d\'inhibiteurs de la pompe à protons.',
    prescriptions: [prescriptions[3].id],
    specialistReferrals: [],
    reimbursementStatus: ReimbursementStatus.REJECTED,
    reimbursementAmount: null,
    reimbursementDate: format(subDays(new Date(), 5), 'yyyy-MM-dd')
  },
  {
    id: consultationId5,
    patientId: patientId5, // Doctor as patient
    doctorId: doctorId1,
    date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    notes: 'Consultation de routine. Pas de problèmes particuliers.',
    prescriptions: [],
    specialistReferrals: [],
    reimbursementStatus: ReimbursementStatus.PENDING,
    reimbursementAmount: null,
    reimbursementDate: null
  }
];

// Mock users for authentication
export const users: User[] = [
  {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@securite-sociale.fr',
    role: UserRole.ADMIN,
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    phoneNumber: '0611223344' // Added phone number
  },
  {
    id: uuidv4(),
    username: 'agent',
    email: 'agent@securite-sociale.fr',
    role: UserRole.SOCIAL_SECURITY_AGENT,
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
    phoneNumber: '0622334455' // Added phone number
  },
  {
    id: uuidv4(),
    username: 'jdupont',
    email: 'jean.dupont@exemple.fr',
    role: UserRole.DOCTOR,
    doctorId: doctorId1,
    profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
    phoneNumber: '0123456789' // Using doctor's phone number
  },
  {
    id: uuidv4(),
    username: 'mlaurent',
    email: 'marie.laurent@exemple.fr',
    role: UserRole.DOCTOR,
    doctorId: doctorId2,
    profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
    phoneNumber: '0123456790' // Using doctor's phone number
  },
  {
    id: uuidv4(),
    username: 'sbernard',
    email: 'sophie.bernard@exemple.fr',
    role: UserRole.DOCTOR,
    doctorId: doctorId4,
    profilePicture: 'https://randomuser.me/api/portraits/women/5.jpg',
    phoneNumber: '0123456792' // Using doctor's phone number
  },
  // Nouveaux utilisateurs patients
  {
    id: uuidv4(),
    username: 'ldubois',
    email: 'lucie.dubois@exemple.fr',
    role: UserRole.PATIENT,
    profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
    phoneNumber: '0678901234' // Using patient's phone number
  },
  {
    id: uuidv4(),
    username: 'tmoreau',
    email: 'thomas.moreau@exemple.fr',
    role: UserRole.PATIENT,
    profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg',
    phoneNumber: '0678901235' // Using patient's phone number
  },
  {
    id: uuidv4(),
    username: 'cleroy',
    email: 'camille.leroy@exemple.fr',
    role: UserRole.PATIENT,
    profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
    phoneNumber: '0678901236' // Using patient's phone number
  }
];
