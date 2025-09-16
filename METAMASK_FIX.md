# MetaMask 连接问题修复指南

## 问题描述

用户反馈无法连接 MetaMask（小狐狸钱包）到应用程序。

## 问题分析

经过检查发现，原始的 wagmi 配置只包含了 `authConnector`（用于 WalletConnect 等连接方式），但没有包含 MetaMask 连接器。

## 解决方案

### 1. 添加 MetaMask 连接器

在 `src/wagmi.ts` 中添加了 MetaMask 连接器：

```typescript
import { metaMask } from 'wagmi/connectors'

// 连接器配置 - 包含 MetaMask 和 WalletConnect
connectors: [
  metaMask(), // MetaMask 连接器
  authConnector({
    options: {
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    },
  }),
],
```

### 2. 创建调试页面

创建了 `src/pages/Debug.tsx` 调试页面，提供：

- 连接状态检查
- 可用连接器列表
- 浏览器环境检测
- MetaMask 检测
- 错误信息显示
- 常见问题解决方案

### 3. 更新导航

在导航栏中添加了调试页面链接，方便用户访问。

## 修复后的功能

现在应用程序支持：

1. **MetaMask 连接** - 直接通过 MetaMask 扩展连接
2. **WalletConnect 连接** - 通过二维码扫描连接其他钱包
3. **多网络支持** - Ethereum 主网、Sepolia 测试网、BSC 主网、BSC 测试网
4. **调试工具** - 完整的连接诊断和问题排查工具

## 使用方法

### 连接 MetaMask

1. 确保已安装 MetaMask 浏览器扩展
2. 访问应用程序首页或调试页面
3. 点击 "Connect Wallet" 按钮
4. 选择 MetaMask 连接器
5. 在 MetaMask 中确认连接

### 调试连接问题

1. 访问 `/debug` 页面
2. 查看连接状态和错误信息
3. 检查浏览器环境检测结果
4. 参考常见问题解决方案

## 常见问题

### 1. MetaMask 未检测到
- 确保已安装 MetaMask 扩展
- 刷新页面重试
- 检查浏览器是否支持 Web3

### 2. 连接被拒绝
- 检查 MetaMask 是否已解锁
- 确认选择了正确的账户
- 检查网络权限设置

### 3. 网络不匹配
- 确保 MetaMask 已添加应用支持的网络
- 使用网络切换功能
- 检查 RPC 节点配置

## 技术细节

### 连接器优先级
1. MetaMask - 直接浏览器扩展连接
2. WalletConnect - 二维码扫描连接

### 支持的网络
- Ethereum 主网 (Chain ID: 1)
- Sepolia 测试网 (Chain ID: 11155111)
- BSC 主网 (Chain ID: 56)
- BSC 测试网 (Chain ID: 97)

### 环境变量
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect 项目 ID
- `VITE_ALCHEMY_ID` - Alchemy API Key（可选）

## 相关文件

- `src/wagmi.ts` - wagmi 配置文件
- `src/pages/Debug.tsx` - 调试页面
- `src/components/Navigation.tsx` - 导航组件
- `src/App.tsx` - 主应用组件
