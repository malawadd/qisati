import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { useWalletAuth } from '../providers/WalletAuthProvider';

export function WalletSignInForm() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signInWithWallet, signInAsGuest, isLoading } = useWalletAuth();

  const handleWalletSignIn = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    setIsSigningIn(true);
    setError(null);
   
    try {
      await signInWithWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with wallet');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="neo bg-white p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-black">📚 Qisati</h1>
          <p className="text-lg font-medium text-black">
            Connect your wallet to start reading and publishing
          </p>
        </div>

        <div className="space-y-4">
          {/* Wallet Connection Status */}
          {isConnected && address && (
            <div className="neo bg-green-100 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-black">WALLET CONNECTED</p>
                  <p className="font-mono text-lg text-black">{formatAddress(address)}</p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          )}

          {/* Sign In with Wallet */}
          <button
            onClick={handleWalletSignIn}
            disabled={isSigningIn || isLoading}
            className="w-full neo bg-primary text-white p-4 text-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {!isConnected ? (
              <>🔗 Connect Wallet</>
            ) : isSigningIn || isLoading ? (
              <>⏳ Signing Message...</>
            ) : (
              <>🔐 Sign Message to Continue</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t-4 border-black"></div>
            <span className="px-4 font-bold text-black">OR</span>
            <div className="flex-1 border-t-4 border-black"></div>
          </div>

          {/* Guest Mode */}
          <button
            onClick={handleGuestSignIn}
            className="w-full neo bg-white text-black p-4 text-lg font-bold hover:scale-105 transition-transform"
          >
            👤 Continue as Guest
          </button>

          {/* Error Display */}
          {error && (
            <div className="neo bg-red-100 p-4 mt-4">
              <p className="font-bold text-sm mb-1 text-black">⚠️ ERROR</p>
              <p className="text-sm text-black">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="neo bg-gray-100 p-4 mt-6">
            <p className="text-sm font-medium text-black">
              <strong>Wallet Mode:</strong> Full access to publishing and collecting features
            </p>
            <p className="text-sm font-medium mt-2 text-black">
              <strong>Guest Mode:</strong> Read-only access with limited features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
