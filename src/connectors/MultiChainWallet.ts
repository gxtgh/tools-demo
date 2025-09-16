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

      // 特殊处理 TON 连接
      if (chainType === 'ton') {
        return await this.connectTon()
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

  private async connectTon(): Promise<WalletConnection> {
    try {
      // 首先尝试使用 Tonkeeper 浏览器扩展
      if (typeof window !== 'undefined' && (window as any).tonkeeper) {
        return await this.connectTonkeeperExtension()
      }

      // 如果没有扩展，使用标准 TON Connect
      const { TonConnect } = await import('@tonconnect/sdk')
      
      const tonConnect = new TonConnect({
        manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json',
        walletsListSource: 'https://raw.githubusercontent.com/ton-community/tonconnect/main/packages/tonconnect-sdk/src/wallets-list.json'
      })

      // 获取连接 URI
      const connectURI = await tonConnect.connect([])
      console.log('TON Connect URI:', connectURI)
      
      // 尝试直接打开 Tonkeeper
      try {
        window.open(connectURI, '_blank')
        alert('正在尝试打开 Tonkeeper 扩展...')
      } catch (err) {
        // 如果无法直接打开，显示 URI
        const userConfirmed = confirm(`TON Connect URI 已生成！\n\n请选择连接方式：\n\n确定 - 复制 URI 到剪贴板\n取消 - 查看完整 URI`)
        
        if (userConfirmed) {
          try {
            await navigator.clipboard.writeText(connectURI)
            alert('URI 已复制到剪贴板！请在 Tonkeeper 中粘贴此 URI 进行连接。')
          } catch (err) {
            alert(`无法复制到剪贴板，请手动复制：\n\n${connectURI}`)
          }
        } else {
          alert(`TON Connect URI:\n\n${connectURI}`)
        }
      }
      
      // 等待用户连接
      return new Promise((resolve, reject) => {
        const unsubscribe = tonConnect.onStatusChange((wallet) => {
          if (wallet && wallet.account) {
            console.log('TON 钱包连接成功:', wallet)
            unsubscribe()
            
            const connection: WalletConnection = {
              chainType: 'ton',
              address: wallet.account.address || '',
              publicKey: wallet.account.publicKey || '',
              balance: '0', // TON 余额查询需要额外实现
              isConnected: true
            }
            
            this.connections.set('ton', connection)
            resolve(connection)
          }
        })

        // 设置超时
        setTimeout(() => {
          unsubscribe()
          reject(new Error('连接超时，请确保已安装 Tonkeeper 钱包并扫描二维码'))
        }, 60000)
      })
    } catch (error) {
      throw new Error(`TON 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async connectTonkeeperExtension(): Promise<WalletConnection> {
    try {
      const tonkeeper = (window as any).tonkeeper
      
      // 检查 Tonkeeper 是否已连接
      if (tonkeeper.tonConnect) {
        // 使用 Tonkeeper 的 TonConnect 实例
        const tonConnect = tonkeeper.tonConnect
        
        // 等待用户连接
        return new Promise((resolve, reject) => {
          const unsubscribe = tonConnect.onStatusChange((wallet: any) => {
            if (wallet && wallet.account) {
              console.log('Tonkeeper 连接成功:', wallet)
              unsubscribe()
              
              const connection: WalletConnection = {
                chainType: 'ton',
                address: wallet.account.address || '',
                publicKey: wallet.account.publicKey || '',
                balance: '0',
                isConnected: true
              }
              
              this.connections.set('ton', connection)
              resolve(connection)
            }
          })

          // 设置超时
          setTimeout(() => {
            unsubscribe()
            reject(new Error('连接超时，请确保 Tonkeeper 已解锁'))
          }, 30000)

          // 尝试连接
          try {
            tonConnect.connect()
          } catch (connectError) {
            console.log('Tonkeeper 连接需要用户交互')
          }
        })
      } else {
        throw new Error('Tonkeeper 扩展未正确初始化')
      }
    } catch (error) {
      throw new Error(`Tonkeeper 扩展连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
