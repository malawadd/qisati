import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { TomoProvider } from "./providers/TomoProvider";
import { WalletAuthProvider } from "./providers/WalletAuthProvider";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <TomoProvider>
      <WalletAuthProvider>
        <App />
      </WalletAuthProvider>
    </TomoProvider>
  </ConvexAuthProvider>,
);
