import { useState, useEffect } from 'react';
import { PrimaryButton } from './atoms/PrimaryButton';
import { Avatar } from './atoms/Avatar';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <Avatar 
                src={user.image || ""} 
                alt={user.name || "User"} 
                size={isScrolled ? 32 : 40}
              />
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
