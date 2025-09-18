import { useState } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'
import MetaMaskConnectButton from '../../../components/MetaMaskConnectButton'

function EthereumWallets() {
  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([])

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case mainnet.id: return 'Ethereum 主网'
      case sepolia.id: return 'Sepolia 测试网'
      case bsc.id: return 'BSC 主网'
      case bscTestnet.id: return 'BSC 测试网'
      default: return `未知网络 (${chainId})`
    }
  }

  const generateEthereumAddresses = () => {
    const addresses = []
    for (let i = 0; i < 10; i++) {
      // 生成随机的以太坊地址格式（仅用于演示）
      const randomHex = Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      addresses.push(`0x${randomHex}`)
    }
    setGeneratedAddresses(addresses)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>⟠ Ethereum 钱包管理</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包连接</h2>
        <MetaMaskConnectButton />
        
        {isConnected && (
          <div style={{ 
            marginTop: '20px',
            padding: '20px', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '8px',
            border: '2px solid #4caf50'
          }}>
            <h3>✅ 钱包已连接</h3>
            <p><strong>地址:</strong> {address}</p>
            <p><strong>余额:</strong> {balance ? `${balance.formatted} ${balance.symbol}` : '加载中...'}</p>
            <p><strong>连接器:</strong> {connector?.name}</p>
            <p><strong>当前网络:</strong> {getChainName(chainId)}</p>
          </div>
        )}
      </div>

      {/* 网络切换 */}
      {isConnected && (
        <div style={{ marginBottom: '30px' }}>
          <h2>网络切换</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <button 
              onClick={() => switchChain({ chainId: mainnet.id })}
              disabled={chainId === mainnet.id}
              style={{ 
                padding: '10px', 
                backgroundColor: chainId === mainnet.id ? '#ccc' : '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: chainId === mainnet.id ? 'not-allowed' : 'pointer'
              }}
            >
              {chainId === mainnet.id ? '✅ Ethereum 主网' : 'Ethereum 主网'}
            </button>
            <button 
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={chainId === sepolia.id}
              style={{ 
                padding: '10px', 
                backgroundColor: chainId === sepolia.id ? '#ccc' : '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: chainId === sepolia.id ? 'not-allowed' : 'pointer'
              }}
            >
              {chainId === sepolia.id ? '✅ Sepolia 测试网' : 'Sepolia 测试网'}
            </button>
            <button 
              onClick={() => switchChain({ chainId: bsc.id })}
              disabled={chainId === bsc.id}
              style={{ 
                padding: '10px', 
                backgroundColor: chainId === bsc.id ? '#ccc' : '#f0b90b',
                color: chainId === bsc.id ? 'white' : 'black',
                border: 'none',
                borderRadius: '6px',
                cursor: chainId === bsc.id ? 'not-allowed' : 'pointer'
              }}
            >
              {chainId === bsc.id ? '✅ BSC 主网' : 'BSC 主网'}
            </button>
            <button 
              onClick={() => switchChain({ chainId: bscTestnet.id })}
              disabled={chainId === bscTestnet.id}
              style={{ 
                padding: '10px', 
                backgroundColor: chainId === bscTestnet.id ? '#ccc' : '#f0b90b',
                color: chainId === bscTestnet.id ? 'white' : 'black',
                border: 'none',
                borderRadius: '6px',
                cursor: chainId === bscTestnet.id ? 'not-allowed' : 'pointer'
              }}
            >
              {chainId === bscTestnet.id ? '✅ BSC 测试网' : 'BSC 测试网'}
            </button>
          </div>
        </div>
      )}

      {/* 钱包创建和地址生成 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>钱包创建</h2>
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={generateEthereumAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            创建 Ethereum 钱包地址
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
        <h2>Ethereum 功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <a
            href="/ethereum/queryBalance"
            style={{
              padding: '20px',
              backgroundColor: '#007acc',
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
            <div style={{ fontSize: '12px', marginTop: '5px' }}>批量查询 Ethereum 地址余额</div>
          </a>
          
          <a
            href="/ethereum/transactions"
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>💸</div>
            <div style={{ fontWeight: 'bold' }}>交易管理</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>发送和查询 Ethereum 交易</div>
          </a>
          
          <a
            href="/ethereum/defi"
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
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏦</div>
            <div style={{ fontWeight: 'bold' }}>DeFi 工具</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>DeFi 协议交互和管理</div>
          </a>
        </div>
      </div>

      {/* 功能说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>Ethereum 钱包功能</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>钱包连接:</strong> 支持 MetaMask、WalletConnect 等多种连接方式</li>
          <li><strong>网络切换:</strong> 支持 Ethereum 主网、Sepolia 测试网、BSC 主网、BSC 测试网</li>
          <li><strong>地址创建:</strong> 创建新的 Ethereum 钱包地址</li>
          <li><strong>余额查询:</strong> 单个和批量地址余额查询</li>
          <li><strong>交易管理:</strong> 发送和查询以太坊交易</li>
          <li><strong>DeFi 工具:</strong> DeFi 协议交互和管理工具</li>
        </ul>
      </div>
    </div>
  )
}

export default EthereumWallets
