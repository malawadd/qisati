import { useState, useEffect } from 'react';
import { PrimaryButton } from './atoms/PrimaryButton';
import { Avatar } from './atoms/Avatar';
import { useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = useQuery(api.auth.loggedInUser);
  const appUser = useQuery(api.users.getCurrentAppUser);
  const { signOut } = useAuthActions();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav 
      className={`sticky top-0 z-50 neo bg-white mx-8 mt-8 transition-all duration-200 ${
        isScrolled ? 'h-16' : 'h-22'
      }`}
    >
      <div className={`flex items-center justify-between px-6 h-full ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        {/* Logo */}
        <a href="/" className="font-bold text-xl text-black hover:text-primary transition-colors">
          ReadOwn
        </a>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="/explore" 
            className="font-medium text-black hover:text-primary transition-colors"
          >
            Explore
          </a>
          <a 
            href="#" 
            className="font-medium text-black hover:text-primary transition-colors"
          >
            Docs
          </a>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <a 
                href="/dashboard"
                className="hidden sm:block font-medium text-black hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar 
                    src={user.image || ""} 
                    alt={user.name || "User"} 
                    size={isScrolled ? 32 : 40}
                  />
                  <div className="hidden sm:block text-left">
                    <div className="font-medium text-black text-sm">
                      {user.name || "User"}
                    </div>
                    {user.email && (
                      <div className="text-xs text-gray-600">
                        {user.email}
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
                  <div className="absolute right-0 top-full mt-2 w-48 neo bg-white shadow-lg z-50">
                    <div className="py-2">
                      <a
                        href={`/@${appUser?.handle || user.name}`}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        View Profile
                      </a>
                      <a
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </a>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <PrimaryButton onClick={() => window.location.href = '/explore'}>
              Start writing
            </PrimaryButton>
          )}
        </div>
      </div>
    </nav>
  );
}
