import { useState, useEffect } from 'react';
import { PrimaryButton } from './atoms/PrimaryButton';
import { NewChapterModal } from './NewChapterModal';
import { WalletConnection } from './WalletConnection';
import { useWalletAuth } from '../providers/WalletAuthProvider';

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);
  const { isAuthenticated } = useWalletAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartWriting = () => {
    setShowNewChapterModal(true);
  };

  const handleChapterCreated = (chapterId: string) => {
    window.location.href = `/work/draft/edit/${chapterId}`;
  };

  return (
    <>
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
          {isAuthenticated ? (
            <>
              <a 
                href="/dashboard"
                className="hidden sm:block font-medium text-black hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <WalletConnection />
            </>
          ) : (
            <PrimaryButton onClick={handleStartWriting}>
              Start writing
            </PrimaryButton>
          )}
        </div>
      </div>
    </nav>

    {showNewChapterModal && (
      <NewChapterModal
        onClose={() => setShowNewChapterModal(false)}
        onChapterCreated={handleChapterCreated}
      />
    )}
  </>
  );
}
