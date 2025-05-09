import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import {
  XMarkIcon
} from '@heroicons/react/24/outline';
import '@react-pdf-viewer/core/lib/styles/index.css';
import React, { Fragment, useEffect, useState } from 'react';
import Button from '../../components/Button';
import { Document } from '../../hooks/useFormData';
import { API_URL_DOC } from '../../services/api';
import { ConsultationRegroupee } from '../../types';


interface PatientConsultationDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  consultationDetail: ConsultationRegroupee | null;
  // onEdit: (consultationDetail: PatientAvecConsultations) => void;
  // onDelete: (idPatient: number) => void;
  // onNewConsultation: (idPatient: number) => void;
}

const PatientConsultationDetailSlideOver: React.FC<PatientConsultationDetailSlideOverProps> = ({
  isOpen,
  onClose,
  consultationDetail,
  // onEdit,
  // onDelete,
  // onNewConsultation
}) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info' ou 'consultations'
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);



  useEffect(() => {
    // Reset active tab to info by default
    setActiveTab('info');
  }, [consultationDetail?.idConsultation]);



  const openPreview = (doc: any) => {
    setPreviewDocument(doc);
  };

  const closePreview = () => {
    setPreviewDocument(null);
  };

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={onClose}>
          <TransitionChild
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

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
                  <DialogPanel className="pointer-events-auto w-screen max-w-5xl">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      {/* En-tête */}
                      <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <DialogTitle className="text-lg md:text-2xl font-semibold text-gray-900">
                            Détails de consultations {consultationDetail?.nomPatient} {consultationDetail?.prenomPatient}
                          </DialogTitle>
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
                        {/* <h3 className="text-xl font-medium leading-6 text-gray-900">{patient.nomPrenomPatient}</h3> */}
                        <div className="mt-2 flex flex-wrap gap-3">
                          {/* <Badge variant="primary">ID: {consultationDetail?.idPatient}</Badge> */}
                          {/* <Badge variant="success">Groupe: {consultationDetail?.groupeSanguinPatient}</Badge> */}
                          {/* <Badge variant="primary">Temp.: {consultationDetail.c}</Badge>
                          <Badge variant="primary">Poids: 110 kg</Badge>
                          <Badge variant="primary">Tension: 20/8</Badge> */}
                          {/* <Badge variant="info">Sexe: M</Badge> */}
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
                            Documents
                          </button>
                        </div>
                      </div>

                      {/* Layout responsive: tabs sur mobile/tablette, côte à côte sur desktop */}
                      <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200 flex-grow overflow-hidden">
                        {/* Colonne gauche: Informations patient */}
                        <div className={`lg:w-3/5 overflow-y-auto ${activeTab !== 'info' ? 'hidden lg:block' : ''}`}>
                          <div className="px-6 py-4 sm:px-8 h-full">
                            <div className="h-full overflow-y-auto ">
                              <h4 className="text-xl font-semibold text-indigo-700 mb-5">Motif de la consultation</h4>
                              <div className="space-y-4">
                                <div className="text-lg text-gray-800 bg-white p-4 rounded-lg  border-l-4 border-indigo-500">
                                  {consultationDetail?.motifConsultation}
                                </div>
                              </div>

                              <h4 className="text-xl font-semibold text-indigo-700 mt-8 mb-5">Détail de la consultation</h4>
                              <div className="space-y-4">
                                <div className="text-lg text-gray-800 bg-white p-4 rounded-lg border-l-4 border-indigo-500">
                                  {consultationDetail?.detailConsultation}
                                </div>
                              </div>

                              <h4 className="text-xl font-semibold text-indigo-700 mt-8 mb-5">Ordonnance</h4>
                              <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg  border-l-4 border-indigo-500">
                                  {consultationDetail?.ordonnance}
                                </div>
                              </div>
                            </div>




                          </div>
                        </div>

                        {/* Colonne droite: Consultations avec pagination */}
                        <div className={`lg:w-2/5 px-6 py-4 sm:px-8 flex flex-col h-full max-h-full ${activeTab !== 'consultations' ? 'hidden lg:flex' : ''}`}>
                          <div className="flex justify-between items-center mb-5 flex-shrink-0">
                            <h4 className="text-xl font-semibold text-indigo-700">Images et documents</h4>


                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {consultationDetail?.documentsConsultations.map((doc, index) => (
                              <div key={index} className="relative">
                                <div
                                  className="border rounded-md bg-gray-50 p-2 w-24 h-24 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                                  onClick={() => openPreview(doc)}
                                >
                                  {doc.type === 'image' ? (
                                    <img
                                      // @ts-ignore
                                      src={`${API_URL_DOC}/${doc?.filename}`}
                                      alt="Aperçu"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-center">
                                      <svg
                                        className="mx-auto h-8 w-8 text-gray-400"
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
                                      <span className="text-xs truncate block">
                                        {doc.filename.length > 10
                                          ? `${doc.filename.substring(0, 10)}...`
                                          : doc.filename}
                                      </span>
                                    </div>
                                  )}

                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            className="flex-1 py-2.5"
                          // onClick={() => onEdit(patient)}
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
                      </div>
                    </div>
                  </DialogPanel>
                </Transition.Child>
              </div>
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
                            src={`${API_URL_DOC}/${previewDocument.filename}`}
                            alt={previewDocument.filename}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <object
                              data={`${API_URL_DOC}/${previewDocument.filename}`}
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
                                    href={`${API_URL_DOC}/${previewDocument.filename}`}
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

      </Transition.Root>
    </>
  );
};

export default PatientConsultationDetailSlideOver;