import "./App.css";
import Web3 from "web3";
import Wallets from "./components/Wallets";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "./components/connectors";
import { useContext, useEffect, useState } from "react";
import { deleteLocalStorage, getLocalStorage } from "./helpers";
import { ConnectWalletContext } from "./components/ConnectWalletContext";
import SwitchModal from "./components/SwitchModal";
import "bootstrap/dist/css/bootstrap.min.css";

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

  const {
    activate,
    account,
    active,
    library: web3Library,
    setPendingError,
    chainId: web3ChainId,
    deactivate,
  } = useWeb3React();

  const [isSwitchErr, setIsSwitchErr] = useState(false);
  const [isSwitchMetaOpen, setIsSwitchMetaOpen] = useState(false);

  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  const tiamondsChainId = process.env.REACT_APP_CHAIN_ID;

  // Checking for coinbase and wallet connect (weather network is correct)
  useEffect(() => {
    if (walletName !== "metamask") {
      if (active && web3ChainId && library) {
        if (Number(web3ChainId) !== Number(tiamondsChainId)) {
          if (walletName === "walletConnect") {
            setIsSwitchModalOpen(true);
          }
          switchNetwork();
        } else {
          if (walletName === "walletConnect") {
            setIsSwitchModalOpen(false);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, web3ChainId, library, walletName]);

  // Function for switching network for coinbase and wallet connect..........................
  const switchNetwork = async () => {
    try {
      await library.currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: `0x${tiamondsChainId}`,
          },
        ],
      });
    } catch (err) {
      if (err) {
        handleClose();
      }
    }
  };

  // To check wallet connection from local storage on refresh
  useEffect(() => {
    checkWalletConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // To set data for coinbase and wallet connect............
  useEffect(() => {
    if (walletName !== "metamask") {
      setAddress(account);
      setLibrary(web3Library);
      setChainId(web3ChainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, library, walletName]);

  // To handle switch network error........................
  useEffect(() => {
    if (isSwitchErr) {
      handleDisconnect();
      setIsSwitchErr(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwitchErr]);

  // To handle network change on changing chainID............................
  useEffect(() => {
    if (walletName === "metamask") {
      if (Number(chainId) !== Number(tiamondsChainId) && !isSwitchMetaOpen) {
        handleDisconnect();
      } else if (
        Number(chainId) !== Number(tiamondsChainId) &&
        isSwitchMetaOpen
      ) {
        setIsSwitchModalOpen(true);
      } else {
        setIsSwitchMetaOpen(false);
        setIsSwitchModalOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  // To handle wallet disconnection.........................
  const handleDisconnect = () => {
    if (walletName !== "metamask") {
      deactivate();
    }

    setAddress("");
    setLibrary(null);
    setChainId(null);
    setWalletName("");
    deleteLocalStorage("walletInfo");
  };

  // To listen to account and chainId change in wallet........................
  useEffect(() => {
    const listenChainChanged = (chainId) => {
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

        deleteLocalStorage("walletInfo");
      } else {
        setAddress(acc[0]);
      }
    };

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

  // To check wallet connection when refresh the page.....................
  const checkWalletConnection = () => {
    const walletInfo = JSON.parse(getLocalStorage("walletInfo"));
    if (walletInfo) {
      if (Date.now() <= walletInfo.time + 86400000) {
        if (walletInfo?.name === "metamask") {
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
        } else {
          let oldConnector;
          const walletName = walletInfo.name;

          if (walletName === "coinbase") {
            oldConnector = connectors.coinbaseWallet;
          } else if (walletName === "walletConnect") {
            oldConnector = connectors.walletConnect;
          }

          web3WalletConnect(walletName, oldConnector);
        }
      } else {
        handleDisconnect();
      }
    }
  };

  // To activate wallet when found on local storage on refresh
  const web3WalletConnect = (name, connector) => {
    activate(connector)
      .then(() => {
        setWalletName(name);
      })
      .catch((error) => {
        if (error) {
          setPendingError(true);
          return;
        }
      });
  };

  // To handle network error modal close
  const handleClose = () => {
    handleDisconnect();
    setIsSwitchModalOpen(false);
  };

  return (
    <>
      <h5 className="w-100 text-center mt-3">
        Web app is built on:{" "}
        {Number(tiamondsChainId) === 1 && "Ethereum Mainnet"}
        {Number(tiamondsChainId) === 5 && "Goerli"}
      </h5>
      <div className="App">
        {isSwitchModalOpen && (
          <SwitchModal show={isSwitchModalOpen} handleClose={handleClose} />
        )}
        <div style={{ margin: "0 0 50px 0" }}>
          {address && (
            <>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "15px",
                }}
              >
                <h3>Connected</h3>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h5>Address:</h5>&nbsp;
                <p>{address}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h5>Chain ID:</h5>&nbsp;
                <p>{chainId}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h5>Wallet Name:</h5>&nbsp;
                <p>{walletName}</p>
              </div>
            </>
          )}

          {!address && <h2>Connect Wallet</h2>}
        </div>

        <Wallets
          setIsSwitchErr={setIsSwitchErr}
          setIsSwitchMetaOpen={setIsSwitchMetaOpen}
          setIsSwitchModalOpen={setIsSwitchModalOpen}
        />
      </div>
    </>
  );
}

export default App;
