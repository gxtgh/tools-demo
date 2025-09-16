import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { AppKitButton } from '@reown/appkit/react'

// 使用类型断言处理 window.ethereum

function Debug() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // 收集调试信息
    const info = {
      isConnected,
      address,
      connector: connector?.name || 'None',
      chainId,
      availableConnectors: connectors.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      })),
      error: error?.message || 'None',
      isPending,
      userAgent: navigator.userAgent,
      hasMetaMask: typeof (window as any).ethereum !== 'undefined',
      ethereum: (window as any).ethereum ? {
        isMetaMask: (window as any).ethereum.isMetaMask || false,
        providers: Array.isArray((window as any).ethereum.providers) 
          ? (window as any).ethereum.providers.map((p: any) => p.isMetaMask) 
          : 'No providers'
      } : 'No ethereum object'
    }
    setDebugInfo(info)
  }, [isConnected, address, connector, chainId, connectors, error, isPending])

  const connectMetaMask = () => {
    const metaMaskConnector = connectors.find(c => c.name === 'MetaMask')
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    } else {
      alert('MetaMask 连接器未找到')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 钱包连接调试页面</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>连接状态</h2>
        <p><strong>已连接:</strong> {isConnected ? '✅ 是' : '❌ 否'}</p>
        <p><strong>地址:</strong> {address || '未连接'}</p>
        <p><strong>当前连接器:</strong> {connector?.name || '无'}</p>
        <p><strong>链 ID:</strong> {chainId || '未知'}</p>
        <p><strong>错误信息:</strong> {error?.message || '无'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>连接操作</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <AppKitButton />
          <button 
            onClick={connectMetaMask}
            disabled={isPending}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f6851b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
          >
            {isPending ? '连接中...' : '直接连接 MetaMask'}
          </button>
          {isConnected && (
            <button 
              onClick={() => disconnect()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff4444',
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

      <div style={{ marginBottom: '20px' }}>
        <h2>可用连接器</h2>
        <ul>
          {connectors.map((connector, index) => (
            <li key={index}>
              <strong>{connector.name}</strong> (ID: {connector.id}, 类型: {connector.type})
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>浏览器环境检查</h2>
        <p><strong>用户代理:</strong> {debugInfo.userAgent}</p>
        <p><strong>检测到 MetaMask:</strong> {debugInfo.hasMetaMask ? '✅ 是' : '❌ 否'}</p>
        <p><strong>window.ethereum 对象:</strong> {debugInfo.ethereum === 'No ethereum object' ? '❌ 不存在' : '✅ 存在'}</p>
        {debugInfo.ethereum !== 'No ethereum object' && (
          <div style={{ marginLeft: '20px' }}>
            <p><strong>isMetaMask:</strong> {debugInfo.ethereum?.isMetaMask ? '✅ 是' : '❌ 否'}</p>
            <p><strong>Providers:</strong> {debugInfo.ethereum?.providers || 'N/A'}</p>
          </div>
        )}
      </div>

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

      <div style={{ marginBottom: '20px' }}>
        <h2>常见问题解决</h2>
        <div style={{ textAlign: 'left' }}>
          <h3>1. MetaMask 未安装</h3>
          <p>请访问 <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">https://metamask.io/</a> 安装 MetaMask 浏览器扩展</p>
          
          <h3>2. MetaMask 未解锁</h3>
          <p>请确保 MetaMask 已解锁并选择了正确的账户</p>
          
          <h3>3. 网络问题</h3>
          <p>请确保 MetaMask 已添加了应用支持的网络（Ethereum 主网、Sepolia 测试网、BSC 主网、BSC 测试网）</p>
          
          <h3>4. 权限问题</h3>
          <p>如果连接被拒绝，请检查 MetaMask 的权限设置</p>
        </div>
      </div>
    </div>
  )
}

export default Debug
