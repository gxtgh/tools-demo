import { useState, useEffect } from 'react'
import { TonConnector } from '../connectors/tonConnector'

interface TonStatus {
  hasTonConnect: boolean
  tonConnect: any | null
  userAgent: string
  manifestUrl: string
  walletsListSource: string
}

function TonTest() {
  const [tonStatus, setTonStatus] = useState<TonStatus>({
    hasTonConnect: false,
    tonConnect: null,
    userAgent: navigator.userAgent,
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json',
    walletsListSource: 'https://raw.githubusercontent.com/ton-community/tonconnect/main/packages/tonconnect-sdk/src/wallets-list.json'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionResult, setConnectionResult] = useState<{ address: string; publicKey: string } | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [walletsList, setWalletsList] = useState<any[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string>('')

  useEffect(() => {
    checkTonStatus()
    loadWalletsList()
  }, [])

  const checkTonStatus = async () => {
    // 检查 TON Connect SDK 是否可以通过动态导入加载
    let hasTonConnect = false
    let tonConnect = null
    
    try {
      // 尝试检查全局对象
      if (typeof window !== 'undefined' && (window as any).tonconnect) {
        hasTonConnect = true
        tonConnect = (window as any).tonconnect
      } else {
        // 检查是否可以通过 import 加载
        const { TonConnector } = await import('../connectors/tonConnector')
        hasTonConnect = await TonConnector.isAvailable()
      }
    } catch (error) {
      console.warn('TON Connect SDK 检测失败:', error)
      hasTonConnect = false
    }

    const status = {
      hasTonConnect,
      tonConnect,
      userAgent: navigator.userAgent,
      manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react/tonconnect-manifest.json',
      walletsListSource: 'https://raw.githubusercontent.com/ton-community/tonconnect/main/packages/tonconnect-sdk/src/wallets-list.json'
    }
    setTonStatus(status)
  }

  const loadWalletsList = async () => {
    try {
      const response = await fetch(tonStatus.walletsListSource)
      const wallets = await response.json()
      setWalletsList(wallets)
    } catch (err) {
      console.error('加载钱包列表失败:', err)
    }
  }

  const testTonConnection = async () => {
    setIsLoading(true)
    setError('')
    setConnectionResult(null)
    setBalance(null)
    
    try {
      // 动态导入 TON Connect SDK
      const { TonConnect } = await import('@tonconnect/sdk')
      
      const tonConnect = new TonConnect({
        manifestUrl: tonStatus.manifestUrl,
        walletsListSource: tonStatus.walletsListSource
      })

      // 获取连接 URI
      const connectURI = await tonConnect.connect([])
      console.log('TON Connect URI:', connectURI)
      
      // 显示连接 URI 给用户
      const userConfirmed = confirm(`TON Connect URI 已生成！\n\n请选择连接方式：\n\n确定 - 复制 URI 到剪贴板\n取消 - 查看完整 URI`)
      
      if (userConfirmed) {
        // 复制到剪贴板
        try {
          await navigator.clipboard.writeText(connectURI)
          alert('URI 已复制到剪贴板！请在 Tonkeeper 中粘贴此 URI 进行连接。')
        } catch (err) {
          alert(`无法复制到剪贴板，请手动复制：\n\n${connectURI}`)
        }
      } else {
        // 显示完整 URI
        alert(`TON Connect URI:\n\n${connectURI}`)
      }
      
      // 监听连接状态
      const unsubscribe = tonConnect.onStatusChange((wallet) => {
        if (wallet && wallet.account) {
          console.log('TON 钱包连接成功:', wallet)
          setConnectionResult({
            address: wallet.account.address || '',
            publicKey: wallet.account.publicKey || ''
          })
          unsubscribe()
          setIsLoading(false)
        }
      })

      // 设置超时
      setTimeout(() => {
        unsubscribe()
        setError('连接超时，请确保已安装 Tonkeeper 钱包并扫描二维码')
        setIsLoading(false)
      }, 60000)

    } catch (err: any) {
      setError(`连接 TON 失败: ${err.message}`)
      setIsLoading(false)
    }
  }

  const testTonConnectSDK = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // 动态导入 TON Connect SDK
      const { TonConnect } = await import('@tonconnect/sdk')
      
      const tonConnect = new TonConnect({
        manifestUrl: tonStatus.manifestUrl,
        walletsListSource: tonStatus.walletsListSource
      })

      // 获取连接 URI
      const connectURI = await tonConnect.connect([])
      console.log('TON Connect URI:', connectURI)
      
      // 显示连接 URI 给用户
      const userConfirmed = confirm(`TON Connect URI 已生成！\n\n请选择连接方式：\n\n确定 - 复制 URI 到剪贴板\n取消 - 查看完整 URI`)
      
      if (userConfirmed) {
        // 复制到剪贴板
        try {
          await navigator.clipboard.writeText(connectURI)
          alert('URI 已复制到剪贴板！请在 Tonkeeper 中粘贴此 URI 进行连接。')
        } catch (err) {
          alert(`无法复制到剪贴板，请手动复制：\n\n${connectURI}`)
        }
      } else {
        // 显示完整 URI
        alert(`TON Connect URI:\n\n${connectURI}`)
      }
      
      // 监听连接状态
      const unsubscribe = tonConnect.onStatusChange((wallet) => {
        if (wallet && wallet.account) {
          console.log('TON 钱包连接成功:', wallet)
          setConnectionResult({
            address: wallet.account.address || '',
            publicKey: wallet.account.publicKey || ''
          })
          unsubscribe()
        }
      })

      // 设置超时
      setTimeout(() => {
        unsubscribe()
        setError('连接超时，请确保已安装 Tonkeeper 钱包并扫描二维码')
      }, 60000)

    } catch (err: any) {
      setError(`TON Connect SDK 测试失败: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testWalletDetection = () => {
    const wallets = []
    
    // 检查 Tonkeeper
    if (typeof window !== 'undefined' && (window as any).tonkeeper) {
      wallets.push('Tonkeeper')
    }
    
    // 检查其他 TON 钱包
    if (typeof window !== 'undefined' && (window as any).ton) {
      wallets.push('TON Wallet')
    }
    
    if (wallets.length > 0) {
      alert(`检测到 TON 钱包: ${wallets.join(', ')}`)
    } else {
      alert('未检测到 TON 钱包，请安装 Tonkeeper 或其他 TON 钱包')
    }
  }

  const debugTonkeeperAPI = () => {
    if (typeof window === 'undefined' || !(window as any).tonkeeper) {
      alert('Tonkeeper 扩展未检测到')
      return
    }

    const tonkeeper = (window as any).tonkeeper
    const apiInfo = {
      'tonkeeper 对象': typeof tonkeeper,
      'tonkeeper.tonConnect': typeof tonkeeper.tonConnect,
      'tonkeeper.TonConnect': typeof tonkeeper.TonConnect,
      'tonkeeper.connect': typeof tonkeeper.connect,
      'tonkeeper.isConnected': typeof tonkeeper.isConnected,
      'tonkeeper.account': typeof tonkeeper.account,
      'tonkeeper.address': typeof tonkeeper.address,
      'tonkeeper.publicKey': typeof tonkeeper.publicKey,
      '所有属性': Object.keys(tonkeeper)
    }

    console.log('Tonkeeper API 调试信息:', apiInfo)
    alert(`Tonkeeper API 调试信息已输出到控制台\n\n主要属性:\n${Object.entries(apiInfo).slice(0, 8).map(([key, value]) => `${key}: ${value}`).join('\n')}`)
  }

  const connectTonkeeperExtension = async () => {
    setIsLoading(true)
    setError('')
    setConnectionResult(null)
    setBalance(null)
    
    try {
      // 检查 Tonkeeper 扩展是否可用
      if (typeof window === 'undefined' || !(window as any).tonkeeper) {
        throw new Error('Tonkeeper 浏览器扩展未检测到，请确保已安装并启用')
      }

      const tonkeeper = (window as any).tonkeeper
      console.log('Tonkeeper 扩展对象:', tonkeeper)
      
      // 检查 Tonkeeper 的各种可能 API
      let tonConnect = null
      
      if (tonkeeper.tonConnect) {
        tonConnect = tonkeeper.tonConnect
        console.log('使用 tonkeeper.tonConnect')
      } else if (tonkeeper.TonConnect) {
        tonConnect = tonkeeper.TonConnect
        console.log('使用 tonkeeper.TonConnect')
      } else if (tonkeeper.connect) {
        // 直接使用 tonkeeper.connect 方法
        console.log('使用 tonkeeper.connect 直接连接')
        try {
          const result = await tonkeeper.connect()
          if (result && result.account) {
            setConnectionResult({
              address: result.account.address || '',
              publicKey: result.account.publicKey || ''
            })
            setIsLoading(false)
            return
          }
        } catch (connectError) {
          console.log('直接连接失败，尝试其他方法:', connectError)
        }
      }
      
      if (tonConnect) {
        // 使用 TonConnect 实例
        console.log('使用 TonConnect 实例连接')
        
        // 监听连接状态
        const unsubscribe = tonConnect.onStatusChange((wallet: any) => {
          if (wallet && wallet.account) {
            console.log('Tonkeeper 连接成功:', wallet)
            setConnectionResult({
              address: wallet.account.address || '',
              publicKey: wallet.account.publicKey || ''
            })
            unsubscribe()
            setIsLoading(false)
          }
        })

        // 设置超时
        setTimeout(() => {
          unsubscribe()
          setError('连接超时，请确保 Tonkeeper 已解锁')
          setIsLoading(false)
        }, 30000)

        // 尝试连接
        try {
          await tonConnect.connect()
        } catch (connectError) {
          console.log('Tonkeeper 连接需要用户交互:', connectError)
        }
      } else {
        // 使用标准 TON Connect 但针对浏览器扩展优化
        console.log('使用标准 TON Connect')
        const { TonConnect } = await import('@tonconnect/sdk')
        
        const tonConnect = new TonConnect({
          manifestUrl: tonStatus.manifestUrl,
          walletsListSource: tonStatus.walletsListSource
        })

        // 获取连接 URI
        const connectURI = await tonConnect.connect([])
        console.log('TON Connect URI:', connectURI)
        
        // 尝试直接打开 Tonkeeper
        try {
          // 尝试使用 ton:// 协议打开 Tonkeeper
          window.open(connectURI, '_blank')
          alert('正在尝试打开 Tonkeeper 扩展...')
        } catch (err) {
          // 如果无法直接打开，显示 URI
          const userConfirmed = confirm(`TON Connect URI 已生成！\n\n请选择连接方式：\n\n确定 - 复制 URI 到剪贴板\n取消 - 查看完整 URI`)
          
          if (userConfirmed) {
            try {
              await navigator.clipboard.writeText(connectURI)
              alert('URI 已复制到剪贴板！请在 Tonkeeper 中粘贴此 URI 进行连接。')
            } catch (err) {
              alert(`无法复制到剪贴板，请手动复制：\n\n${connectURI}`)
            }
          } else {
            alert(`TON Connect URI:\n\n${connectURI}`)
          }
        }
        
        // 监听连接状态
        const unsubscribe = tonConnect.onStatusChange((wallet) => {
          if (wallet && wallet.account) {
            console.log('TON 钱包连接成功:', wallet)
            setConnectionResult({
              address: wallet.account.address || '',
              publicKey: wallet.account.publicKey || ''
            })
            unsubscribe()
            setIsLoading(false)
          }
        })

        // 设置超时
        setTimeout(() => {
          unsubscribe()
          setError('连接超时，请确保 Tonkeeper 已解锁')
          setIsLoading(false)
        }, 60000)
      }
    } catch (err: any) {
      setError(`连接 Tonkeeper 失败: ${err.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      <h1>💎 TON 连接测试页面</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        此页面用于诊断 TON 钱包连接问题。
      </p>

      {/* 状态检查 */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <h3>环境检查</h3>
        <p><strong>TON Connect SDK:</strong> {tonStatus.hasTonConnect ? '✅ 可用' : '❌ 不可用'}</p>
        <p><strong>Manifest URL:</strong> {tonStatus.manifestUrl}</p>
        <p><strong>Wallets List:</strong> {tonStatus.walletsListSource}</p>
        <p><strong>钱包列表数量:</strong> {walletsList.length}</p>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={checkTonStatus}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          刷新状态
        </button>
        
        <button
          onClick={testWalletDetection}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          检测钱包
        </button>
        
        <button
          onClick={debugTonkeeperAPI}
          style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          调试 Tonkeeper API
        </button>
        
        <button
          onClick={connectTonkeeperExtension}
          disabled={isLoading}
          style={{ padding: '10px 15px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? '连接中...' : '连接 Tonkeeper 扩展'}
        </button>
        
        <button
          onClick={testTonConnectSDK}
          disabled={isLoading}
          style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? '测试中...' : '测试 TON Connect SDK'}
        </button>
        
        <button
          onClick={testTonConnection}
          disabled={isLoading}
          style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? '连接中...' : '连接 TON 钱包'}
        </button>
      </div>

      {/* 错误信息 */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px'
        }}>
          <strong>错误:</strong> {error}
        </div>
      )}

      {/* 连接结果 */}
      {connectionResult && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '6px'
        }}>
          <h3>✅ 连接成功！</h3>
          <p><strong>地址:</strong> {connectionResult.address}</p>
          <p><strong>公钥:</strong> {connectionResult.publicKey}</p>
          <p><strong>余额:</strong> {balance !== null ? `${balance} TON` : '加载中...'}</p>
        </div>
      )}

      {/* 钱包列表 */}
      {walletsList.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e9ecef',
          borderRadius: '6px'
        }}>
          <h3>支持的 TON 钱包</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {walletsList.slice(0, 10).map((wallet, index) => (
              <div key={index} style={{
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold' }}>{wallet.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{wallet.appName}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>{wallet.about}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 故障排除指南 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>故障排除</h3>
        <ul style={{ textAlign: 'left' }}>
          <li>确保已安装 <a href="https://tonkeeper.com/" target="_blank" rel="noopener noreferrer">Tonkeeper 钱包</a></li>
          <li>在移动设备上打开 Tonkeeper 应用</li>
          <li>确保 Tonkeeper 钱包已解锁</li>
          <li>检查网络连接是否正常</li>
          <li>尝试刷新页面重新连接</li>
          <li>确保 TON Connect 协议正常工作</li>
        </ul>
        
        <h4>常见问题</h4>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>连接超时:</strong> 检查网络连接，确保 Tonkeeper 应用正在运行</li>
          <li><strong>钱包未检测到:</strong> 确保已安装 Tonkeeper 并已解锁</li>
          <li><strong>SDK 错误:</strong> 检查 TON Connect SDK 是否正确安装</li>
        </ul>
      </div>

      {/* 调试信息 */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <h3>调试信息</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(tonStatus, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default TonTest
