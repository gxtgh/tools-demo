import { Link, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'

function Navigation() {
  const location = useLocation()
  const { isConnected } = useAccount()

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/wallet', label: '钱包', icon: '👛' },
    { path: '/multichain', label: '多链', icon: '🌐' },
    { path: '/tron-test', label: 'Tron测试', icon: '🔴' },
    { path: '/metamask-test', label: 'MetaMask测试', icon: '🦊' },
    { path: '/debug', label: '调试', icon: '🔧' },
    { path: '/about', label: '关于', icon: 'ℹ️' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav style={{
      padding: '15px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e0e0e0',
      marginBottom: '0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo/Brand */}
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          <span style={{ marginRight: '8px' }}>⚡</span>
          Web3 DApp
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                color: isActive(item.path) ? '#007acc' : '#666',
                backgroundColor: isActive(item.path) ? '#e3f2fd' : 'transparent',
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Connection Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
            color: isConnected ? '#155724' : '#721c24',
            border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {isConnected ? '✅ 已连接' : '❌ 未连接'}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 