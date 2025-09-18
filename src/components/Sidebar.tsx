import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface MenuGroup {
  title: string
  items: MenuItem[]
}

interface MenuItem {
  path: string
  label: string
  icon: string
  description?: string
}

function Sidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuGroups: MenuGroup[] = [
    {
      title: '主要功能',
      items: [
        { path: '/', label: '首页', icon: '🏠', description: '应用首页和概览' },
        { path: '/wallet', label: '通用钱包', icon: '👛', description: 'Ethereum 通用钱包管理' },
      ]
    },
    {
      title: 'Ethereum 生态',
      items: [
        { path: '/ethereum/wallets', label: 'Ethereum 钱包', icon: '⟠', description: 'Ethereum 和 BSC 钱包管理' },
        { path: '/ethereum/queryBalance', label: 'Ethereum 余额查询', icon: '📊', description: '批量查询 Ethereum 地址余额' },
      ]
    },
    {
      title: 'Bitcoin 生态',
      items: [
        { path: '/bitcoin/wallets', label: 'Bitcoin 钱包', icon: '₿', description: 'Bitcoin 钱包管理 (OKX)' },
        { path: '/bitcoin/queryBalance', label: 'Bitcoin 余额查询', icon: '📊', description: '批量查询 Bitcoin 地址余额' },
      ]
    },
    {
      title: 'Tron 生态',
      items: [
        { path: '/tron/wallets', label: 'Tron 钱包', icon: '🔴', description: 'Tron 钱包管理 (TronLink)' },
        { path: '/tron/queryBalance', label: 'Tron 余额查询', icon: '📊', description: '批量查询 Tron 地址余额' },
      ]
    },
    {
      title: 'TON 生态',
      items: [
        { path: '/ton/wallets', label: 'TON 钱包', icon: '💎', description: 'TON 钱包管理 (Tonkeeper)' },
        { path: '/ton/queryBalance', label: 'TON 余额查询', icon: '📊', description: '批量查询 TON 地址余额' },
      ]
    },
    {
      title: 'Sui 生态',
      items: [
        { path: '/sui/wallets', label: 'Sui 钱包', icon: '🟢', description: 'Sui 钱包管理' },
        { path: '/sui/queryBalance', label: 'Sui 余额查询', icon: '📊', description: '批量查询 Sui 地址余额' },
      ]
    },
    {
      title: 'Aptos 生态',
      items: [
        { path: '/aptos/wallets', label: 'Aptos 钱包', icon: '🟡', description: 'Aptos 钱包管理' },
        { path: '/aptos/queryBalance', label: 'Aptos 余额查询', icon: '📊', description: '批量查询 Aptos 地址余额' },
      ]
    },
    {
      title: '工具和测试',
      items: [
        { path: '/multichain', label: '多链连接', icon: '🌐', description: '多链钱包统一管理' },
        { path: '/debug', label: '调试工具', icon: '🔧', description: '连接调试和故障排除' },
      ]
    }
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div style={{
      width: isCollapsed ? '60px' : '280px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #e0e0e0',
      transition: 'width 0.3s ease',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      zIndex: 1000
    }}>
      {/* 侧边栏头部 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!isCollapsed && (
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
              ⚡ Web3 DApp
            </h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
              多链钱包管理
            </p>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* 菜单组 */}
      <div style={{ padding: isCollapsed ? '10px 5px' : '20px' }}>
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} style={{ marginBottom: '25px' }}>
            {!isCollapsed && (
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '14px',
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {group.title}
              </h3>
            )}
            
            <div>
              {group.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: isCollapsed ? '12px 8px' : '12px 16px',
                    marginBottom: '8px',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    backgroundColor: isActive(item.path) ? '#e3f2fd' : 'transparent',
                    color: isActive(item.path) ? '#1976d2' : '#333',
                    border: isActive(item.path) ? '2px solid #1976d2' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
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
                  <span style={{ fontSize: '20px', marginRight: isCollapsed ? '0' : '12px' }}>
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: isActive(item.path) ? 'bold' : 'normal'
                      }}>
                        {item.label}
                      </div>
                      {item.description && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#666', 
                          marginTop: '2px'
                        }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 侧边栏底部 */}
      {!isCollapsed && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          padding: '15px',
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            多链钱包支持
          </div>
          <div>
            支持 Ethereum、Bitcoin、Tron、TON、Sui、Aptos 等多种区块链钱包连接和管理
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
