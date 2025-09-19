import { useState } from 'react'

interface AddressBalance {
  address: string
  balance: string
  symbol: string
  error?: string
}

function SuiQueryBalance() {
  const [batchAddresses, setBatchAddresses] = useState<string>('')
  const [batchResults, setBatchResults] = useState<AddressBalance[]>([])
  const [isQueryingBatch, setIsQueryingBatch] = useState(false)
  const [singleAddress, setSingleAddress] = useState<string>('')
  const [singleResult, setSingleResult] = useState<AddressBalance | null>(null)
  const [isQueryingSingle, setIsQueryingSingle] = useState(false)
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null)

  const querySingleBalance = async () => {
    if (!singleAddress.trim()) {
      alert('请输入要查询的地址')
      return
    }

    setIsQueryingSingle(true)
    setSingleResult(null)

    try {
      const address = singleAddress.trim()
      
      // 使用 Sui RPC API 查询余额
      const response = await fetch('https://fullnode.mainnet.sui.io:443', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'suix_getBalance',
          params: [address]
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.result) {
          // Sui 余额以 MIST 为单位，需要除以 10^9 转换为 SUI
          const balance = parseInt(data.result.totalBalance) / 1000000000
          setSingleResult({
            address: address,
            balance: balance.toFixed(6),
            symbol: 'SUI'
          })
        } else {
          throw new Error(data.error?.message || 'API 返回错误')
        }
      } else {
        throw new Error(`API 请求失败: ${response.status}`)
      }
    } catch (error) {
      console.error('查询 Sui 余额失败:', error)
      setSingleResult({
        address: singleAddress.trim(),
        balance: '0',
        symbol: 'SUI',
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

    // 设置总进度
    setBatchProgress({ current: 0, total: addresses.length })

    // 批量查询，分批处理避免请求过于频繁
    const batchSize = 6 // Sui RPC 限制较严格，每批处理6个
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      
      // 并行查询当前批次
      const batchPromises = batch.map(async (addr) => {
        const trimmedAddr = addr.trim()
        if (!trimmedAddr) return null

        try {
          // 使用 Sui RPC API 查询余额
          const response = await fetch('https://fullnode.mainnet.sui.io:443', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Math.floor(Math.random() * 1000),
              method: 'suix_getBalance',
              params: [trimmedAddr]
            })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.result) {
              // Sui 余额以 MIST 为单位，需要除以 10^9 转换为 SUI
              const balance = parseInt(data.result.totalBalance) / 1000000000
              return {
                address: trimmedAddr,
                balance: balance.toFixed(6),
                symbol: 'SUI'
              }
            } else {
              throw new Error(data.error?.message || 'API 返回错误')
            }
          } else {
            throw new Error(`API 请求失败: ${response.status}`)
          }
        } catch (error) {
          console.error(`查询 Sui 地址 ${trimmedAddr} 失败:`, error)
          return {
            address: trimmedAddr,
            balance: '0',
            symbol: 'SUI',
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

      // 如果不是最后一批，延迟一下避免请求过于频繁
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 800)) // Sui RPC 需要较长延迟
      }
    }

    setIsQueryingBatch(false)
    setBatchProgress(null)
  }

  const generateSampleAddresses = () => {
    const sampleAddresses = [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
      '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    ]
    setBatchAddresses(sampleAddresses.join('\n'))
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Sui 余额查询</h1>
      
      {/* 面包屑导航 */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <a href="/sui/wallets" style={{ color: '#007bff', textDecoration: 'none' }}>Sui 钱包</a>
        <span style={{ margin: '0 8px' }}>&gt;</span>
        <span>余额查询</span>
      </div>

      {/* 单个地址查询 */}
      <div style={{ marginBottom: '30px' }}>
        <h2>单个地址查询</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            value={singleAddress}
            onChange={(e) => setSingleAddress(e.target.value)}
            placeholder="请输入 Sui 地址 (0x...)"
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
              backgroundColor: isQueryingSingle ? '#6c757d' : '#4da6ff',
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
            placeholder="请输入要查询的 Sui 地址，每行一个"
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
              backgroundColor: isQueryingBatch ? '#6c757d' : '#4da6ff',
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
            backgroundColor: '#e8f4fd',
            borderRadius: '6px',
            border: '1px solid #4da6ff'
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
                backgroundColor: '#4da6ff',
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
              <strong> 总余额:</strong> {batchResults.reduce((sum, r) => sum + (r.error ? 0 : parseFloat(r.balance)), 0).toFixed(4)} SUI
            </p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>使用说明</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>单个查询:</strong> 输入单个 Sui 地址进行快速查询</li>
          <li><strong>批量查询:</strong> 输入多个地址（每行一个）进行批量查询</li>
          <li><strong>示例地址:</strong> 点击"加载示例地址"可以加载一些示例地址进行测试</li>
          <li><strong>API 支持:</strong> 使用 Sui RPC API 获取实时余额数据</li>
          <li><strong>网络支持:</strong> 支持 Sui 主网和测试网</li>
        </ul>
      </div>
    </div>
  )
}

export default SuiQueryBalance
