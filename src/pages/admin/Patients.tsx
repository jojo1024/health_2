import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useAppDispatch } from '../../redux/hooks';
import { createPatient, deletePatient, fetchPatients, updatePatient } from '../../redux/patientSlice';
import { RootState } from '../../redux/store';
import { Patient } from '../../types';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable, { Column } from '../components/DataTable';
import NewPatientModal from '../components/NewPatientModal';
import PatientDetailSlideOver from '../components/PatientDetailSlideOver';
import SearchBar from '../components/SearchBar';
import Notification from '../../components/Notification';

const columnsData: Column<Patient>[] = [
  { label: 'Num.', render: p => p.idPatient },
  { label: 'Nom', render: p => `${p.nomUtilisateur} ${p.prenomUtilisateur}` },
  { label: 'Date de nais.', render: p => new Date(p.dateNaisPatient).toLocaleDateString('fr-FR') },
  { label: 'Ethnie', render: p => p.ethniePatient },
  { label: 'G.S', render: p => p.groupeSanguinPatient },
  { label: 'Adresse', render: p => p.adressePatient },
];

const Patients: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients, loading, error } = useSelector((state: RootState) => state.patients);
  const idUtilisateur = useSelector((state: RootState) => state.auth.userInfo.user?.idUtilisateur);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDetailSlideOver = () => {
    setShowPatientDetail(false);
    setSelectedPatient(null);
  };

  // Fonction pour ajouter un nouveau patient
  const handleSavePatient = (formData: Patient) => {
    dispatch(createPatient(formData))
      .unwrap()
      .then(() => {
        setNotification({
          message: 'Patient ajouté avec succès',
          type: 'success'
        });
        setShowNewPatientModal(false);
      })
      .catch(() => {
        setNotification({
          message: 'Erreur lors de l\'ajout du patient',
          type: 'error'
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Fonction pour ouvrir les détails d'un patient
  const handleViewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  // Fonction pour modifier un patient
  const handleEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsEditMode(true);
    setShowNewPatientModal(true);
  };

  // Fonction pour initier la suppression d'un patient
  const handleInitiateDelete = (idPatient: string) => {
    setPatientToDelete(idPatient);
    setShowDeleteConfirmModal(true);
  };

  // Fonction pour confirmer la suppression d'un patient
  const handleConfirmDelete = () => {
    if (patientToDelete) {
      setIsSubmitting(true);
      dispatch(deletePatient(patientToDelete))
        .unwrap()
        .then(() => {
          setNotification({
            message: 'Patient supprimé avec succès',
            type: 'success'
          });
          setShowDeleteConfirmModal(false);
          closeDetailSlideOver();
          setPatientToDelete(null);
        })
        .catch(() => {
          setNotification({
            message: 'Erreur lors de la suppression du patient',
            type: 'error'
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  // Fonction pour mettre à jour un patient existant
  const handleUpdatePatient = (updatedPatientData: Patient) => {
    if (!patientToEdit) return;

    const updatedPatient: Patient = {
      ...patientToEdit,
      ...updatedPatientData
    };

    dispatch(updatePatient({ data: updatedPatient }))
      .unwrap()
      .then(() => {
        setNotification({
          message: 'Patient mis à jour avec succès',
          type: 'success'
        });
        if (selectedPatient && selectedPatient.idPatient === patientToEdit.idPatient) {
          setSelectedPatient(updatedPatient);
        }
        setPatientToEdit(null);
        setIsEditMode(false);
        setShowNewPatientModal(false);
      })
      .catch(() => {
        setNotification({
          message: 'Erreur lors de la mise à jour du patient',
          type: 'error'
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const renderActions = (p: Patient) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewPatientDetails(p)}
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
        onClick={() => handleInitiateDelete(p.idPatient)}
        className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
      >
        <TrashIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );

  // Filtrer les patients en fonction du terme de recherche
  const filteredPatients = patients.filter(patient =>
    patient.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.prenomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telephoneUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.ethniePatient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.adressePatient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.groupeSanguinPatient && patient.groupeSanguinPatient.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Gérer le save/update en fonction du mode
  const handleSaveOrUpdatePatient = (formData: Patient) => {
    setIsSubmitting(true);
    if (isEditMode && patientToEdit) {
      handleUpdatePatient(formData);
    } else {
      handleSavePatient(formData);
    }
  };

  // Fermer modal et réinitialiser mode d'édition
  const handleCloseModal = () => {
    setShowNewPatientModal(false);
    setIsEditMode(false);
    setPatientToEdit(null);
  };

  // Fonction pour obtenir une clé unique pour chaque patient
  const getPatientKey = (patient: Patient) => patient.idPatient;

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

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
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-gray-500 mt-1">Gérez tous les patients enregistrés</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => {
            setIsEditMode(false);
            setPatientToEdit(null);
            setShowNewPatientModal(true);
          }}>
            Nouveau Patient
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
          noDataText="Aucun patient trouvé"
          getItemKey={getPatientKey}
        />
      </Card>

      {showNewPatientModal && (
        <NewPatientModal
          isOpen={showNewPatientModal}
          onSave={handleSaveOrUpdatePatient}
          onClose={handleCloseModal}
          initialData={isEditMode && patientToEdit ? patientToEdit : undefined}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
        />
      )}

      {showPatientDetail && selectedPatient && (
        <PatientDetailSlideOver
          isOpen={showPatientDetail}
          onClose={closeDetailSlideOver}
          patient={selectedPatient}
          onEdit={handleEditPatient}
          onDelete={handleInitiateDelete}
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

export default Patients;