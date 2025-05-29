import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
// import AuthDialog from '../components/AuthDialog';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable, { Column } from '../components/DataTable';
import NewConsultationModal from '../components/NewConsultationModal';
import PatientConsultationDetailSlideOver from '../components/PatientConsultationDetailSlideOver';
import SearchBar from '../components/SearchBar';
import PatientDetailSlideOver2 from '../components/PatientDetailSlideOver2';
import { useAppDispatch } from '../../redux/hooks';
import { fetchConsultations } from '../../redux/consultationSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ConsultationRegroupee, Patient, PatientAvecConsultations } from '../../types';
import AuthDialog from '../components/AuthDialog';
import Notification from '../../components/Notification';


const columnsData: Column<PatientAvecConsultations>[] = [
  { label: 'Num.', render: p => p.idPatient },
  { label: 'Nom patient', render: p => `${p.nomPatient} ${p.prenomPatient}` },
  { label: 'Adresse', render: p => p.adressePatient },
  { label: 'Date nais.', render: p => new Date(p.dateNaisPatient).toLocaleDateString('fr-FR') },
];

// Type pour stocker les actions en attente après authentification
type PendingAction = {
  type: 'viewDetails' | 'edit' | 'delete' | 'newConsultation' | 'viewConsultationDetails';
  idPatient: number;
  data?: PatientAvecConsultations;
};

