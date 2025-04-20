import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import Card from '../components/Card';
import { patients, doctors, medications, prescriptions } from '../data/mockData';
import { Prescription, Medication, DoctorSpecialty } from '../types';

type MedicationWithQuantity = Medication & {
  quantity: number;
  notes?: string;
};

interface FormState {
  patientId: string;
  doctorId: string;
  date: string;
  notes: string;
  medications: MedicationWithQuantity[];
}

const PrescriptionForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    medications: [],
  });

  const [availableDoctors, setAvailableDoctors] = useState(doctors);
  const [availableMedications, setAvailableMedications] = useState(medications);
  const [selectedMedication, setSelectedMedication] = useState('');
  const [medicationQuantity, setMedicationQuantity] = useState(1);
  const [medicationNotes, setMedicationNotes] = useState('');

  useEffect(() => {
    // Filter general doctors when a patient is selected
    if (formState.patientId) {
      setAvailableDoctors(doctors.filter(doctor =>
        doctor.specialty === DoctorSpecialty.GENERAL
      ));
    } else {
      setAvailableDoctors(doctors);
    }

    // If in edit mode, load prescription data
    if (isEditMode && id) {
      const prescription = prescriptions.find(p => p.id === id);
      if (prescription) {
        setFormState({
          patientId: prescription.patientId,
          doctorId: prescription.doctorId,
          date: prescription.date,
          notes: prescription.notes || '', // Set default empty string if notes is undefined
          medications: prescription.medications.map(med => ({
            ...med,
            quantity: 1, // Default quantity as it may not exist in the original data
          })),
        });
      }
    }
  }, [isEditMode, id, formState.patientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMedication = () => {
    if (!selectedMedication) return;

    const medicationToAdd = medications.find(m => m.id === selectedMedication);
    if (!medicationToAdd) return;

    setFormState(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          ...medicationToAdd,
          quantity: medicationQuantity,
          notes: medicationNotes || undefined,
        },
      ],
    }));

    // Reset medication form
    setSelectedMedication('');
    setMedicationQuantity(1);
    setMedicationNotes('');
  };

  const handleRemoveMedication = (medicationId: string) => {
    setFormState(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== medicationId),
    }));
  };

  const validateForm = (): boolean => {
    if (!formState.patientId) {
      setFormError('Veuillez sélectionner un patient');
      return false;
    }

    if (!formState.doctorId) {
      setFormError('Veuillez sélectionner un médecin');
      return false;
    }

    if (!formState.date) {
      setFormError('Veuillez sélectionner une date de prescription');
      return false;
    }

    if (formState.medications.length === 0) {
      setFormError('Veuillez ajouter au moins un médicament');
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
      // In a real app, this would be an API call to save the prescription
      const newPrescription: Prescription = {
        id: isEditMode && id ? id : uuidv4(),
        consultationId: uuidv4(), // In a real app, this might be linked to a real consultation
        patientId: formState.patientId,
        doctorId: formState.doctorId,
        medications: formState.medications,
        date: formState.date,
        notes: formState.notes,
      };

      console.log('Saved prescription:', newPrescription);

      // Show success modal
      setShowConfirmModal(true);
    } catch (error) {
      setFormError('Une erreur est survenue lors de l\'enregistrement de la prescription');
      setIsSubmitting(false);
    }
  };

  const handleConfirmSuccess = () => {
    navigate('/prescriptions');
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            className="mr-4"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier la prescription' : 'Nouvelle prescription'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Mettre à jour les détails de la prescription' : 'Créer une prescription médicale'}
            </p>
          </div>
        </div>
      </div>

      {formError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card title="Informations générales">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Patient *
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formState.patientId}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.socialSecurityNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Médecin prescripteur *
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formState.doctorId}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                >
                  <option value="">Sélectionner un médecin</option>
                  {availableDoctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date de prescription *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formState.date}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </Card>

          <Card title="Médicaments prescrits">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="medication" className="block text-sm font-medium text-gray-700">
                    Médicament
                  </label>
                  <select
                    id="medication"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedMedication}
                    onChange={(e) => setSelectedMedication(e.target.value)}
                  >
                    <option value="">Sélectionner un médicament</option>
                    {availableMedications.map(medication => (
                      <option key={medication.id} value={medication.id}>
                        {medication.name} ({medication.dosage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantité
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={medicationQuantity}
                    onChange={(e) => setMedicationQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="medicationNotes" className="block text-sm font-medium text-gray-700">
                  Instructions spécifiques (optionnel)
                </label>
                <textarea
                  id="medicationNotes"
                  rows={2}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  placeholder="Instructions spécifiques pour ce médicament..."
                  value={medicationNotes}
                  onChange={(e) => setMedicationNotes(e.target.value)}
                />
              </div>

              <div>
                <Button
                  type="button"
                  onClick={handleAddMedication}
                  disabled={!selectedMedication}
                  icon={<PlusIcon className="w-5 h-5" />}
                >
                  Ajouter à la prescription
                </Button>
              </div>

              {formState.medications.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Médicaments ajoutés:</h4>
                  <div className="border rounded-md divide-y">
                    {formState.medications.map((medication) => (
                      <div key={medication.id} className="p-4 flex items-start justify-between">
                        <div>
                          <div className="font-medium">{medication.name} - {medication.dosage}</div>
                          <div className="text-sm text-gray-500">
                            <p>Quantité: {medication.quantity}</p>
                            <p>Posologie: {medication.frequency} pendant {medication.duration}</p>
                            <p className="italic">{medication.instructions}</p>
                            {medication.notes && (
                              <p className="mt-1 text-gray-700">Note: {medication.notes}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 flex-shrink-0"
                          icon={<MinusIcon className="w-4 h-4" />}
                          onClick={() => handleRemoveMedication(medication.id)}
                        >
                          Retirer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Notes supplémentaires">
            <div>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Notes ou instructions supplémentaires..."
                value={formState.notes}
                onChange={handleChange}
              />
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/prescriptions')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>

      {/* Success modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-40"></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <div className="mb-4 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-2">
                {isEditMode ? 'Prescription mise à jour' : 'Prescription créée avec succès'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode
                  ? 'La prescription a été mise à jour avec succès.'
                  : 'La nouvelle prescription a été créée et est maintenant disponible dans le système.'}
              </p>

              <div className="mt-4 bg-gray-50 rounded-md p-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Patient:</span> {getPatientName(formState.patientId)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Médecin:</span> {getDoctorName(formState.doctorId)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Date:</span> {formState.date}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Médicaments:</span> {formState.medications.length}
                </p>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <Button
                className="w-full"
                onClick={handleConfirmSuccess}
              >
                Retour à la liste des prescriptions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
