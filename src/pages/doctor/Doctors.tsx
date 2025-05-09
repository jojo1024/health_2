import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import DataTable, { Column } from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import NewDoctorModal from '../components/NewDoctorModal';
import DoctorDetailSlideOver from '../components/DoctorDetailSlideOver';
import { Doctor } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { createDoctor, deleteDoctor, fetchDoctors, updateDoctor } from '../../redux/doctorSlice';

// Définition des colonnes pour le tableau
const columnsData: Column<Doctor>[] = [
  { label: 'Num.', render: d => d.idPersSoignant },
  { label: 'Nom', render: d => `${d.nomUtilisateur} ${d.prenomUtilisateur}` },
  { label: 'Spécialité', render: d => d.specPersSoignant },
  { label: 'Téléphone', render: d => d.telephoneUtilisateur },
];



const Doctors: React.FC = () => {

  const dispatch = useAppDispatch();
  const { doctors, loading, error } = useSelector((state: RootState) => state.doctors);
  console.log("🚀 ~ doctors>>>>>>><:", doctors)

  const [searchTerm, setSearchTerm] = useState<string>('');
  // const [doctorData, setDoctorData] = useState<Doctor[]>(doctors);
  const [showNewDoctorModal, setShowNewDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDoctorDetail, setShowDoctorDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);



  const closeDetailSlideOver = () => {
    setShowDoctorDetail(false);
    setSelectedDoctor(null);
  };

  // Fonction pour ajouter un nouveau médecin
  const handleSaveDoctor = (formData: Doctor) => {
    dispatch(createDoctor(formData))
  };

  // Fonction pour ouvrir les détails d'un médecin
  const handleViewDoctorDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetail(true);
  };

  // Fonction pour modifier un médecin
  const handleEditDoctor = (doctor: Doctor) => {
    setDoctorToEdit(doctor);
    setIsEditMode(true);
    setShowNewDoctorModal(true);
  };

  // Fonction pour initier la suppression d'un médecin
  const handleInitiateDelete = (id: string) => {
    setDoctorToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  // Fonction pour confirmer la suppression d'un médecin
  const handleConfirmDelete = () => {
    if (doctorToDelete) {

      dispatch(deleteDoctor(doctorToDelete));
      setShowDeleteConfirmModal(false);

      // Si le médecin supprimé était sélectionné, fermer les détails
      if (selectedDoctor && selectedDoctor.idPersSoignant === doctorToDelete) {
        closeDetailSlideOver();
      }

      setDoctorToDelete(null);
    }
  };

  // Fonction pour mettre à jour un médecin existant
  const handleUpdateDoctor = (updatedDoctorData: Doctor) => {
    if (!doctorToEdit) return;

    const updatedDoctor: Doctor = {
      ...doctorToEdit,
      ...updatedDoctorData,
    };

    dispatch(updateDoctor({ data: updatedDoctor }));


    // Si ce médecin était sélectionné dans le SlideOver, mettre à jour les détails
    if (selectedDoctor && selectedDoctor.idPersSoignant === doctorToEdit.idPersSoignant) {
      setSelectedDoctor(updatedDoctor);
    }

    setDoctorToEdit(null);
    setIsEditMode(false);
  };

  const renderActions = (d: Doctor) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewDoctorDetails(d)}
        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
      >
        Détails
      </button>
    </div>
  );

  // Filtrer les médecins en fonction du terme de recherche
  const filteredDoctors = doctors.filter(doctor =>
    doctor.nomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.prenomUtilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.telephoneUtilisateur.includes(searchTerm) ||
    doctor.specPersSoignant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le save/update en fonction du mode
  const handleSaveOrUpdateDoctor = (formData: Doctor) => {
    if (isEditMode && doctorToEdit) {
      handleUpdateDoctor(formData);
    } else {
      handleSaveDoctor(formData);
    }

    setShowNewDoctorModal(false);
  };

  // Fermer modal et réinitialiser mode d'édition
  const handleCloseModal = () => {
    setShowNewDoctorModal(false);
    setIsEditMode(false);
    setDoctorToEdit(null);
  };

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  return (
    <div className="space-y-6 p-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Médecins</h1>
          <p className="text-gray-500 mt-1">Gérez tous les médecins enregistrés</p>
        </div>

      </header>

      <Card>
        <div className="mb-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        {
          loading && <p className="text-center text-gray-500">Chargement des patients...</p>
        }
        {
          error && <p className="text-red-500 text-center">{error}</p>
        }
        <DataTable
          items={filteredDoctors}
          columns={columnsData}
          itemsPerPage={5}
          renderActions={renderActions}
          noDataText="Aucun médecin trouvé"
        />
      </Card>

      {showNewDoctorModal && (
        <NewDoctorModal
          isOpen={showNewDoctorModal}
          onSave={handleSaveOrUpdateDoctor}
          onClose={handleCloseModal}
          initialData={isEditMode && doctorToEdit ? doctorToEdit : undefined}
          isEditMode={isEditMode}
        />
      )}

      {showDoctorDetail && selectedDoctor && (
        <DoctorDetailSlideOver
          isOpen={showDoctorDetail}
          onClose={closeDetailSlideOver}
          doctor={selectedDoctor}
          onEdit={handleEditDoctor}
          onDelete={handleInitiateDelete}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer le médecin"
        message={`Êtes-vous sûr de vouloir supprimer ce médecin ? Cette action est irréversible et toutes les données associées seront perdues.`}
      />
    </div>
  );
};

export default Doctors;