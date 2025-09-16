import { useState, useEffect } from 'react'

function TronTest() {
  const [tronStatus, setTronStatus] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkTronStatus()
  }, [])

  const checkTronStatus = () => {
    const tronWeb = (window as any).tronWeb
    const status = {
      hasTronWeb: typeof tronWeb !== 'undefined',
      tronWeb: tronWeb ? {
        isConnected: tronWeb.isConnected ? tronWeb.isConnected() : false,
        defaultAddress: tronWeb.defaultAddress ? {
          base58: tronWeb.defaultAddress.base58,
          hex: tronWeb.defaultAddress.hex
        } : null,
        ready: tronWeb.ready || false,
        version: tronWeb.version || '未知'
      } : null,
      userAgent: navigator.userAgent
    }
    setTronStatus(status)
  }

  const testTronConnection = async () => {
    setIsLoading(true)
    setError('')

    try {
      // 等待 TronLink 加载
      await new Promise((resolve, reject) => {
        const startTime = Date.now()
        const timeout = 10000

        const checkTronLink = () => {
          if (typeof window !== 'undefined' && (window as any).tronWeb) {
            resolve(true)
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('TronLink 未检测到'))
          } else {
            setTimeout(checkTronLink, 100)
          }
        }
        
        checkTronLink()
      })

      const tronWeb = (window as any).tronWeb

      // 检查连接状态
      if (!tronWeb.isConnected()) {
        throw new Error('TronLink 未连接到网络')
      }

      // 检查账户
      if (!tronWeb.defaultAddress || !tronWeb.defaultAddress.base58) {
        throw new Error('请先解锁 TronLink 钱包并选择账户')
      }

      // 获取账户信息
      const address = tronWeb.defaultAddress.base58
      const publicKey = tronWeb.defaultAddress.hex

      // 获取余额
      const balance = await tronWeb.trx.getBalance(address)
      const balanceInTrx = tronWeb.fromSun(balance)

      alert(`连接成功!\n地址: ${address}\n公钥: ${publicKey}\n余额: ${balanceInTrx} TRX`)

    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setIsLoading(false)
    }
  }

  const requestTronPermission = async () => {
    try {
      if ((window as any).tronWeb && (window as any).tronWeb.request) {
        await (window as any).tronWeb.request({
          method: 'tron_requestAccounts'
        })
        checkTronStatus()
        alert('权限请求已发送，请检查 TronLink 钱包')
      } else {
        alert('TronLink 钱包未检测到')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '权限请求失败')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔴 Tron 连接测试</h1>
      
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <strong>错误:</strong> {error}
          <button 
            onClick={() => setError('')}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>TronLink 状态检查</h2>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px',
          marginBottom: '15px'
        }}>
          <p><strong>检测到 TronWeb:</strong> {tronStatus.hasTronWeb ? '✅ 是' : '❌ 否'}</p>
          {tronStatus.tronWeb && (
            <div style={{ marginLeft: '20px' }}>
              <p><strong>已连接:</strong> {tronStatus.tronWeb.isConnected ? '✅ 是' : '❌ 否'}</p>
              <p><strong>地址:</strong> {tronStatus.tronWeb.defaultAddress?.base58 || '未设置'}</p>
              <p><strong>公钥:</strong> {tronStatus.tronWeb.defaultAddress?.hex || '未设置'}</p>
              <p><strong>就绪状态:</strong> {tronStatus.tronWeb.ready ? '✅ 是' : '❌ 否'}</p>
              <p><strong>版本:</strong> {tronStatus.tronWeb.version || '未知'}</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={checkTronStatus}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            刷新状态
          </button>

          <button
            onClick={testTronConnection}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: isLoading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '测试中...' : '测试连接'}
          </button>

          <button
            onClick={requestTronPermission}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            请求权限
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>完整状态信息</h2>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(tronStatus, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>故障排除指南</h2>
        <div style={{ textAlign: 'left' }}>
          <h3>1. 确保 TronLink 已安装</h3>
          <p>访问 <a href="https://www.tronlink.org/" target="_blank" rel="noopener noreferrer">https://www.tronlink.org/</a> 下载并安装 TronLink 扩展</p>
          
          <h3>2. 解锁钱包</h3>
          <p>打开 TronLink 扩展，输入密码解锁钱包</p>
          
          <h3>3. 选择账户</h3>
          <p>确保在 TronLink 中选择了正确的账户</p>
          
          <h3>4. 检查网络</h3>
          <p>确保 TronLink 连接到正确的网络（主网或测试网）</p>
          
          <h3>5. 刷新页面</h3>
          <p>安装或解锁 TronLink 后，刷新浏览器页面</p>
          
          <h3>6. 检查权限</h3>
          <p>确保网站有权限访问 TronLink 钱包</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>浏览器信息</h2>
        <p><strong>用户代理:</strong> {tronStatus.userAgent}</p>
      </div>
    </div>
  )
}

export default TronTest
