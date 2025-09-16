import { useState } from 'react'
import { multiChainWallet } from '../connectors/MultiChainWallet'
import type { ChainType, WalletConnection } from '../connectors/MultiChainWallet'

function MultiChainWallet() {
  const [connections, setConnections] = useState<WalletConnection[]>([])
  const [loading, setLoading] = useState<Record<ChainType, boolean>>({} as Record<ChainType, boolean>)
  const [error, setError] = useState<string>('')

  // 更新连接状态
  const updateConnections = () => {
    setConnections(multiChainWallet.getAllConnections())
  }

  // 连接钱包
  const connectWallet = async (chainType: ChainType) => {
    setLoading(prev => ({ ...prev, [chainType]: true }))
    setError('')

    try {
      await multiChainWallet.connect(chainType)
      updateConnections()
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(prev => ({ ...prev, [chainType]: false }))
    }
  }

  // 断开连接
  const disconnectWallet = async (chainType: ChainType) => {
    try {
      await multiChainWallet.disconnect(chainType)
      updateConnections()
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开连接失败')
    }
  }

  // 更新余额
  const updateBalance = async (chainType: ChainType) => {
    try {
      await multiChainWallet.updateBalance(chainType)
      updateConnections()
    } catch (err) {
      console.error('更新余额失败:', err)
    }
  }

  // 发送交易
  const sendTransaction = async (chainType: ChainType, to: string, amount: string) => {
    try {
      const txHash = await multiChainWallet.sendTransaction(chainType, to, amount)
      alert(`交易成功! Hash: ${txHash}`)
      await updateBalance(chainType)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送交易失败')
    }
  }

  // 获取链信息
  const getChainInfo = (chainType: ChainType) => {
    return multiChainWallet.getChainInfo(chainType)
  }

  // 支持的链列表
  const supportedChains: { type: ChainType; name: string; icon: string }[] = [
    { type: 'tron', name: 'Tron', icon: '🔴' },
    { type: 'ton', name: 'TON', icon: '💎' },
    { type: 'sui', name: 'Sui', icon: '🟢' },
    { type: 'bitcoin', name: 'Bitcoin', icon: '₿' },
    { type: 'aptos', name: 'Aptos', icon: '🟡' }
  ]

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🌐 多链钱包连接</h1>
      
      {/* Ethereum 连接说明 */}
      <div style={{
        padding: '15px',
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3>🔵 Ethereum 连接</h3>
        <p>Ethereum 链使用 AppKit 连接器，请使用页面顶部的 "Connect Wallet" 按钮进行连接。</p>
        <p>支持的连接方式：MetaMask、WalletConnect 等</p>
      </div>
      
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          marginBottom: '20px'
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

      {/* 支持的链列表 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>支持的区块链</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          {supportedChains.map(({ type, name, icon }) => {
            const isConnected = multiChainWallet.isConnected(type)
            const isLoading = loading[type]
            const chainInfo = getChainInfo(type)
            
            return (
              <div key={type} style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: isConnected ? '#d4edda' : '#f8f9fa',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
                <h3>{name}</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {chainInfo?.testnet ? '测试网' : '主网'}
                </p>
                
                {isConnected ? (
                  <div>
                    <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                      {multiChainWallet.getConnection(type)?.address}
                    </p>
                    <button
                      onClick={() => disconnectWallet(type)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px'
                      }}
                    >
                      断开连接
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => connectWallet(type)}
                    disabled={isLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isLoading ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    {isLoading ? '连接中...' : '连接钱包'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 已连接的钱包 */}
      {connections.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>已连接的钱包</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {connections.map((connection) => {
              const chainInfo = getChainInfo(connection.chainType)
              
              return (
                <div key={connection.chainType} style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h3>{chainInfo?.name} 钱包</h3>
                  <p><strong>地址:</strong> {connection.address}</p>
                  <p><strong>余额:</strong> {connection.balance} {chainInfo?.symbol}</p>
                  <p><strong>公钥:</strong> {connection.publicKey.substring(0, 20)}...</p>
                  
                  <div style={{ marginTop: '15px' }}>
                    <button
                      onClick={() => updateBalance(connection.chainType)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      更新余额
                    </button>
                    
                    <button
                      onClick={() => {
                        const to = prompt('接收地址:')
                        const amount = prompt('金额:')
                        if (to && amount) {
                          sendTransaction(connection.chainType, to, amount)
                        }
                      }}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      发送交易
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>使用说明</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>Ethereum:</strong> 使用页面顶部的 "Connect Wallet" 按钮，支持 MetaMask、WalletConnect 等</li>
          <li><strong>Tron:</strong> 需要安装 TronLink 钱包扩展</li>
          <li><strong>TON:</strong> 使用 TON Connect 协议连接</li>
          <li><strong>Sui:</strong> 使用 Sui 钱包或生成新密钥对</li>
          <li><strong>Bitcoin:</strong> 生成新密钥对或使用私钥</li>
          <li><strong>Aptos:</strong> 使用 Aptos 钱包或生成新密钥对</li>
        </ul>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          <strong>注意:</strong> 某些链需要特定的钱包扩展或配置。请确保已安装相应的钱包软件。
        </p>
      </div>
    </div>
  )
}

export default MultiChainWallet
