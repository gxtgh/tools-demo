import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { Ed25519PrivateKey } from '@aptos-labs/ts-sdk'

export interface AptosConnectorConfig {
  network?: 'mainnet' | 'testnet'
  rpcUrl?: string
  privateKey?: string
}

export class AptosConnector {
  private aptos: Aptos | null = null
  private privateKey: Ed25519PrivateKey | null = null
  private config: AptosConnectorConfig

  constructor(config: AptosConnectorConfig = {}) {
    this.config = {
      network: 'mainnet',
      rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
      ...config
    }
  }

  async connect(): Promise<{ address: string; publicKey: string }> {
    try {
      // 创建 Aptos 配置
      const aptosConfig = new AptosConfig({
        network: this.config.network === 'testnet' ? Network.TESTNET : Network.MAINNET,
        fullnode: this.config.rpcUrl
      })

      this.aptos = new Aptos(aptosConfig)

      if (this.config.privateKey) {
        // 使用提供的私钥
        this.privateKey = new Ed25519PrivateKey(this.config.privateKey)
      } else {
        // 生成新的私钥
        this.privateKey = Ed25519PrivateKey.generate()
      }

      const address = this.privateKey.publicKey().authKey().derivedAddress().toString()
      const publicKey = this.privateKey.publicKey().toString()

      return { address, publicKey }
    } catch (error) {
      throw new Error(`Aptos 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async disconnect(): Promise<void> {
    this.aptos = null
    this.privateKey = null
  }

  async getBalance(address: string): Promise<string> {
    if (!this.aptos) {
      throw new Error('Aptos 未连接')
    }

    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: address
      })

      // 查找 APT 代币资源
      const aptResource = resources.find(
        (resource) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      )

      if (!aptResource) {
        return '0'
      }

      const balance = (aptResource.data as any).coin.value
      return (parseInt(balance) / 1e8).toString() // 转换为 APT
    } catch (error) {
      throw new Error(`获取余额失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    if (!this.aptos || !this.privateKey) {
      throw new Error('Aptos 未连接')
    }

    try {
      const amountInOctas = Math.floor(parseFloat(amount) * 1e8)

      const transaction = await this.aptos.transferCoinTransaction({
        sender: this.privateKey.publicKey().authKey().derivedAddress().toString(),
        recipient: to,
        amount: amountInOctas
      })

      const committedTransaction = await this.aptos.signAndSubmitTransaction({
        signer: this.privateKey as any,
        transaction
      })

      return committedTransaction.hash
    } catch (error) {
      throw new Error(`发送交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  isConnected(): boolean {
    return this.aptos !== null && this.privateKey !== null
  }

  getAddress(): string | null {
    return this.privateKey?.publicKey().authKey().derivedAddress().toString() || null
  }
}
