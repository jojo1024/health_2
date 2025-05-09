import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { Link } from 'react-router-dom';

// Type pour les consultations
interface Consultation {
  id: string;
  date: string;
  doctorId: string;
  patientId: string;
  notes: string;
}

// Type pour le patient
export interface PatientDetail {
  id: string;
  numeroPatient: string;
  nomPrenomPatient: string;
  dateNaissancePatient: Date;
  medecin: string;
  medecinId?: string;
  ethniePatient: string;
  groupeSanguinPatient: string;
  lieuHabitationPatient: string;
  telephone?: string;
  email?: string;
  sexe?: string;
  consultations?: Consultation[];
}

interface PatientDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientDetail | null;
  onEdit: (patient: PatientDetail) => void;
  onDelete: (id: string) => void;
  onNewConsultation: (patientId: string) => void;
}

const PatientDetailSlideOver: React.FC<PatientDetailSlideOverProps> = ({
  isOpen,
  onClose,
  patient,
  onEdit,
  onDelete,
  onNewConsultation
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const consultationsPerPage = 5;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Fonction pour obtenir l'âge du patient
  const getAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  useEffect(() => {
    // Reset pagination when patient changes
    setCurrentPage(1);
  }, [patient?.id]);

  if (!patient) return null;
  
  const totalConsultations = patient.consultations?.length || 0;
  const totalPages = Math.ceil(totalConsultations / consultationsPerPage);
  const currentConsultations = patient.consultations?.slice(
    (currentPage - 1) * consultationsPerPage, 
    currentPage * consultationsPerPage
  ) || [];
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Couleurs des groupes sanguins
  const bloodGroupColors: Record<string, string> = {
    'A+': 'bg-red-100 text-red-800',
    'A-': 'bg-red-100 text-red-800',
    'B+': 'bg-blue-100 text-blue-800',
    'B-': 'bg-blue-100 text-blue-800',
    'AB+': 'bg-purple-100 text-purple-800',
    'AB-': 'bg-purple-100 text-purple-800',
    'O+': 'bg-green-100 text-green-800',
    'O-': 'bg-green-100 text-green-800',
  };

  // Obtenir la couleur du groupe sanguin
  const getBloodGroupClass = (group: string) => {
    return bloodGroupColors[group] || 'bg-gray-100 text-gray-800';
  };

  // Déterminer la classe de la carte de consultation
  const getConsultationCardClass = (index: number) => {
    return index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
  };

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" />
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
                    <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl rounded-l-xl">
                      {/* En-tête amélioré avec dégradé */}
                      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-6 sm:px-8">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-2xl font-bold text-white">
                            Fiche Patient
                          </Dialog.Title>
                          <div className="flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-full bg-white/10 p-1 text-white hover:bg-white/20 transition-all"
                              onClick={onClose}
                            >
                              <span className="sr-only">Fermer</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Patient Header avec avatar */}
                      <div className="bg-white px-6 py-6 sm:px-8 border-b border-gray-200 shadow-sm">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                              {patient.nomPrenomPatient.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-5 flex-1">
                            <h3 className="text-2xl font-bold text-gray-900">{patient.nomPrenomPatient}</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge variant="primary" className="font-medium">ID: {patient.numeroPatient}</Badge>
                              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${getBloodGroupClass(patient.groupeSanguinPatient)}`}>
                                Groupe: {patient.groupeSanguinPatient}
                              </span>
                              {patient.sexe && (
                                <span className="inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium bg-indigo-100 text-indigo-800">
                                  {patient.sexe}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium bg-amber-100 text-amber-800">
                                {getAge(patient.dateNaissancePatient)} ans
                              </span>
                            </div>
                            <div className="mt-3 flex space-x-3">
                              <button
                                onClick={() => onEdit(patient)}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => onNewConsultation(patient.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                              >
                                <PlusCircleIcon className="mr-1.5 h-4 w-4" />
                                Nouvelle consultation
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Layout responsive: côte à côte sur desktop, empilé sur mobile */}
                      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200 flex-grow overflow-hidden">
                        {/* Colonne gauche: Informations patient */}
                        <div className="lg:w-2/5 px-6 py-6 sm:px-8 overflow-y-auto">
                          <div className="bg-white rounded-xl overflow-hidden shadow">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                <UserCircleIcon className="h-5 w-5 mr-2 text-indigo-600" />
                                Informations personnelles
                              </h4>
                            </div>
                            <div className="px-6 py-5 space-y-6">
                              <div className="flex items-start">
                                <UserIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Identité</div>
                                  <div className="text-base font-medium text-gray-900 mt-1">{patient.nomPrenomPatient}</div>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <CalendarIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Date de naissance</div>
                                  <div className="text-base font-medium text-gray-900 mt-1">
                                    {formatDate(patient.dateNaissancePatient)} ({getAge(patient.dateNaissancePatient)} ans)
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <UserIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Ethnie</div>
                                  <div className="text-base font-medium text-gray-900 mt-1">{patient.ethniePatient}</div>
                                </div>
                              </div>

                              <div className="flex items-start">
                                <IdentificationIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Médecin traitant</div>
                                  <div className="text-base font-medium text-gray-900 mt-1">{patient.medecin || 'Non assigné'}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl overflow-hidden shadow mt-6">
                            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                <EnvelopeIcon className="h-5 w-5 mr-2 text-indigo-600" />
                                Coordonnées
                              </h4>
                            </div>
                            <div className="px-6 py-5 space-y-6">
                              {patient.telephone && (
                                <div className="flex items-start">
                                  <PhoneIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-500">Téléphone</div>
                                    <div className="text-base font-medium text-gray-900 mt-1">{patient.telephone}</div>
                                  </div>
                                </div>
                              )}

                              {patient.email && (
                                <div className="flex items-start">
                                  <EnvelopeIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-500">Email</div>
                                    <div className="text-base font-medium text-gray-900 mt-1">{patient.email}</div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-start">
                                <MapPinIcon className="w-5 h-5 text-indigo-600 mt-1 mr-4" />
                                <div>
                                  <div className="text-sm font-medium text-gray-500">Adresse</div>
                                  <div className="text-base font-medium text-gray-900 mt-1">{patient.lieuHabitationPatient}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Colonne droite: Consultations avec pagination */}
                        <div className="lg:w-3/5 px-6 py-6 sm:px-8 border-t border-gray-200 lg:border-t-0 flex flex-col">
                          <div className="flex justify-between items-center mb-5">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-indigo-600" />
                              Consultations
                              {totalConsultations > 0 && (
                                <span className="ml-2 bg-indigo-100 text-indigo-800 py-0.5 px-2.5 rounded-full text-xs font-medium">
                                  {totalConsultations}
                                </span>
                              )}
                            </h4>
                            <Button
                              onClick={() => onNewConsultation(patient.id)}
                              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm"
                            >
                              <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                              Nouvelle consultation
                            </Button>
                          </div>

                          {patient.consultations && patient.consultations.length > 0 ? (
                            <>
                              <div className="divide-y divide-gray-200 flex-grow overflow-y-auto">
                                {currentConsultations.map((consultation, index) => (
                                  <div key={consultation.id} className={`py-5 px-4 rounded-lg my-2 ${getConsultationCardClass(index)} shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-base font-semibold text-gray-900 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-indigo-600" />
                                        {formatDate(new Date(consultation.date))}
                                      </span>
                                      <Link 
                                        to={`/consultations/${consultation.id}`} 
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                                      >
                                        Détails
                                      </Link>
                                    </div>
                                    <p className="mt-3 text-base text-gray-600 line-clamp-3">{consultation.notes}</p>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                  <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                      onClick={goToPreviousPage}
                                      disabled={currentPage === 1}
                                      className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                      Précédent
                                    </button>
                                    <button
                                      onClick={goToNextPage}
                                      disabled={currentPage === totalPages}
                                      className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                      Suivant
                                    </button>
                                  </div>
                                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-sm text-gray-700">
                                        Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                                      </p>
                                    </div>
                                    <div>
                                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                          onClick={goToPreviousPage}
                                          disabled={currentPage === 1}
                                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                          <span className="sr-only">Précédent</span>
                                          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                        
                                        {/* Pages */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                          <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                              page === currentPage
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                            }`}
                                          >
                                            {page}
                                          </button>
                                        ))}
                                        
                                        <button
                                          onClick={goToNextPage}
                                          disabled={currentPage === totalPages}
                                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                          <span className="sr-only">Suivant</span>
                                          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                      </nav>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-10 flex-grow flex flex-col justify-center bg-gray-50 rounded-xl border border-gray-200">
                              <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto" />
                              <h3 className="mt-3 text-base font-medium text-gray-900">Aucune consultation</h3>
                              <p className="mt-2 text-base text-gray-500">
                                Ce patient n'a pas encore de consultations enregistrées.
                              </p>
                              <div className="mt-8">
                                <Button 
                                  onClick={() => onNewConsultation(patient.id)} 
                                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm"
                                >
                                  <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                                  Nouvelle consultation
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="border-t border-gray-200 px-6 py-4 sm:px-8 bg-gray-50">
                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={() => onDelete(patient.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Supprimer le patient
                          </button>
                          <Button
                            variant="outline"
                            className="inline-flex items-center px-4 py-2"
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
    </>
  );
};

export default PatientDetailSlideOver;