import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Doctor, DoctorSpecialty, SpecialistType } from '../../types';

interface ValidationErrors {
    [key: string]: string;
}

interface NewDoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Doctor) => void;
    initialData?: Doctor;
    isEditMode: boolean;
    isSubmitting: boolean;
}

// Interface pour CustomInput
interface CustomInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    error?: string;
}

// Composant CustomInput
const CustomInput: React.FC<CustomInputProps> = ({
    label,
    name,
    value,
    onChange,
    required = false,
    type = 'text',
    placeholder = '',
    error
}) => {
    return (
        <div>
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

const defaultFormData: Doctor = {
    idPersSoignant: '',
    nomUtilisateur: '',
    prenomUtilisateur: '',
    telephoneUtilisateur: '225',
    specPersSoignant: '',
    typePersSoignant: '',
    idUtilisateur: '',

};

const NewDoctorModal: React.FC<NewDoctorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    isEditMode = false,
    isSubmitting
}) => {
    const [formData, setFormData] = useState<Doctor>(initialData || defaultFormData);
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(defaultFormData);
        }
        // Réinitialiser les erreurs à chaque ouverture
        setErrors({});
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Effacer l'erreur pour ce champ si elle existe
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Validation du nom
        if (!formData.nomUtilisateur.trim()) {
            newErrors.nomUtilisateur = 'Le nom est obligatoire';
        }

        // Validation du prénom
        if (!formData.prenomUtilisateur.trim()) {
            newErrors.prenomUtilisateur = 'Le prénom est obligatoire';
        }

        // Validation du numéro de téléphone (doit commencer par 225 et être suivi de 10 chiffres)
        if (
            !formData.telephoneUtilisateur ||
            !/^225\d{10}$/.test(formData.telephoneUtilisateur.replace(/\s/g, ''))
        ) {
            newErrors.telephoneUtilisateur = 'Le numéro doit commencer par 225 et contenir 10 chiffres après';
        }

        // Validation de la spécialité
        if (!formData.specPersSoignant) {
            newErrors.specPersSoignant = 'La spécialité est obligatoire';
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSave(formData);

            // Ne pas réinitialiser le formulaire en mode édition
            if (!isEditMode) {
                setFormData(defaultFormData);
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
                                    {isEditMode ? 'Modifier le médecin' : 'Nouveau médecin'}
                                </h3>
                                <div className="mt-4">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <CustomInput
                                                label="Nom"
                                                name="nomUtilisateur"
                                                value={formData.nomUtilisateur}
                                                onChange={handleChange}
                                                required
                                                error={errors.nomUtilisateur}
                                            />
                                            <CustomInput
                                                label="Prénom"
                                                name="prenomUtilisateur"
                                                value={formData.prenomUtilisateur}
                                                onChange={handleChange}
                                                required
                                                error={errors.prenomUtilisateur}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="specPersSoignant" className="text-sm font-medium text-gray-700">
                                                    Spécialité <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="specPersSoignant"
                                                    id="specPersSoignant"
                                                    value={formData.specPersSoignant}
                                                    onChange={handleChange}
                                                    className={`w-full px-3 py-2 border ${errors.specPersSoignant ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                                >
                                                    <option value="">Sélectionner</option>
                                                    <option value="Généraliste">Généraliste</option>
                                                    <option value="Cardiologue">Cardiologue</option>
                                                    <option value="Dermatologue">Dermatologue</option>
                                                    <option value="Gynécologue">Gynécologue</option>
                                                    <option value="Pédiatre">Pédiatre</option>
                                                    <option value="Psychiatre">Psychiatre</option>
                                                    <option value="Neurologue">Neurologue</option>
                                                    <option value="Ophtalmologue">Ophtalmologue</option>
                                                    <option value="ORL">ORL</option>
                                                    <option value="Dentiste">Dentiste</option>
                                                    <option value="Autre">Autre</option>
                                                </select>
                                                {errors.specPersSoignant && <p className="text-red-500 text-sm mt-1">{errors.specPersSoignant}</p>}
                                            </div>

                                            <div className="">
                                                <CustomInput
                                                    label="Téléphone"
                                                    name="telephoneUtilisateur"
                                                    type="tel"
                                                    value={formData.telephoneUtilisateur}
                                                    placeholder="Ex: 2250708091011"
                                                    onChange={handleChange}
                                                    required
                                                    error={errors.telephoneUtilisateur}
                                                />

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

export default NewDoctorModal;