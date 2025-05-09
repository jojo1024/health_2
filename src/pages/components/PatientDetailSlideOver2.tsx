import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
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
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { ConsultationRegroupee, PatientAvecConsultations } from '../../types';
import { calculateAge } from '../../utils/functions';

// Type pour les consultations




interface PatientDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: PatientAvecConsultations | null;
  // onEdit: (consultation: PatientAvecConsultations) => void;
  // onDelete: (idPatient: number) => void;
  onNewConsultation: (idPatient: number) => void;
  onOpenConsultationDetail: (data: ConsultationRegroupee) => void;
}

const PatientDetailSlideOver2: React.FC<PatientDetailSlideOverProps> = ({
  isOpen,
  onClose,
  consultation,
  // onEdit,
  // onDelete,
  onNewConsultation,
  onOpenConsultationDetail
}) => {
  console.log("🚀 ~ consultation:<<<<<<<<<<<<", consultation)
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'consultations'
  const consultationsPerPage = 5;



  useEffect(() => {
    // Reset pagination when consultation changes
    setCurrentPage(1);
    // Reset active tab to info by default
    setActiveTab('info');
  }, [consultation?.idPatient]);

  if (!consultation) return null;

  const totalConsultations = consultation.consultations?.length || 0;
  const totalPages = Math.ceil(totalConsultations / consultationsPerPage);
  const currentConsultations = consultation.consultations?.slice(
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

  // Rendu du contenu des informations personnelles
  const renderPersonalInfo = () => (
    <div className="space-y-5 pt-2">
      <div className="flex items-start">
        <UserIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Identité</div>
          <div className="text-lg text-gray-900 mt-1">{consultation.nomPatient} {consultation.prenomPatient}</div>
        </div>
      </div>

      <div className="flex items-start">
        <CalendarIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Âge</div>
          <div className="text-lg text-gray-900 mt-1">{calculateAge(consultation.dateNaisPatient)}</div>
        </div>
      </div>

      <div className="flex items-start">
        <UserIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Ethnie</div>
          <div className="text-lg text-gray-900 mt-1">{consultation.ethniePatient}</div>
        </div>
      </div>

    </div>
  );

  // Rendu du contenu des coordonnées
  const renderContactInfo = () => (
    <div className="space-y-5 pt-2">
      {consultation.telephonePatient && (
        <div className="flex items-start">
          <PhoneIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
          <div>
            <div className="text-sm font-medium text-gray-500">Téléphone</div>
            <div className="text-lg text-gray-900 mt-1">{consultation.telephonePatient}</div>
          </div>
        </div>
      )}




      <div className="flex items-start">
        <MapPinIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Adresse</div>
          <div className="text-lg text-gray-900 mt-1">{consultation.adressePatient}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
              {/* Panel beaucoup plus large pour l'affichage en colonnes sur desktop */}
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
                  {/* Panel plus large: max-w-5xl pour un affichage généreux */}
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-5xl">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      {/* En-tête */}
                      <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg md:text-2xl font-semibold text-gray-900">
                            Détails du consultation {consultation.nomPatient} {consultation.prenomPatient}
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

                      {/* Patient Header */}
                      <div className="bg-white px-6 py-4 sm:px-8 border-b border-gray-200">
                        {/* <h3 className="text-xl font-medium leading-6 text-gray-900">{consultation.nomPrenomPatient}</h3> */}
                        <div className="mt-2 flex flex-wrap gap-3">
                          <Badge variant="primary">ID: {consultation.idPatient}</Badge>
                          <Badge variant="success">Groupe: {consultation.groupeSanguinPatient}</Badge>
                          {consultation.sexePatient && <Badge variant="info">Sexe: {consultation.sexePatient}</Badge>}
                        </div>
                      </div>

                      {/* Tabs pour mobile et tablette */}
                      <div className="lg:hidden border-b border-gray-200">
                        <div className="flex">
                          <button
                            className={`flex-1 py-4 px-4 text-center font-medium text-sm ${activeTab === 'info'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                            onClick={() => setActiveTab('info')}
                          >
                            Informations
                          </button>
                          <button
                            className={`flex-1 py-4 px-4 text-center font-medium text-sm ${activeTab === 'consultations'
                              ? 'text-indigo-600 border-b-2 border-indigo-600'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                            onClick={() => setActiveTab('consultations')}
                          >
                            Consultations
                          </button>
                        </div>
                      </div>

                      {/* Layout responsive: tabs sur mobile/tablette, côte à côte sur desktop */}
                      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200 flex-grow overflow-hidden">
                        {/* Colonne gauche: Informations consultation */}
                        <div className={`lg:w-2/5 overflow-y-auto ${activeTab !== 'info' ? 'hidden lg:block' : ''}`}>
                          <div className="px-6 py-4 sm:px-8 h-full">
                            <div className="h-full overflow-y-auto">
                              <h4 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h4>
                              {renderPersonalInfo()}

                              <h4 className="text-lg font-medium text-gray-900 mt-8 mb-4">Coordonnées</h4>
                              {renderContactInfo()}
                            </div>
                          </div>
                        </div>

                        {/* Colonne droite: Consultations avec pagination */}
                        <div className={`lg:w-3/5 px-6 py-4 sm:px-8 flex flex-col h-full max-h-full ${activeTab !== 'consultations' ? 'hidden lg:flex' : ''}`}>
                          <div className="flex justify-between items-center mb-5 flex-shrink-0">
                            <h4 className="text-lg font-medium text-gray-900">Consultations</h4>
                            {/* <Button
                              onClick={() => onNewConsultation(consultation.id)}
                              className="inline-flex items-center px-4 py-2"
                            >
                              Ajouter
                            </Button> */}
                          </div>

                          {consultation.consultations && consultation.consultations.length > 0 ? (
                            <>
                              {/* Conteneur pour la liste des consultations avec hauteur maximale */}
                              <div className="divide-y divide-gray-200 flex-grow overflow-y-auto min-h-0">
                                {currentConsultations.map((consultation) => (
                                  <div key={consultation.idConsultation} className="py-5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-base font-medium text-gray-900">{new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')}</span>
                                      {/* <Link to={`/consultations/${consultation.id}`} className="text-sm text-indigo-600 hover:text-indigo-800">
                                        Détails
                                      </Link> */}
                                      <button
                                        onClick={() => onOpenConsultationDetail(consultation)}
                                        className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                                      >
                                        Détails
                                      </button>
                                    </div>
                                    <p className="mt-3 text-base text-gray-600">{consultation.motifConsultation}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Pagination - rendu en flex-shrink-0 pour qu'elle reste toujours visible */}
                              {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 flex-shrink-0">
                                  <div className="flex flex-1 items-center justify-between">
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

                                        {/* Pages - simplifié pour les petits écrans */}
                                        <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold z-10 bg-indigo-600 text-white">
                                          {currentPage}
                                        </button>

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
                            <div className="text-center py-10 flex-grow flex flex-col justify-center">
                              <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto" />
                              <h3 className="mt-3 text-base font-medium text-gray-900">Aucune consultation</h3>
                              <p className="mt-2 text-base text-gray-500">
                                Ce consultation n'a pas encore de consultations enregistrées.
                              </p>
                              <div className="mt-8">
                                <Button onClick={() => onNewConsultation(consultation.idPatient)} className="inline-flex items-center px-5 py-2.5">
                                  Ajouter
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer actions */}
                      {/* <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            className="flex-1 py-2.5"
                            onClick={() => onEdit(consultation)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 py-2.5"
                            onClick={onClose}
                          >
                            Fermer
                          </Button>
                        </div>
                      </div> */}
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

export default PatientDetailSlideOver2;