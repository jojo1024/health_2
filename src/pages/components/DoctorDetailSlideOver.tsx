import { Dialog, Transition } from '@headlessui/react';
import { PencilIcon, TrashIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { Fragment } from 'react';
import Button from '../../components/Button';
import { Doctor } from '../../types';

interface DoctorDetailSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
}

const DoctorDetailSlideOver: React.FC<DoctorDetailSlideOverProps> = ({
  isOpen,
  onClose,
  doctor,
  onEdit,
  onDelete,
}) => {
  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Détails du médecin
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              onClick={onClose}
                            >
                              <span className="sr-only">Fermer</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        {/* Informations du médecin */}
                        <div className="flex flex-col items-center pb-5">
                          <UserCircleIcon className="h-24 w-24 text-gray-300" aria-hidden="true" />
                          <h3 className="mt-3 text-lg font-medium text-gray-900">{doctor.nomUtilisateur} {doctor.prenomUtilisateur}</h3>
                          <div className="mt-1 text-sm text-gray-500">{doctor.specPersSoignant}</div>
                          <div className="mt-1 text-sm text-gray-500">N° {doctor.idPersSoignant}</div>
                        </div>

                        <div className="space-y-6 py-4">
                          {/* Informations personnelles */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">INFORMATIONS PERSONNELLES</h4>
                            <div className="mt-3 space-y-3">
                              {/* <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">Âge</div>
                                <div className="col-span-2 text-sm text-gray-900">
                                  {calculateAge(doctor.dateNaissanceMedecin)} ans ({doctor.dateNaissanceMedecin.toLocaleDateString('fr-FR')})
                                </div>
                              </div> */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">Spécialité</div>
                                <div className="col-span-2 text-sm text-gray-900">{doctor.specPersSoignant}</div>
                              </div>
                              {/* <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">Adresse</div>
                                <div className="col-span-2 text-sm text-gray-900">{doctor.adresse}</div>
                              </div> */}
                            </div>
                          </div>

                          {/* Informations professionnelles */}
                          {/* <div>
                            <h4 className="text-sm font-medium text-gray-500">INFORMATIONS PROFESSIONNELLES</h4>
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">N° Ordre</div>
                                <div className="col-span-2 text-sm text-gray-900">{doctor.numeroOrdre}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">Disponibilité</div>
                                <div className="col-span-2 text-sm text-gray-900">{doctor.disponibilite}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">Patients</div>
                                <div className="col-span-2 text-sm text-gray-900">
                                  {doctor.patients.length} patient(s)
                                </div>
                              </div>
                            </div>
                          </div> */}

                          {/* Informations de contact */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">CONTACT</h4>
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1 text-sm font-medium text-gray-500">Téléphone</div>
                                <div className="col-span-2 text-sm text-gray-900">{doctor.telephoneUtilisateur}</div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions en bas */}
                    <div className="flex flex-shrink-0 justify-between gap-2 px-4 py-4">
                      <Button
                        variant="danger"
                        onClick={() => onDelete(doctor.idPersSoignant)}
                        icon={<TrashIcon className="h-5 w-5" />}
                      >
                        Supprimer
                      </Button>
                      
                      <Button 
                        onClick={() => onEdit(doctor)}
                        icon={<PencilIcon className="h-5 w-5" />}
                      >
                        Modifier
                      </Button>
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

export default DoctorDetailSlideOver;