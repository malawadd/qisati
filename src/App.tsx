import { useWalletAuth } from "./providers/WalletAuthProvider";
import { WalletSignInForm } from "./components/WalletSignInForm";
import { Landing } from "./pages/Landing";
import { Explore } from "./pages/Explore";
import { Work } from "./pages/Work";
import { Chapter } from "./pages/Chapter";
import { Profile } from "./pages/Profile";
import { Dashboard } from "./pages/Dashboard";
import Editor from "./pages/Editor";

function App() {
  const { isAuthenticated } = useWalletAuth();

  // Simple client-side routing
  const path = window.location.pathname;
  
  if (!isAuthenticated) {
    return <WalletSignInForm />;
  }

  // Route to different pages based on path
  if (path === '/' || path === '/home') {
    return <Landing />;
  } else if (path === '/explore') {
    return <Explore />;
  } else if (path.startsWith('/work/') && path.includes('/chap/')) {
    return <Chapter />;
  } else if (path.startsWith('/work/') && path.includes('/edit/')) {
    return <Editor />;
  } else if (path.startsWith('/work/')) {
    return <Work />;
  } else if (path.startsWith('/@')) {
    return <Profile />;
  } else if (path === '/dashboard') {
    return <Dashboard />;
  }

  // Default to landing page
  return <Landing />;
}

export default App;
