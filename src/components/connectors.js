import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const walletconnect = new WalletConnectConnector({
  rpcUrl: "https://goerli.infura.io/v3/2c2ef791e79946c0b6dd923af8bde3a6",
  bridge: "https://bridge.walletconnect.org",
  supportedChainIds: [1, 5],
  qrcode: true,
});

const walletlink = new WalletLinkConnector({
  url: "https://goerli.infura.io/v3/2c2ef791e79946c0b6dd923af8bde3a6",
  supportedChainIds: [1, 5],
  appName: "web3-react-demo",
});

export const connectors = {
  walletConnect: walletconnect,
  coinbaseWallet: walletlink,
};
