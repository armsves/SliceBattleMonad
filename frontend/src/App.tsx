import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GelatoSmartWalletDynamicContextProvider } from '@gelatonetwork/smartwallet-react-dynamic';
import { monadTestnet } from './chains';
import { Game } from './components/Game';

const queryClient = new QueryClient();

// Monad testnet config
const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
});

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <GelatoSmartWalletDynamicContextProvider
          settings={{
            waas: {
              appId: import.meta.env.VITE_DYNAMIC_APP_ID || 'your-dynamic-app-id', // Replace with your Dynamic app ID
            },
            defaultChain: monadTestnet,
            wagmi: {
              config: wagmiConfig,
            },
          }}
        >
          <Game />
        </GelatoSmartWalletDynamicContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
