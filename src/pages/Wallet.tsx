import { AppKitButton } from '@reown/appkit/react'
import { useAccount, useBalance, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'

function Wallet() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case mainnet.id:
        return 'Ethereum 主网'
      case sepolia.id:
        return 'Sepolia 测试网'
      case bsc.id:
        return 'BSC 主网'
      case bscTestnet.id:
        return 'BSC 测试网'
      default:
        return `未知网络 (${chainId})`
    }
  }

  const getChainColor = (chainId: number) => {
    switch (chainId) {
      case mainnet.id:
      case sepolia.id:
        return '#007acc'
      case bsc.id:
      case bscTestnet.id:
        return '#f0b90b'
      default:
        return '#666'
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>钱包管理</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>连接钱包</h2>
        <AppKitButton />
      </div>

      {isConnected ? (
        <div>
          {/* 钱包信息卡片 */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #e0e0e0', 
            borderRadius: '12px',
            marginBottom: '25px',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>钱包详情</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <strong>钱包地址:</strong>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '14px', 
                  backgroundColor: '#fff', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  marginTop: '5px',
                  wordBreak: 'break-all'
                }}>
                  {address}
                </div>
              </div>
              
              <div>
                <strong>当前网络:</strong>
                <div style={{ 
                  display: 'inline-block',
                  marginLeft: '10px',
                  padding: '4px 12px',
                  backgroundColor: getChainColor(chainId),
                  color: chainId === bsc.id || chainId === bscTestnet.id ? 'black' : 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {getChainName(chainId)}
                </div>
              </div>
              
              <div>
                <strong>账户余额:</strong>
                <div style={{ 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  marginTop: '5px'
                }}>
                  {balance ? `${balance.formatted} ${balance.symbol}` : '加载中...'}
                </div>
              </div>
            </div>
          </div>

          {/* 网络切换区域 */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #e3f2fd', 
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            marginBottom: '25px'
          }}>
            <h3 style={{ marginTop: 0, color: '#1565c0' }}>网络切换</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              选择您想要连接的区块链网络
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              {/* Ethereum 网络 */}
              <div style={{ border: '1px solid #007acc', borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ color: '#007acc', margin: '0 0 15px 0' }}>Ethereum</h4>
                <button 
                  onClick={() => switchChain({ chainId: mainnet.id })}
                  disabled={chainId === mainnet.id}
                  style={{ 
                    width: '100%',
                    padding: '8px 12px', 
                    backgroundColor: chainId === mainnet.id ? '#ccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === mainnet.id ? 'not-allowed' : 'pointer',
                    marginBottom: '8px'
                  }}
                >
                  {chainId === mainnet.id ? '✅ 当前网络' : '切换到主网'}
                </button>
                <button 
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  disabled={chainId === sepolia.id}
                  style={{ 
                    width: '100%',
                    padding: '8px 12px', 
                    backgroundColor: chainId === sepolia.id ? '#ccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === sepolia.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {chainId === sepolia.id ? '✅ 当前网络' : '切换到测试网'}
                </button>
              </div>

              {/* BSC 网络 */}
              <div style={{ border: '1px solid #f0b90b', borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ color: '#f0b90b', margin: '0 0 15px 0' }}>BSC</h4>
                <button 
                  onClick={() => switchChain({ chainId: bsc.id })}
                  disabled={chainId === bsc.id}
                  style={{ 
                    width: '100%',
                    padding: '8px 12px', 
                    backgroundColor: chainId === bsc.id ? '#ccc' : '#f0b90b',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === bsc.id ? 'not-allowed' : 'pointer',
                    marginBottom: '8px'
                  }}
                >
                  {chainId === bsc.id ? '✅ 当前网络' : '切换到主网'}
                </button>
                <button 
                  onClick={() => switchChain({ chainId: bscTestnet.id })}
                  disabled={chainId === bscTestnet.id}
                  style={{ 
                    width: '100%',
                    padding: '8px 12px', 
                    backgroundColor: chainId === bscTestnet.id ? '#ccc' : '#f0b90b',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === bscTestnet.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {chainId === bscTestnet.id ? '✅ 当前网络' : '切换到测试网'}
                </button>
              </div>
            </div>
          </div>

          {/* 操作区域 */}
          <div style={{ 
            padding: '25px', 
            border: '2px solid #ffebee', 
            borderRadius: '12px',
            backgroundColor: '#fafafa'
          }}>
            <h3 style={{ marginTop: 0, color: '#d32f2f' }}>钱包操作</h3>
            <button 
              onClick={() => disconnect()} 
              style={{ 
                padding: '12px 24px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              断开钱包连接
            </button>
            <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>
              断开连接后，您需要重新连接钱包才能使用相关功能。
            </p>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          border: '2px dashed #ccc', 
          borderRadius: '12px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>未连接钱包</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            请先连接您的钱包以查看详细信息和进行操作
          </p>
          <AppKitButton />
        </div>
      )}
    </div>
  )
}

export default Wallet 