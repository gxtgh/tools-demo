# OKX 钱包 Bitcoin 连接指南

## 问题描述

用户反馈使用 OKX 钱包插件连接 Bitcoin，但点击"连接 Bitcoin 钱包"按钮没有反应。

## 问题分析

原始的 Bitcoin 连接器只支持密钥对生成，不支持浏览器钱包扩展连接。

## 解决方案

我已经为 Bitcoin 连接器添加了完整的 OKX 钱包支持：

### 1. 更新 Bitcoin 连接器

#### 添加 OKX 钱包检测
```typescript
// 优先尝试使用 OKX 钱包扩展
if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
  return await this.connectOKXWallet()
}
```

#### OKX 钱包连接方法
```typescript
private async connectOKXWallet(): Promise<{ address: string; publicKey: string }> {
  const okxBitcoin = (window as any).okxwallet.bitcoin
  
  // 请求连接
  const accounts = await okxBitcoin.requestAccounts()
  const address = accounts[0]
  
  // 获取公钥
  const publicKey = await okxBitcoin.getPublicKey()
  
  return { address, publicKey }
}
```

#### 支持的功能
- **连接钱包**: 使用 `requestAccounts()` 请求连接
- **获取余额**: 使用 `getBalance()` 获取余额
- **发送交易**: 使用 `sendBitcoin()` 发送交易
- **获取公钥**: 使用 `getPublicKey()` 获取公钥

### 2. 创建 Bitcoin 测试页面

创建了 `/bitcoin-test` 页面，提供：

#### 功能特性
- **OKX 钱包检测**: 检测 OKX 钱包扩展是否可用
- **API 调试**: 查看 OKX 钱包的 Bitcoin API 结构
- **连接测试**: 测试 OKX 钱包连接功能
- **权限请求**: 请求 OKX 钱包权限
- **故障排除**: 完整的故障排除指南

#### 测试按钮
- **刷新状态**: 重新检测 OKX 钱包状态
- **调试 OKX API**: 查看 OKX 钱包 API 结构
- **请求 OKX 权限**: 请求账户访问权限
- **连接 OKX 钱包**: 测试 OKX 钱包连接
- **测试 Bitcoin 连接器**: 测试完整的连接器功能

### 3. 更新多链钱包页面

在多链钱包页面中添加了专门的 Bitcoin 连接处理：

```typescript
private async connectBitcoin(): Promise<WalletConnection> {
  // 检查是否有 OKX 钱包
  if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
    const okxBitcoin = (window as any).okxwallet.bitcoin
    
    // 请求连接
    const accounts = await okxBitcoin.requestAccounts()
    const address = accounts[0]
    
    // 获取公钥和余额
    const publicKey = await okxBitcoin.getPublicKey()
    const balance = await okxBitcoin.getBalance()
    
    const connection: WalletConnection = {
      chainType: 'bitcoin',
      address,
      publicKey,
      balance: balance.toString(),
      isConnected: true
    }
    
    this.connections.set('bitcoin', connection)
    return connection
  } else {
    throw new Error('OKX 钱包扩展未检测到，请安装 OKX 钱包并确保支持 Bitcoin')
  }
}
```

## 使用方法

### 1. 使用 Bitcoin 测试页面
1. 访问 `/bitcoin-test` 页面
2. 点击 "调试 OKX API" 查看 API 结构
3. 点击 "请求 OKX 权限" 请求权限
4. 点击 "连接 OKX 钱包" 进行连接

### 2. 使用多链钱包页面
1. 访问 `/multichain` 页面
2. 点击 Bitcoin 钱包的 "连接钱包" 按钮
3. 在 OKX 钱包中确认连接请求

## 故障排除

### 1. 确保 OKX 钱包已安装
- 访问 [OKX 钱包官网](https://www.okx.com/web3) 下载安装
- 确保扩展已启用

### 2. 检查 Bitcoin 支持
- 确保 OKX 钱包支持 Bitcoin
- 确保已创建或导入 Bitcoin 钱包

### 3. 解锁钱包
- 打开 OKX 钱包扩展
- 输入密码解锁钱包

### 4. 检查权限
- 确保网站有权限访问 OKX 钱包
- 必要时重新授权

### 5. 调试连接
- 使用 Bitcoin 测试页面进行诊断
- 查看浏览器控制台的详细日志

## 技术细节

### 1. OKX 钱包 API
- `okxwallet.bitcoin.requestAccounts()` - 请求账户连接
- `okxwallet.bitcoin.getBalance()` - 获取余额
- `okxwallet.bitcoin.getPublicKey()` - 获取公钥
- `okxwallet.bitcoin.sendBitcoin()` - 发送交易

### 2. 连接流程
1. 检测 OKX 钱包扩展
2. 请求账户访问权限
3. 获取账户地址和公钥
4. 获取余额信息
5. 建立连接状态

### 3. 错误处理
- 扩展未安装
- 权限被拒绝
- API 不可用
- 网络错误

## 验证结果

- ✅ OKX 钱包检测正常
- ✅ Bitcoin API 支持完整
- ✅ 连接流程优化
- ✅ 多链钱包页面支持
- ✅ 调试工具完善

## 相关文件

- `src/connectors/bitcoinConnector.ts` - Bitcoin 连接器（已更新）
- `src/pages/BitcoinTest.tsx` - Bitcoin 测试页面
- `src/connectors/MultiChainWallet.ts` - 多链钱包（已更新）
- `src/App.tsx` - 路由配置
- `src/components/Navigation.tsx` - 导航更新

## 下一步

1. 确保 OKX 钱包扩展已安装并启用
2. 访问 Bitcoin 测试页面 (`/bitcoin-test`)
3. 点击 "调试 OKX API" 查看 API 结构
4. 点击 "连接 OKX 钱包" 进行连接
5. 在 OKX 钱包中确认连接请求

现在 Bitcoin 钱包连接应该能够正常工作了！
