// Consultation.tsx - Avec intégration du système d'autorisation
import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
// import AuthDialog from '../components/AuthDialog';
import { useSelector } from 'react-redux';
import { fetchPatientConsultationById } from '../../redux/consultationSlice';
import { useAppDispatch } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import { PatientConsultations } from '../../types';
import DataTable, { Column } from '../components/DataTable';
import PatientConsultationDetailSlideOver from '../components/PatientConsultationDetailSlideOver';
import SearchBar from '../components/SearchBar';



const columnsData: Column<PatientConsultations>[] = [
  { label: 'Date consul.', render: p => new Date(p.dateConsultation).toLocaleDateString('fr-FR') },
  { label: 'Motif consul.', render: p => p.motifConsultation },
  { label: 'Nom médecin', render: p => `${p.nomSoignant} ${p.prenomSoignant}` },
];


const Consultation: React.FC = () => {

  const dispatch = useAppDispatch();
  const { patientConsultations, loading, error } = useSelector((state: RootState) => state.consultations);
  const idUtilisateur = useSelector((state: RootState) => state.auth.userInfo.user?.idUtilisateur);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedConsulationDetail, setSelectedConsulationDetail] = useState<PatientConsultations | null>(null)
  const [showPatientConsultationDetail, setShowPatientConsultationDetail] = useState(false);



  // Fonctions qui nécessitent une authentification
  // Ces fonctions vont initialiser le processus d'authentification

  // Fonction pour voir les détails d'un patient
  const handleViewConsultationDetails = (consultation: PatientConsultations) => {
    // Demander l'authentification
    setSelectedConsulationDetail(consultation);
    setShowPatientConsultationDetail(true);
  };


  const renderActions = (p: PatientConsultations) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewConsultationDetails(p)}
        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
      >
        Détails
      </button>
    </div>
  );

  // Filtrer les patients en fonction du terme de recherche
  const filtredConsultations = patientConsultations.filter(consultation =>
    consultation.nomSoignant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.prenomPatient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultation.motifConsultation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchPatientConsultationById(idUtilisateur || 0));
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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Consultation</h1>
          <p className="text-gray-500 mt-1">Liste de toutes les consultations</p>
        </div>

      </header>

      <Card>
        <div className="mb-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <DataTable
          items={filtredConsultations}
          columns={columnsData}
          itemsPerPage={5}
          renderActions={renderActions}
          noDataText="Aucune consultation trouvée"
        />
      </Card>

      {
        showPatientConsultationDetail && selectedConsulationDetail && (
          <PatientConsultationDetailSlideOver
            isOpen={showPatientConsultationDetail}
            onClose={() => {
              setShowPatientConsultationDetail(false);
            }}
            // @ts-ignore
            consultationDetail={selectedConsulationDetail}
          // onEdit={handleEditPatient}
          // onDelete={handleInitiateDelete}
          // onNewConsultation={handleNewConsultation}
          />
        )

      }


    </div>
  );
};

export default Consultation;