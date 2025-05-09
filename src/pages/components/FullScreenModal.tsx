import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FullscreenModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({
    isOpen,
    onClose,
    title,
    children
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    <div className="min-h-full">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full h-screen transform overflow-hidden bg-white shadow-xl transition-all flex flex-col">
                                {/* En-tête avec bouton de fermeture */}
                                <div className="bg-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium text-gray-900"
                                    >
                                        {title || 'Visualisation plein écran'}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Fermer</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Contenu du modal */}
                                <div className="flex-1 overflow-auto p-0">
                                    {children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default FullscreenModal;

// Alternative : SlideOver (panneau latéral qui glisse depuis la droite)
export const SlideOverPanel: React.FC<FullscreenModalProps> = ({
    isOpen,
    onClose,
    title,
    children
}) => {
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-7xl">
                                    <div className="flex h-full flex-col bg-white shadow-xl">
                                        <div className="bg-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                                            <Dialog.Title className="text-lg font-medium text-gray-900">
                                                {title || 'Visualisation détaillée'}
                                            </Dialog.Title>
                                            <button
                                                type="button"
                                                className="rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onClick={onClose}
                                            >
                                                <span className="sr-only">Fermer</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-auto p-0">
                                            {children}
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