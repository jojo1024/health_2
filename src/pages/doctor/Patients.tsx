import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Card from '../../components/Card';
import { useAppDispatch } from '../../redux/hooks';
import { deletePatient, fetchPatients, fetchPatientsByMedecinId } from '../../redux/patientSlice';
import { RootState } from '../../redux/store';
import { Patient } from '../../types';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import DataTable, { Column } from '../components/DataTable';
import PatientDetailSlideOver from '../components/PatientDetailSlideOver';
import SearchBar from '../components/SearchBar';

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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);



  const closeDetailSlideOver = () => {
    setShowPatientDetail(false);
    setSelectedPatient(null);
  };

  // Fonction pour ouvrir les détails d'un patient
  const handleViewPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  // Fonction pour confirmer la suppression d'un patient
  const handleConfirmDelete = () => {
    if (patientToDelete) {
      dispatch(deletePatient(patientToDelete));
      // setPatientData(patientData.filter(p => p.idPatient !== patientToDelete));
      setShowDeleteConfirmModal(false);
      closeDetailSlideOver();

      // Si le patient supprimé était sélectionné, fermer les détails
      // if (selectedPatient && selectedPatient.idPatient === patientToDelete) {
      //   closeDetailSlideOver();
      // }

      setPatientToDelete(null);
    }
  };


  const renderActions = (p: Patient) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewPatientDetails(p)}
        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
      >
        Détails
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



  // Fonction pour obtenir une clé unique pour chaque patient
  const getPatientKey = (patient: Patient) => patient.idPatient;

  useEffect(() => {
    dispatch(fetchPatientsByMedecinId(idUtilisateur || 0));
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-gray-500 mt-1">Gérez tous les patients enregistrés</p>
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

      {showPatientDetail && selectedPatient && (
        <PatientDetailSlideOver
          isOpen={showPatientDetail}
          onClose={closeDetailSlideOver}
          patient={selectedPatient}
          onEdit={() => null}
          onDelete={() => null}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le patient"
        message={`Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible et toutes les données associées seront perdues.`}
      />
    </div>
  );
};

export default Patients;