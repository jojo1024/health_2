import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  MinusIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/Button';
import Card from '../components/Card';
import { patients, doctors, medications } from '../data/mockData';
import { DoctorSpecialty, SpecialistType } from '../types';

const ConsultationForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';
  const initialDoctorId = searchParams.get('doctorId') || '';
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    patientId: initialPatientId,
    doctorId: initialDoctorId,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    // Constantes vitales
    vitalSigns: {
      bloodPressure: { systolic: '', diastolic: '' },
      heartRate: '',
      temperature: '',
      weight: '',
      glucose: ''
    },
    // Diagnostics
    diagnoses: [{ id: uuidv4(), description: '', notes: '' }],
    // Médicaments
    selectedMedications: [] as {
      id: string;
      medicationId: string;
      dosage: string;
      duration: string;
    }[],
    // Références spécialistes
    specialistReferrals: [] as {
      id: string;
      specialistType: SpecialistType;
      reason: string;
    }[],
    // Images
    images: [] as {
      id: string;
      file: File;
      preview: string;
    }[]
  });

  const [availableDoctors, setAvailableDoctors] = useState(doctors);

  // Filter specialists if a specialist type is selected
  useEffect(() => {
    if (formData.patientId) {
      // If a patient is selected, filter doctors to show only generals or relevant specialists
      setAvailableDoctors(
        doctors.filter(d => d.specialty === DoctorSpecialty.GENERAL ||
          (d.specialty === DoctorSpecialty.SPECIALIST &&
            formData.specialistReferrals.some(ref =>
              ref.specialistType === d.specialistType
            )
          )
        )
      );
    } else {
      setAvailableDoctors(doctors);
    }
  }, [formData.patientId, formData.specialistReferrals]);

  // Clean up image previews when component unmounts
  useEffect(() => {
    return () => {
      formData.images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle vital signs changes
  const handleVitalSignChange = (field, value, subfield = null) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: subfield
          ? { ...prev.vitalSigns[field], [subfield]: value }
          : value
      }
    }));
  };

  // Handle diagnoses changes
  const handleDiagnosisChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.map(diag =>
        diag.id === id ? { ...diag, [field]: value } : diag
      )
    }));
  };

  const handleAddDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, { id: uuidv4(), description: '', notes: '' }]
    }));
  };

  const handleRemoveDiagnosis = (id) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.filter(diag => diag.id !== id)
    }));
  };

  // Handle medication changes
  const handleMedicationChange = (e) => {
    const value = e.target.value;

    if (value && !formData.selectedMedications.some(med => med.medicationId === value)) {
      setFormData(prev => ({
        ...prev,
        selectedMedications: [
          ...prev.selectedMedications,
          {
            id: uuidv4(),
            medicationId: value,
            dosage: '',
            duration: ''
          }
        ]
      }));
    }
  };

  const handleMedicationDetailChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      selectedMedications: prev.selectedMedications.map(med =>
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleRemoveMedication = (id) => {
    setFormData(prev => ({
      ...prev,
      selectedMedications: prev.selectedMedications.filter(med => med.id !== id)
    }));
  };

  // Handle specialist referral changes
  const handleAddSpecialistReferral = () => {
    setFormData(prev => ({
      ...prev,
      specialistReferrals: [
        ...prev.specialistReferrals,
        {
          id: uuidv4(),
          specialistType: SpecialistType.OTHER,
          reason: ''
        }
      ]
    }));
  };

  const handleSpecialistReferralChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      specialistReferrals: prev.specialistReferrals.map(ref =>
        ref.id === id ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const handleRemoveSpecialistReferral = (id) => {
    setFormData(prev => ({
      ...prev,
      specialistReferrals: prev.specialistReferrals.filter(ref => ref.id !== id)
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const newImages = files.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id) => {
    setFormData(prev => {
      const imageToRemove = prev.images.find(img => img.id === id);
      if (imageToRemove && imageToRemove.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return {
        ...prev,
        images: prev.images.filter(img => img.id !== id)
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here you would normally save to an API
    console.log('Form submitted:', formData);

    // For demo purposes, let's just navigate back to consultations
    navigate('/consultations');
  };

  // Get patient and doctor names for display
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : '';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '';
  };

  const getMedicationName = (medicationId) => {
    const medication = medications.find(m => m.id === medicationId);
    return medication ? medication.name : 'Médicament inconnu';
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
              Nouvelle Consultation
            </h1>
            <p className="text-gray-500 mt-1">
              Enregistrer une nouvelle consultation médicale
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

          {/* NOUVELLE SECTION: Images */}
          <Card title="Images et documents de la consultation">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ajouter des images ou documents
                </label>
                <div className="mt-2 flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    icon={<PhotoIcon className="w-5 h-5" />}
                    onClick={() => fileInputRef.current.click()}
                  >
                    Charger des images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {formData.images.map(image => (
                    <div key={image.id} className="relative">
                      <div className="aspect-w-4 aspect-h-3 w-full overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={image.preview}
                          alt="Aperçu"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-500"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 truncate">
                        {image.file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="Informations de base">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Patient *
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Médecin *
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un médecin</option>
                  {availableDoctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialty}
                      {doctor.specialistType ? ` - ${doctor.specialistType}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date de consultation *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div> */}
            </div>

            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes *
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Entrez les notes de consultation..."
                value={formData.notes}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          {/* NOUVELLE SECTION: Constantes Vitales */}
          <Card title="Constantes Vitales">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tension Artérielle (mmHg)
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    className="w-1/2 pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    placeholder="Systolique"
                    value={formData.vitalSigns.bloodPressure.systolic}
                    onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value, 'systolic')}
                  />
                  <span className="flex items-center text-gray-500">/</span>
                  <input
                    type="number"
                    className="w-1/2 pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    placeholder="Diastolique"
                    value={formData.vitalSigns.bloodPressure.diastolic}
                    onChange={(e) => handleVitalSignChange('bloodPressure', e.target.value, 'diastolic')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fréquence Cardiaque (bpm)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  placeholder="Fréquence Cardiaque"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) => handleVitalSignChange('heartRate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Température (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  placeholder="Température"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  placeholder="Poids"
                  value={formData.vitalSigns.weight}
                  onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Glycémie (mmol/L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  placeholder="Glycémie"
                  value={formData.vitalSigns.glucose}
                  onChange={(e) => handleVitalSignChange('glucose', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* NOUVELLE SECTION: Diagnostics */}
          <Card title="Diagnostics">
            {formData.diagnoses.map((diagnosis, index) => (
              <div key={diagnosis.id} className="mb-6 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Diagnostic #{index + 1}
                  </h4>
                  {formData.diagnoses.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      icon={<MinusIcon className="w-4 h-4" />}
                      onClick={() => handleRemoveDiagnosis(diagnosis.id)}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description du diagnostic *
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      placeholder="Entrez le diagnostic..."
                      value={diagnosis.description}
                      onChange={(e) => handleDiagnosisChange(diagnosis.id, 'description', e.target.value)}
                      required={index === 0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes complémentaires
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      placeholder="Notes sur le diagnostic..."
                      value={diagnosis.notes}
                      onChange={(e) => handleDiagnosisChange(diagnosis.id, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={handleAddDiagnosis}
            >
              Ajouter un diagnostic
            </Button>
          </Card>

          {/* Section Prescriptions Améliorée */}
          <Card title="Prescriptions de médicaments">
            <div>
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700">
                Ajouter un médicament
              </label>
              <div className="mt-1">
                <select
                  id="medication"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value=""
                  onChange={handleMedicationChange}
                >
                  <option value="">Sélectionner un médicament</option>
                  {medications.map(medication => (
                    <option
                      key={medication.id}
                      value={medication.id}
                      disabled={formData.selectedMedications.some(med => med.medicationId === medication.id)}
                    >
                      {medication.name} ({medication.dosage})
                    </option>
                  ))}
                </select>
              </div>

              {formData.selectedMedications.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Médicaments prescrits:</h4>
                  <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                    {formData.selectedMedications.map(medication => {
                      const medicationName = getMedicationName(medication.medicationId);
                      return (
                        <li key={medication.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{medicationName}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              icon={<MinusIcon className="w-4 h-4" />}
                              onClick={() => handleRemoveMedication(medication.id)}
                            >
                              Retirer
                            </Button>
                          </div>
                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">
                                Posologie
                              </label>
                              <input
                                type="text"
                                className="mt-1 block w-full pl-3 pr-3 py-1 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                placeholder="Ex: 1 comprimé 3x/jour"
                                value={medication.dosage}
                                onChange={(e) => handleMedicationDetailChange(medication.id, 'dosage', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">
                                Durée du traitement
                              </label>
                              <input
                                type="text"
                                className="mt-1 block w-full pl-3 pr-3 py-1 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                placeholder="Ex: 7 jours"
                                value={medication.duration}
                                onChange={(e) => handleMedicationDetailChange(medication.id, 'duration', e.target.value)}
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </Card>



          <Card title="Référence vers un spécialiste">
            {formData.specialistReferrals.length > 0 && (
              <div className="mb-6 space-y-6">
                {formData.specialistReferrals.map((referral, index) => (
                  <div key={referral.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Référence #{index + 1}
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        icon={<MinusIcon className="w-4 h-4" />}
                        onClick={() => handleRemoveSpecialistReferral(referral.id)}
                      >
                        Supprimer
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Type de spécialiste *
                        </label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={referral.specialistType}
                          onChange={(e) => handleSpecialistReferralChange(referral.id, 'specialistType', e.target.value)}
                          required
                        >
                          {Object.values(SpecialistType).map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Raison *
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          placeholder="Raison de la référence..."
                          value={referral.reason}
                          onChange={(e) => handleSpecialistReferralChange(referral.id, 'reason', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={handleAddSpecialistReferral}
            >
              Ajouter une référence vers un spécialiste
            </Button>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/consultations')}
            >
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer la consultation
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;