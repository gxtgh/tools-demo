import { useState ,useEffect} from 'react'
import { AppKitButton } from '@reown/appkit/react'
import { useAccount, useBalance, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

function Home() {
  const [count, setCount] = useState(0)
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // 获取当前网络名称
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


  useEffect(() => {
    getTokenInfo()
  }, [])

  const getTokenInfo = async () => {
    fetch('https://bscscan.com/token/0xec1c15281f79a181a6369c6063b2f790f0622cef')
    .then(res => res.json())
    .then(data => {
      console.log(data)
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>首页 - Vite + React + AppKit</h1>
      
      {/* 钱包连接区域 */}
      <div className="card">
        <AppKitButton />
        
        {isConnected && (
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>钱包信息</h3>
            <p><strong>地址:</strong> {address}</p>
            <p><strong>当前网络:</strong> {getChainName(chainId)}</p>
            <p><strong>余额:</strong> {balance ? `${balance.formatted} ${balance.symbol}` : '加载中...'}</p>
            
            {/* 网络切换按钮 */}
            <div style={{ marginTop: '15px' }}>
              <h4>切换网络:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => switchChain({ chainId: mainnet.id })}
                  disabled={chainId === mainnet.id}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: chainId === mainnet.id ? '#ccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === mainnet.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  Ethereum 主网
                </button>
                <button 
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  disabled={chainId === sepolia.id}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: chainId === sepolia.id ? '#ccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === sepolia.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  Sepolia 测试网
                </button>
                <button 
                  onClick={() => switchChain({ chainId: bsc.id })}
                  disabled={chainId === bsc.id}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: chainId === bsc.id ? '#ccc' : '#f0b90b',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === bsc.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  BSC 主网
                </button>
                <button 
                  onClick={() => switchChain({ chainId: bscTestnet.id })}
                  disabled={chainId === bscTestnet.id}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: chainId === bscTestnet.id ? '#ccc' : '#f0b90b',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: chainId === bscTestnet.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  BSC 测试网
                </button>
              </div>
            </div>
            
            <button onClick={() => disconnect()} style={{ marginTop: '15px', padding: '8px 16px' }}>
              断开连接
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/pages/Home.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default Home 