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
    isEditMode?: boolean;
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
    isEditMode = false
}) => {
    const [formData, setFormData] = useState<Doctor>(initialData || defaultFormData);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);

        if (validateForm()) {
            onSave(formData);

            // Ne pas réinitialiser le formulaire en mode édition
            if (!isEditMode) {
                setFormData(defaultFormData);
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
                                    {isEditMode ? 'Modifier le médecin' : 'Nouveau Médecin'}
                                </Dialog.Title>

                                <div className="p-4 max-h-[70vh] overflow-y-auto">
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

export default NewDoctorModal;