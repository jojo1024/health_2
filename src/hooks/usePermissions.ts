import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface PermissionSet {
  canViewPatients: boolean;
  canCreatePatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;

  canViewDoctors: boolean;
  canCreateDoctors: boolean;
  canEditDoctors: boolean;
  canDeleteDoctors: boolean;

  canViewConsultations: boolean;
  canCreateConsultations: boolean;
  canEditConsultations: boolean;
  canDeleteConsultations: boolean;

  canViewPrescriptions: boolean;
  canCreatePrescriptions: boolean;
  canEditPrescriptions: boolean;
  canDeletePrescriptions: boolean;

  canViewReimbursements: boolean;
  canProcessReimbursements: boolean;

  canRequestPatientAccess: boolean;
  canViewAllPatientData: boolean;

  canViewOwnData: boolean;
  canManageChildren: boolean;
}

const usePermissions = (): PermissionSet => {
  const { user } = useAuth();

  // Définition des permissions par défaut (aucun droit)
  const defaultPermissions: PermissionSet = {
    canViewPatients: false,
    canCreatePatients: false,
    canEditPatients: false,
    canDeletePatients: false,

    canViewDoctors: false,
    canCreateDoctors: false,
    canEditDoctors: false,
    canDeleteDoctors: false,

    canViewConsultations: false,
    canCreateConsultations: false,
    canEditConsultations: false,
    canDeleteConsultations: false,

    canViewPrescriptions: false,
    canCreatePrescriptions: false,
    canEditPrescriptions: false,
    canDeletePrescriptions: false,

    canViewReimbursements: false,
    canProcessReimbursements: false,

    canRequestPatientAccess: false,
    canViewAllPatientData: false,

    canViewOwnData: false,
    canManageChildren: false
  };

  // Si l'utilisateur n'est pas connecté, retourner les permissions par défaut
  if (!user) {
    return defaultPermissions;
  }

  // Définition des permissions selon le rôle
  switch (user.role) {
    case UserRole.ADMIN:
      // L'admin a accès à tout sauf la création/modification de consultations et prescriptions
      return {
        ...defaultPermissions,
        canViewPatients: true,
        canCreatePatients: true,
        canEditPatients: true,
        canDeletePatients: true,

        canViewDoctors: true,
        canCreateDoctors: true,
        canEditDoctors: true,
        canDeleteDoctors: true,

        canViewConsultations: true,
        canCreateConsultations: false, // L'admin ne crée pas de consultations
        canEditConsultations: false, // L'admin ne modifie pas les consultations
        canDeleteConsultations: true,

        canViewPrescriptions: true,
        canCreatePrescriptions: false, // L'admin ne crée pas de prescriptions
        canEditPrescriptions: false, // L'admin ne modifie pas les prescriptions
        canDeletePrescriptions: true,

        canViewReimbursements: true,
        canProcessReimbursements: true,

        canViewAllPatientData: true,
        canRequestPatientAccess: false,
      };

    case UserRole.DOCTOR:
      // Le médecin peut consulter les patients autorisés et créer des consultations/prescriptions
      return {
        ...defaultPermissions,
        canViewPatients: true, // Peut voir la liste mais accès détaillé contrôlé par les autorisations
        canCreatePatients: false,
        canEditPatients: false,
        canDeletePatients: false,

        canViewDoctors: true,
        canCreateDoctors: false,
        canEditDoctors: false,
        canDeleteDoctors: false,

        canViewConsultations: true, // Peut voir ses propres consultations
        canCreateConsultations: true,
        canEditConsultations: true, // Peut modifier ses propres consultations
        canDeleteConsultations: false,

        canViewPrescriptions: true, // Peut voir ses propres prescriptions
        canCreatePrescriptions: true,
        canEditPrescriptions: true, // Peut modifier ses propres prescriptions
        canDeletePrescriptions: false,

        canViewReimbursements: false,
        canProcessReimbursements: false,

        canRequestPatientAccess: true, // Peut demander l'accès au dossier d'un patient
        canViewAllPatientData: false,

        canViewOwnData: true, // Si le médecin est aussi un patient
      };

    case UserRole.PATIENT:
      // Le patient peut consulter ses propres données et celles de ses enfants
      return {
        ...defaultPermissions,
        canViewPatients: false,
        canCreatePatients: false,
        canEditPatients: false,
        canDeletePatients: false,

        canViewDoctors: true, // Peut voir la liste des médecins
        canCreateDoctors: false,
        canEditDoctors: false,
        canDeleteDoctors: false,

        canViewConsultations: true, // Peut voir ses propres consultations
        canCreateConsultations: false,
        canEditConsultations: false,
        canDeleteConsultations: false,

        canViewPrescriptions: true, // Peut voir ses propres prescriptions
        canCreatePrescriptions: false,
        canEditPrescriptions: false,
        canDeletePrescriptions: false,

        canViewReimbursements: true, // Peut voir ses propres remboursements
        canProcessReimbursements: false,

        canRequestPatientAccess: false,
        canViewAllPatientData: false,

        canViewOwnData: true,
        canManageChildren: true, // Peut gérer ses enfants
      };

    case UserRole.SOCIAL_SECURITY_AGENT:
      // L'agent de sécu peut voir les remboursements mais pas les consultations détaillées
      return {
        ...defaultPermissions,
        canViewPatients: true,
        canCreatePatients: false,
        canEditPatients: true,
        canDeletePatients: false,

        canViewDoctors: true,
        canCreateDoctors: false,
        canEditDoctors: true,
        canDeleteDoctors: false,

        canViewConsultations: true, // Limité aux informations administratives
        canCreateConsultations: false,
        canEditConsultations: false,
        canDeleteConsultations: false,

        canViewPrescriptions: false,
        canCreatePrescriptions: false,
        canEditPrescriptions: false,
        canDeletePrescriptions: false,

        canViewReimbursements: true,
        canProcessReimbursements: true,

        canRequestPatientAccess: false,
        canViewAllPatientData: false,
      };

    default:
      return defaultPermissions;
  }
};

export default usePermissions;
