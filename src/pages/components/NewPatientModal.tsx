import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import CustomInput from '../components/CustomInput';
import { Patient } from '../../types';

interface ValidationErrors {
  [key: string]: string;
}

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Patient) => void;
  initialData?: Patient; // Pour le mode édition
  isEditMode?: boolean; // Indique si on est en mode édition
  isSubmitting: boolean;
}

const initFormData: Patient = {
  prenomUtilisateur: '',
  nomUtilisateur: '',
  adressePatient: '',
  ethniePatient: '',
  groupeSanguinPatient: '',
  telephoneUtilisateur: '225',
  dateNaisPatient: new Date(),
  sexePatient: '',
  idPatient: '', // Assurez-vous que cet ID est généré ou fourni par le backend
  idUtilisateur: '', // Assurez-vous que cet ID est généré ou fourni par le backend
};

const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditMode = false,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Patient>(initFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [dateInputValue, setDateInputValue] = useState('');

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);

      // Convertir la date de naissance en format yyyy-MM-dd pour l'input date
      const dateNais = initialData.dateNaisPatient instanceof Date
        ? initialData.dateNaisPatient
        : new Date(initialData.dateNaisPatient);

      setDateInputValue(formatDateForInput(dateNais));
    } else {
      // Réinitialiser si pas de données initiales
      setFormData(initFormData);
      setDateInputValue('');
    }
  }, [initialData, isOpen]);

  // Fonction pour formater une date au format yyyy-MM-dd (pour input type="date")
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validation des champs obligatoires
    if (!formData.nomUtilisateur.trim()) {
      newErrors.nomUtilisateur = 'Le nom est obligatoire';
    }

    if (!formData.prenomUtilisateur.trim()) {
      newErrors.prenomUtilisateur = 'Le prénom est obligatoire';
    }

    if (!formData.dateNaisPatient) {
      newErrors.dateNaisPatient = 'La date de naissance est obligatoire';
    } else {
      // Vérifier que la date n'est pas dans le futur
      const selectedDate = formData.dateNaisPatient instanceof Date
        ? formData.dateNaisPatient
        : new Date(formData.dateNaisPatient);

      const today = new Date();
      if (selectedDate > today) {
        newErrors.dateNaisPatient = 'La date de naissance ne peut pas être dans le futur';
      }
    }

    // Validation du numéro de téléphone (doit commencer par 225 et être suivi de 10 chiffres)
    if (
      formData.telephoneUtilisateur &&
      !/^225\d{10}$/.test(formData.telephoneUtilisateur.replace(/\s/g, ''))
    ) {
      newErrors.telephoneUtilisateur = 'Le numéro doit commencer par 225 et contenir 10 chiffres après';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'dateNaisPatient') {
      // Mettre à jour la valeur de l'input date
      setDateInputValue(value);

      // Convertir la chaîne de date en objet Date pour le state
      const dateObject = value ? new Date(value) : new Date();
      setFormData(prev => ({
        ...prev,
        [name]: dateObject
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Créer un nouvel ID pour un nouveau patient (uniquement si ce n'est pas en mode édition)
      const patientToSave = isEditMode
        ? formData
        : {
          ...formData,
          // Générer un ID si nécessaire et non fourni par le backend
          idPatient: formData.idPatient || `PAT-${Date.now()}`,
          idUtilisateur: formData.idUtilisateur || `USR-${Date.now()}`
        };

      onSave(patientToSave);

      // Ne pas réinitialiser le formulaire en mode édition
      if (!isEditMode) {
        setFormData(initFormData);
        setDateInputValue('');
      }

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isEditMode ? 'Modifier le patient' : 'Nouveau patient'}
                </h3>
                <div className="mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <CustomInput
                          label="Nom"
                          name="nomUtilisateur"
                          value={formData.nomUtilisateur}
                          onChange={handleChange}
                          required
                        />
                        {errors.nomUtilisateur && <p className="text-red-500 text-sm mt-1">{errors.nomUtilisateur}</p>}
                      </div>
                      <div>
                        <CustomInput
                          label="Prénom"
                          name="prenomUtilisateur"
                          value={formData.prenomUtilisateur}
                          onChange={handleChange}
                          required
                        />
                        {errors.prenomUtilisateur && <p className="text-red-500 text-sm mt-1">{errors.prenomUtilisateur}</p>}
                      </div>
                    </div>

                    <CustomInput
                      label="Lieu d'habitation"
                      name="adressePatient"
                      value={formData.adressePatient}
                      onChange={handleChange}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CustomInput
                        label="Ethnie"
                        name="ethniePatient"
                        value={formData.ethniePatient}
                        onChange={handleChange}
                      />
                      <div>
                        <CustomInput
                          label="Téléphone"
                          name="telephoneUtilisateur"
                          type="tel"
                          value={formData.telephoneUtilisateur}
                          placeholder="Ex: 0102030405"
                          onChange={handleChange}
                        />
                        {errors.telephoneUtilisateur && <p className="text-red-500 text-sm mt-1">{errors.telephoneUtilisateur}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex flex-col gap-1">
                          <label htmlFor="dateNaisPatient" className="text-sm font-medium text-gray-700">
                            Date de naissance <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="dateNaisPatient"
                            name="dateNaisPatient"
                            value={dateInputValue}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        {errors.dateNaisPatient && <p className="text-red-500 text-sm mt-1">{errors.dateNaisPatient}</p>}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="sexePatient" className="text-sm font-medium text-gray-700">
                          Sexe
                        </label>
                        <select
                          name="sexePatient"
                          id="sexePatient"
                          value={formData.sexePatient}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="M">M</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="groupeSanguinPatient" className="text-sm font-medium text-gray-700">
                          Groupe sanguin
                        </label>
                        <select
                          name="groupeSanguinPatient"
                          id="groupeSanguinPatient"
                          value={formData.groupeSanguinPatient}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Modification en cours...' : 'Création en cours...'}
                </>
              ) : (
                isEditMode ? 'Modifier' : 'Créer'
              )}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPatientModal;