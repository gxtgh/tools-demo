import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { AppKitButton } from '@reown/appkit/react'

function MetaMaskTest() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

  useEffect(() => {
    checkMetaMaskStatus()
  }, [])

  const checkMetaMaskStatus = () => {
    const info = {
      hasWindowEthereum: typeof (window as any).ethereum !== 'undefined',
      isMetaMask: (window as any).ethereum?.isMetaMask || false,
      ethereumProviders: (window as any).ethereum?.providers || 'No providers',
      userAgent: navigator.userAgent,
      connectors: connectors.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      })),
      currentConnector: connector?.name || 'None',
      isConnected,
      address: address || 'Not connected'
    }
    setDebugInfo(info)
    setIsMetaMaskInstalled(!!(window as any).ethereum?.isMetaMask)
  }

  const connectMetaMask = async () => {
    try {
      const metaMaskConnector = connectors.find(c => c.name === 'MetaMask')
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector })
        checkMetaMaskStatus()
      } else {
        alert('MetaMask 连接器未找到')
      }
    } catch (err) {
      console.error('连接失败:', err)
    }
  }

  const requestAccountAccess = async () => {
    try {
      if ((window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        checkMetaMaskStatus()
        alert('账户访问权限已请求')
      } else {
        alert('MetaMask 未检测到')
      }
    } catch (err) {
      console.error('请求权限失败:', err)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🦊 MetaMask 连接测试</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '20px' }}>
        <h2>连接状态</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da', 
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          <p><strong>连接状态:</strong> {isConnected ? '✅ 已连接' : '❌ 未连接'}</p>
          <p><strong>地址:</strong> {address || '未连接'}</p>
          <p><strong>连接器:</strong> {connector?.name || '无'}</p>
          <p><strong>MetaMask 已安装:</strong> {isMetaMaskInstalled ? '✅ 是' : '❌ 否'}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <AppKitButton />
          
          <button
            onClick={connectMetaMask}
            disabled={isPending || !isMetaMaskInstalled}
            style={{
              padding: '10px 20px',
              backgroundColor: isPending || !isMetaMaskInstalled ? '#6c757d' : '#f6851b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isPending || !isMetaMaskInstalled ? 'not-allowed' : 'pointer'
            }}
          >
            {isPending ? '连接中...' : '直接连接 MetaMask'}
          </button>

          <button
            onClick={requestAccountAccess}
            disabled={!isMetaMaskInstalled}
            style={{
              padding: '10px 20px',
              backgroundColor: !isMetaMaskInstalled ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !isMetaMaskInstalled ? 'not-allowed' : 'pointer'
            }}
          >
            请求账户权限
          </button>

          {isConnected && (
            <button
              onClick={() => disconnect()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              断开连接
            </button>
          )}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <strong>错误:</strong> {error.message}
        </div>
      )}

      {/* 调试信息 */}
      <div style={{ marginBottom: '20px' }}>
        <h2>调试信息</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          <p><strong>window.ethereum 存在:</strong> {debugInfo.hasWindowEthereum ? '✅ 是' : '❌ 否'}</p>
          <p><strong>是 MetaMask:</strong> {debugInfo.isMetaMask ? '✅ 是' : '❌ 否'}</p>
          <p><strong>Providers:</strong> {Array.isArray(debugInfo.ethereumProviders) ? debugInfo.ethereumProviders.length : 'N/A'}</p>
          <p><strong>可用连接器:</strong> {debugInfo.connectors?.length || 0}</p>
        </div>

        <button
          onClick={checkMetaMaskStatus}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          刷新状态
        </button>
      </div>

      {/* 完整调试信息 */}
      <div style={{ marginBottom: '20px' }}>
        <h2>完整调试信息</h2>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* 故障排除指南 */}
      <div style={{ marginBottom: '20px' }}>
        <h2>故障排除指南</h2>
        <div style={{ textAlign: 'left' }}>
          <h3>1. 确保 MetaMask 已安装</h3>
          <p>访问 <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">https://metamask.io/</a> 下载并安装 MetaMask 扩展</p>
          
          <h3>2. 解锁 MetaMask</h3>
          <p>打开 MetaMask 扩展，输入密码解锁钱包</p>
          
          <h3>3. 检查网络</h3>
          <p>确保 MetaMask 连接到正确的网络（主网或测试网）</p>
          
          <h3>4. 刷新页面</h3>
          <p>安装或解锁 MetaMask 后，刷新浏览器页面</p>
          
          <h3>5. 检查权限</h3>
          <p>确保网站有权限访问 MetaMask 钱包</p>
          
          <h3>6. 清除缓存</h3>
          <p>如果问题持续，尝试清除浏览器缓存和重新安装 MetaMask</p>
        </div>
      </div>

      {/* 浏览器信息 */}
      <div style={{ marginBottom: '20px' }}>
        <h2>浏览器信息</h2>
        <p><strong>用户代理:</strong> {debugInfo.userAgent}</p>
      </div>
    </div>
  )
}

export default MetaMaskTest
