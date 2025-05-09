import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalWithTransitionProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  widthClass?: string; // ex: 'max-w-md' ou 'max-w-2xl'
}

const ModalWithTransition: React.FC<ModalWithTransitionProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  widthClass = 'max-w-md',
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Background overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        {/* Dialog wrapper */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${widthClass} transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all`}>
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex justify-between items-center mb-4">
                    {title && <Dialog.Title className="text-lg font-medium text-gray-900">{title}</Dialog.Title>}
                    {showCloseButton && (
                      <button onClick={onClose}>
                        <XMarkIcon className="h-6 w-6 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
                {/* Content */}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalWithTransition;
