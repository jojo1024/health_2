import { useState, FormEvent, useRef, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  LockClosedIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { AuthStep } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Fonction d'aide pour formater et valider les numéros de téléphone
const formatPhoneNumber = (input: string): string => {
  // Supprimer tous les caractères non numériques
  const cleaned = input.replace(/\D/g, '');

  // Ajouter des espaces pour formater le numéro
  if (cleaned.length > 0) {
    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 2 === 0 && i < 10) {
        formatted += ' ';
      }
      formatted += cleaned[i];
    }
    return formatted;
  }
  return cleaned;
};

// Fonction pour valider un numéro de téléphone
const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Supprimer tous les espaces pour la validation
  const cleaned = phoneNumber.replace(/\s/g, '');

  // Numéro français commençant par 0 et suivi de 9 chiffres
  const frenchRegex = /^0[1-9][0-9]{8}$/;

  // Numéro international commençant par +33 et suivi de 9 chiffres
  const internationalRegex = /^\+33[1-9][0-9]{8}$/;

  return frenchRegex.test(cleaned) || internationalRegex.test(cleaned);
};

// Fonction pour convertir un numéro au format standard
const standardizePhoneNumber = (phoneNumber: string): string => {
  // Supprimer tous les espaces
  const cleaned = phoneNumber.replace(/\s/g, '');

  // Convertir le format international +33 au format français 0
  if (cleaned.startsWith('+33')) {
    return '0' + cleaned.substring(3);
  }

  return cleaned;
};

