import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserInfo, UserRole, AuthStep } from '../types';
import { authService } from '../services/api';
import { useAppDispatch } from '../redux/hooks';
import { setUserInfo } from '../redux/authSlice';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

interface AuthContextType extends UserInfo {
  initiateLogin: (phoneNumber: string) => Promise<boolean>;
  verifyCode: (code: string) => Promise<boolean>;
  logout: () => void;
  codeExpiresIn: number | null;
  isCodeExpired: boolean;
}

export const initialUser: UserInfo = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  currentStep: AuthStep.PHONE_INPUT,
  phoneNumber: null,
  verificationCode: null
}

const AuthContext = createContext<AuthContextType>({
  ...initialUser,
  codeExpiresIn: null,
  isCodeExpired: false,
  initiateLogin: async () => false,
  verifyCode: async () => false,
  logout: () => { }
});

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const useHasRole = (roles: UserRole[]): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  return roles.includes(user.typeUtilisateur);
};

interface AuthProviderProps {
  children: ReactNode;
}



const CODE_EXPIRATION_TIME = 3 * 60; // 3 minutes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {

  const dispatch = useAppDispatch();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  console.log("🚀 ~ userInfo>>>>>>>>>>>>:", userInfo)


  // const [state, setState] = useState<UserInfo>(initialUser);

  const [codeExpiresIn, setCodeExpiresIn] = useState<number | null>(null);
  const [isCodeExpired, setIsCodeExpired] = useState<boolean>(false);
  const [expirationTimer, setExpirationTimer] = useState<number | null>(null);

  useEffect(() => {
    if (expirationTimer) {
      clearInterval(expirationTimer);
      setExpirationTimer(null);
    }

    if (userInfo.currentStep === AuthStep.CODE_VERIFICATION && userInfo.verificationCode) {
      setCodeExpiresIn(CODE_EXPIRATION_TIME);
      setIsCodeExpired(false);

      const timer = window.setInterval(() => {
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

      return () => clearInterval(timer);
    } else {
      setCodeExpiresIn(null);
      setIsCodeExpired(false);
    }
  }, [userInfo.currentStep, userInfo.verificationCode]);

  useEffect(() => {
    const storedUser = userInfo;
    if (storedUser.isAuthenticated && storedUser.user) {
      try {
        const user = storedUser.user;
        // setState({
        //   user,
        //   isAuthenticated: true,
        //   isLoading: false,
        //   error: null,
        //   currentStep: AuthStep.COMPLETED,
        //   phoneNumber: user.telephoneUtilisateur,
        //   verificationCode: null
        // });
        dispatch(setUserInfo({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          currentStep: AuthStep.COMPLETED,
          phoneNumber: user.telephoneUtilisateur,
          verificationCode: null
        }))
      } catch (error) {
        // localStorage.removeItem('currentUser');
        // setState(prev => ({
        //   ...prev,
        //   isLoading: false,
        //   currentStep: AuthStep.PHONE_INPUT
        // }));
        dispatch(setUserInfo({
          ...userInfo,
          isLoading: false,
          currentStep: AuthStep.PHONE_INPUT
        }))
      }
    } else {
      // setState(prev => ({
      //   ...prev,
      //   isLoading: false,
      //   currentStep: AuthStep.PHONE_INPUT
      // }));
      dispatch(setUserInfo({
        ...userInfo,
        isLoading: false,
        currentStep: AuthStep.PHONE_INPUT
      }))
    }
  }, []);

  const initiateLogin = async (phoneNumber: string): Promise<boolean> => {
    try {
      // const formatNumber = `225${phoneNumber.replace(/\s/g, "")}`
      const res = await authService.requestPinCode(phoneNumber)

      // const data = await response.json();

      if (res.status === 'success') {
        // setState(prev => ({
        //   ...prev,
        //   phoneNumber: phoneNumber,
        //   verificationCode: res.data, // Code de vérification
        //   currentStep: AuthStep.CODE_VERIFICATION,
        //   error: null
        // }));

        dispatch(setUserInfo({
          ...userInfo,
          phoneNumber: phoneNumber,
          verificationCode: res.data, // Code de vérification
          currentStep: AuthStep.CODE_VERIFICATION,
          error: null
        }))

        return true;
      } else {
        // setState(prev => ({
        //   ...prev,
        //   error: res.message || 'Erreur inconnue lors de l\'envoi du code'
        // }));
        dispatch(setUserInfo({
          ...userInfo,
          error: res.message || 'Erreur inconnue lors de l\'envoi du code'
        }))
        return false;
      }
    } catch (error: any) {
      console.error('Erreur initiateLogin', error);
      // setState(prev => ({
      //   ...prev,
      //   error: error.message || 'Erreur réseau'
      // }));
      dispatch(setUserInfo({
        ...userInfo,
        error: error.message || 'Erreur réseau'
      }))
      return false;
    }
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    try {
      const response = await authService.verifyCode(userInfo.phoneNumber!, code)


      if (response.status === 'success' && response.data) {
        const matchedUser = response.data as User;
        if (matchedUser) {
          // localStorage.setItem('currentUser', JSON.stringify(matchedUser));
          // setState({
          //   user: matchedUser,
          //   isAuthenticated: true,
          //   isLoading: false,
          //   error: null,
          //   currentStep: AuthStep.COMPLETED,
          //   phoneNumber: matchedUser.telephoneUtilisateur,
          //   verificationCode: null
          // });
          dispatch(setUserInfo({
            user: matchedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            currentStep: AuthStep.COMPLETED,
            phoneNumber: matchedUser.telephoneUtilisateur,
            verificationCode: null
          }))
          return true;
        } else {
          // setState(prev => ({
          //   ...prev,
          //   error: 'Utilisateur introuvable'
          // }));
          dispatch(setUserInfo({
            ...userInfo,
            error: 'Utilisateur introuvable'
          }))
          return false;
        }
      } else {
        // setState(prev => ({
        //   ...prev,
        //   error: response.message || 'Code incorrect ou expiré'
        // }));
        dispatch(setUserInfo({
          ...userInfo,
          error: response.message || 'Code incorrect ou expiré'
        }))
        return false;
      }
    } catch (error: any) {
      console.error('Erreur verifyCode', error);
      // setState(prev => ({
      //   ...prev,
      //   error: error.message || 'Erreur réseau'
      // }));
      dispatch(setUserInfo({
        ...userInfo,
        error: error.message || 'Erreur réseau'
      }))
      return false;
    }
  };

  const logout = () => {
    // localStorage.removeItem('currentUser');
    // setState(initialUser);
    dispatch(setUserInfo(initialUser))
  };

  return (
    <AuthContext.Provider value={{ ...userInfo, initiateLogin, verifyCode, logout, codeExpiresIn, isCodeExpired }}>
      {children}
    </AuthContext.Provider>
  );
};
