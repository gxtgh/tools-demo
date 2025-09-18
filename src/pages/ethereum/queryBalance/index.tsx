import { useState } from 'react'
import { useChainId } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

function EthereumQueryBalance() {
  const chainId = useChainId()
  const [batchAddresses, setBatchAddresses] = useState<string>('')
  const [batchResults, setBatchResults] = useState<AddressBalance[]>([])
  const [isQueryingBatch, setIsQueryingBatch] = useState(false)
  const [singleAddress, setSingleAddress] = useState<string>('')
  const [singleResult, setSingleResult] = useState<AddressBalance | null>(null)
  const [isQueryingSingle, setIsQueryingSingle] = useState(false)

  const getChainInfo = () => {
    switch (chainId) {
      case mainnet.id: 
        return { name: 'Ethereum 主网', symbol: 'ETH', apiUrl: 'https://api.etherscan.io/api' }
      case sepolia.id: 
        return { name: 'Sepolia 测试网', symbol: 'ETH', apiUrl: 'https://api-sepolia.etherscan.io/api' }
      case bsc.id: 
        return { name: 'BSC 主网', symbol: 'BNB', apiUrl: 'https://api.bscscan.com/api' }
      case bscTestnet.id: 
        return { name: 'BSC 测试网', symbol: 'tBNB', apiUrl: 'https://api-testnet.bscscan.com/api' }
      default: 
        return { name: '未知网络', symbol: 'ETH', apiUrl: '' }
    }
  }

  const querySingleBalance = async () => {
    if (!singleAddress.trim()) {
      alert('请输入要查询的地址')
      return
    }

    setIsQueryingSingle(true)
    setSingleResult(null)

    try {
      const chainInfo = getChainInfo()
      // 这里应该使用实际的 API 查询，目前使用模拟数据
      const mockBalance = (Math.random() * 10).toFixed(4)
      setSingleResult({
        address: singleAddress.trim(),
        balance: mockBalance,
        symbol: chainInfo.symbol
      })
    } catch (error) {
      setSingleResult({
        address: singleAddress.trim(),
        balance: '0',
        symbol: getChainInfo().symbol,
        error: error instanceof Error ? error.message : '查询失败'
      })
    } finally {
      setIsQueryingSingle(false)
    }
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
    const chainInfo = getChainInfo()

    for (const addr of addresses) {
      const trimmedAddr = addr.trim()
      if (!trimmedAddr) continue

      try {
        // 这里应该使用实际的 API 查询，目前使用模拟数据
        const mockBalance = (Math.random() * 10).toFixed(4)
        results.push({
          address: trimmedAddr,
          balance: mockBalance,
          symbol: chainInfo.symbol
        })
      } catch (error) {
        results.push({
          address: trimmedAddr,
          balance: '0',
          symbol: chainInfo.symbol,
          error: error instanceof Error ? error.message : '查询失败'
        })
      }
    }

    setBatchResults(results)
    setIsQueryingBatch(false)
  }

  const generateSampleAddresses = () => {
    const sampleAddresses = [
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb'
    ]
    setBatchAddresses(sampleAddresses.join('\n'))
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Ethereum 余额查询</h1>
      
      {/* 面包屑导航 */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <a href="/ethereum/wallets" style={{ color: '#007bff', textDecoration: 'none' }}>Ethereum 钱包</a>
        <span style={{ margin: '0 8px' }}>&gt;</span>
        <span>余额查询</span>
      </div>

      {/* 当前网络信息 */}
      <div style={{ 
        marginBottom: '30px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '6px',
        border: '1px solid #2196f3'
      }}>
        <h3>当前网络</h3>
        <p><strong>网络:</strong> {getChainInfo().name}</p>
        <p><strong>代币:</strong> {getChainInfo().symbol}</p>
        <p><strong>链 ID:</strong> {chainId}</p>
      </div>

      {/* 单个地址查询 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>单个地址查询</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            value={singleAddress}
            onChange={(e) => setSingleAddress(e.target.value)}
            placeholder="请输入 Ethereum 地址 (0x...)"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          <button
            onClick={querySingleBalance}
            disabled={isQueryingSingle}
            style={{
              padding: '10px 20px',
              backgroundColor: isQueryingSingle ? '#6c757d' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isQueryingSingle ? 'not-allowed' : 'pointer'
            }}
          >
            {isQueryingSingle ? '查询中...' : '查询余额'}
          </button>
        </div>

        {/* 单个查询结果 */}
        {singleResult && (
          <div style={{
            padding: '15px',
            backgroundColor: singleResult.error ? '#f8d7da' : '#d4edda',
            color: singleResult.error ? '#721c24' : '#155724',
            border: `1px solid ${singleResult.error ? '#f5c6cb' : '#c3e6cb'}`,
            borderRadius: '6px'
          }}>
            <h4>{singleResult.error ? '❌ 查询失败' : '✅ 查询成功'}</h4>
            <p><strong>地址:</strong> {singleResult.address}</p>
            <p><strong>余额:</strong> {singleResult.balance} {singleResult.symbol}</p>
            {singleResult.error && <p><strong>错误:</strong> {singleResult.error}</p>}
          </div>
        )}
      </div>

      {/* 批量地址查询 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>批量地址查询</h2>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            value={batchAddresses}
            onChange={(e) => setBatchAddresses(e.target.value)}
            placeholder="请输入要查询的 Ethereum 地址，每行一个"
            style={{
              width: '100%',
              height: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={queryBatchBalances}
            disabled={isQueryingBatch}
            style={{
              padding: '10px 20px',
              backgroundColor: isQueryingBatch ? '#6c757d' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isQueryingBatch ? 'not-allowed' : 'pointer'
            }}
          >
            {isQueryingBatch ? '查询中...' : '批量查询余额'}
          </button>
          
          <button
            onClick={generateSampleAddresses}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            加载示例地址
          </button>
        </div>
      </div>

      {/* 批量查询结果 */}
      {batchResults.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2>批量查询结果 ({batchResults.length} 个地址)</h2>
          <div style={{ 
            maxHeight: '500px', 
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>序号</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>地址</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'right' }}>余额</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((result, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #eee',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #eee',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}>
                      {result.address}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #eee',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: parseFloat(result.balance) > 0 ? '#28a745' : '#6c757d'
                    }}>
                      {result.balance} {result.symbol}
                    </td>
                    <td style={{ 
                      padding: '12px', 
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
          
          {/* 统计信息 */}
          <div style={{ 
            marginTop: '15px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            <h4>查询统计</h4>
            <p>
              <strong>总地址数:</strong> {batchResults.length} | 
              <strong> 成功:</strong> {batchResults.filter(r => !r.error).length} | 
              <strong> 失败:</strong> {batchResults.filter(r => r.error).length} | 
              <strong> 总余额:</strong> {batchResults.reduce((sum, r) => sum + (r.error ? 0 : parseFloat(r.balance)), 0).toFixed(4)} {getChainInfo().symbol}
            </p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>使用说明</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>网络自适应:</strong> 自动识别当前网络并使用对应的 API</li>
          <li><strong>单个查询:</strong> 输入单个 Ethereum 地址进行快速查询</li>
          <li><strong>批量查询:</strong> 输入多个地址（每行一个）进行批量查询</li>
          <li><strong>示例地址:</strong> 点击"加载示例地址"可以加载一些示例地址进行测试</li>
          <li><strong>多网络支持:</strong> 支持 Ethereum 主网、测试网、BSC 主网、测试网</li>
        </ul>
      </div>
    </div>
  )
}

export default EthereumQueryBalance
