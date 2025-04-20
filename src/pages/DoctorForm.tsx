import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '../components/Button';
import Card from '../components/Card';
import { doctors, patients } from '../data/mockData';
import { Doctor, DoctorSpecialty, SpecialistType } from '../types';

const DoctorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    address: '',
    licenseNumber: '',
    specialty: DoctorSpecialty.GENERAL,
    specialistType: '',
    isAlsoPatient: false
  });
  const [loading, setLoading] = useState(isEditMode);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      // En mode édition, récupérer les données du médecin existant
      const doctor = doctors.find(d => d.id === id);

      if (doctor) {
        setFormData({
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          dateOfBirth: doctor.dateOfBirth,
          phoneNumber: doctor.phoneNumber,
          email: doctor.email,
          address: doctor.address,
          licenseNumber: doctor.licenseNumber,
          specialty: doctor.specialty,
          specialistType: doctor.specialistType || '',
          isAlsoPatient: doctor.isAlsoPatient
        });
      } else {
        setSubmitError('Médecin non trouvé');
      }

      setLoading(false);
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = () => {
    // Validation basique
    if (!formData.firstName.trim()) return 'Le prénom est requis';
    if (!formData.lastName.trim()) return 'Le nom est requis';
    if (!formData.dateOfBirth) return 'La date de naissance est requise';
    if (!formData.licenseNumber.trim()) return 'Le numéro de licence est requis';
    if (!formData.email.trim()) return 'L\'email est requis';
    if (!formData.phoneNumber.trim()) return 'Le numéro de téléphone est requis';
    if (!formData.address.trim()) return 'L\'adresse est requise';

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'L\'email n\'est pas valide';

    // Validation supplémentaire pour les spécialistes
    if (formData.specialty === DoctorSpecialty.SPECIALIST && !formData.specialistType) {
      return 'Le type de spécialité est requis pour un spécialiste';
    }

    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitSuccess(false);
    setSubmitError('');

    // Validation du formulaire
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    // Création ou mise à jour du médecin
    try {
      // Dans une application réelle, nous ferions un appel API ici
      // Pour la démo, nous simulons une action réussie
      if (isEditMode && id) {
        // Mode édition: mise à jour d'un médecin existant
        console.log('Médecin mis à jour:', {
          id,
          ...formData,
          specialistType: formData.specialty === DoctorSpecialty.SPECIALIST ? formData.specialistType : undefined
        });
      } else {
        // Mode création: ajout d'un nouveau médecin
        const newDoctor: Doctor = {
          id: uuidv4(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          licenseNumber: formData.licenseNumber,
          specialty: formData.specialty as DoctorSpecialty,
          isAlsoPatient: formData.isAlsoPatient,
          // Ajouter le specialistType uniquement si c'est un spécialiste
          ...(formData.specialty === DoctorSpecialty.SPECIALIST && {
            specialistType: formData.specialistType as SpecialistType
          })
        };

        // Si le médecin est aussi un patient, nous devons générer un ID de patient
        if (formData.isAlsoPatient) {
          // Dans une application réelle, nous créerions aussi un patient
          console.log('Médecin qui est aussi un patient:', newDoctor);
        }

        console.log('Nouveau médecin créé:', newDoctor);
      }

      setSubmitSuccess(true);

      // Redirection après un court délai
      setTimeout(() => {
        navigate('/doctors');
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setSubmitError('Une erreur est survenue lors de l\'enregistrement du médecin.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            className="mr-4"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/doctors')}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier le médecin' : 'Ajouter un médecin'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Modifier les informations du médecin' : 'Créer un nouveau profil de médecin'}
            </p>
          </div>
        </div>
      </div>

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                {isEditMode ? 'Médecin mis à jour avec succès' : 'Médecin ajouté avec succès'}
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Vous allez être redirigé vers la liste des médecins.
              </p>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur lors de la soumission</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card title="Informations personnelles">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date de naissance *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                Numéro de licence *
              </label>
              <input
                type="text"
                name="licenseNumber"
                id="licenseNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        <Card title="Spécialité" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Type de médecin *
              </label>
              <select
                id="specialty"
                name="specialty"
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formData.specialty}
                onChange={handleChange}
              >
                <option value={DoctorSpecialty.GENERAL}>Généraliste</option>
                <option value={DoctorSpecialty.SPECIALIST}>Spécialiste</option>
              </select>
            </div>

            {formData.specialty === DoctorSpecialty.SPECIALIST && (
              <div>
                <label htmlFor="specialistType" className="block text-sm font-medium text-gray-700">
                  Spécialité *
                </label>
                <select
                  id="specialistType"
                  name="specialistType"
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.specialistType}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner une spécialité</option>
                  <option value={SpecialistType.CARDIOLOGY}>Cardiologie</option>
                  <option value={SpecialistType.DERMATOLOGY}>Dermatologie</option>
                  <option value={SpecialistType.NEUROLOGY}>Neurologie</option>
                  <option value={SpecialistType.ORTHOPEDICS}>Orthopédie</option>
                  <option value={SpecialistType.OPHTHALMOLOGY}>Ophtalmologie</option>
                  <option value={SpecialistType.GYNECOLOGY}>Gynécologie</option>
                  <option value={SpecialistType.PEDIATRICS}>Pédiatrie</option>
                  <option value={SpecialistType.PSYCHIATRY}>Psychiatrie</option>
                  <option value={SpecialistType.OTHER}>Autre</option>
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isAlsoPatient"
                    name="isAlsoPatient"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={formData.isAlsoPatient}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isAlsoPatient" className="font-medium text-gray-700">
                    Est également patient du système
                  </label>
                  <p className="text-gray-500">Ce médecin est également enregistré comme patient.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Coordonnées" className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse *
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/doctors')}
          >
            Annuler
          </Button>
          <Button type="submit">
            {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
