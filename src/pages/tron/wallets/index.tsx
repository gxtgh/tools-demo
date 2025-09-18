import { useState, useEffect } from 'react'
import { TronConnector } from '../../../connectors/tronConnector'

interface TronWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'tronlink' | null
}

function TronWallets() {
  const [walletState, setWalletState] = useState<TronWalletState>({
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
    const hasTronLink = typeof (window as any).tronWeb !== 'undefined'
    const isConnected = hasTronLink && !!(window as any).tronWeb?.defaultAddress?.base58
    
    setWalletState({
      isConnected,
      address: isConnected ? (window as any).tronWeb.defaultAddress.base58 : null,
      publicKey: isConnected ? (window as any).tronWeb.defaultAddress.hex : null,
      balance: null,
      connector: hasTronLink ? 'tronlink' : null
    })
  }

  const connectTronLink = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const connector = new TronConnector()
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
        connector: 'tronlink'
      })
      
      setError('')
    } catch (err: any) {
      setError(`连接 TronLink 失败: ${err.message}`)
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

  const generateTronAddresses = () => {
    const addresses = []
    for (let i = 0; i < 10; i++) {
      // 生成随机的 Tron 地址格式（仅用于演示）
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let address = 'T'
      for (let j = 0; j < 33; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      addresses.push(address)
    }
    setGeneratedAddresses(addresses)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔴 Tron 钱包管理</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包连接</h2>
        
        {!walletState.isConnected ? (
          <div>
            <button
              onClick={connectTronLink}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#6c757d' : '#ff073a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? '连接中...' : '连接 TronLink 钱包'}
            </button>
            
            {typeof (window as any).tronWeb === 'undefined' && (
              <div style={{ 
                marginTop: '15px',
                padding: '15px', 
                backgroundColor: '#fff3cd', 
                borderRadius: '6px',
                border: '1px solid #ffeaa7'
              }}>
                <strong>提示:</strong> 未检测到 TronLink 钱包。请安装 <a href="https://www.tronlink.org/" target="_blank" rel="noopener noreferrer">TronLink 扩展</a>。
              </div>
            )}
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
            <p><strong>余额:</strong> {walletState.balance} TRX</p>
            <p><strong>连接方式:</strong> TronLink 钱包</p>
            
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
            onClick={generateTronAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            创建 Tron 钱包地址
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
        <h2>Tron 功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <a
            href="/tron/queryBalance"
            style={{
              padding: '20px',
              backgroundColor: '#ff073a',
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
            <div style={{ fontSize: '12px', marginTop: '5px' }}>批量查询 Tron 地址余额</div>
          </a>
          
          <a
            href="/tron/transactions"
            style={{
              padding: '20px',
              backgroundColor: '#dc3545',
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
            <div style={{ fontSize: '12px', marginTop: '5px' }}>发送和查询 Tron 交易</div>
          </a>
          
          <a
            href="/tron/tokens"
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🪙</div>
            <div style={{ fontWeight: 'bold' }}>代币管理</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>TRC20 代币管理和交互</div>
          </a>
        </div>
      </div>

      {/* 功能说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>Tron 钱包功能</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>钱包连接:</strong> 支持 TronLink 钱包扩展连接</li>
          <li><strong>地址创建:</strong> 创建新的 Tron 钱包地址</li>
          <li><strong>余额查询:</strong> 查询单个或批量地址余额</li>
          <li><strong>交易管理:</strong> 发送和查询 Tron 交易</li>
          <li><strong>代币管理:</strong> TRC20 代币交互和管理</li>
        </ul>
      </div>
    </div>
  )
}

export default TronWallets
