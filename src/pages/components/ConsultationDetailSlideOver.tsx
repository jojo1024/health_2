import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  UserIcon,
  CalendarIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  XMarkIcon,
  HeartIcon,
  ScaleIcon,
  BeakerIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

// Type for consultation
interface Consultation {
  id: string;
  date: string;
  doctorId: string;
  patientId: string;
  notes: string;
  temperature?: string;
  weight?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  motif: string;
  consultation?: string;
  prescription?: string;
  documents?: Document[];
}

interface Document {
  id: string;
  file: File;
  type: 'image' | 'pdf';
  preview: string;
}

interface ConsultationDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation;
  onDelete: () => void;
  patientName: string;
}

const ConsultationDetailSlideOver: React.FC<ConsultationDetailSlideOverProps> = ({
  isOpen,
  onClose,
  consultation,
  onDelete,
  patientName
}) => {
  const [currentTab, setCurrentTab] = useState('details'); // 'details', 'prescription', 'documents'
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Render vital signs if available
  const renderVitalSigns = () => {
    const hasVitalSigns = consultation.temperature || 
                          consultation.weight || 
                          consultation.bloodPressureSystolic || 
                          consultation.heartRate || 
                          consultation.respiratoryRate || 
                          consultation.oxygenSaturation;
    
    if (!hasVitalSigns) return null;
    
    return (
      <div>
        <h4 className="text-lg font-medium text-gray-900 mt-8 mb-4">Signes vitaux</h4>
        <div className="space-y-5 pt-2">
          {consultation.temperature && (
            <div className="flex items-start">
              <BeakerIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
              <div>
                <div className="text-sm font-medium text-gray-500">Température</div>
                <div className="text-lg text-gray-900 mt-1">{consultation.temperature} °C</div>
              </div>
            </div>
          )}
          
          {consultation.weight && (
            <div className="flex items-start">
              <ScaleIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
              <div>
                <div className="text-sm font-medium text-gray-500">Poids</div>
                <div className="text-lg text-gray-900 mt-1">{consultation.weight} kg</div>
              </div>
            </div>
          )}
          
          {(consultation.bloodPressureSystolic || consultation.bloodPressureDiastolic) && (
            <div className="flex items-start">
              <HeartIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
              <div>
                <div className="text-sm font-medium text-gray-500">Tension artérielle</div>
                <div className="text-lg text-gray-900 mt-1">
                  {consultation.bloodPressureSystolic || '?'}/{consultation.bloodPressureDiastolic || '?'} mmHg
                </div>
              </div>
            </div>
          )}
          
          {consultation.heartRate && (
            <div className="flex items-start">
              <HeartIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
              <div>
                <div className="text-sm font-medium text-gray-500">Fréquence cardiaque</div>
                <div className="text-lg text-gray-900 mt-1">{consultation.heartRate} bpm</div>
              </div>
            </div>
          )}
          
          {consultation.respiratoryRate && (
            <div className="flex items-start">
              <HeartIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
              <div>
                <div className="text-sm font-medium text-gray-500">Fréquence respiratoire</div>
                <div className="text-lg text-gray-900 mt-1">{consultation.respiratoryRate} rpm</div>
              </div>
            </div>
          )}
          
          {consultation.oxygenSaturation && (
            <div className="flex items-start">
              <HeartIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
              <div>
                <div className="text-sm font-medium text-gray-500">Saturation en oxygène</div>
                <div className="text-lg text-gray-900 mt-1">{consultation.oxygenSaturation} %</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Nous n'avons plus besoin de cette fonction car les documents sont gérés directement dans le rendu principal
  // en utilisant les onglets

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={() => null}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-5xl">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg md:text-2xl font-semibold text-gray-900">
                          Détails de la consultation
                        </Dialog.Title>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">Fermer</span>
                            <XMarkIcon className="h-7 w-7" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Consultation Header with badges */}
                    <div className="bg-white px-6 py-4 sm:px-8 border-b border-gray-200">
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="primary">Date: {formatDate(consultation.date)}</Badge>
                        {consultation.temperature && (
                          <Badge variant="info">Temp: {consultation.temperature}°C</Badge>
                        )}
                        {consultation.weight && (
                          <Badge variant="success">Poids: {consultation.weight} kg</Badge>
                        )}
                        {(consultation.bloodPressureSystolic || consultation.bloodPressureDiastolic) && (
                          <Badge variant="warning">
                            TA: {consultation.bloodPressureSystolic || '?'}/{consultation.bloodPressureDiastolic || '?'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Tabs pour mobile et tablette */}
                    <div className="lg:hidden border-b border-gray-200">
                      <div className="flex">
                        <button
                          className={`flex-1 py-4 px-4 text-center font-medium text-sm ${
                            currentTab === 'details'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setCurrentTab('details')}
                        >
                          Détails
                        </button>
                        <button
                          className={`flex-1 py-4 px-4 text-center font-medium text-sm ${
                            currentTab === 'prescription'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setCurrentTab('prescription')}
                        >
                          Prescription
                        </button>
                        {consultation.documents && consultation.documents.length > 0 && (
                          <button
                            className={`flex-1 py-4 px-4 text-center font-medium text-sm ${
                              currentTab === 'documents'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setCurrentTab('documents')}
                          >
                            Documents
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content with responsive layout */}
                    <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200 flex-grow overflow-hidden">
                      {/* Colonne gauche: Informations de base et signes vitaux */}
                      <div className={`lg:w-2/5 overflow-y-auto ${currentTab !== 'details' ? 'hidden lg:block' : ''}`}>
                        <div className="px-6 py-4 sm:px-8 h-full">
                          <div className="h-full overflow-y-auto">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h4>
                            <div className="space-y-5 pt-2 mb-8">
                              <div className="flex items-start">
                                <CalendarIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Date</div>
                                  <div className="text-lg text-gray-900 mt-1">{formatDate(consultation.date)}</div>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <UserIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Patient</div>
                                  <div className="text-lg text-gray-900 mt-1">{patientName}</div>
                                </div>
                              </div>
                            </div>

                            {/* Vital signs */}
                            {renderVitalSigns()}
                          </div>
                        </div>
                      </div>

                      {/* Colonne droite: Détails de consultation, prescription et documents */}
                      <div className={`lg:w-3/5 px-6 py-4 sm:px-8 flex flex-col h-full max-h-full ${
                        (currentTab !== 'prescription' && currentTab !== 'documents') ? 'hidden lg:flex' :  'hidden'
                        // (currentTab !== 'prescription' && currentTab !== 'documents') ? 'hidden lg:flex' : (currentTab === '' ? 'flex' : 'hidden')
                      }`}>
                        <div className="flex-grow overflow-y-auto min-h-0">
                          <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Motif de consultation</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                              <p className="text-base text-gray-800">{consultation.motif}</p>
                            </div>
                          </div>

                          {consultation.consultation && (
                            <div className="mb-6">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Examen</h3>
                              <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-base text-gray-800 whitespace-pre-line">{consultation.consultation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Onglet Prescription */}
                      <div className={`lg:w-3/5 px-6 py-4 sm:px-8 flex flex-col h-full max-h-full ${
                        currentTab === 'prescription' ? 'flex' : 'hidden lg:hidden'
                      }`}>
                        <div className="flex-grow overflow-y-auto min-h-0">
                          {consultation.prescription ? (
                            <div className="mb-6">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription</h3>
                              <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-base text-gray-800 whitespace-pre-line">{consultation.prescription}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-10 flex-grow flex flex-col justify-center">
                              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto" />
                              <h3 className="mt-3 text-base font-medium text-gray-900">Aucune prescription</h3>
                              <p className="mt-2 text-base text-gray-500">
                                Cette consultation ne contient pas de prescription.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Onglet Documents */}
                      <div className={`lg:w-3/5 px-6 py-4 sm:px-8 flex flex-col h-full max-h-full ${
                        currentTab === 'documents' ? 'flex' : 'hidden lg:hidden'
                      }`}>
                        <div className="flex-grow overflow-y-auto min-h-0">
                          {consultation.documents && consultation.documents.length > 0 ? (
                            <div className="mb-6">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {consultation.documents.map((doc) => (
                                  <div key={doc.id} className="border border-gray-200 rounded-md p-2">
                                    <div className="aspect-w-4 aspect-h-3 mb-2">
                                      <img 
                                        src={doc.preview} 
                                        alt={`Document ${doc.id}`} 
                                        className="object-cover w-full h-full rounded-md" 
                                      />
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {doc.file.name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-10 flex-grow flex flex-col justify-center">
                              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto" />
                              <h3 className="mt-3 text-base font-medium text-gray-900">Aucun document</h3>
                              <p className="mt-2 text-base text-gray-500">
                                Cette consultation ne contient pas de documents.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          className="flex-1 py-2.5 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          onClick={onDelete}
                        >
                          Supprimer
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 py-2.5"
                          onClick={onClose}
                        >
                          Fermer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConsultationDetailSlideOver;