import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState, UserRole, AuthStep } from '../types';
import { users } from '../data/mockData';

interface AuthContextType extends AuthState {
  // Nouvelle méthode pour initier la connexion avec numéro de téléphone
  initiateLogin: (phoneNumber: string) => Promise<boolean>;

  // Nouvelle méthode pour vérifier le code SMS
  verifyCode: (code: string) => Promise<boolean>;

  // Méthode de déconnexion existante
  logout: () => void;

  // Temps restant en secondes pour le code
  codeExpiresIn: number | null;

  // Indique si le code a expiré
  isCodeExpired: boolean;
}

// Créer le contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  currentStep: AuthStep.PHONE_INPUT,
  phoneNumber: null,
  verificationCode: null,
  codeExpiresIn: null,
  isCodeExpired: false,
  initiateLogin: async () => false,
  verifyCode: async () => false,
  logout: () => { /* Implémentation vide mais nécessaire */ }
});

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useHasRole = (roles: UserRole[]): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  return roles.includes(user.role);
};

interface AuthProviderProps {
  children: ReactNode;
}

// Durée de validité du code en secondes (5 minutes)
const CODE_EXPIRATION_TIME = 5 * 60;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    currentStep: AuthStep.PHONE_INPUT,
    phoneNumber: null,
    verificationCode: null
  });

  // État pour le temps d'expiration
  const [codeExpiresIn, setCodeExpiresIn] = useState<number | null>(null);
  const [isCodeExpired, setIsCodeExpired] = useState<boolean>(false);
  const [expirationTimer, setExpirationTimer] = useState<NodeJS.Timeout | null>(null);

  // Effet pour gérer le compte à rebours
  useEffect(() => {
    // Nettoyer le timer existant
    if (expirationTimer) {
      clearInterval(expirationTimer);
      setExpirationTimer(null);
    }

    // Si nous avons un code de vérification actif, démarrer le compte à rebours
    if (state.currentStep === AuthStep.CODE_VERIFICATION && state.verificationCode) {
      setCodeExpiresIn(CODE_EXPIRATION_TIME);
      setIsCodeExpired(false);

      const timer = setInterval(() => {
        setCodeExpiresIn(prevTime => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(timer);
            setIsCodeExpired(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      setExpirationTimer(timer);

      // Nettoyer le timer quand le composant est démonté
      return () => {
        clearInterval(timer);
      };
    } else {
      setCodeExpiresIn(null);
      setIsCodeExpired(false);
    }
  }, [state.currentStep, state.verificationCode]);

  useEffect(() => {
    // Vérifier si l'utilisateur est stocké dans localStorage (connexion persistante)
    const storedUser = localStorage.getItem('currentUser');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          currentStep: AuthStep.COMPLETED,
          phoneNumber: user.phoneNumber,
          verificationCode: null
        });
      } catch (error) {
        // Utilisateur stocké invalide, le supprimer
        localStorage.removeItem('currentUser');
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStep: AuthStep.PHONE_INPUT
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        currentStep: AuthStep.PHONE_INPUT
      }));
    }
  }, []);

  // Nouvelle méthode pour initier la connexion avec numéro de téléphone
  const initiateLogin = async (phoneNumber: string): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      phoneNumber
    }));

    try {
      // On vérifie si le numéro existe dans notre base de données
      const user = users.find(u => u.phoneNumber === phoneNumber);

      if (user) {
        // Si le numéro existe, on génère un code de vérification (exemple: 123456 pour la démo)
        const verificationCode = '123456';

        // Simuler l'envoi d'un SMS (log pour la démo)
        console.log(`[SMS SIMULATION] Sending code ${verificationCode} to ${phoneNumber}`);

        // Passer à l'étape de vérification du code
        setState(prev => ({
          ...prev,
          isLoading: false,
          currentStep: AuthStep.CODE_VERIFICATION,
          verificationCode // Normalement, on ne stockerait pas le code côté client, mais pour la démo c'est ok
        }));

        return true;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Numéro de téléphone non reconnu',
          currentStep: AuthStep.PHONE_INPUT
        }));

        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Une erreur s'est produite lors de l'envoi du code",
        currentStep: AuthStep.PHONE_INPUT
      }));

      return false;
    }
  };

  // Nouvelle méthode pour vérifier le code SMS
  const verifyCode = async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Vérifier si le code a expiré
      if (isCodeExpired) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Le code a expiré. Veuillez demander un nouveau code.',
          currentStep: AuthStep.CODE_VERIFICATION
        }));
        return false;
      }

      // Vérifier que le code correspond au code envoyé
      if (code === state.verificationCode) {
        // Trouver l'utilisateur par numéro de téléphone
        const user = users.find(u => u.phoneNumber === state.phoneNumber);

        if (user) {
          // Stocker l'utilisateur dans localStorage pour la connexion persistante
          localStorage.setItem('currentUser', JSON.stringify(user));

          // Nettoyer le timer d'expiration
          if (expirationTimer) {
            clearInterval(expirationTimer);
            setExpirationTimer(null);
          }

          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            currentStep: AuthStep.COMPLETED,
            phoneNumber: state.phoneNumber,
            verificationCode: null // Effacer le code pour des raisons de sécurité
          });

          return true;
        }
      }

      // Si le code ne correspond pas
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Code de vérification incorrect',
        currentStep: AuthStep.CODE_VERIFICATION
      }));

      return false;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Une erreur s'est produite lors de la vérification du code",
        currentStep: AuthStep.CODE_VERIFICATION
      }));

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');

    // Nettoyer le timer d'expiration
    if (expirationTimer) {
      clearInterval(expirationTimer);
      setExpirationTimer(null);
    }

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      currentStep: AuthStep.PHONE_INPUT,
      phoneNumber: null,
      verificationCode: null
    });
  };

  const contextValue: AuthContextType = {
    ...state,
    codeExpiresIn,
    isCodeExpired,
    initiateLogin,
    verifyCode,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
