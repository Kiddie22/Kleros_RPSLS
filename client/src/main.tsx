import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Web3Provider } from "./contexts/Web3Context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a tanstack query client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Web3Provider>
  </StrictMode>
);