const Consultation: React.FC = () => {

  const dispatch = useAppDispatch();
  const { consultations, loading, error } = useSelector((state: RootState) => state.consultations);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<number | null>(null);
  const [selectedConsulationDetail, setSelectedConsulationDetail] = useState<ConsultationRegroupee | null>(null)
  console.log("🚀 ~ selectedConsulationDetail:", selectedConsulationDetail)
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewConsultationModal, setShowNewConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<PatientAvecConsultations | null>(null);
  console.log("🚀 ~ selectedConsultation:", selectedConsultation)
  const [showConsultationDetail, setShowPatientDetail] = useState(false);
  const [showPatientConsultationDetail, setShowPatientConsultationDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientAvecConsultations | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<number | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Nouvel état pour gérer les actions en attente après authentification
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Fermeture du dialogue d'authentification
  const closeDialog = () => {
    setShowDialog(false);
    setSelectedConsultationId(null);
    // Réinitialiser l'action en attente si l'utilisateur annule
    setPendingAction(null);
  };

  // Gestion de la réussite de l'authentification
  const handleAuthSuccess = (patient: Patient) => {
    // Exécuter l'action en attente après authentification réussie
    setPatient(patient);
    if (pendingAction) {
      switch (pendingAction.type) {
        case 'viewDetails':
          if (pendingAction.data) {
            executeViewPatientDetails(pendingAction.data);
          }
          break;
        case 'edit':
          if (pendingAction.data) {
            executeEditPatient(pendingAction.data);
          }
          break;
        case 'delete':
          executeInitiateDelete(pendingAction.idPatient);
          break;
        case 'newConsultation':
          executeNewConsultation(pendingAction.idPatient);
          break;
        case 'viewConsultationDetails':
          executeViewPatientConsultationDetails();
          break;
      }

      // Réinitialiser l'action en attente
      setPendingAction(null);
    }
  };

  const closeDetailSlideOver = () => {
    setShowPatientDetail(false);
    setSelectedConsultation(null);
  };

  // Fonctions d'exécution après authentification
  const executeViewPatientDetails = (consultation: PatientAvecConsultations) => {
    setSelectedConsultation(consultation);
    setShowPatientDetail(true);
  };

  const executeEditPatient = (consultation: PatientAvecConsultations) => {
    setPatientToEdit(consultation);
    setIsEditMode(true);
    setShowNewPatientModal(true);
  };

  const executeInitiateDelete = (id: number) => {
    setConsultationToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const executeNewConsultation = (idPatient: number) => {
    setSelectedConsultationId(idPatient);
    setShowNewConsultationModal(true);
  };

  const executeViewPatientConsultationDetails = () => {
    setShowPatientConsultationDetail(true);
  };

  // Fonctions qui nécessitent une authentification
  // Ces fonctions vont initialiser le processus d'authentification

  // Fonction pour voir les détails d'un patient
  const handleViewConsultationDetails = (consultation: PatientAvecConsultations) => {
    // Stocker l'action à exécuter après authentification
    setPendingAction({
      type: 'viewDetails',
      idPatient: consultation.idPatient,
      data: consultation
    });

    // Demander l'authentification
    setSelectedConsultationId(consultation.idPatient);
    setShowDialog(true);
  };

  // Fonction pour voir les détails de consultation d'un patient
  const handleViewPatientConsulationDetails = (data: ConsultationRegroupee) => {
    if (selectedConsultation) {
      setPendingAction({
        type: 'viewConsultationDetails',
        idPatient: selectedConsultation.idPatient
      });
      setSelectedConsulationDetail(data);
      setSelectedConsultationId(selectedConsultation.idPatient);
      setShowPatientConsultationDetail(true);
    }
  };

  // Fonction pour modifier un patient
  const handleEditPatient = (consultation: PatientAvecConsultations) => {
    setPendingAction({
      type: 'edit',
      idPatient: consultation.idPatient,
      data: consultation
    });

    setSelectedConsultationId(consultation.idPatient);
    setShowDialog(true);
  };

  // Fonction pour initier la suppression d'un patient
  const handleInitiateDelete = (consultation: PatientAvecConsultations) => {
    setPendingAction({
      type: 'delete',
      idPatient: consultation.idPatient,
      data: consultation
    });

    setSelectedConsultationId(consultation.idPatient);
    setShowDialog(true);
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = () => {
    if (consultationToDelete) {
      // setPatientData(patientData.filter(p => p.id !== consultationToDelete));
      setShowDeleteConfirmModal(false);

      // Si le patient supprimé était sélectionné, fermer les détails
      if (selectedConsultation && selectedConsultation.idPatient === consultationToDelete) {
        closeDetailSlideOver();
      }

      setConsultationToDelete(null);
    }
  };

  // Fonction pour démarrer une nouvelle consultation
  const handleNewConsultation = (idPatient: number) => {
    setPendingAction({
      type: 'newConsultation',
      idPatient
    });

    setSelectedConsultationId(idPatient);
    setShowDialog(true);
  };

  const renderActions = (p: PatientAvecConsultations) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewConsultationDetails(p)}
        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
      >
        Détails
      </button>
      <button
        onClick={() => handleEditPatient(p)}
        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
      >
        <PencilIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleInitiateDelete(p)}
        className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
      >
        <TrashIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );

  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = consultations.filter(patient =>
    patient.nomPatient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.prenomPatient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.adressePatient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchConsultations());
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Consultation</h1>
          <p className="text-gray-500 mt-1">Gérez tous les consultations</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => {
              setIsEditMode(false);
              setPatientToEdit(null);
              setSelectedConsultationId(1);
              setShowDialog(true);
              setPendingAction({
                type: 'newConsultation',
                idPatient: 1
              });
            }}
            disabled={loading}
          >
            Nouvelle consultation
          </Button>
        </div>
      </header>

      <Card>
        <div className="mb-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <DataTable
          items={filteredPatients}
          columns={columnsData}
          itemsPerPage={5}
          renderActions={renderActions}
          noDataText="Aucune consultation trouvée"
        />
      </Card>

      {/* Dialog d'authentification - passez l'événement onAuthorized pour traiter le succès */}
      {showDialog && selectedConsultationId !== null && (
        <AuthDialog
          telephoneUtilisateur={pendingAction?.data?.telephonePatient || ""}
          onClose={closeDialog}
          onAuthorized={handleAuthSuccess}
        />
      )}

      {showConsultationDetail && selectedConsultation && (
        <PatientDetailSlideOver2
          isOpen={showConsultationDetail}
          onClose={closeDetailSlideOver}
          consultation={selectedConsultation}
          // onEdit={handleEditPatient}
          // onDelete={handleInitiateDelete}
          onNewConsultation={handleNewConsultation}
          onOpenConsultationDetail={handleViewPatientConsulationDetails}
        />
      )}

      <PatientConsultationDetailSlideOver
        isOpen={showPatientConsultationDetail}
        onClose={() => {
          setShowPatientConsultationDetail(false);
          setShowPatientDetail(true)
        }}
        consultationDetail={selectedConsulationDetail}
      // onEdit={handleEditPatient}
      // onDelete={handleInitiateDelete}
      // onNewConsultation={handleNewConsultation}
      />

      {showNewConsultationModal && patient && (
        <NewConsultationModal
          isOpen={showNewConsultationModal}
          onClose={() => setShowNewConsultationModal(false)}
          patientId={selectedConsultationId?.toString() || ""}
          patient={patient}
          onSuccess={(message) => {
            setNotification({
              message,
              type: 'success'
            });
            setShowNewConsultationModal(false);
          }}
          onError={(message) => {
            setNotification({
              message,
              type: 'error'
            });
          }}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le patient"
        message={`Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible et toutes les données associées seront perdues.`}
        isSubmitting={isSubmitting}

      />
    </div>
  );
};

export default Consultation;