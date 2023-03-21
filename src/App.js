import "./App.css";
import Web3 from "web3";
import Wallets from "./Wallets";
import { deleteLocalStorage, getLocalStorage } from "./helpers";
import { useContext, useEffect, useState } from "react";
import { ConnectWalletContext } from "./ConnectWalletContext";

function App() {
  const {
    address,
    setAddress,
    setWalletName,
    setLibrary,
    setChainId,
    library,
    walletName,
    chainId,
  } = useContext(ConnectWalletContext);

  const [isSwitchErr, setIsSwitchErr] = useState(false);
  const [isSwitchMetaOpen, setIsSwitchMetaOpen] = useState(false);

  console.log(isSwitchMetaOpen);

  const tiamondsChainId = 5;

  useEffect(() => {
    checkWalletConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSwitchErr) {
      handleDisconnect();
      setIsSwitchErr(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwitchErr]);

  useEffect(() => {
    if (walletName === "metamask") {
      if (chainId !== tiamondsChainId && !isSwitchMetaOpen) {
        handleDisconnect();
      } else {
        setIsSwitchMetaOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  const handleDisconnect = () => {
    if (walletName === "metamask") {
      setAddress("");
      setLibrary(null);
      setChainId(null);
      setWalletName("");
    }

    deleteLocalStorage("walletName");
  };

  useEffect(() => {
    if (library) {
      library.currentProvider.on("accountsChanged", listenAccountsChanged);
      library.currentProvider.on("chainChanged", listenChainChanged);
      return () => {
        library.currentProvider.removeListener(
          "accountsChanged",
          listenAccountsChanged
        );

        library.currentProvider.removeListener(
          "chainChanged",
          listenChainChanged
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library]);

  const listenChainChanged = (chainId) => {
    console.log(Number(chainId));
    setChainId(Number(chainId));
  };

  const listenAccountsChanged = (acc) => {
    if (!acc.length) {
      if (walletName === "metamask") {
        setAddress("");
        setLibrary(null);
        setChainId(null);
        setWalletName("");
      }

      deleteLocalStorage("walletName");
    } else {
      setAddress(acc[0]);
    }
  };

  const checkWalletConnection = () => {
    if (getLocalStorage("walletName") === "metamask") {
      if (
        window.ethereum?.isMetaMask ||
        window.ethereum?.providerMap?.get("MetaMask")
      ) {
        let provider =
          window.ethereum?.providerMap?.get("MetaMask") || window.ethereum;

        provider
          .request({ method: "eth_requestAccounts" })
          .then((addresses) => {
            setAddress(addresses[0]);
            setWalletName("metamask");
            setLibrary(new Web3(provider));
            provider.request({ method: "eth_chainId" }).then((id) => {
              setChainId(Number(id));
            });
          });
      }
    }
  };

  return (
    <div className="App">
      <div style={{ textAlign: "center", margin: "0 0 50px 0" }}>
        <h5 style={{ margin: "0 0 10px 0" }}>Address</h5>
        <p>{address}</p>
      </div>

      <Wallets
        setIsSwitchErr={setIsSwitchErr}
        setIsSwitchMetaOpen={setIsSwitchMetaOpen}
      />
    </div>
  );
}

export default App;
