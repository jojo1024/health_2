import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { patients, doctors, consultations } from '../data/mockData';
import { Patient, Consultation } from '../types';

// Récupérer l'ID du patient par défaut depuis le localStorage
const getDefaultPatientId = () => {
  return localStorage.getItem('defaultPatientId') || patients[0]?.id || "";
};

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [primaryDoctor, setPrimaryDoctor] = useState<string>('Non assigné');
  const [patientConsultations, setPatientConsultations] = useState<Consultation[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    address: '',
    socialSecurityNumber: '',
    primaryDoctorId: ''
  });

  // Debug helper
  useEffect(() => {
    console.log("PatientDetails mounted, ID:", id);
    console.log("Available patient IDs:", patients.map(p => p.id));

    // Si aucun ID n'est fourni dans l'URL, rediriger vers la liste
    if (!id) {
      console.warn("No ID provided, redirecting to patients list");
      navigate('/patients');
      return;
    }

    return () => {
      console.log("PatientDetails unmounted");
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Simuler un délai de chargement pour s'assurer que le state est correctement mis à jour
    setTimeout(() => {
      // Find patient
      const foundPatient = patients.find(p => p.id === id);

      console.log("Found patient:", foundPatient);

      if (foundPatient) {
        setPatient(foundPatient);

        // Préparer le formulaire d'édition
        setEditForm({
          firstName: foundPatient.firstName,
          lastName: foundPatient.lastName,
          dateOfBirth: foundPatient.dateOfBirth,
          phoneNumber: foundPatient.phoneNumber,
          email: foundPatient.email,
          address: foundPatient.address,
          socialSecurityNumber: foundPatient.socialSecurityNumber,
          primaryDoctorId: foundPatient.primaryDoctorId || ''
        });

        // Find primary doctor
        if (foundPatient.primaryDoctorId) {
          const doctor = doctors.find(d => d.id === foundPatient.primaryDoctorId);
          if (doctor) {
            setPrimaryDoctor(`Dr. ${doctor.firstName} ${doctor.lastName}`);
          }
        }

        // Find consultations
        const foundConsultations = consultations
          .filter(c => c.patientId === id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setPatientConsultations(foundConsultations);
      } else {
        console.error(`Patient with ID ${id} not found`);

        // Tenter de rediriger vers le patient par défaut
        const defaultPatientId = getDefaultPatientId();
        if (defaultPatientId && defaultPatientId !== id) {
          console.log(`Redirecting to default patient: ${defaultPatientId}`);
          navigate(`/patients/${defaultPatientId}`, { replace: true });
        }
      }

      setLoading(false);
    }, 300);  // Petit délai pour s'assurer que les données sont chargées
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Dans une application réelle, ceci serait un appel API
    // Pour la démo, nous allons simplement mettre à jour l'état local
    if (patient) {
      const updatedPatient = {
        ...patient,
        ...editForm,
        primaryDoctorId: editForm.primaryDoctorId || null
      };

      setPatient(updatedPatient);

      // Mettre à jour le nom du médecin traitant si modifié
      if (editForm.primaryDoctorId) {
        const doctor = doctors.find(d => d.id === editForm.primaryDoctorId);
        if (doctor) {
          setPrimaryDoctor(`Dr. ${doctor.firstName} ${doctor.lastName}`);
        }
      } else {
        setPrimaryDoctor('Non assigné');
      }

      // Simuler une mise à jour réussie
      console.log("Patient updated:", updatedPatient);

      // Sortie du mode édition
      setIsEditMode(false);
    }
  };

  const handleDelete = () => {
    // Dans une application réelle, ceci serait un appel API pour supprimer le patient
    console.log('Patient supprimé:', patient?.id);
    navigate('/patients');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatForInput = (dateString: string) => {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  // Page de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Chargement des informations du patient...</span>
      </div>
    );
  }

  // Page d'erreur si le patient n'est pas trouvé
  if (!patient) {
    return (
      <div className="flex flex-col justify-center items-center h-full py-16">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Patient non trouvé</h2>
          <p className="text-gray-500 mb-6">
            Le patient recherché (ID: {id}) n'existe pas ou a été supprimé.
          </p>
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => navigate('/patients')}
            >
              Retour à la liste des patients
            </Button>
            {patients.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/patients/${getDefaultPatientId()}`)}
              >
                Accéder au premier patient
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Médecin inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            className="mr-4"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/patients')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier le patient' : `${patient.firstName} ${patient.lastName}`}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Modifier les informations du patient' : `Détails du patient`}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          {!isEditMode && (
            <>
              <Button
                variant="outline"
                icon={<PencilIcon className="w-5 h-5" />}
                onClick={() => setIsEditMode(true)}
              >
                Modifier
              </Button>
              <Link to={`/consultations/new?patientId=${id}`}>
                <Button
                  icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
                >
                  Nouvelle consultation
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                icon={<TrashIcon className="w-5 h-5" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Supprimer
              </Button>
            </>
          )}

          {isEditMode && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditMode(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card title="Informations personnelles">
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={editForm.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={editForm.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={editForm.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="socialSecurityNumber" className="block text-sm font-medium text-gray-700">
                    Numéro de Lomeko Santé
                  </label>
                  <input
                    type="text"
                    name="socialSecurityNumber"
                    id="socialSecurityNumber"
                    value={editForm.socialSecurityNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="primaryDoctorId" className="block text-sm font-medium text-gray-700">
                    Médecin traitant
                  </label>
                  <select
                    id="primaryDoctorId"
                    name="primaryDoctorId"
                    value={editForm.primaryDoctorId}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Non assigné</option>
                    {doctors
                      .filter(d => d.specialty === "Généraliste")
                      .map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Nom complet</div>
                    <div className="text-base">{patient.firstName} {patient.lastName}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Date de naissance</div>
                    <div className="text-base">{formatDate(patient.dateOfBirth)}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <IdentificationIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Numéro de Lomeko Santé</div>
                    <div className="text-base">{patient.socialSecurityNumber}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Médecin traitant</div>
                    <div className="text-base">{primaryDoctor}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card title="Coordonnées">
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={editForm.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adresse
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={editForm.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Téléphone</div>
                    <div className="text-base">{patient.phoneNumber}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Email</div>
                    <div className="text-base">{patient.email}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-500">Adresse</div>
                    <div className="text-base">{patient.address}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card
            title="Historique des consultations"
            className="h-full"
            footer={patientConsultations.length > 5 && (
              <Link to={`/patients/${id}/consultations`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Voir toutes les consultations →
              </Link>
            )}
          >
            {patientConsultations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Médecin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patientConsultations.slice(0, 5).map((consultation) => (
                      <tr key={consultation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(consultation.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getDoctorName(consultation.doctorId)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {consultation.notes}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/consultations/${consultation.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Détails
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune consultation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ce patient n'a pas encore de consultations enregistrées.
                </p>
                <div className="mt-6">
                  <Link to={`/consultations/new?patientId=${id}`}>
                    <Button>
                      Nouvelle consultation
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de confirmation pour la suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Supprimer le patient</h3>
              <p className="text-sm text-gray-500 mt-1">
                Êtes-vous sûr de vouloir supprimer ce patient ? Cette action est irréversible.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
