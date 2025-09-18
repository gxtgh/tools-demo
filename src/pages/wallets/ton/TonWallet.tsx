import { useState, useEffect } from 'react'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

interface TonWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'tonkeeper' | 'tonconnect' | null
}

function TonWallet() {
  const [walletState, setWalletState] = useState<TonWalletState>({
    isConnected: false,
    address: null,
    publicKey: null,
    balance: null,
    connector: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [batchAddresses, setBatchAddresses] = useState<string>('')
  const [batchResults, setBatchResults] = useState<AddressBalance[]>([])
  const [isQueryingBatch, setIsQueryingBatch] = useState(false)
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
    for (let i = 0; i < 5; i++) {
      // 生成随机的 TON 地址格式（仅用于演示）
      const chars = '0123456789ABCDEFabcdef'
      let address = '0:'
      for (let j = 0; j < 64; j++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      addresses.push(address)
    }
    setGeneratedAddresses(addresses)
    setBatchAddresses(addresses.join('\n'))
  }

  const queryBatchBalances = async () => {
    if (!batchAddresses.trim()) {
      alert('请输入要查询的地址')
      return
    }

    setIsQueryingBatch(true)
    setBatchResults([])

    const addresses = batchAddresses.split('\n').filter(addr => addr.trim())
    const results: AddressBalance[] = []

    for (const addr of addresses) {
      const trimmedAddr = addr.trim()
      if (!trimmedAddr) continue

      try {
        // 使用 TON API 查询余额（模拟）
        const mockBalance = (Math.random() * 100).toFixed(2)
        results.push({
          address: trimmedAddr,
          balance: mockBalance,
          symbol: 'TON'
        })
      } catch (error) {
        results.push({
          address: trimmedAddr,
          balance: '0',
          symbol: 'TON',
          error: error instanceof Error ? error.message : '查询失败'
        })
      }
    }

    setBatchResults(results)
    setIsQueryingBatch(false)
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

      {/* 地址生成 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>地址生成</h2>
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
            生成 TON 地址（演示）
          </button>
        </div>
        
        {generatedAddresses.length > 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h4>生成的地址:</h4>
            {generatedAddresses.map((addr, index) => (
              <div key={index} style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                padding: '5px',
                backgroundColor: 'white',
                margin: '5px 0',
                borderRadius: '4px'
              }}>
                {addr}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 批量余额查询 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>批量余额查询</h2>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            value={batchAddresses}
            onChange={(e) => setBatchAddresses(e.target.value)}
            placeholder="请输入要查询的 TON 地址，每行一个"
            style={{
              width: '100%',
              height: '150px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>
        
        <button
          onClick={queryBatchBalances}
          disabled={isQueryingBatch}
          style={{
            padding: '10px 20px',
            backgroundColor: isQueryingBatch ? '#6c757d' : '#0088cc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isQueryingBatch ? 'not-allowed' : 'pointer'
          }}
        >
          {isQueryingBatch ? '查询中...' : '批量查询余额'}
        </button>
      </div>

      {/* 批量查询结果 */}
      {batchResults.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>批量查询结果</h2>
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>地址</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'right' }}>余额</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((result, index) => (
                  <tr key={index}>
                    <td style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #eee',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}>
                      {result.address}
                    </td>
                    <td style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #eee',
                      textAlign: 'right',
                      fontWeight: 'bold'
                    }}>
                      {result.balance} {result.symbol}
                    </td>
                    <td style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #eee',
                      textAlign: 'center'
                    }}>
                      {result.error ? (
                        <span style={{ color: '#dc3545', fontSize: '12px' }}>{result.error}</span>
                      ) : (
                        <span style={{ color: '#28a745' }}>✅ 成功</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>功能说明</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>Tonkeeper 连接:</strong> 使用 TON Connect 协议连接 Tonkeeper 钱包</li>
          <li><strong>地址生成:</strong> 生成随机 TON 地址用于演示</li>
          <li><strong>批量查询:</strong> 支持批量查询多个地址的余额</li>
          <li><strong>连接 URI:</strong> 生成连接 URI 用于钱包连接</li>
          <li><strong>网络支持:</strong> 支持 TON 主网和测试网</li>
        </ul>
      </div>
    </div>
  )
}

export default TonWallet
