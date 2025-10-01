import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (
        event: string,
        callback: (accounts: string[]) => void
      ) => void;
    };
  }
}

interface Web3ContextType {
  walletAddress: string;
  isConnected: boolean;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(
    null
  );

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const address = accounts?.[0];
        if (!address) return;
        setWalletAddress(address);
        setIsConnected(true);

        // Create provider and signer
        const browserProvider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        const walletSigner = await browserProvider.getSigner();

        setProvider(browserProvider);
        setSigner(walletSigner);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.log("MetaMask not installed");
    }
  };

  const disconnect = () => {
    setWalletAddress("");
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== walletAddress) {
          setWalletAddress(accounts[0]);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [walletAddress]);

  const value: Web3ContextType = {
    walletAddress,
    isConnected,
    provider,
    signer,
    connectWallet,
    disconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
