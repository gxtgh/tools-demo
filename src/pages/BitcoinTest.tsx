import { useState, useEffect } from 'react'
import { BitcoinConnector } from '../connectors/bitcoinConnector'

interface BitcoinStatus {
  hasOKXWallet: boolean
  okxWallet: any | null
  userAgent: string
  network: string
}

function BitcoinTest() {
  const [bitcoinStatus, setBitcoinStatus] = useState<BitcoinStatus>({
    hasOKXWallet: false,
    okxWallet: null,
    userAgent: navigator.userAgent,
    network: 'mainnet'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [connectionResult, setConnectionResult] = useState<{ address: string; publicKey: string } | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    checkBitcoinStatus()
  }, [])

  const checkBitcoinStatus = () => {
    const okxWallet = (window as any).okxwallet
    const status = {
      hasOKXWallet: BitcoinConnector.isOKXWalletAvailable(),
      okxWallet: okxWallet ? {
        hasBitcoin: !!okxWallet.bitcoin,
        bitcoinMethods: okxWallet.bitcoin ? Object.keys(okxWallet.bitcoin) : [],
        version: okxWallet.version || 'N/A'
      } : null,
      userAgent: navigator.userAgent,
      network: 'mainnet'
    }
    setBitcoinStatus(status)
  }

  const debugOKXAPI = () => {
    if (typeof window === 'undefined' || !(window as any).okxwallet) {
      alert('OKX 钱包扩展未检测到')
      return
    }

    const okxWallet = (window as any).okxwallet
    const apiInfo = {
      'okxwallet 对象': typeof okxWallet,
      'okxwallet.bitcoin': typeof okxWallet.bitcoin,
      'okxWallet.bitcoin.requestAccounts': typeof okxWallet.bitcoin?.requestAccounts,
      'okxWallet.bitcoin.getBalance': typeof okxWallet.bitcoin?.getBalance,
      'okxWallet.bitcoin.sendBitcoin': typeof okxWallet.bitcoin?.sendBitcoin,
      'okxWallet.bitcoin.getPublicKey': typeof okxWallet.bitcoin?.getPublicKey,
      'okxWallet.bitcoin.getAddress': typeof okxWallet.bitcoin?.getAddress,
      'okxWallet.bitcoin.signMessage': typeof okxWallet.bitcoin?.signMessage,
      'bitcoin 对象所有属性': okxWallet.bitcoin ? Object.keys(okxWallet.bitcoin) : 'N/A'
    }

    console.log('OKX 钱包 API 调试信息:', apiInfo)
    alert(`OKX 钱包 API 调试信息已输出到控制台\n\n主要属性:\n${Object.entries(apiInfo).slice(0, 7).map(([key, value]) => `${key}: ${value}`).join('\n')}`)
  }

  const testOKXConnection = async () => {
    setIsLoading(true)
    setError('')
    setConnectionResult(null)
    setBalance(null)
    
    try {
      if (!BitcoinConnector.isOKXWalletAvailable()) {
        throw new Error('OKX 钱包扩展未检测到，请确保已安装并启用')
      }

      const okxBitcoin = (window as any).okxwallet.bitcoin
      console.log('OKX Bitcoin API:', okxBitcoin)
      
      // 请求连接
      const accounts = await okxBitcoin.requestAccounts()
      console.log('OKX 账户:', accounts)
      
      if (!accounts || accounts.length === 0) {
        throw new Error('OKX 钱包未返回账户信息')
      }

      const address = accounts[0]
      
      // 获取公钥
      let publicKey = ''
      try {
        const pubKey = await okxBitcoin.getPublicKey()
        publicKey = pubKey || 'N/A'
      } catch (pubKeyError) {
        console.warn('无法获取公钥:', pubKeyError)
        publicKey = 'N/A'
      }

      setConnectionResult({ address, publicKey })
      
      // 尝试获取余额
      try {
        const bal = await okxBitcoin.getBalance()
        setBalance(bal.toString())
      } catch (balanceErr) {
        console.warn('获取余额失败:', balanceErr)
        setBalance('无法获取')
      }
      
      setError('')
    } catch (err: any) {
      setError(`连接 OKX 钱包失败: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testBitcoinConnector = async () => {
    setIsLoading(true)
    setError('')
    setConnectionResult(null)
    setBalance(null)
    
    try {
      const connector = new BitcoinConnector({
        network: 'mainnet',
        rpcUrl: 'https://blockstream.info/api'
      })
      
      const result = await connector.connect()
      setConnectionResult(result)
      
      // 尝试获取余额
      try {
        const bal = await connector.getBalance(result.address)
        setBalance(bal)
      } catch (balanceErr) {
        console.warn('获取余额失败:', balanceErr)
        setBalance('无法获取')
      }
      
      setError('')
    } catch (err: any) {
      setError(`连接 Bitcoin 失败: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const requestOKXPermission = async () => {
    try {
      if ((window as any).okxwallet && (window as any).okxwallet.bitcoin) {
        const accounts = await (window as any).okxwallet.bitcoin.requestAccounts()
        console.log('OKX 权限请求结果:', accounts)
        alert(`权限请求成功！账户: ${accounts.join(', ')}`)
        checkBitcoinStatus()
      } else {
        alert('OKX 钱包未检测到')
      }
    } catch (err: any) {
      setError(`权限请求失败: ${err.message}`)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
      <h1>₿ Bitcoin 连接测试页面</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        此页面用于诊断 Bitcoin 钱包连接问题，特别是 OKX 钱包扩展。
      </p>

      {/* 状态检查 */}
      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        marginBottom: '15px'
      }}>
        <h3>环境检查</h3>
        <p><strong>OKX 钱包扩展:</strong> {bitcoinStatus.hasOKXWallet ? '✅ 可用' : '❌ 不可用'}</p>
        <p><strong>网络:</strong> {bitcoinStatus.network}</p>
        <p><strong>用户代理:</strong> {bitcoinStatus.userAgent}</p>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={checkBitcoinStatus}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          刷新状态
        </button>
        
        <button
          onClick={debugOKXAPI}
          style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          调试 OKX API
        </button>
        
        <button
          onClick={requestOKXPermission}
          disabled={!bitcoinStatus.hasOKXWallet}
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: !bitcoinStatus.hasOKXWallet ? 'not-allowed' : 'pointer' }}
        >
          请求 OKX 权限
        </button>
        
        <button
          onClick={testOKXConnection}
          disabled={isLoading || !bitcoinStatus.hasOKXWallet}
          style={{ padding: '10px 15px', backgroundColor: '#f7931a', color: 'white', border: 'none', borderRadius: '5px', cursor: isLoading || !bitcoinStatus.hasOKXWallet ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? '连接中...' : '连接 OKX 钱包'}
        </button>
        
        <button
          onClick={testBitcoinConnector}
          disabled={isLoading}
          style={{ padding: '10px 15px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {isLoading ? '连接中...' : '测试 Bitcoin 连接器'}
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
          <p><strong>余额:</strong> {balance !== null ? `${balance} BTC` : '加载中...'}</p>
        </div>
      )}

      {/* 故障排除指南 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>故障排除</h3>
        <ul style={{ textAlign: 'left' }}>
          <li>确保已安装 <a href="https://www.okx.com/web3" target="_blank" rel="noopener noreferrer">OKX 钱包扩展</a></li>
          <li>确保 OKX 钱包已解锁</li>
          <li>确保 OKX 钱包支持 Bitcoin</li>
          <li>检查浏览器扩展权限</li>
          <li>尝试刷新页面重新检测</li>
          <li>查看浏览器控制台的错误信息</li>
        </ul>
        
        <h4>OKX 钱包使用步骤</h4>
        <ol style={{ textAlign: 'left' }}>
          <li>安装 OKX 钱包浏览器扩展</li>
          <li>创建或导入 Bitcoin 钱包</li>
          <li>解锁钱包</li>
          <li>点击 "连接 OKX 钱包" 按钮</li>
          <li>在 OKX 钱包中确认连接请求</li>
        </ol>

        <h4>常见问题</h4>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>扩展未检测到:</strong> 确保 OKX 钱包扩展已安装并启用</li>
          <li><strong>连接被拒绝:</strong> 检查 OKX 钱包是否已解锁</li>
          <li><strong>API 错误:</strong> 检查 OKX 钱包版本是否支持 Bitcoin API</li>
          <li><strong>权限问题:</strong> 确保网站有权限访问 OKX 钱包</li>
        </ul>
      </div>

      {/* 调试信息 */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <h3>调试信息</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(bitcoinStatus, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default BitcoinTest
