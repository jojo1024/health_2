import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Document, validateConsultationForm } from '../../hooks/useFormData';
import { createConsultation } from '../../redux/consultationSlice';
import { useAppDispatch } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import { ConsultationBackendPayload, Patient } from '../../types';
import { calculateAge } from '../../utils/functions';
import { AddIcon, PdfIcon, Spinner } from '../../utils/svg';
import CustomInput from '../components/CustomInput';

interface NewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string; // ID du patient pour lier la consultation
  patient: Patient;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const initialFormData = {
  temperature: '',
  weight: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  heartRate: '',
  respiratoryRate: '',
  oxygenSaturation: '',
  motif: '',
  consultation: '',
  prescription: '',
}

const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
  onError,
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useSelector((state: RootState) => state.consultations);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialFormData);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          // The result includes the MIME type prefix (e.g., "data:image/jpeg;base64,")
          resolve(reader.result.toString());
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur si le champ est rempli
    if (errors[name] && value.trim()) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingFiles(true);
      const newFiles = Array.from(e.target.files);

      // Filtrer seulement les images et PDFs
      const acceptedFiles = newFiles.filter(file =>
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      try {
        // Process files one by one
        const newDocuments = await Promise.all(acceptedFiles.map(async (file) => {
          const isImage = file.type.startsWith('image/');
          const base64String = await fileToBase64(file);

          return {
            id: Math.random().toString(36).slice(2, 9),
            filename: file.name,
            type: isImage ? 'image' : 'pdf' as 'image' | 'pdf',
            preview: URL.createObjectURL(file),
            base64: base64String
          };
        }));

        setDocuments(prev => [...prev, ...newDocuments as Document[]]);

        // Effacer l'erreur si des documents sont ajoutés
        if (errors.documents) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.documents;
            return newErrors;
          });
        }
      } catch (error) {
        console.error("Error processing files:", error);
      } finally {
        setIsProcessingFiles(false);
      }
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));

    // Fermer la prévisualisation si le document supprimé était prévisualisé
    if (previewDocument && previewDocument.id === id) {
      setPreviewDocument(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openPreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const handleSubmit = async () => {
    try {
      if (validateConsultationForm(formData, setErrors, documents)) {
        setIsSubmitting(true);
        // Transformation des données pour correspondre au schéma du backend
        const consultationPayload: ConsultationBackendPayload = {
          idPatient: Number(patient.idUtilisateur),
          idPersSoignant: Number(user?.idUtilisateur),
          motifConsultation: formData.motif,
          detailConsultation: formData.consultation,
          ordonnance: formData.prescription,
          constantes: {}
        };

        // Ajouter température si présente
        if (formData.temperature) {
          consultationPayload.constantes!.temperature = parseFloat(formData.temperature);
        }

        // Ajouter tension si au moins une valeur est présente
        if (formData.bloodPressureSystolic || formData.bloodPressureDiastolic) {
          consultationPayload.constantes!.tension = {};

          if (formData.bloodPressureSystolic) {
            consultationPayload.constantes!.tension.systolique = parseFloat(formData.bloodPressureSystolic);
          }

          if (formData.bloodPressureDiastolic) {
            consultationPayload.constantes!.tension.diastolique = parseFloat(formData.bloodPressureDiastolic);
          }
        }

        // Si aucune constante n'est définie, supprimer l'objet constantes
        if (consultationPayload.constantes && Object.keys(consultationPayload.constantes).length === 0) {
          delete consultationPayload.constantes;
        }

        // Traiter les documents
        if (documents.length > 0) {
          consultationPayload.documentsConsultations = documents.map(doc => ({
            type: doc.type,
            url: doc.filename,
            data: doc.base64
          }));
        }

        // Envoi des données au backend
        await dispatch(createConsultation(consultationPayload)).unwrap();

        // Réinitialiser le formulaire
        setFormData(initialFormData);
        setDocuments([]);

        // Notifier le succès
        onSuccess('Consultation créée avec succès');
      }
    } catch (error) {
      console.error("Erreur lors de la création de la consultation:", error);
      onError('Erreur lors de la création de la consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      documents.forEach(doc => {
        URL.revokeObjectURL(doc.preview);
      });
    };
  }, [documents]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop avec animation */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-xl font-bold p-4 border-b"
                >
                  Nouvelle Consultation pour {patient.nomUtilisateur} {patient.prenomUtilisateur}
                </DialogTitle>

                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Informations du patient */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="text-md font-medium text-blue-800 mb-2">Informations du patient</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">Nom:</span> {patient.nomUtilisateur} {patient.prenomUtilisateur}</div>
                        <div><span className="font-medium">ID:</span> {patient.idUtilisateur}</div>
                        <div><span className="font-medium">Âge:</span> {calculateAge(patient.dateNaisPatient)}</div>
                        <div><span className="font-medium">Téléphone:</span> {patient.telephoneUtilisateur}</div>
                        <div><span className="font-medium">Adresse:</span> {patient.adressePatient || 'Non renseigné'}</div>
                        <div><span className="font-medium">Sexe:</span> {patient.sexePatient || 'Non renseigné'}</div>
                        <div><span className="font-medium">Groupe sanguin:</span> {patient.groupeSanguinPatient || 'Non renseigné'}</div>
                        <div><span className="font-medium">Ethnie:</span> {patient.ethniePatient || 'Non renseigné'}</div>
                      </div>
                    </div>

                    {/* Motif et Documents en haut côte à côte */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Motif de consultation */}
                      <div>
                        <div className="flex flex-col gap-1">
                          <label htmlFor="motif" className="text-sm font-medium text-gray-700">
                            Motif de consultation *
                          </label>
                          <textarea
                            id="motif"
                            name="motif"
                            rows={5}
                            value={formData.motif}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.motif ? 'border-red-500' : 'border-gray-300'
                              }`}
                          />
                          {errors.motif && (
                            <p className="text-red-500 text-sm mt-1">{errors.motif}</p>
                          )}
                        </div>
                      </div>

                      {/* Téléchargement de documents */}
                      <div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">
                            Documents et images *
                          </label>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                            accept="image/*,.pdf"
                          />

                          <div className="flex flex-wrap gap-3 mt-2">
                            {documents.map((doc) => (
                              <div key={doc.id} className="relative">
                                <div
                                  className="border rounded-md bg-gray-50 p-2 w-24 h-24 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                                  onClick={() => openPreview(doc)}
                                >
                                  {doc.type === 'image' ? (
                                    <img
                                      src={doc.preview}
                                      alt="Aperçu"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center relative flex flex-col items-center justify-center">
                                      {/* Icône PDF avec badge de prévisualisation */}
                                      <div className="relative">
                                        <PdfIcon />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                                          <PdfIcon />
                                        </div>
                                      </div>
                                      <span className="text-xs truncate block mt-1">
                                        {doc.filename.length > 10
                                          ? `${doc.filename.substring(0, 10)}...`
                                          : doc.filename}
                                      </span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeDocument(doc.id);
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={triggerFileInput}
                              disabled={isProcessingFiles}
                              className={`border-2 border-dashed ${isProcessingFiles ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white hover:border-blue-500'} rounded-md p-2 w-24 h-24 flex flex-col items-center justify-center transition-colors`}
                            >
                              {isProcessingFiles ? (
                                <>
                                  <Spinner />
                                  <span className="text-xs text-gray-500 mt-1">Chargement...</span>
                                </>
                              ) : (
                                <>
                                  <AddIcon />
                                  <span className="text-xs text-gray-500 mt-1">Ajouter</span>
                                </>
                              )}
                            </button>
                          </div>

                          {errors.documents && (
                            <p className="text-red-500 text-sm mt-1">{errors.documents}</p>
                          )}

                          <p className="text-xs text-gray-500">
                            Formats acceptés: Images, PDF
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section des constantes vitales */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Constantes vitales</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <CustomInput
                          label="Température (°C)"
                          name="temperature"
                          type="number"
                          value={formData.temperature}
                          onChange={handleChange}
                        />
                        <CustomInput
                          label="Poids (kg)"
                          name="weight"
                          type="number"
                          value={formData.weight}
                          onChange={handleChange}
                        />
                        <div className="flex space-x-2">
                          <CustomInput
                            label="Tension (sys)"
                            name="bloodPressureSystolic"
                            type="number"
                            value={formData.bloodPressureSystolic}
                            onChange={handleChange}
                          />
                          <CustomInput
                            label="(dia)"
                            name="bloodPressureDiastolic"
                            type="number"
                            value={formData.bloodPressureDiastolic}
                            onChange={handleChange}
                          />
                        </div>
                        <CustomInput
                          label="Rythme cardiaque (bpm)"
                          name="heartRate"
                          type="number"
                          value={formData.heartRate}
                          onChange={handleChange}
                        />
                        <CustomInput
                          label="Fréquence respiratoire"
                          name="respiratoryRate"
                          type="number"
                          value={formData.respiratoryRate}
                          onChange={handleChange}
                        />
                        <CustomInput
                          label="Saturation en O₂ (%)"
                          name="oxygenSaturation"
                          type="number"
                          value={formData.oxygenSaturation}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Contenu de la consultation */}
                    <div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="consultation" className="text-sm font-medium text-gray-700">
                          Consultation *
                        </label>
                        <textarea
                          id="consultation"
                          name="consultation"
                          rows={4}
                          value={formData.consultation}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.consultation ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.consultation && (
                          <p className="text-red-500 text-sm mt-1">{errors.consultation}</p>
                        )}
                      </div>
                    </div>

                    {/* Ordonnance */}
                    <div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="prescription" className="text-sm font-medium text-gray-700">
                          Ordonnance *
                        </label>
                        <textarea
                          id="prescription"
                          name="prescription"
                          rows={4}
                          value={formData.prescription}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.prescription ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.prescription && (
                          <p className="text-red-500 text-sm mt-1">{errors.prescription}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Annuler
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>

      {/* Modal de prévisualisation */}
      {previewDocument && (
        <Transition appear show={true} as={Fragment}>
          <Dialog as="div" className="relative z-[60]" onClose={closePreview}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-75" />
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
                  <Dialog.Panel className="w-full max-w-4xl h-[80vh] transform overflow-hidden rounded-lg bg-white shadow-xl transition-all flex flex-col">
                    <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
                      <h3 className="text-lg font-medium">
                        {previewDocument.filename}
                      </h3>
                      <button
                        type="button"
                        onClick={closePreview}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
                      {previewDocument.type === 'image' ? (
                        <img
                          src={previewDocument.preview}
                          alt={previewDocument.filename}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <object
                            data={previewDocument.preview}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            className="border-0"
                          >
                            <div className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded bg-gray-50">
                              <svg
                                className="w-16 h-16 text-gray-400 mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-gray-600">
                                Aperçu du PDF non disponible. <a
                                  href={previewDocument.preview}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Cliquez ici pour ouvrir
                                </a>
                              </p>
                            </div>
                          </object>
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </Transition>
  );
};

export default NewConsultationModal;