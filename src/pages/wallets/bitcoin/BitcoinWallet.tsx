import { useState, useEffect } from 'react'
import { BitcoinConnector } from '../../../connectors/bitcoinConnector'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

interface BitcoinWalletState {
  isConnected: boolean
  address: string | null
  publicKey: string | null
  balance: string | null
  connector: 'okx' | 'keypair' | null
}

function BitcoinWallet() {
  const [walletState, setWalletState] = useState<BitcoinWalletState>({
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
    for (let i = 0; i < 5; i++) {
      // 生成随机的比特币地址格式（仅用于演示）
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      let address = '1'
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
        // 使用 Blockstream API 查询余额
        const response = await fetch(`https://blockstream.info/api/address/${trimmedAddr}`)
        if (response.ok) {
          const data = await response.json()
          const balance = ((data.chain_stats.funded_txo_sum || 0) - (data.chain_stats.spent_txo_sum || 0)) / 100000000
          results.push({
            address: trimmedAddr,
            balance: balance.toString(),
            symbol: 'BTC'
          })
        } else {
          throw new Error('API 请求失败')
        }
      } catch (error) {
        results.push({
          address: trimmedAddr,
          balance: '0',
          symbol: 'BTC',
          error: error instanceof Error ? error.message : '查询失败'
        })
      }
    }

    setBatchResults(results)
    setIsQueryingBatch(false)
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

      {/* 地址生成 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>地址生成</h2>
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
            生成 Bitcoin 地址（演示）
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
            placeholder="请输入要查询的 Bitcoin 地址，每行一个"
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
            backgroundColor: isQueryingBatch ? '#6c757d' : '#f7931a',
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
          <li><strong>OKX 钱包连接:</strong> 使用 OKX 钱包扩展连接 Bitcoin 钱包</li>
          <li><strong>密钥对连接:</strong> 生成新的密钥对进行连接</li>
          <li><strong>地址生成:</strong> 生成随机 Bitcoin 地址用于演示</li>
          <li><strong>批量查询:</strong> 支持批量查询多个地址的余额</li>
          <li><strong>实时余额:</strong> 显示当前连接钱包的实时余额</li>
        </ul>
        
        <h4>使用提示</h4>
        <ul style={{ textAlign: 'left' }}>
          <li>推荐使用 OKX 钱包扩展以获得更好的体验</li>
          <li>密钥对方式仅用于开发和测试</li>
          <li>批量查询使用 Blockstream API</li>
          <li>地址生成仅用于演示，实际使用请通过钱包生成</li>
        </ul>
      </div>
    </div>
  )
}

export default BitcoinWallet
