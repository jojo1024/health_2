import { Dialog, Transition } from '@headlessui/react';
import {
  CalendarIcon,
  EnvelopeIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import React, { Fragment, useEffect, useState } from 'react';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Patient } from '../../types';

// Type pour les consultations
interface Consultation {
  id: string;
  date: string;
  doctorId: string;
  patientId: string;
  notes: string;
}

interface PatientDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
}

const PatientDetailSlideOver: React.FC<PatientDetailSlideOverProps> = ({
  isOpen,
  onClose,
  patient,
  onEdit,
  onDelete,
}) => {

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };



  if (!patient) return null;

  // Rendu du contenu des informations personnelles
  const renderPersonalInfo = () => (
    <div className="space-y-5 pt-2">
      <div className="flex items-start">
        <UserIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Identité</div>
          <div className="text-lg text-gray-900 mt-1">{patient.nomUtilisateur} {patient.prenomUtilisateur}</div>
        </div>
      </div>

      <div className="flex items-start">
        <CalendarIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Date de naissance</div>
          <div className="text-lg text-gray-900 mt-1">
            {patient.dateNaisPatient instanceof Date 
              ? formatDate(patient.dateNaisPatient)
              : formatDate(new Date(patient.dateNaisPatient))}
          </div>
        </div>
      </div>

      <div className="flex items-start">
        <UserIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Ethnie</div>
          <div className="text-lg text-gray-900 mt-1">{patient.ethniePatient}</div>
        </div>
      </div>
    </div>
  );

  // Rendu du contenu des coordonnées
  const renderContactInfo = () => (
    <div className="space-y-5 pt-2">
      {patient.telephoneUtilisateur && (
        <div className="flex items-start">
          <PhoneIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
          <div>
            <div className="text-sm font-medium text-gray-500">Téléphone</div>
            <div className="text-lg text-gray-900 mt-1">{patient.telephoneUtilisateur}</div>
          </div>
        </div>
      )}

      <div className="flex items-start">
        <MapPinIcon className="w-6 h-6 text-gray-400 mt-1 mr-4" />
        <div>
          <div className="text-sm font-medium text-gray-500">Adresse</div>
          <div className="text-lg text-gray-900 mt-1">{patient.adressePatient}</div>
        </div>
      </div>
    </div>
  );



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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      {/* En-tête */}
                      <div className="px-6 py-6 sm:px-8 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-xl font-semibold text-gray-900">
                            Détails du patient {patient.nomUtilisateur} {patient.prenomUtilisateur}
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
                        <div className="mt-2 flex flex-wrap gap-3">
                          <Badge variant="primary">ID: {patient.idPatient}</Badge>
                          <Badge variant="success">Groupe: {patient.groupeSanguinPatient}</Badge>
                          {patient.sexePatient && <Badge variant="info">{patient.sexePatient}</Badge>}
                        </div>
                      </div>

              

                      {/* Layout responsive: tabs sur mobile/tablette, côte à côte sur desktop */}
                      <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Colonne gauche: Informations patient */}
                        <div className={`flex-1 overflow-y-auto`}>
                          <div className="px-6 py-4 sm:px-8 h-full">
                            <div className="h-full overflow-y-auto">
                              <h4 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h4>
                              {renderPersonalInfo()}

                              <h4 className="text-lg font-medium text-gray-900 mt-8 mb-4">Coordonnées</h4>
                              {renderContactInfo()}
                            </div>
                          </div>
                        </div>

                      
                      </div>

                      {/* Footer actions */}
                      <div className="border-t border-gray-200 px-6 py-4 sm:px-8">
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            className="flex-1 py-2.5"
                            onClick={() => onEdit(patient)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="danger"
                            className="flex-1 py-2.5"
                            onClick={() => onDelete(patient.idPatient)}
                          >
                            Supprimer
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