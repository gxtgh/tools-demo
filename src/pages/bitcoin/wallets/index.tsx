import { useState, useEffect } from 'react'
import { BitcoinConnector } from '../../../connectors/bitcoinConnector'

interface BitcoinWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'okx' | 'keypair' | null
}

function BitcoinWallets() {
  const [walletState, setWalletState] = useState<BitcoinWalletState>({
    isConnected: false,
    address: null,
    publicKey: null,
    balance: null,
    connector: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([])

  useEffect(() => {
    checkWalletStatus()
  }, [])

  const checkWalletStatus = () => {
    const connector = new BitcoinConnector()
    const isConnected = connector.isConnected()
    const address = connector.getAddress()
    
    setWalletState({
      isConnected,
      address,
      publicKey: null,
      balance: null,
      connector: BitcoinConnector.isOKXWalletAvailable() ? 'okx' : 'keypair'
    })
  }

  const connectOKXWallet = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      if (!BitcoinConnector.isOKXWalletAvailable()) {
        throw new Error('OKX 钱包扩展未检测到，请安装 OKX 钱包')
      }

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
        publicKey = pubKey || 'N/A'
      } catch (pubKeyError) {
        console.warn('无法获取公钥:', pubKeyError)
        publicKey = 'N/A'
      }

      // 获取余额
      let balance = '0'
      try {
        const bal = await okxBitcoin.getBalance()
        balance = bal.toString()
      } catch (balanceError) {
        console.warn('无法获取余额:', balanceError)
        balance = '0'
      }

      setWalletState({
        isConnected: true,
        address,
        publicKey,
        balance,
        connector: 'okx'
      })
      
      setError('')
    } catch (err: any) {
      setError(`连接 OKX 钱包失败: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWithKeypair = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const connector = new BitcoinConnector()
      const result = await connector.connect()
      
      // 获取余额
      let balance = '0'
      try {
        balance = await connector.getBalance(result.address)
      } catch (balanceError) {
        console.warn('获取余额失败:', balanceError)
      }

      setWalletState({
        isConnected: true,
        address: result.address,
        publicKey: result.publicKey,
        balance,
        connector: 'keypair'
      })
      
      setError('')
    } catch (err: any) {
      setError(`密钥对连接失败: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setWalletState({
      isConnected: false,
      address: null,
      publicKey: null,
      balance: null,
      connector: null
    })
  }

  const generateBitcoinAddresses = () => {
    const addresses = []
    for (let i = 0; i < 10; i++) {
      // 生成随机的比特币地址格式（仅用于演示）
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let address = '1'
      for (let j = 0; j < 33; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      addresses.push(address)
    }
    setGeneratedAddresses(addresses)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>₿ Bitcoin 钱包管理</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包连接</h2>
        
        {!walletState.isConnected ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={connectOKXWallet}
              disabled={isLoading || !BitcoinConnector.isOKXWalletAvailable()}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading || !BitcoinConnector.isOKXWalletAvailable() ? '#6c757d' : '#f7931a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading || !BitcoinConnector.isOKXWalletAvailable() ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? '连接中...' : '连接 OKX 钱包'}
            </button>
            
            <button
              onClick={connectWithKeypair}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? '连接中...' : '生成密钥对连接'}
            </button>
          </div>
        ) : (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px',
            border: '2px solid #4caf50'
          }}>
            <h3>✅ 钱包已连接</h3>
            <p><strong>地址:</strong> {walletState.address}</p>
            <p><strong>公钥:</strong> {walletState.publicKey}</p>
            <p><strong>余额:</strong> {walletState.balance} BTC</p>
            <p><strong>连接方式:</strong> {walletState.connector === 'okx' ? 'OKX 钱包' : '密钥对'}</p>
            
            <button
              onClick={disconnect}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              断开连接
            </button>
          </div>
        )}
        
        {!BitcoinConnector.isOKXWalletAvailable() && (
          <div style={{ 
            marginTop: '15px',
            padding: '15px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '6px',
            border: '1px solid #ffeaa7'
          }}>
            <strong>提示:</strong> 未检测到 OKX 钱包扩展。请安装 <a href="https://www.okx.com/web3" target="_blank" rel="noopener noreferrer">OKX 钱包</a> 以获得更好的体验。
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px'
        }}>
          <strong>错误:</strong> {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 钱包创建和地址生成 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包创建</h2>
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={generateBitcoinAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            创建 Bitcoin 钱包地址
          </button>
        </div>
        
        {generatedAddresses.length > 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h4>创建的钱包地址:</h4>
            {generatedAddresses.map((addr, index) => (
              <div key={index} style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                padding: '8px',
                backgroundColor: 'white',
                margin: '5px 0',
                borderRadius: '4px',
                border: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{addr}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(addr)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  复制
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 功能导航 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Bitcoin 功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <a
            href="/bitcoin/queryBalance"
            style={{
              padding: '20px',
              backgroundColor: '#f7931a',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'block',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
            <div style={{ fontWeight: 'bold' }}>余额查询</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>批量查询 Bitcoin 地址余额</div>
          </a>
          
          <a
            href="/bitcoin/transactions"
            style={{
              padding: '20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'block',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>💸</div>
            <div style={{ fontWeight: 'bold' }}>交易管理</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>发送和查询 Bitcoin 交易</div>
          </a>
          
          <a
            href="/bitcoin/tools"
            style={{
              padding: '20px',
              backgroundColor: '#6f42c1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'block',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔧</div>
            <div style={{ fontWeight: 'bold' }}>工具箱</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>Bitcoin 相关工具和实用程序</div>
          </a>
        </div>
      </div>

      {/* 功能说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>Bitcoin 钱包功能</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>钱包连接:</strong> 支持 OKX 钱包扩展和密钥对连接</li>
          <li><strong>地址创建:</strong> 创建新的 Bitcoin 钱包地址</li>
          <li><strong>余额查询:</strong> 查询单个或批量地址余额</li>
          <li><strong>交易管理:</strong> 发送和查询 Bitcoin 交易</li>
          <li><strong>工具箱:</strong> Bitcoin 相关的实用工具</li>
        </ul>
      </div>
    </div>
  )
}

export default BitcoinWallets
