import { useState } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'
import MetaMaskConnectButton from '../../../components/MetaMaskConnectButton'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

function EthereumWallet() {
  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  const [batchAddresses, setBatchAddresses] = useState<string>('')
  const [batchResults, setBatchResults] = useState<AddressBalance[]>([])
  const [isQueryingBatch, setIsQueryingBatch] = useState(false)
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

  const generateRandomAddresses = () => {
    const addresses = []
    for (let i = 0; i < 5; i++) {
      // 生成随机的以太坊地址格式（仅用于演示）
      const randomHex = Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      addresses.push(`0x${randomHex}`)
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
        // 这里应该调用实际的余额查询 API
        // 目前使用模拟数据
        const mockBalance = (Math.random() * 10).toFixed(4)
        results.push({
          address: trimmedAddr,
          balance: mockBalance,
          symbol: 'ETH'
        })
      } catch (error) {
        results.push({
          address: trimmedAddr,
          balance: '0',
          symbol: 'ETH',
          error: error instanceof Error ? error.message : '查询失败'
        })
      }
    }

    setBatchResults(results)
    setIsQueryingBatch(false)
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

      {/* 地址生成 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>地址生成</h2>
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={generateRandomAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            生成随机地址（演示）
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
            placeholder="请输入要查询的地址，每行一个"
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
            backgroundColor: isQueryingBatch ? '#6c757d' : '#007bff',
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
                        <span style={{ color: '#dc3545' }}>❌ 错误</span>
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
          <li><strong>钱包连接:</strong> 支持 MetaMask、WalletConnect 等</li>
          <li><strong>网络切换:</strong> 支持 Ethereum 主网、Sepolia 测试网、BSC 主网、BSC 测试网</li>
          <li><strong>地址生成:</strong> 生成随机地址用于演示</li>
          <li><strong>批量查询:</strong> 支持批量查询多个地址的余额</li>
          <li><strong>实时余额:</strong> 显示当前连接钱包的实时余额</li>
        </ul>
      </div>
    </div>
  )
}

export default EthereumWallet
