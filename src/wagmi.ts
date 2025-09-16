import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'
import { authConnector } from '@reown/appkit-adapter-wagmi'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  // Your dApps chains - 添加 BSC 主网和测试网
  chains: [mainnet, sepolia, bsc, bscTestnet],
  transports: {
    // Ethereum 网络
    [mainnet.id]: http(
      import.meta.env.VITE_ALCHEMY_ID 
        ? `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`
        : 'https://eth.llamarpc.com'
    ),
    [sepolia.id]: http(
      import.meta.env.VITE_ALCHEMY_ID 
        ? `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`
        : 'https://sepolia.gateway.tenderly.co'
    ),
    
    // BSC 网络
    [bsc.id]: http('https://bsc-dataseed1.binance.org'),
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
  },

  // 连接器配置 - 包含 MetaMask 和 WalletConnect
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Web3 DApp Demo',
        description: 'A demo Web3 application',
        url: window.location.origin,
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      }
    }), // MetaMask 连接器
    authConnector({
      options: {
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
      },
    }),
  ],
})