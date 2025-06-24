import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface WalletAuthContextType {
  user: any;
  sessionId: Id<"walletSessions"> | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  signInWithWallet: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => void;
  isLoading: boolean;
}

const WalletAuthContext = createContext<WalletAuthContextType | null>(null);

export function useWalletAuth() {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error('useWalletAuth must be used within WalletAuthProvider');
  }
  return context;
}

interface WalletAuthProviderProps {
  children: React.ReactNode;
}

export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const [sessionId, setSessionId] = useState<Id<"walletSessions"> | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
 
  const loginWithWallet = useAction(api.walletAuth.loginWithWallet);
  const logoutMutation = useMutation(api.walletAuth.logout);
  const user = useQuery(api.walletAuth.getCurrentUser,
    sessionId ? { sessionId } : "skip"
  );

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    const savedIsGuest = localStorage.getItem('isGuest') === 'true';
   
    if (savedSessionId && !savedIsGuest) {
      setSessionId(savedSessionId as Id<"walletSessions">);
    } else if (savedIsGuest) {
      setIsGuest(true);
    }
  }, []);

  const signInWithWallet = async () => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const message = `Sign in to ReadOwn\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
     
      const signature = await signMessageAsync({ message });
     
      const result = await loginWithWallet({
        address,
        signature,
        message,
      });

      setSessionId(result.sessionId);
      setIsGuest(false);
      localStorage.setItem('sessionId', result.sessionId);
      localStorage.removeItem('isGuest');
    } catch (error) {
      console.error('Wallet sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    setSessionId(null);
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('sessionId');
  };

  const signOut = async () => {
    if (sessionId) {
      await logoutMutation({ sessionId });
    }
   
    setSessionId(null);
    setIsGuest(false);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('isGuest');
  };

  const value: WalletAuthContextType = {
    user: isGuest ? { handle: 'Guest User', walletAddress: null } : user,
    sessionId,
    isAuthenticated: !!sessionId || isGuest,
    isGuest,
    signInWithWallet,
    signInAsGuest,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    signOut,
    isLoading,
  };

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  );
}
