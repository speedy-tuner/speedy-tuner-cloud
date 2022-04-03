import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import appwrite from '../appwrite';
import Loader from '../components/Loader';
import { auth } from '../firebase';

export interface User {
  $id: string;
  name: string;
  registration: number;
  status: boolean;
  passwordUpdate: number;
  email: string;
  emailVerification: boolean;
  prefs: {};
}

export interface Session {
  $id: string;
  userId: string;
  expire: number;
  provider: string;
  providerUid: string;
  providerAccessToken: string;
  providerAccessTokenExpiry: number;
  providerRefreshToken: string;
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  clientType: string;
  clientCode: string;
  clientName: string;
  clientVersion: string;
  clientEngine: string;
  clientEngineVersion: string;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  countryCode: string;
  countryName: string;
  current: boolean;
};

interface AuthValue {
  currentUser: User | null,
  signUp: (email: string, password: string, username: string) => Promise<User>,
  login: (email: string, password: string) => Promise<User>,
  sendMagicLink: (email: string) => Promise<void>,
  logout: () => Promise<void>,
  initResetPassword: (email: string) => Promise<void>,
  googleAuth: () => Promise<void>,
  githubAuth: () => Promise<void>,
  facebookAuth: () => Promise<void>,
  refreshToken: () => Promise<string> | undefined,
}

const OAUTH_REDIRECT_URL = import.meta.env.VITE_WEB_URL as string;
const MAGIC_LINK_REDIRECT_URL = import.meta.env.VITE_WEB_URL as string;
const RESET_PASSWORD_REDIRECT_URL = import.meta.env.VITE_WEB_URL as string;
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];
const GITHUB_SCOPES = ['user:email'];
const FACEBOOK_SCOPES = ['email'];

const AuthContext = createContext<AuthValue | null>(null);

const useAuth = () => useContext<AuthValue>(AuthContext as any);

const AuthProvider = (props: { children: ReactNode }) => {
  const { children } = props;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const value = useMemo(() => ({
    currentUser,
    signUp: async (email: string, password: string, username: string) => {
      try {
        await appwrite.account.create('unique()', email, password, username);
        await appwrite.account.createSession(email, password);
        const user = await appwrite.account.get();
        setCurrentUser(user);
        return Promise.resolve(user);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    login: async (email: string, password: string) => {
      try {
        await appwrite.account.createSession(email, password);
        const user = await appwrite.account.get();
        setCurrentUser(user);
        return Promise.resolve(user);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    sendMagicLink: async (email: string) => {
      try {
        await appwrite.account.createMagicURLSession('unique()', email, MAGIC_LINK_REDIRECT_URL);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    logout: async () => {
      try {
        await appwrite.account.deleteSession('current');
        setCurrentUser(null);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    initResetPassword: async (email: string) => {
      try {
        await appwrite.account.createRecovery(email, RESET_PASSWORD_REDIRECT_URL);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    },
    googleAuth: async () => {
      appwrite.account.createOAuth2Session(
        'google',
        OAUTH_REDIRECT_URL,
        OAUTH_REDIRECT_URL,
        GOOGLE_SCOPES,
      );
    },
    githubAuth: async () => {
      appwrite.account.createOAuth2Session(
        'github',
        OAUTH_REDIRECT_URL,
        OAUTH_REDIRECT_URL,
        GITHUB_SCOPES,
      );
    },
    facebookAuth: async () => {
      appwrite.account.createOAuth2Session(
        'facebook',
        OAUTH_REDIRECT_URL,
        OAUTH_REDIRECT_URL,
        FACEBOOK_SCOPES,
      );
    },
    refreshToken: () => auth.currentUser?.getIdToken(true),
  }), [currentUser]);

  useEffect(() => {
    appwrite.account.get().then((user) => {
      console.info('Logged as:', user.name);
      setCurrentUser(user);
      setIsLoading(false);
    }).catch((error) => {
      console.info('User not logged in');
    }).finally(() => setIsLoading(false));

    const unsubscribe = appwrite.subscribe('account', (event) => {
      console.info('Account event', event);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <Loader /> : children}
    </AuthContext.Provider>
  );
};

export {
  useAuth,
  AuthProvider,
};
