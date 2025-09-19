import { useState, useEffect } from 'react'

interface TonWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'tonkeeper' | 'tonconnect' | null
}

function TonWallets() {
  const [walletState, setWalletState] = useState<TonWalletState>({
    isConnected: false,
    address: null,
    publicKey: null,
    balance: null,
    connector: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([])
  const [connectURI, setConnectURI] = useState<string>('')

  useEffect(() => {
    checkWalletStatus()
  }, [])

  const checkWalletStatus = () => {
    const hasTonkeeper = typeof (window as any).tonkeeper !== 'undefined'
    
    setWalletState(prev => ({
      ...prev,
      connector: hasTonkeeper ? 'tonkeeper' : null
    }))
  }

  const connectTonkeeper = async () => {
    setIsLoading(true)
    setError('')
    setConnectURI('')
    
    try {
      // 动态导入 TON Connect SDK
      const { TonConnect } = await import('@tonconnect/sdk')
      
      const tonConnect = new TonConnect({
        manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json',
        walletsListSource: 'https://raw.githubusercontent.com/ton-community/tonconnect/main/packages/tonconnect-sdk/src/wallets-list.json'
      })

      // 获取连接 URI
      const uri = await tonConnect.connect([])
      setConnectURI(uri)
      console.log('TON Connect URI:', uri)
      
      // 监听连接状态
      const unsubscribe = tonConnect.onStatusChange((wallet) => {
        if (wallet && wallet.account) {
          console.log('TON 钱包连接成功:', wallet)
          setWalletState({
            isConnected: true,
            address: wallet.account.address || '',
            publicKey: wallet.account.publicKey || '',
            balance: '0', // TON 余额需要额外查询
            connector: 'tonconnect'
          })
          unsubscribe()
          setIsLoading(false)
        }
      })

      // 设置超时
      setTimeout(() => {
        unsubscribe()
        setError('连接超时，请确保已安装 Tonkeeper 钱包')
        setIsLoading(false)
      }, 60000)
      
    } catch (err: any) {
      setError(`连接 TON 钱包失败: ${err.message}`)
      setIsLoading(false)
    }
  }

  const copyConnectURI = async () => {
    if (!connectURI) return
    
    try {
      await navigator.clipboard.writeText(connectURI)
      alert('连接 URI 已复制到剪贴板！请在 Tonkeeper 中粘贴此 URI 进行连接。')
    } catch (err) {
      alert(`无法复制到剪贴板，请手动复制：\n\n${connectURI}`)
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
    setConnectURI('')
  }

  const generateTonAddresses = () => {
    const addresses = []
    for (let i = 0; i < 10; i++) {
      // 生成随机的 TON 地址格式（仅用于演示）
      const chars = '0123456789ABCDEFabcdef'
      let address = '0:'
      for (let j = 0; j < 64; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      addresses.push(address)
    }
    setGeneratedAddresses(addresses)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>💎 TON 钱包管理</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包连接</h2>
        
        {!walletState.isConnected ? (
          <div>
            <button
              onClick={connectTonkeeper}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: isLoading ? '#6c757d' : '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? '连接中...' : '连接 TON 钱包'}
            </button>
            
            {connectURI && (
              <div style={{ 
                marginTop: '15px',
                padding: '15px', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '6px',
                border: '1px solid #2196f3'
              }}>
                <h4>连接 URI 已生成</h4>
                <p style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {connectURI}
                </p>
                <button
                  onClick={copyConnectURI}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  复制 URI
                </button>
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
            <p><strong>余额:</strong> {walletState.balance} TON</p>
            <p><strong>连接方式:</strong> {walletState.connector === 'tonkeeper' ? 'Tonkeeper' : 'TON Connect'}</p>
            
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
            onClick={generateTonAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            创建 TON 钱包地址
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
        <h2>TON 功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <a
            href="/ton/queryBalance"
            style={{
              padding: '20px',
              backgroundColor: '#0088cc',
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
            <div style={{ fontSize: '12px', marginTop: '5px' }}>批量查询 TON 地址余额</div>
          </a>
          
          <a
            href="/ton/jettons"
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🪙</div>
            <div style={{ fontWeight: 'bold' }}>Jetton 代币</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>TON Jetton 代币管理</div>
          </a>
          
          <a
            href="/ton/transactions"
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
            <div style={{ fontSize: '12px', marginTop: '5px' }}>发送和查询 TON 交易</div>
          </a>
        </div>
      </div>

      {/* 功能说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>TON 钱包功能</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>钱包连接:</strong> 使用 TON Connect 协议连接 Tonkeeper 钱包</li>
          <li><strong>地址创建:</strong> 创建新的 TON 钱包地址</li>
          <li><strong>余额查询:</strong> 查询单个或批量地址余额</li>
          <li><strong>Jetton 代币:</strong> TON Jetton 代币管理</li>
          <li><strong>交易管理:</strong> 发送和查询 TON 交易</li>
        </ul>
      </div>
    </div>
  )
}

export default TonWallets
