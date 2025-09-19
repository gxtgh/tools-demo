import { useState } from 'react'
import { useChainId, usePublicClient } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'
import { formatEther, isAddress } from 'viem'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

function EthereumQueryBalance() {
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const [batchAddresses, setBatchAddresses] = useState<string>('')
  const [batchResults, setBatchResults] = useState<AddressBalance[]>([])
  const [isQueryingBatch, setIsQueryingBatch] = useState(false)
  const [singleAddress, setSingleAddress] = useState<string>('')
  const [singleResult, setSingleResult] = useState<AddressBalance | null>(null)
  const [isQueryingSingle, setIsQueryingSingle] = useState(false)
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null)

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

    const address = singleAddress.trim()
    
    // 验证地址格式
    if (!isAddress(address)) {
      alert('请输入有效的以太坊地址')
      return
    }

    setIsQueryingSingle(true)
    setSingleResult(null)

    try {
      const chainInfo = getChainInfo()
      
      if (!publicClient) {
        throw new Error('无法连接到区块链网络，请检查网络连接')
      }

      // 使用 viem 查询真实余额
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`
      })

      // 将 wei 转换为 ether
      const formattedBalance = formatEther(balance)
      
      setSingleResult({
        address: address,
        balance: parseFloat(formattedBalance).toFixed(6),
        symbol: chainInfo.symbol
      })
    } catch (error) {
      console.error('查询余额失败:', error)
      setSingleResult({
        address: address,
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
    setBatchProgress(null)

    const addresses = batchAddresses.split('\n').filter(addr => addr.trim())
    const results: AddressBalance[] = []
    const chainInfo = getChainInfo()

    if (!publicClient) {
      alert('无法连接到区块链网络，请检查网络连接')
      setIsQueryingBatch(false)
      return
    }

    // 设置总进度
    setBatchProgress({ current: 0, total: addresses.length })

    // 批量查询，但为了避免 RPC 限制，我们分批处理
    const batchSize = 10 // 每批处理10个地址
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      
      // 并行查询当前批次的所有地址
      const batchPromises = batch.map(async (addr) => {
        const trimmedAddr = addr.trim()
        if (!trimmedAddr) return null

        try {
          // 验证地址格式
          if (!isAddress(trimmedAddr)) {
            return {
              address: trimmedAddr,
              balance: '0',
              symbol: chainInfo.symbol,
              error: '无效的地址格式'
            }
          }

          // 使用 viem 查询真实余额
          const balance = await publicClient.getBalance({
            address: trimmedAddr as `0x${string}`
          })

          // 将 wei 转换为 ether
          const formattedBalance = formatEther(balance)
          
          return {
            address: trimmedAddr,
            balance: parseFloat(formattedBalance).toFixed(6),
            symbol: chainInfo.symbol
          }
        } catch (error) {
          console.error(`查询地址 ${trimmedAddr} 失败:`, error)
          return {
            address: trimmedAddr,
            balance: '0',
            symbol: chainInfo.symbol,
            error: error instanceof Error ? error.message : '查询失败'
          }
        }
      })

      // 等待当前批次完成
      const batchResults = await Promise.all(batchPromises)
      const validResults = batchResults.filter(result => result !== null) as AddressBalance[]
      
      // 更新结果并刷新UI
      results.push(...validResults)
      setBatchResults([...results]) // 实时更新结果
      
      // 更新进度
      setBatchProgress({ current: results.length, total: addresses.length })

      // 如果不是最后一批，稍微延迟一下避免请求过于频繁
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsQueryingBatch(false)
    setBatchProgress(null)
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
            disabled={isQueryingBatch}
            style={{
              padding: '10px 20px',
              backgroundColor: isQueryingBatch ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isQueryingBatch ? 'not-allowed' : 'pointer'
            }}
          >
            加载示例地址
          </button>
        </div>

        {/* 批量查询进度 */}
        {batchProgress && (
          <div style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            border: '1px solid #2196f3'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>查询进度: {batchProgress.current} / {batchProgress.total}</span>
              <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                height: '100%',
                backgroundColor: '#2196f3',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
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
          <li><strong>真实查询:</strong> 使用 Viem 直接从区块链查询真实余额数据</li>
          <li><strong>网络自适应:</strong> 自动识别当前网络并使用对应的 RPC 节点</li>
          <li><strong>地址验证:</strong> 自动验证地址格式，确保查询有效性</li>
          <li><strong>单个查询:</strong> 输入单个 Ethereum 地址进行快速查询</li>
          <li><strong>批量查询:</strong> 支持批量查询多个地址（每批10个，避免 RPC 限制）</li>
          <li><strong>实时更新:</strong> 批量查询时实时显示查询进度和结果</li>
          <li><strong>示例地址:</strong> 包含 Vitalik 等知名地址用于测试</li>
          <li><strong>多网络支持:</strong> 支持 Ethereum 主网、Sepolia 测试网、BSC 主网、BSC 测试网</li>
          <li><strong>精确显示:</strong> 余额精确到小数点后6位，支持大额和小额余额显示</li>
        </ul>
      </div>
    </div>
  )
}

export default EthereumQueryBalance
