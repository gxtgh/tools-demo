import { TronConnector } from './tronConnector'
import { TonConnector } from './tonConnector'
import { SuiConnector } from './suiConnector'
import { BitcoinConnector } from './bitcoinConnector'
import { AptosConnector } from './aptosConnector'
import { SUPPORTED_CHAINS } from '../config/chains'

export type ChainType = 'tron' | 'ton' | 'sui' | 'bitcoin' | 'aptos'

export interface WalletConnection {
  chainType: ChainType
  address: string
  publicKey: string
  balance: string
  isConnected: boolean
}

export class MultiChainWallet {
  private connectors: Map<ChainType, any> = new Map()
  private connections: Map<ChainType, WalletConnection> = new Map()

  constructor() {
    // 初始化所有连接器
    // 注意：Ethereum 链使用 wagmi 连接器，不在这里初始化
    this.connectors.set('tron', new TronConnector())
    this.connectors.set('ton', new TonConnector())
    this.connectors.set('sui', new SuiConnector())
    this.connectors.set('bitcoin', new BitcoinConnector())
    this.connectors.set('aptos', new AptosConnector())
  }

  async connect(chainType: ChainType): Promise<WalletConnection> {
    try {
      // Ethereum 链使用 wagmi 连接器，需要特殊处理
      if (chainType === 'ethereum') {
        throw new Error('Ethereum 链请使用 AppKit 连接器，请点击 "Connect Wallet" 按钮')
      }

      const connector = this.connectors.get(chainType)
      if (!connector) {
        throw new Error(`不支持的链类型: ${chainType}`)
      }

      const { address, publicKey } = await connector.connect()
      const balance = await connector.getBalance(address)

      const connection: WalletConnection = {
        chainType,
        address,
        publicKey,
        balance,
        isConnected: true
      }

      this.connections.set(chainType, connection)
      return connection
    } catch (error) {
      throw new Error(`连接 ${chainType} 失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async disconnect(chainType: ChainType): Promise<void> {
    try {
      const connector = this.connectors.get(chainType)
      if (connector) {
        await connector.disconnect()
      }
      this.connections.delete(chainType)
    } catch (error) {
      throw new Error(`断开 ${chainType} 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async sendTransaction(chainType: ChainType, to: string, amount: string): Promise<string> {
    try {
      const connector = this.connectors.get(chainType)
      if (!connector) {
        throw new Error(`不支持的链类型: ${chainType}`)
      }

      if (!this.connections.has(chainType)) {
        throw new Error(`${chainType} 未连接`)
      }

      const txHash = await connector.sendTransaction(to, amount)
      
      // 更新余额
      await this.updateBalance(chainType)
      
      return txHash
    } catch (error) {
      throw new Error(`发送 ${chainType} 交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async updateBalance(chainType: ChainType): Promise<void> {
    try {
      const connection = this.connections.get(chainType)
      if (!connection) return

      const connector = this.connectors.get(chainType)
      if (!connector) return

      const balance = await connector.getBalance(connection.address)
      connection.balance = balance
      this.connections.set(chainType, connection)
    } catch (error) {
      console.error(`更新 ${chainType} 余额失败:`, error)
    }
  }

  getConnection(chainType: ChainType): WalletConnection | null {
    return this.connections.get(chainType) || null
  }

  getAllConnections(): WalletConnection[] {
    return Array.from(this.connections.values())
  }

  isConnected(chainType: ChainType): boolean {
    return this.connections.has(chainType) && this.connections.get(chainType)?.isConnected === true
  }

  getSupportedChains(): ChainType[] {
    return ['tron', 'ton', 'sui', 'bitcoin', 'aptos']
  }

  getChainInfo(chainType: ChainType) {
    const chainMap: Record<ChainType, string> = {
      tron: 'tron',
      ton: 'ton',
      sui: 'sui',
      bitcoin: 'bitcoin',
      aptos: 'aptos'
    }

    const chainKey = chainMap[chainType]
    return SUPPORTED_CHAINS[chainKey]
  }
}

// 创建全局实例
export const multiChainWallet = new MultiChainWallet()
