import { useState, useEffect } from 'react';
import { useConnectModal, useAccountModal, useChainModal } from '@tomo-inc/tomo-evm-kit';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletAuth } from '../providers/WalletAuthProvider';
import { Avatar } from './atoms/Avatar';

export function WalletConnection() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { signOut, isAuthenticated, user, isGuest } = useWalletAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleDisconnect = async () => {
    await signOut();
    if (isConnected) {
      disconnect();
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        onClick={openConnectModal}
        className="nb-button-accent text-sm"
      >
        🔗 Connect Wallet
      </button>
    );
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Chain Selector - only show if wallet is connected */}
      {isConnected && !isGuest && (
        <button
          onClick={openChainModal}
          className="nb-panel px-3 py-2 text-xs font-bold"
        >
          {chain?.name || 'Unknown'}
        </button>
      )}
     
      {/* User Menu */}
      <div className="relative user-menu-container">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Avatar 
            src={user?.avatarUrl || ""} 
            alt={user?.handle || "User"} 
            size={32}
          />
          <div className="hidden sm:block text-left">
            <div className="font-medium text-black text-sm">
              {user?.handle || "Guest User"}
            </div>
            {user?.walletAddress && (
              <div className="text-xs text-gray-600">
                {formatAddress(user.walletAddress)}
              </div>
            )}
          </div>
          <svg 
            className={`w-4 h-4 text-black transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 nb-panel shadow-lg z-50">
            <div className="py-2">
              {!isGuest && (
                <>
                  <a
                    href={`/@${user?.handle}`}
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 View Profile
                  </a>
                  <a
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    📊 Dashboard
                  </a>
                  {isConnected && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openAccountModal?.();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                    >
                      💰 Wallet Settings
                    </button>
                  )}
                  <hr className="my-1 border-gray-200" />
                </>
              )}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleDisconnect();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                {isGuest ? '🚪 Exit Guest Mode' : '🔓 Sign Out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
