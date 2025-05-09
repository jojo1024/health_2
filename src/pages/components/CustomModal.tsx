import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Décrit une étape du modal
 */
export interface Step {
  /** Titre affiché en en-tête */
  title: string;
  /** Contenu JSX pour cette étape */
  content: React.ReactNode;
  /** Texte du bouton principal (par défaut "Suivant") */
  primaryText?: string;
}

export interface CustomModalProps {
  /** Contrôle l'affichage du modal */
  isOpen: boolean;
  /** Callback pour fermer le modal */
  onClose: () => void;
  /** Étape courante (1-based) */
  currentStep: number;
  /** Tableau d'étapes */
  steps: Step[];
  /** Callback appelé lorsque l'utilisateur clique sur le bouton principal, reçoit le numéro d'étape */
  onNext: (step: number) => void;
  /** Texte du bouton annuler */
  cancelButtonText?: string;
}

/**
 * Composant générique de modal à plusieurs étapes
 */
const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  steps,
  onNext,
  cancelButtonText = 'Annuler',
}) => {
  if (!isOpen) return null;

  const stepIndex = currentStep - 1;
  const step = steps[stepIndex] || { title: '', content: null };
  const { title, content, primaryText } = step;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        {/* Fond semi-transparent */}
        <div className="fixed inset-0 bg-gray-500 opacity-75" aria-hidden="true" />

        {/* Contenu du modal */}
        <div className="inline-block align-middle bg-white rounded-lg shadow-xl transform transition-all max-w-lg w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">{content}</div>
          </div>

          {/* Pied de modal avec actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => onNext(currentStep)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {primaryText ?? 'Suivant'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {cancelButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
