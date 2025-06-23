import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Landing } from "./pages/Landing";
import { Explore } from "./pages/Explore";
import { Work } from "./pages/Work";
import { Chapter } from "./pages/Chapter";

export default function App() {
  const path = window.location.pathname;
  
  // Simple routing based on pathname
  const renderPage = () => {
    if (path === '/') return <Landing />;
    if (path === '/explore') return <Explore />;
    if (path.startsWith('/work/') && path.includes('/chap/')) return <Chapter />;
    if (path.startsWith('/work/')) return <Work />;
    return <Landing />;
  };

  return (
    <div className="min-h-screen">
      <Authenticated>
        {renderPage()}
      </Authenticated>
      
      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-grid-bg">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
            <h2 className="text-xl font-semibold text-primary">ReadOwn</h2>
            <SignOutButton />
          </header>
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-primary mb-4">Join ReadOwn</h1>
                <p className="text-xl text-secondary">Sign in to start reading and collecting</p>
              </div>
              <SignInForm />
            </div>
          </main>
        </div>
      </Unauthenticated>
      
      <Toaster />
    </div>
  );
}
