import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppKitProvider } from '@reown/appkit/react'
import { config } from './wagmi'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// 使用 wagmi 配置中的链信息
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const networks = config.chains.map(chain => ({
  id: chain.id,
  name: chain.name,
  nativeCurrency: chain.nativeCurrency,
  blockExplorers: chain.blockExplorers,
  rpcUrls: chain.rpcUrls,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider
          projectId={import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'}
          networks={networks}
          enableNetworkSwitching={false}
          enableAccountView={true}
          enableOnramp={false}
        >
          <App />
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
