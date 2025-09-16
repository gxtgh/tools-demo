// 多链配置
export interface ChainConfig {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  blockExplorer: string
  testnet?: boolean
}

// 支持的链配置
export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  // Ethereum 网络
  ethereum: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    testnet: false
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.gateway.tenderly.co',
    blockExplorer: 'https://sepolia.etherscan.io',
    testnet: true
  },
  
  // BSC 网络
  bsc: {
    id: 56,
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorer: 'https://bscscan.com',
    testnet: false
  },
  bscTestnet: {
    id: 97,
    name: 'BSC Testnet',
    symbol: 'tBNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorer: 'https://testnet.bscscan.com',
    testnet: true
  },
  
  // Tron 网络
  tron: {
    id: 728,
    name: 'Tron',
    symbol: 'TRX',
    rpcUrl: 'https://api.trongrid.io',
    blockExplorer: 'https://tronscan.org',
    testnet: false
  },
  tronTestnet: {
    id: 201910292,
    name: 'Tron Testnet',
    symbol: 'tTRX',
    rpcUrl: 'https://api.shasta.trongrid.io',
    blockExplorer: 'https://shasta.tronscan.org',
    testnet: true
  },
  
  // TON 网络
  ton: {
    id: 607,
    name: 'TON',
    symbol: 'TON',
    rpcUrl: 'https://toncenter.com/api/v2/jsonrpc',
    blockExplorer: 'https://tonscan.org',
    testnet: false
  },
  tonTestnet: {
    id: 608,
    name: 'TON Testnet',
    symbol: 'tTON',
    rpcUrl: 'https://testnet.toncenter.com/api/v2/jsonrpc',
    blockExplorer: 'https://testnet.tonscan.org',
    testnet: true
  },
  
  // Sui 网络
  sui: {
    id: 101,
    name: 'Sui',
    symbol: 'SUI',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    blockExplorer: 'https://suiexplorer.com',
    testnet: false
  },
  suiTestnet: {
    id: 102,
    name: 'Sui Testnet',
    symbol: 'tSUI',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    blockExplorer: 'https://testnet.suiexplorer.com',
    testnet: true
  },
  
  // Bitcoin 网络
  bitcoin: {
    id: 0,
    name: 'Bitcoin',
    symbol: 'BTC',
    rpcUrl: 'https://blockstream.info/api',
    blockExplorer: 'https://blockstream.info',
    testnet: false
  },
  bitcoinTestnet: {
    id: 1,
    name: 'Bitcoin Testnet',
    symbol: 'tBTC',
    rpcUrl: 'https://blockstream.info/testnet/api',
    blockExplorer: 'https://blockstream.info/testnet',
    testnet: true
  },
  
  // Aptos 网络
  aptos: {
    id: 1,
    name: 'Aptos',
    symbol: 'APT',
    rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    blockExplorer: 'https://explorer.aptoslabs.com',
    testnet: false
  },
  aptosTestnet: {
    id: 2,
    name: 'Aptos Testnet',
    symbol: 'tAPT',
    rpcUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
    blockExplorer: 'https://explorer.aptoslabs.com/?network=testnet',
    testnet: true
  }
}

// 获取所有链配置
export const getAllChains = () => Object.values(SUPPORTED_CHAINS)

// 根据 ID 获取链配置
export const getChainById = (id: number) => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === id)
}

// 根据名称获取链配置
export const getChainByName = (name: string) => {
  return SUPPORTED_CHAINS[name.toLowerCase()]
}
