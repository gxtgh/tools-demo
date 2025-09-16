import { TonConnect } from '@tonconnect/sdk'

export interface TonConnectorConfig {
  manifestUrl?: string
  walletsListSource?: string
}

export class TonConnector {
  private tonConnect: TonConnect | null = null
  private config: TonConnectorConfig

  constructor(config: TonConnectorConfig = {}) {
    this.config = {
      manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json',
      walletsListSource: 'https://raw.githubusercontent.com/ton-community/tonconnect/main/packages/tonconnect-sdk/src/wallets-list.json',
      ...config
    }
  }

  // 检查 SDK 是否可用
  static async isAvailable(): Promise<boolean> {
    try {
      await import('@tonconnect/sdk')
      return true
    } catch (error) {
      console.error('TON Connect SDK 不可用:', error)
      return false
    }
  }

  async connect(): Promise<{ address: string; publicKey: string }> {
    try {
      if (!this.tonConnect) {
        this.tonConnect = new TonConnect({
          manifestUrl: this.config.manifestUrl!,
          walletsListSource: this.config.walletsListSource!
        })
      }

      // 检查是否已经连接
      if (this.tonConnect.connected) {
        const wallet = this.tonConnect.wallet
        if (wallet) {
          return {
            address: wallet.account.address || '',
            publicKey: wallet.account.publicKey || ''
          }
        }
      }

      // 获取连接 URI
      const connectURI = await this.tonConnect.connect([])
      console.log('TON Connect URI:', connectURI)

      // 等待用户连接
      return new Promise((resolve, reject) => {
        const unsubscribe = this.tonConnect!.onStatusChange((wallet) => {
          if (wallet && wallet.account) {
            unsubscribe()
            resolve({
              address: wallet.account.address || '',
              publicKey: wallet.account.publicKey || ''
            })
          }
        })

        // 设置超时
        setTimeout(() => {
          unsubscribe()
          reject(new Error('连接超时，请确保已安装 Tonkeeper 钱包并扫描二维码'))
        }, 60000) // 增加超时时间到 60 秒
      })
    } catch (error) {
      throw new Error(`TON 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.tonConnect) {
      await this.tonConnect.disconnect()
      this.tonConnect = null
    }
  }

  async getBalance(_address: string): Promise<string> {
    try {
      // 这里需要实现 TON 余额查询逻辑
      // 由于 TON 的复杂性，这里返回模拟数据
      return '0'
    } catch (error) {
      throw new Error(`获取余额失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async sendTransaction(_to: string, _amount: string): Promise<string> {
    if (!this.tonConnect) {
      throw new Error('TON 未连接')
    }

    try {
      // 这里需要实现 TON 交易发送逻辑
      throw new Error('TON 交易发送功能待实现')
    } catch (error) {
      throw new Error(`发送交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  isConnected(): boolean {
    return this.tonConnect !== null && this.tonConnect.connected
  }

  getAddress(): string | null {
    return this.tonConnect?.account?.address || null
  }
}
