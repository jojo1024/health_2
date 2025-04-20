import { v4 as uuidv4 } from 'uuid';
import { addMinutes, isAfter } from 'date-fns';
import {
  AuthorizationRequest,
  AuthorizationStatus,
  Patient
} from '../types';
import { authorizationRequests, patients } from '../data/mockData';

// Service pour gérer les demandes d'autorisation entre médecins et patients
export const AuthorizationService = {
  // Demander une autorisation d'accès au dossier d'un patient
  requestAuthorization: async (doctorId: string, patientPhoneNumber: string): Promise<{ success: boolean; message: string; authorizationId?: string }> => {
    try {
      // Vérifier si le patient existe
      const patient = patients.find(p => p.phoneNumber === patientPhoneNumber);
      if (!patient) {
        return { success: false, message: 'Aucun patient trouvé avec ce numéro de téléphone.' };
      }

      // Vérifier si une demande d'autorisation est déjà en cours
      const existingRequest = authorizationRequests.find(
        ar => ar.doctorId === doctorId &&
              ar.patientId === patient.id &&
              (ar.status === AuthorizationStatus.PENDING || ar.status === AuthorizationStatus.APPROVED)
      );

      if (existingRequest) {
        if (existingRequest.status === AuthorizationStatus.APPROVED) {
          return {
            success: true,
            message: 'Vous avez déjà une autorisation valide pour ce patient.',
            authorizationId: existingRequest.id
          };
        }

        return {
          success: false,
          message: 'Une demande d\'autorisation est déjà en cours pour ce patient.'
        };
      }

      // Générer un code à 4 chiffres
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Date d'expiration (15 minutes)
      const now = new Date();
      const codeExpiryDate = addMinutes(now, 15);

      // Créer la demande d'autorisation
      const newRequest: AuthorizationRequest = {
        id: uuidv4(),
        doctorId,
        patientId: patient.id,
        requestDate: new Date().toISOString(),
        status: AuthorizationStatus.PENDING,
        verificationCode,
        codeExpiryDate: codeExpiryDate.toISOString()
      };

      // Ajouter la demande à la liste
      authorizationRequests.push(newRequest);

      // Dans une application réelle, on enverrait le code par SMS ici
      console.log(`[SIMULATION] SMS envoyé au patient ${patient.phoneNumber} avec le code: ${verificationCode}`);

      return {
        success: true,
        message: `Une demande d'autorisation a été envoyée au patient. Un code de vérification a été envoyé au ${patientPhoneNumber}.`,
        authorizationId: newRequest.id
      };
    } catch (error) {
      console.error("Erreur lors de la demande d'autorisation:", error);
      return { success: false, message: 'Une erreur est survenue lors de la demande d\'autorisation.' };
    }
  },

  // Vérifier un code d'autorisation
  verifyAuthorizationCode: async (authorizationId: string, code: string): Promise<{ success: boolean; message: string; patientId?: string }> => {
    try {
      // Trouver la demande d'autorisation
      const authRequest = authorizationRequests.find(ar => ar.id === authorizationId);

      if (!authRequest) {
        return { success: false, message: 'Demande d\'autorisation introuvable.' };
      }

      // Vérifier si le code a expiré
      const now = new Date();
      const expiryDate = new Date(authRequest.codeExpiryDate);

      if (isAfter(now, expiryDate)) {
        // Mettre à jour le statut de la demande
        authRequest.status = AuthorizationStatus.EXPIRED;
        return { success: false, message: 'Le code a expiré. Veuillez faire une nouvelle demande.' };
      }

      // Vérifier le code
      if (authRequest.verificationCode !== code) {
        return { success: false, message: 'Code de vérification incorrect.' };
      }

      // Approuver la demande
      authRequest.status = AuthorizationStatus.APPROVED;

      return {
        success: true,
        message: 'Code vérifié avec succès. Vous avez maintenant accès au dossier du patient.',
        patientId: authRequest.patientId
      };
    } catch (error) {
      console.error("Erreur lors de la vérification du code:", error);
      return { success: false, message: 'Une erreur est survenue lors de la vérification du code.' };
    }
  },

  // Récupérer la liste des patients autorisés pour un médecin
  getAuthorizedPatients: async (doctorId: string): Promise<Patient[]> => {
    try {
      // Trouver toutes les demandes d'autorisation approuvées pour ce médecin
      const approvedRequests = authorizationRequests.filter(
        ar => ar.doctorId === doctorId && ar.status === AuthorizationStatus.APPROVED
      );

      // Récupérer les informations des patients correspondants
      const authorizedPatients = approvedRequests.map(ar => {
        return patients.find(p => p.id === ar.patientId);
      }).filter(Boolean) as Patient[];

      return authorizedPatients;
    } catch (error) {
      console.error("Erreur lors de la récupération des patients autorisés:", error);
      return [];
    }
  },

  // Vérifier si un médecin a l'autorisation d'accéder aux données d'un patient
  checkAuthorization: async (doctorId: string, patientId: string): Promise<boolean> => {
    try {
      // Vérifier si une autorisation valide existe
      const validAuthorization = authorizationRequests.some(
        ar => ar.doctorId === doctorId &&
              ar.patientId === patientId &&
              ar.status === AuthorizationStatus.APPROVED
      );

      return validAuthorization;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'autorisation:", error);
      return false;
    }
  }
};
