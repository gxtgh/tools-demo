import TronWeb from 'tronweb'

export interface TronConnectorConfig {
  rpcUrl?: string
  privateKey?: string
}

export class TronConnector {
  private tronWeb: any | null = null
  private config: TronConnectorConfig

  constructor(config: TronConnectorConfig = {}) {
    this.config = {
      rpcUrl: 'https://api.trongrid.io',
      ...config
    }
  }

  async connect(): Promise<{ address: string; publicKey: string }> {
    try {
      // 等待 TronLink 钱包加载
      await this.waitForTronLink()

      // 检查是否在 Tron 环境中
      if (typeof window !== 'undefined' && (window as any).tronWeb) {
        this.tronWeb = (window as any).tronWeb
      } else {
        // 创建 TronWeb 实例
        this.tronWeb = new (TronWeb as any)({
          fullHost: this.config.rpcUrl,
          privateKey: this.config.privateKey
        })
      }

      // 检查钱包是否已解锁
      if (!this.tronWeb || !this.tronWeb.defaultAddress || !this.tronWeb.defaultAddress.base58) {
        throw new Error('请先解锁 TronLink 钱包并确保已选择账户')
      }

      // 检查网络连接
      if (!this.tronWeb.isConnected()) {
        throw new Error('TronLink 钱包未连接到网络')
      }

      const address = this.tronWeb.defaultAddress.base58
      const publicKey = this.tronWeb.defaultAddress.hex

      return { address, publicKey }
    } catch (error) {
      throw new Error(`Tron 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async waitForTronLink(timeout: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const checkTronLink = () => {
        if (typeof window !== 'undefined' && (window as any).tronWeb) {
          resolve()
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('TronLink 钱包未检测到，请确保已安装并刷新页面'))
        } else {
          setTimeout(checkTronLink, 100)
        }
      }
      
      checkTronLink()
    })
  }

  async disconnect(): Promise<void> {
    this.tronWeb = null
  }

  async getBalance(address: string): Promise<string> {
    if (!this.tronWeb) {
      throw new Error('Tron 未连接')
    }

    try {
      const balance = await this.tronWeb.trx.getBalance(address)
      return this.tronWeb.fromSun(balance)
    } catch (error) {
      throw new Error(`获取余额失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.tronWeb) {
      throw new Error('Tron 未连接')
    }

    try {
      const transaction = await this.tronWeb.transactionBuilder.sendTrx(
        to,
        this.tronWeb.toSun(amount)
      )
      const signedTransaction = await this.tronWeb.trx.sign(transaction)
      const result = await this.tronWeb.trx.sendRawTransaction(signedTransaction)
      return result.txid
    } catch (error) {
      throw new Error(`发送交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  isConnected(): boolean {
    return this.tronWeb !== null && 
           !!this.tronWeb.defaultAddress && 
           !!this.tronWeb.defaultAddress.base58 &&
           this.tronWeb.isConnected()
  }

  getAddress(): string | null {
    return this.tronWeb?.defaultAddress.base58 || null
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    tronWeb?: any
  }
}
