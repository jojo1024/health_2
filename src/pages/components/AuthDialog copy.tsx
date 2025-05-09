import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';

interface AuthDialogProps {
  patientId: string;
  onClose: () => void;
  onAuthorized?: () => void;

}

const AuthDialog: React.FC<AuthDialogProps> = ({ patientId, onClose, onAuthorized }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleNext = () => {
    if (step === 1) {
      if (!phone || phone.length < 10) {
        setError('Veuillez entrer un numéro valide');
        return;
      }
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(code);
      setStep(2);
      setError('');
    } else {
      if (enteredCode === generatedCode) {
        window.location.href = `/patients/${patientId}`;
      } else {
        setError('Code incorrect');
      }
    }
  };

  useEffect(() => {
    if (step === 2 && generatedCode) {
      console.log(`Envoyé au ${phone}: ${generatedCode}`);
    }
  }, [step, generatedCode, phone]);

  return (
    <Transition appear show as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    {step === 1 ? 'Vérification d’identité' : 'Saisie du code'}
                  </Dialog.Title>
                  <button onClick={onClose}>
                    <XMarkIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                <div>
                  {step === 1 ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">Entrez votre numéro pour recevoir un code.</p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          className="block w-full pl-10 pr-3 py-2 border rounded-md"
                          placeholder="06 12 34 56 78"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 mb-4">Code envoyé à {phone}</p>
                      <input
                        type="text"
                        maxLength={4}
                        className="block w-full pl-3 pr-3 py-2 border rounded-md"
                        placeholder="1234"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                      />
                      <p className="text-xs text-gray-400 mt-2">Pour la démo, code: {generatedCode}</p>
                    </>
                  )}
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    {step === 1 ? 'Envoyer' : 'Vérifier'}
                  </button>
                  <button onClick={onClose} className="px-4 py-2 bg-white border rounded-md">
                    Annuler
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthDialog;
