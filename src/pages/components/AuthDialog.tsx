// AuthDialog.tsx - Version améliorée avec validation SMS
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import { Dialog } from '@headlessui/react';
import ModalWithTransition from './ModalWithTransition';
import { authService } from '../../services/api';
import { Patient } from '../../types';

interface AuthDialogProps {
  telephoneUtilisateur: string;
  onClose: () => void;
  onAuthorized?: (patient: Patient) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ telephoneUtilisateur, onClose, onAuthorized }) => {
  console.log("🚀 ~ telephoneUtilisateur>>>>>>>>>>:", telephoneUtilisateur)
  const [step, setStep] = useState<'phone' | 'sms'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(telephoneUtilisateur.slice(3));
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsCode, setSmsCode] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(0);

  // Référence pour les inputs de code
  const inputRefs = Array(4).fill(0).map(() => React.createRef<HTMLInputElement>());


  // Timer de compte à rebours pour renvoyer le code
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft]);

  // Envoyer le code SMS
  const handleSendSMS = async () => {
    setIsSending(true);
    setError(null);

    try {
      // Simuler l'envoi API
      // await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await authService.requestPinCode(phoneNumber)
      if (response.status === 'success') {
        // setserverSmsCode(data.data)
        // Simuler succès
        setStep('sms');
        setTimeLeft(60); // 60 secondes avant de pouvoir renvoyer
      }

      // Dans une implémentation réelle, un code serait généré et envoyé par un service SMS
      console.log('Code SMS envoyé au', phoneNumber);
    } catch (error:any) {
      setError(error?.message || "Erreur lors de l'envoi du SMS. Veuillez réessayer.");
    } finally {
      setIsSending(false);
    }
  };

  // Gérer le changement des champs du code SMS
  const handleCodeChange = (index: number, value: string) => {
    // Ne prendre que le premier caractère si plus d'un est collé
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);

    // Mettre à jour le tableau de code
    const newCode = [...smsCode];
    newCode[index] = digit;
    setSmsCode(newCode);

    // Passer au champ suivant si on a saisi un chiffre
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Gérer la touche backspace pour revenir au champ précédent
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Vérifier le code SMS
  const handleVerifyCode = async () => {
    const fullCode = smsCode.join('');
    if (fullCode.length !== 4) {
      setError("Veuillez entrer le code à 4 chiffres complet.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Simuler vérification API
      // await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await authService.verifyCode(phoneNumber, fullCode)
      // Pour la démo, acceptons le code "1234"
      if (response.status === 'success' && response.data) {
        // Autorisation réussie
        if (onAuthorized) {
          if(response.data?.typeUtilisateur !== 'PATIENT'){
            setError("Cet utilisateur n'est pas un patient.");
            return;

          }
          onAuthorized(response.data);
        }
        onClose();
      } else {
        setError("Code incorrect. Veuillez réessayer.");
        // Réinitialiser le code pour un nouvel essai
        setSmsCode(['', '', '', '']);
        // Focus sur le premier champ
        inputRefs[0].current?.focus();
      }
    } catch (error: any) {
      console.log("🚀 ~ handleVerifyCode ~ error:", error)
      setError(error?.message || "Erreur lors de la vérification du code. Veuillez réessayer.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Coller un code complet
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);

    if (pastedData) {
      const newCode = [...smsCode];
      for (let i = 0; i < pastedData.length && i < 4; i++) {
        newCode[i] = pastedData[i];
      }
      setSmsCode(newCode);

      // Focus sur le dernier champ rempli ou le suivant
      const focusIndex = Math.min(pastedData.length, 3);
      inputRefs[focusIndex].current?.focus();
    }
  };

  return (
    <ModalWithTransition
      isOpen={true}
      onClose={onClose}
      title={step === 'phone' ? "Vérification d’identité" : "Saisie du code"}
    >
      <>

        {step === 'phone' && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Pour des raisons de confidentialité, vous devez avoir l'approbation du patient, veuillez saisir son numero.
            </p>

            {/* {patientInfo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">Patient: {patientInfo.name}</p>
                <p className="text-sm text-gray-500">ID: {patientInfo.id}</p>
              </div>
            )} */}

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: 0708091011"
                
              />
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSendSMS}
                loading={isSending}
                disabled={!phoneNumber || phoneNumber.length < 10}
              >
                Envoyer le code
              </Button>
            </div>
          </div>
        )}

        {step === 'sms' && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-4">
              Un code de vérification à 4 chiffres a été envoyé au {phoneNumber}.
              Veuillez saisir ce code pour continuer.
            </p>

            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={smsCode[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="text-center mb-4">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-500">
                  Renvoyer le code dans {timeLeft} secondes
                </p>
              ) : (
                <button
                  onClick={handleSendSMS}
                  disabled={isSending}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Renvoyer le code
                </button>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setStep('phone')}
              >
                Retour
              </Button>
              <Button
                variant="primary"
                onClick={handleVerifyCode}
                loading={isVerifying}
                disabled={smsCode.some(digit => !digit)}
              >
                Vérifier
              </Button>
            </div>
          </div>
        )}
      </>
    </ModalWithTransition>

  );
};

export default AuthDialog;

// Service d'authentification - à utiliser pour l'intégration avec le reste de l'application
export const AuthService = {
  // Fonction utilitaire pour vérifier si une action nécessite une authentification
  requireAuth: (action: () => void) => {
    // Cette fonction pourrait vérifier si l'utilisateur est déjà authentifié
    // Pour l'instant, on simule toujours le besoin d'authentification

    // Dans une vraie application, on vérifierait un token ou une session
    const isAuthenticated = false;

    if (isAuthenticated) {
      // Si déjà authentifié, exécuter l'action directement
      action();
    } else {
      // Sinon, enregistrer l'action pour l'exécuter après authentification
      // Dans cet exemple, on stockerait l'action et montrerait le modal d'auth
      console.log("Authentification requise avant d'exécuter cette action");
      // setShowAuthDialog(true); // À implémenter dans le composant parent
      // setPendingAction(action); // À implémenter dans le composant parent
    }
  }
};