// Composant pour le compte à rebours
const CountdownTimer = ({ seconds }: { seconds: number | null }) => {
  if (seconds === null) return null;

  // Formater le temps restant
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Déterminer la couleur en fonction du temps restant
  const getColorClass = (seconds: number): string => {
    if (seconds <= 30) return "text-red-600";
    if (seconds <= 60) return "text-orange-500";
    return "text-blue-600";
  };

  return (
    <div className="flex items-center justify-center mt-2">
      <div className="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${getColorClass(seconds)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-sm ${getColorClass(seconds)}`}>
          Code valide pendant: {formatTime(seconds)}
        </span>
      </div>
    </div>
  );
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState(['', '', '', '']); // Pour un code à 4 chiffres
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, isLoading, error, currentStep, codeExpiresIn, isCodeExpired, initiateLogin, verifyCode } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Initialiser les refs pour les inputs OTP
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, smsCode.length);
  }, [smsCode.length]);

  // Focus sur le premier input lorsque le formulaire OTP est affiché
  useEffect(() => {
    if (currentStep === AuthStep.CODE_VERIFICATION) {
      setTimeout(() => {
        const firstInput = inputRefs.current[0];
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [currentStep]);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Gestionnaire de changement pour le champ de numéro de téléphone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPhoneNumber(formatPhoneNumber(input));
  };

  // Gestionnaire de changement pour les champs OTP
  const handleCodeChange = (index: number, value: string) => {
    // Ne prendre que les chiffres
    const newValue = value.replace(/\D/g, '');
    
    if (newValue.length <= 1) {
      // Mettre à jour le code SMS
      const newCode = [...smsCode];
      newCode[index] = newValue;
      setSmsCode(newCode);
      
      // Passer au champ suivant si une valeur est entrée et qu'il y a un champ suivant
      if (newValue && index < smsCode.length - 1) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Gestionnaire pour les touches spéciales (suppression, flèches, etc.)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      // Si backspace est pressé et que le champ actuel est vide, aller au champ précédent
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Naviguer vers la gauche
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    } else if (e.key === 'ArrowRight' && index < smsCode.length - 1) {
      // Naviguer vers la droite
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Gestionnaire de collage pour le premier champ OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    
    if (pastedData) {
      const newCode = [...smsCode];
      for (let i = 0; i < Math.min(pastedData.length, smsCode.length); i++) {
        newCode[i] = pastedData[i];
      }
      setSmsCode(newCode);
      
      // Mettre le focus sur le dernier champ rempli ou le suivant
      const focusIndex = Math.min(pastedData.length, smsCode.length - 1);
      const targetInput = inputRefs.current[focusIndex];
      if (targetInput) {
        targetInput.focus();
      }
    }
  };

  const handlePhoneSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setFormError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setFormError(null);
    try {
      setLoading(true);
      // Standardiser le numéro avant de l'envoyer
      const standardizedPhone = standardizePhoneNumber(phoneNumber);
      const success = await initiateLogin(standardizedPhone);
      if (!success) {
        setFormError('Numéro de téléphone non reconnu');
      }
    } catch (error) {
      setFormError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Vérifier si tous les champs sont remplis
    if (smsCode.some(digit => !digit.trim())) {
      setFormError('Veuillez saisir le code complet');
      return;
    }

    const combinedCode = smsCode.join('');
    setFormError(null);
    
    try {
      setLoading(true);
      const success = await verifyCode(combinedCode);
      if (!success) {
        setFormError('Code de vérification incorrect');
      }
    } catch (error) {
      setFormError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour revenir à l'étape du numéro de téléphone
  const handleBackToPhone = () => {
    setSmsCode(['', '', '', '']); // Réinitialiser le code SMS
    initiateLogin(phoneNumber); // Réinitialiser à l'étape du téléphone
  };

  // Fonction pour demander un nouveau code
  const handleRequestNewCode = () => {
    setSmsCode(['', '', '', '']); // Réinitialiser le code SMS
    initiateLogin(phoneNumber);
  };

  // Rediriger si l'utilisateur est authentifié
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Afficher le formulaire de numéro de téléphone ou de vérification de code en fonction de l'étape actuelle
  return (
    <div className="flex items-center h-[100vh] justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.h1
            className="text-center text-3xl font-bold text-blue-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Lomeko Santé
          </motion.h1>
          <motion.h2
            className="mt-6 text-center text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Connexion à votre compte
          </motion.h2>
          <motion.p
            className="mt-2 text-center text-sm text-gray-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Accédez à l'application de gestion des patients
          </motion.p>
        </div>

        {(error || formError) && (
          <motion.div
            className="rounded-md bg-red-50 p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error || formError}
                </h3>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === AuthStep.PHONE_INPUT && (
            <motion.form
              key="phone-form"
              className="mt-8 space-y-6"
              onSubmit={handlePhoneSubmit}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="06 12 34 56 78"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <DevicePhoneMobileIcon
                      className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                      aria-hidden="true"
                    />
                  </span>
                  {loading ? 'Envoi en cours...' : 'Recevoir le code SMS'}
                  {loading && (
                    <span className="ml-2 animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                  )}
                </button>
              </motion.div>
            </motion.form>
          )}

          {currentStep === AuthStep.CODE_VERIFICATION && (
            <motion.form
              key="code-form"
              className="mt-8 space-y-6"
              onSubmit={handleCodeSubmit}
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div variants={itemVariants} className="flex items-center">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="inline-flex items-center mr-2 text-sm text-blue-600 hover:text-blue-500"
                  disabled={isLoading}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Retour
                </button>
                <span className="text-gray-500 text-sm">Numéro: {phoneNumber}</span>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification
                </label>
                
                {/* Champs OTP pour la saisie du code */}
                <div className="flex justify-center space-x-2 mb-4">
                  {smsCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading || isCodeExpired}
                    />
                  ))}
                </div>
                
                <p className="mt-2 text-sm text-gray-500">
                  Saisissez le code à 4 chiffres envoyé par SMS
                </p>

                {/* Ajout du compte à rebours */}
                <CountdownTimer seconds={codeExpiresIn} />

                {isCodeExpired && (
                  <motion.p
                    className="mt-2 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    Le code a expiré. Veuillez demander un nouveau code.
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isLoading || isCodeExpired}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                      aria-hidden="true"
                    />
                  </span>
                  {loading ? 'Vérification...' : 'Vérifier le code'}
                  {loading && (
                    <span className="ml-2 animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
                  )}
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
                  onClick={handleRequestNewCode}
                  disabled={isLoading}
                >
                  {isCodeExpired ? 'Demander un nouveau code' : 'Recevoir un nouveau code'}
                </button>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;