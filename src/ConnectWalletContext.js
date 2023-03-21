import { createContext, useState } from "react";

export const ConnectWalletContext = createContext();

// eslint-disable-next-line react/prop-types
const ConnectWalletProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  const [library, setLibrary] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [walletName, setWalletName] = useState("");

  return (
    <ConnectWalletContext.Provider
      value={{
        walletName,
        setWalletName,
        address,
        setAddress,
        library,
        setLibrary,
        chainId,
        setChainId,
      }}
    >
      {children}
    </ConnectWalletContext.Provider>
  );
};

export default ConnectWalletProvider;
