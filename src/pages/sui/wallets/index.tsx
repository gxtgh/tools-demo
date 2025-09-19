import { useState, useEffect } from 'react'
import { SuiConnector } from '../../../connectors/suiConnector'

interface SuiWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'sui' | null
}

function SuiWallets() {
  const [walletState, setWalletState] = useState<SuiWalletState>({
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
    // Sui 钱包状态检查
    setWalletState(prev => ({
      ...prev,
      connector: null
    }))
  }

  const connectSuiWallet = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const connector = new SuiConnector()
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
        connector: 'sui'
      })
      
      setError('')
    } catch (err: any) {
      setError(`连接 Sui 钱包失败: ${err.message}`)
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

  const generateSuiAddresses = () => {
    const addresses = []
    for (let i = 0; i < 10; i++) {
      // 生成随机的 Sui 地址格式（仅用于演示）
      const chars = '0123456789abcdef'
      let address = '0x'
      for (let j = 0; j < 64; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      addresses.push(address)
    }
    setGeneratedAddresses(addresses)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🟢 Sui 钱包管理</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包连接</h2>
        
        {!walletState.isConnected ? (
          <button
            onClick={connectSuiWallet}
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: isLoading ? '#6c757d' : '#4da6ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoading ? '连接中...' : '连接 Sui 钱包'}
          </button>
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
            <p><strong>余额:</strong> {walletState.balance} SUI</p>
            <p><strong>连接方式:</strong> Sui 密钥对</p>
            
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
            onClick={generateSuiAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            创建 Sui 钱包地址
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
        <h2>Sui 功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <a
            href="/sui/queryBalance"
            style={{
              padding: '20px',
              backgroundColor: '#4da6ff',
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
            <div style={{ fontSize: '12px', marginTop: '5px' }}>批量查询 Sui 地址余额</div>
          </a>
          
          <a
            href="/sui/objects"
            style={{
              padding: '20px',
              backgroundColor: '#28a745',
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎯</div>
            <div style={{ fontWeight: 'bold' }}>对象管理</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>Sui 对象查询和管理</div>
          </a>
          
          <a
            href="/sui/transactions"
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>💸</div>
            <div style={{ fontWeight: 'bold' }}>交易管理</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>发送和查询 Sui 交易</div>
          </a>
        </div>
      </div>

      {/* 功能说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>Sui 钱包功能</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>钱包连接:</strong> 使用 Sui SDK 生成密钥对连接</li>
          <li><strong>地址创建:</strong> 创建新的 Sui 钱包地址</li>
          <li><strong>余额查询:</strong> 查询单个或批量地址余额</li>
          <li><strong>对象管理:</strong> Sui 对象查询和管理</li>
          <li><strong>交易管理:</strong> 发送和查询 Sui 交易</li>
        </ul>
      </div>
    </div>
  )
}

export default SuiWallets
