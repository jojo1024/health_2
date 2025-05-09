// Types
export enum ReimbursementStatus {
    COMPLETED = 'COMPLETED',
    APPROVED = 'APPROVED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    PARTIAL = 'PARTIAL'
  }
  
  export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
  }
  
  export interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  }
  
  export interface Consultation {
    id: string;
    patientId: string;
    doctorId: string;
    date: string;
    reimbursementStatus: ReimbursementStatus;
    amount: number;
  }
  
  // Mock data
  export const MOCK_PATIENTS: Patient[] = [
    { id: '1', firstName: 'Jean', lastName: 'Dupont' },
    { id: '2', firstName: 'Marie', lastName: 'Martin' },
    { id: '3', firstName: 'Sophie', lastName: 'Leclerc' },
    { id: '4', firstName: 'Pierre', lastName: 'Dubois' },
    { id: '5', firstName: 'Émilie', lastName: 'Bernard' },
  ];
  
  export const MOCK_DOCTORS: Doctor[] = [
    { id: '1', firstName: 'Antoine', lastName: 'Petit', specialty: 'Généraliste' },
    { id: '2', firstName: 'Claire', lastName: 'Robert', specialty: 'Cardiologue' },
    { id: '3', firstName: 'Michel', lastName: 'Leroy', specialty: 'Pédiatre' },
  ];
  
  export const MOCK_CONSULTATIONS: Consultation[] = [
    { id: '1', patientId: '1', doctorId: '1', date: '2025-04-20', reimbursementStatus: ReimbursementStatus.COMPLETED, amount: 25 },
    { id: '2', patientId: '2', doctorId: '2', date: '2025-04-18', reimbursementStatus: ReimbursementStatus.APPROVED, amount: 60 },
    { id: '3', patientId: '3', doctorId: '3', date: '2025-04-15', reimbursementStatus: ReimbursementStatus.PENDING, amount: 35 },
    { id: '4', patientId: '4', doctorId: '1', date: '2025-04-10', reimbursementStatus: ReimbursementStatus.REJECTED, amount: 25 },
    { id: '5', patientId: '5', doctorId: '2', date: '2025-04-08', reimbursementStatus: ReimbursementStatus.PARTIAL, amount: 75 },
    { id: '6', patientId: '1', doctorId: '3', date: '2025-04-05', reimbursementStatus: ReimbursementStatus.PENDING, amount: 40 },
    { id: '7', patientId: '2', doctorId: '1', date: '2025-04-01', reimbursementStatus: ReimbursementStatus.COMPLETED, amount: 25 },
  ];