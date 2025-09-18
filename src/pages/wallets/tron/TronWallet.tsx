import { useState, useEffect } from 'react'
import { TronConnector } from '../../../connectors/tronConnector'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

interface TronWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'tronlink' | 'keypair' | null
}

function TronWallet() {
  const [walletState, setWalletState] = useState<TronWalletState>({
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
    for (let i = 0; i < 5; i++) {
      // 生成随机的 Tron 地址格式（仅用于演示）
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let address = 'T'
      for (let j = 0; j < 33; j++) {
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
        // 使用 TronGrid API 查询余额
        const response = await fetch(`https://api.trongrid.io/v1/accounts/${trimmedAddr}`)
        if (response.ok) {
          const data = await response.json()
          const balance = (data.data[0]?.balance || 0) / 1000000 // 转换为 TRX
          results.push({
            address: trimmedAddr,
            balance: balance.toString(),
            symbol: 'TRX'
          })
        } else {
          throw new Error('API 请求失败')
        }
      } catch (error) {
        results.push({
          address: trimmedAddr,
          balance: '0',
          symbol: 'TRX',
          error: error instanceof Error ? error.message : '查询失败'
        })
      }
    }

    setBatchResults(results)
    setIsQueryingBatch(false)
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

      {/* 地址生成 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>地址生成</h2>
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
            生成 Tron 地址（演示）
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
            placeholder="请输入要查询的 Tron 地址，每行一个"
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
            backgroundColor: isQueryingBatch ? '#6c757d' : '#ff073a',
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
          <li><strong>TronLink 连接:</strong> 使用 TronLink 钱包扩展连接</li>
          <li><strong>地址生成:</strong> 生成随机 Tron 地址用于演示</li>
          <li><strong>批量查询:</strong> 支持批量查询多个地址的余额</li>
          <li><strong>实时余额:</strong> 显示当前连接钱包的实时余额</li>
          <li><strong>网络支持:</strong> 支持 Tron 主网和测试网</li>
        </ul>
      </div>
    </div>
  )
}

export default TronWallet