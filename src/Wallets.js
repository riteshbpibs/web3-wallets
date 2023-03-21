import Web3 from "web3";
import React, { useContext } from "react";
import { deleteLocalStorage, setLocalStorage } from "./helpers";
import { isMobile } from "react-device-detect";
import { ConnectWalletContext } from "./ConnectWalletContext";

const Wallets = (props) => {
  const {
    setAddress,
    setChainId,
    setLibrary,
    setWalletName,
    address,
    walletName,
  } = useContext(ConnectWalletContext);

  const tiamondsChainId = 5;
  const location = window.location.href.split("//")[1];

  const metamaskConnect = () => {
    if (!isMobile) {
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
        alert("Error! Could not switch network");
      }
    }
  };

  const coinbaseConnect = () => {};

  const handleDisconnect = () => {
    if (walletName === "metamask") {
      setAddress("");
      setLibrary(null);
      setChainId(null);
      setWalletName("");
    }

    deleteLocalStorage("walletName");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {!address && <button onClick={() => metamaskConnect()}>Metamask</button>}
      {!address && <button onClick={() => coinbaseConnect()}>Coinbase</button>}

      {address && <button onClick={handleDisconnect}>Disconnect</button>}
    </div>
  );
};

export default Wallets;
