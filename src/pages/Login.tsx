import { useState, FormEvent } from 'react';
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
  console.log("🚀 ~ Login ~ phoneNumber:", phoneNumber)
  const [verificationCode, setVerificationCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  console.log("🚀 ~ Login ~ loading:", loading)
  const { isAuthenticated, isLoading, error, currentStep, codeExpiresIn, isCodeExpired, initiateLogin, verifyCode } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

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

  const handlePhoneSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setFormError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    // Validation améliorée du numéro de téléphone
    // if (!isValidPhoneNumber(phoneNumber)) {
    //   setFormError('Format du numéro de téléphone invalide. Utilisez un format français (06 12 34 56 78) ou international (+33 6 12 34 56 78)');
    //   return;
    // }

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

    if (!verificationCode.trim()) {
      setFormError('Veuillez entrer le code de vérification');
      return;
    }

    setFormError(null);
    try {
      setLoading(true);
      const success = await verifyCode(verificationCode);
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
    initiateLogin(phoneNumber); // Réinitialiser à l'étape du téléphone
  };

  // Rediriger si l'utilisateur est authentifié
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Afficher le formulaire de numéro de téléphone ou de vérification de code en fonction de l'étape actuelle
  return (
    <div className=" flex items-center h-[100vh] justify-center bg-gray-50   px-4 sm:px-6 lg:px-8">
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
                {/* <p className="mt-2 text-sm text-gray-500">
                  Formats acceptés: 06 12 34 56 78 ou +33 6 12 34 56 78
                </p> */}
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
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Code de vérification
                </label>
                <div className="mt-1">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={isLoading || isCodeExpired}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Saisissez le code à 6 chiffres envoyé par SMS
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
                  onClick={() => initiateLogin(phoneNumber)}
                  disabled={isLoading}
                >
                  {isCodeExpired ? 'Demander un nouveau code' : 'Recevoir un nouveau code'}
                </button>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Numéros de téléphone de démonstration
              </span>
            </div>
          </div>
          
          <motion.div
            className="mt-6 grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                className="cursor-pointer rounded-md border border-gray-300 bg-white py-2 px-3 hover:bg-gray-50"
                onClick={() => {
                  setPhoneNumber(user.phoneNumber);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.8 + index * 0.1
                  }
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`}
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="truncate text-sm text-gray-500">{user.phoneNumber}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div> */}
      </motion.div>
    </div>
  );
};

export default Login;
