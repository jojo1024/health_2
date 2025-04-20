import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import Card from '../components/Card';
import { doctors } from '../data/mockData';
import { DoctorSpecialty } from '../types';

interface PatientFormState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  primaryDoctorId: string;
}

const PatientForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formState, setFormState] = useState<PatientFormState>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    socialSecurityNumber: '',
    phoneNumber: '',
    email: '',
    address: '',
    primaryDoctorId: '',
  });

  // Filtrer pour n'obtenir que les médecins généralistes (qui peuvent être médecins traitants)
  const availableGeneralDoctors = doctors.filter(
    doctor => doctor.specialty === DoctorSpecialty.GENERAL
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formState.firstName || !formState.lastName) {
      setFormError('Les nom et prénom sont obligatoires');
      return false;
    }

    if (!formState.dateOfBirth) {
      setFormError('La date de naissance est obligatoire');
      return false;
    }

    if (!formState.socialSecurityNumber) {
      setFormError('Le numéro de Lomeko Santé est obligatoire');
      return false;
    }

    // Validation du format du numéro de Lomeko Santé français (simplifié)
    if (!/^\d{13,15}$/.test(formState.socialSecurityNumber)) {
      setFormError('Le numéro de Lomeko Santé doit contenir entre 13 et 15 chiffres');
      return false;
    }

    // Validation de l'email si fourni
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      setFormError('L\'adresse email est invalide');
      return false;
    }

    // Validation du numéro de téléphone si fourni (format français simplifié)
    if (formState.phoneNumber && !/^0\d{9}$/.test(formState.phoneNumber.replace(/\s/g, ''))) {
      setFormError('Le numéro de téléphone doit être au format français (ex: 0123456789)');
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Dans une application réelle, ceci serait un appel API pour enregistrer le patient
      const newPatient = {
        id: uuidv4(),
        ...formState,
        primaryDoctorId: formState.primaryDoctorId || null,
      };

      console.log('Patient enregistré:', newPatient);

      // Simuler un délai d'enregistrement
      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccessModal(true);
      }, 1000);
    } catch (error) {
      setFormError('Une erreur est survenue lors de l\'enregistrement du patient');
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    navigate('/patients');
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
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
              Nouvel Assuré
            </h1>
            <p className="text-gray-500 mt-1">
              Enregistrer un nouveau patient dans le système
            </p>
          </div>
        </div>
      </div>

      {formError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card title="Informations personnelles">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  value={formState.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  value={formState.lastName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                  max={formatDateForInput(new Date())}
                  value={formState.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="socialSecurityNumber" className="block text-sm font-medium text-gray-700">
                  Numéro de Lomeko Santé *
                </label>
                <input
                  type="text"
                  id="socialSecurityNumber"
                  name="socialSecurityNumber"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: 1234567890123"
                  required
                  value={formState.socialSecurityNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="Coordonnées">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formState.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: 0123456789"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formState.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          <Card title="Affiliation médicale">
            <div>
              <label htmlFor="primaryDoctorId" className="block text-sm font-medium text-gray-700">
                Médecin traitant
              </label>
              <select
                id="primaryDoctorId"
                name="primaryDoctorId"
                className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formState.primaryDoctorId}
                onChange={handleChange}
              >
                <option value="">Aucun médecin traitant sélectionné</option>
                {availableGeneralDoctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Vous pouvez sélectionner un médecin traitant maintenant ou plus tard.
              </p>
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/patients')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-40"></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                Patient enregistré avec succès
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Le nouvel assuré a été ajouté au système et peut maintenant bénéficier des services de santé.
              </p>

              <div className="mt-4 bg-gray-50 rounded-md p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Nom complet:</span> {formState.firstName} {formState.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">N° Lomeko Santé:</span> {formState.socialSecurityNumber}
                </p>
                {formState.primaryDoctorId && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Médecin traitant:</span> {
                      (() => {
                        const doctor = doctors.find(d => d.id === formState.primaryDoctorId);
                        return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Non assigné';
                      })()
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <Button
                className="w-full"
                onClick={handleSuccessConfirm}
              >
                Retourner à la liste des patients
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;
