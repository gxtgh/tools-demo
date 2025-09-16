import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client'
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519'
import { TransactionBlock } from '@mysten/sui.js/transactions'

export interface SuiConnectorConfig {
  rpcUrl?: string
  privateKey?: string
}

export class SuiConnector {
  private suiClient: SuiClient | null = null
  private keypair: Ed25519Keypair | null = null
  private config: SuiConnectorConfig

  constructor(config: SuiConnectorConfig = {}) {
    this.config = {
      rpcUrl: getFullnodeUrl('mainnet'),
      ...config
    }
  }

  async connect(): Promise<{ address: string; publicKey: string }> {
    try {
      // 创建 Sui 客户端
      this.suiClient = new SuiClient({ url: this.config.rpcUrl! })

      // 检查是否有私钥
      if (this.config.privateKey) {
        this.keypair = Ed25519Keypair.fromSecretKey(
          Uint8Array.from(Buffer.from(this.config.privateKey, 'hex'))
        )
      } else {
        // 生成新的密钥对
        this.keypair = new Ed25519Keypair()
      }

      const address = this.keypair.getPublicKey().toSuiAddress()
      const publicKey = this.keypair.getPublicKey().toBase64()

      return { address, publicKey }
    } catch (error) {
      throw new Error(`Sui 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async disconnect(): Promise<void> {
    this.suiClient = null
    this.keypair = null
  }

  async getBalance(address: string): Promise<string> {
    if (!this.suiClient) {
      throw new Error('Sui 未连接')
    }

    try {
      const coins = await this.suiClient.getBalance({
        owner: address,
        coinType: '0x2::sui::SUI'
      })
      return (parseInt(coins.totalBalance) / 1e9).toString() // 转换为 SUI
    } catch (error) {
      throw new Error(`获取余额失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.suiClient || !this.keypair) {
      throw new Error('Sui 未连接')
    }

    try {
      const txb = new TransactionBlock()
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(parseInt(amount) * 1e9)])
      txb.transferObjects([coin], to)

      const result = await this.suiClient.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        signer: this.keypair
      })

      return result.digest
    } catch (error) {
      throw new Error(`发送交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  isConnected(): boolean {
    return this.suiClient !== null && this.keypair !== null
  }

  getAddress(): string | null {
    return this.keypair?.getPublicKey().toSuiAddress() || null
  }
}
