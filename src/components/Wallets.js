import Web3 from "web3";
import React, { useContext } from "react";
import { connectors } from "./connectors";
import { useWeb3React } from "@web3-react/core";
import { isMobile, isTablet } from "react-device-detect";
import { ConnectWalletContext } from "./ConnectWalletContext";
import { deleteLocalStorage, setLocalStorage } from "../helpers";

// eslint-disable-next-line no-unused-vars
import { Web3Modal } from "@web3modal/react";

const Wallets = (props) => {
  const {
    activate,
    account,
    library: web3Library,
    deactivate,
    setPendingError,
  } = useWeb3React();

  const {
    setAddress,
    setChainId,
    setLibrary,
    setWalletName,
    address,
    walletName,
  } = useContext(ConnectWalletContext);

  const tiamondsChainId = process.env.REACT_APP_CHAIN_ID;
  const location = window.location.href.split("//")[1];

  // Custom function for metamask connection............................
  const metamaskConnect = () => {
    if (!isMobile || !isTablet) {
      if (
        window.ethereum?.isMetaMask ||
        window.ethereum?.providerMap?.get("MetaMask")
      ) {
        let provider =
          window.ethereum?.providerMap?.get("MetaMask") || window.ethereum;
        metamaskProvider(provider);
      } else {
        window.open("https://metamask.io/download", "blank");
      }
    } else {
      if (navigator.userAgent.search("MetaMaskMobile") !== -1) {
        let provider = window.ethereum;
        metamaskProvider(provider);
      } else {
        window.location.replace(`https://metamask.app.link/dapp/${location}`);
      }
    }
  };

  // Metamask connection provider.............................................
  const metamaskProvider = async (provider) => {
    try {
      let address = await provider.request({ method: "eth_requestAccounts" });
      if (address) {
        setAddress(address[0]);
        setWalletName("metamask");
        setLibrary(new Web3(provider));
        setLocalStorage("walletName", "metamask");
        let chainId = await provider.request({ method: "eth_chainId" });
        if (chainId) {
          setChainId(Number(chainId));
          if (chainId !== tiamondsChainId) {
            changeChain();
          }
        }
      }
    } catch (err) {
      handleDisconnect();
    }
  };

  // Function to change network in metamask.............................
  const changeChain = async () => {
    if (
      window.ethereum?.isMetaMask ||
      window.ethereum?.providerMap?.get("MetaMask")
    ) {
      props.setIsSwitchMetaOpen(true);
      let provider =
        window.ethereum?.providerMap?.get("MetaMask") || window.ethereum;

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: `0x${Number(tiamondsChainId).toString(16)}`,
            },
          ],
        });
      } catch (error) {
        props.setIsSwitchErr(true);
        props.setIsSwitchMetaOpen(false);
        props.setIsSwitchModalOpen(false);
      }
    }
  };

  // Function to connect wallet in coinbase and wallet connect.................
  const handleConnect = (name, connector) => {
    if (!isMobile || !isTablet) {
      connect(name, connector);
    } else {
      if (name === "coinbase" && window?.ethereum?.isCoinbaseBrowser) {
        connect(name, connector);
      } else {
        window.location.replace(`https://go.cb-w.com/dapp?cb_url=${location}`);
      }
    }
  };

  // Activating wallet from web3............
  const connect = (name, connector) => {
    activate(connector)
      .then(() => {
        setAddress(account);
        setWalletName(name);
        setLibrary(web3Library);
        setLocalStorage("walletName", name);
      })
      .catch((error) => {
        if (error) {
          activate(connector);
          return;
        } else {
          setPendingError(true);
          return;
        }
      });
  };

  // Handling wallet disconnect......
  const handleDisconnect = () => {
    if (walletName !== "metamask") {
      deactivate();
    }

    setAddress("");
    setLibrary(null);
    setChainId(null);
    setWalletName("");
    deleteLocalStorage("walletName");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {!address && <button onClick={() => metamaskConnect()}>Metamask</button>}
      {!address && (
        <button
          onClick={() => handleConnect("coinbase", connectors.coinbaseWallet)}
        >
          Coinbase
        </button>
      )}

      {!address && (
        <button
          onClick={() =>
            handleConnect("walletConnect", connectors.walletConnect)
          }
        >
          Wallet Connect
        </button>
      )}

      {address && <button onClick={handleDisconnect}>Disconnect</button>}
    </div>
  );
};

export default Wallets;
