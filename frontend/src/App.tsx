import { createConfig, fallback, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GelatoSmartWalletDynamicContextProvider } from '@gelatonetwork/smartwallet-react-dynamic';
import { monadTestnet } from './chains';
import { Game } from './components/Game';

const queryClient = new QueryClient();

const gelatoRpcUrl = import.meta.env.VITE_GELATO_RPC_URL || 'https://api.gelato.cloud/rpc/10143?apiKey=test_phx0xw9eGF7KIRT5VJb_eEwgmdTMxcvK_B5olV6lrs0_';
// Backend RPC proxy uses DRPC (avoids 429 from public Monad RPCs) - no keys exposed
const backendRpc = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/rpc` : null;
const monadRpcs = [
  ...(backendRpc ? [backendRpc] : []),
  gelatoRpcUrl,
  'https://rpc.ankr.com/monad_testnet',
];

const wagmiConfig = {
  chains: [monadTestnet] as const,
  transports: {
    [monadTestnet.id]: fallback(monadRpcs.map((url) => http(url))),
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <GelatoSmartWalletDynamicContextProvider
      settings={{
        waas: {
          appId: import.meta.env.VITE_DYNAMIC_APP_ID || 'your-dynamic-app-id',
          customChains: {
            // Use function to return only Monad - avoids parseChainId(undefined) from Dynamic API networks
            evmNetworks: (_networks) => [{
              chainId: 10143,
              networkId: 10143,
              name: 'Monad Testnet',
              rpcUrls: [gelatoRpcUrl, ...monadRpcs],
              blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
              nativeCurrency: { decimals: 18, name: 'Monad', symbol: 'MON' },
            }],
          },
        },
        defaultChain: monadTestnet,
        wagmi: { config: wagmiConfig },
        apiKey: import.meta.env.VITE_GELATO_API_KEY || 'test_phx0xw9eGF7KIRT5VJb_eEwgmdTMxcvK_B5olV6lrs0_',
        scw: { encoding: 'gelato', type: 'gelato', version: '0.1' },
      }}
    >
      <Game />
    </GelatoSmartWalletDynamicContextProvider>
    </QueryClientProvider>
  );
}

export default App;
