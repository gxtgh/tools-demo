import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { AppKitButton } from '@reown/appkit/react'

function MetaMaskConnectButton() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  // 检查是否有 MetaMask 连接器
  const metaMaskConnector = connectors.find(c => c.name === 'MetaMask' || c.id === 'metaMask')

  const handleConnect = async () => {
    if (metaMaskConnector) {
      try {
        await connect({ connector: metaMaskConnector })
      } catch (err) {
        console.error('MetaMask 连接失败:', err)
      }
    } else {
      console.error('MetaMask 连接器未找到')
    }
  }

  if (isConnected) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <div style={{ 
          padding: '10px 20px', 
          backgroundColor: '#28a745', 
          color: 'white', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          ✅ 已连接 MetaMask
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div>地址: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
          <div>连接器: {connector?.name}</div>
        </div>
        <button
          onClick={() => disconnect()}
          style={{
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
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      {/* 标准 AppKit 按钮 */}
      <AppKitButton />
      
      {/* 直接连接 MetaMask 按钮 */}
      <button
        onClick={handleConnect}
        disabled={isPending || !metaMaskConnector}
        style={{
          padding: '12px 24px',
          backgroundColor: isPending || !metaMaskConnector ? '#6c757d' : '#f6851b',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isPending || !metaMaskConnector ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isPending ? '🔄 连接中...' : '🦊 直接连接 MetaMask'}
      </button>

      {/* 错误信息 */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          <strong>连接错误:</strong> {error.message}
        </div>
      )}

      {/* 调试信息 */}
      <div style={{ 
        fontSize: '12px', 
        color: '#666', 
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <div>MetaMask 连接器: {metaMaskConnector ? '✅ 可用' : '❌ 不可用'}</div>
        <div>连接状态: {isPending ? '🔄 连接中' : '⏸️ 待连接'}</div>
      </div>
    </div>
  )
}

export default MetaMaskConnectButton
