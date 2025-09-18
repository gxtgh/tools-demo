import * as bitcoin from 'bitcoinjs-lib'

export interface BitcoinConnectorConfig {
  network?: 'mainnet' | 'testnet'
  rpcUrl?: string
  privateKey?: string
}

export class BitcoinConnector {
  private network: bitcoin.Network
  private config: BitcoinConnectorConfig
  private keyPair: any | null = null

  constructor(config: BitcoinConnectorConfig = {}) {
    this.config = {
      network: 'mainnet',
      rpcUrl: 'https://blockstream.info/api',
      ...config
    }
    
    this.network = this.config.network === 'testnet' 
      ? bitcoin.networks.testnet 
      : bitcoin.networks.bitcoin
  }

  async connect(): Promise<{ address: string; publicKey: string }> {
    try {
      // 优先尝试使用 OKX 钱包扩展
      if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
        return await this.connectOKXWallet()
      }

      // 如果没有 OKX 钱包，使用密钥对方式
      if (this.config.privateKey) {
        // 使用提供的私钥
        const privateKeyBuffer = Buffer.from(this.config.privateKey, 'hex')
        this.keyPair = (bitcoin as any).ECPair.fromPrivateKey(privateKeyBuffer, { network: this.network })
      } else {
        // 生成新的密钥对
        this.keyPair = (bitcoin as any).ECPair.makeRandom({ network: this.network })
      }

      const { address } = bitcoin.payments.p2pkh({
        pubkey: this.keyPair.publicKey,
        network: this.network
      })

      if (!address) {
        throw new Error('无法生成比特币地址')
      }

      return {
        address,
        publicKey: this.keyPair.publicKey.toString('hex')
      }
    } catch (error) {
      throw new Error(`Bitcoin 连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async connectOKXWallet(): Promise<{ address: string; publicKey: string }> {
    try {
      const okxBitcoin = (window as any).okxwallet.bitcoin
      
      // 请求连接
      const accounts = await okxBitcoin.requestAccounts()
      
      if (!accounts || accounts.length === 0) {
        throw new Error('OKX 钱包未返回账户信息')
      }

      const address = accounts[0]
      
      // 获取公钥
      let publicKey = ''
      try {
        const pubKey = await okxBitcoin.getPublicKey()
        publicKey = pubKey || ''
      } catch (pubKeyError) {
        console.warn('无法获取公钥:', pubKeyError)
        publicKey = 'N/A'
      }

      return {
        address,
        publicKey
      }
    } catch (error) {
      throw new Error(`OKX 钱包连接失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async disconnect(): Promise<void> {
    this.keyPair = null
  }

  async getBalance(address: string): Promise<string> {
    try {
      // 优先尝试使用 OKX 钱包 API
      if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
        try {
          const okxBitcoin = (window as any).okxwallet.bitcoin
          const balance = await okxBitcoin.getBalance()
          return balance.toString()
        } catch (okxError) {
          console.warn('OKX 钱包获取余额失败，使用备用方法:', okxError)
        }
      }

      // 备用方法：使用区块链浏览器 API
      const response = await fetch(`${this.config.rpcUrl}/address/${address}`)
      const data = await response.json()
      
      // 计算总余额（未确认 + 已确认）
      const totalBalance = (data.chain_stats.funded_txo_sum || 0) - (data.chain_stats.spent_txo_sum || 0)
      return (totalBalance / 100000000).toString() // 转换为 BTC
    } catch (error) {
      throw new Error(`获取余额失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  async sendTransaction(to: string, amount: string): Promise<string> {
    try {
      // 优先尝试使用 OKX 钱包发送交易
      if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
        try {
          const okxBitcoin = (window as any).okxwallet.bitcoin
          const amountSatoshi = Math.floor(parseFloat(amount) * 100000000)
          
          const txid = await okxBitcoin.sendBitcoin(to, amountSatoshi)
          return txid
        } catch (okxError) {
          console.warn('OKX 钱包发送交易失败，使用备用方法:', okxError)
        }
      }

      // 备用方法：使用密钥对发送交易
      if (!this.keyPair) {
        throw new Error('Bitcoin 未连接且无法使用 OKX 钱包')
      }

      // 获取 UTXOs
      const address = bitcoin.payments.p2pkh({
        pubkey: this.keyPair.publicKey,
        network: this.network
      }).address!

      const utxosResponse = await fetch(`${this.config.rpcUrl}/address/${address}/utxo`)
      const utxos = await utxosResponse.json()

      if (utxos.length === 0) {
        throw new Error('没有可用的 UTXOs')
      }

      // 创建交易
      const txb = new (bitcoin as any).TransactionBuilder(this.network)
      
      // 添加输入
      let totalInput = 0
      for (const utxo of utxos) {
        txb.addInput(utxo.txid, utxo.vout)
        totalInput += utxo.value
      }

      // 添加输出
      const amountSatoshi = Math.floor(parseFloat(amount) * 100000000)
      const fee = 10000 // 固定手续费
      const change = totalInput - amountSatoshi - fee

      txb.addOutput(to, amountSatoshi)
      if (change > 0) {
        txb.addOutput(address, change)
      }

      // 签名
      for (let i = 0; i < utxos.length; i++) {
        txb.sign(i, this.keyPair)
      }

      const tx = txb.build()
      const txHex = tx.toHex()

      // 广播交易
      const response = await fetch(`${this.config.rpcUrl}/tx`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: txHex
      })

      if (!response.ok) {
        throw new Error('交易广播失败')
      }

      const txid = await response.text()
      return txid
    } catch (error) {
      throw new Error(`发送交易失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  isConnected(): boolean {
    // 检查是否通过 OKX 钱包连接
    if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
      return true
    }
    
    // 检查是否通过密钥对连接
    return this.keyPair !== null
  }

  getAddress(): string | null {
    // 优先从 OKX 钱包获取地址
    if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
      try {
        // 这里需要存储连接时的地址，因为 OKX 可能没有直接获取地址的方法
        return null // 暂时返回 null，实际地址在连接时获取
      } catch (error) {
        console.warn('无法从 OKX 钱包获取地址:', error)
      }
    }

    // 从密钥对获取地址
    if (!this.keyPair) return null
    
    const { address } = bitcoin.payments.p2pkh({
      pubkey: this.keyPair.publicKey,
      network: this.network
    })
    
    return address || null
  }

  // 检查 OKX 钱包是否可用
  static isOKXWalletAvailable(): boolean {
    return typeof window !== 'undefined' && 
           !!(window as any).okxwallet && 
           !!(window as any).okxwallet.bitcoin
  }
}
