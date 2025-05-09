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
  isEditMode = false
}) => {
  const [formData, setFormData] = useState<Patient>(initFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

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

    setIsSubmitting(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop avec animation */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold p-4 border-b"
                >
                  {isEditMode ? 'Modifier le patient' : 'Nouveau Patient'}
                </Dialog.Title>

                <div className="p-4 max-h-[70vh] overflow-y-auto">
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

                <div className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm sm:text-base transition-colors"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base transition-colors disabled:bg-blue-400"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewPatientModal;