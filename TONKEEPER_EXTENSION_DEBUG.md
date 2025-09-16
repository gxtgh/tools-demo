# Tonkeeper 扩展连接调试指南

## 问题描述

用户已安装 Tonkeeper 浏览器扩展，但连接时一直显示"连接中..."状态，无法完成连接。

## 解决方案

我已经添加了更强大的 Tonkeeper 扩展检测和连接逻辑，包括：

### 1. 增强的扩展检测

现在会检查 Tonkeeper 扩展的多种可能 API 结构：
- `tonkeeper.tonConnect`
- `tonkeeper.TonConnect`
- `tonkeeper.connect`
- `tonkeeper.isConnected`
- `tonkeeper.account`

### 2. 调试工具

添加了 "调试 Tonkeeper API" 按钮，可以：
- 检查扩展对象的所有属性
- 输出详细的 API 信息到控制台
- 帮助诊断连接问题

### 3. 多种连接方式

#### 方式一：直接连接
如果 `tonkeeper.connect` 方法可用，会直接调用：
```typescript
const result = await tonkeeper.connect()
```

#### 方式二：TonConnect 实例
如果 `tonkeeper.tonConnect` 可用，会使用 TonConnect API：
```typescript
const tonConnect = tonkeeper.tonConnect
await tonConnect.connect()
```

#### 方式三：标准 TON Connect
如果扩展 API 不可用，会回退到标准 TON Connect：
```typescript
const { TonConnect } = await import('@tonconnect/sdk')
const tonConnect = new TonConnect({...})
```

## 使用方法

### 1. 调试 Tonkeeper API
1. 访问 `/ton-test` 页面
2. 点击 "调试 Tonkeeper API" 按钮（灰色按钮）
3. 查看控制台输出的详细 API 信息
4. 根据 API 结构选择合适的连接方式

### 2. 尝试连接
1. 点击 "连接 Tonkeeper 扩展" 按钮（紫色按钮）
2. 系统会自动检测并使用最佳的连接方式
3. 查看控制台日志了解连接过程

### 3. 检查连接状态
- 查看页面上的连接结果
- 检查浏览器控制台的日志
- 确认 Tonkeeper 扩展是否弹出连接请求

## 故障排除

### 1. 检查扩展状态
确保 Tonkeeper 扩展：
- 已安装并启用
- 已解锁
- 在正确的网络上

### 2. 检查 API 结构
使用调试工具检查：
- `tonkeeper` 对象是否存在
- 可用的方法和属性
- API 版本兼容性

### 3. 查看控制台日志
连接过程中会输出详细日志：
- 使用的连接方式
- 连接状态变化
- 错误信息

### 4. 常见问题

#### 扩展未检测到
- 确保扩展已安装并启用
- 刷新页面重新检测
- 检查浏览器扩展权限

#### 连接超时
- 确保 Tonkeeper 已解锁
- 检查网络连接
- 尝试重新连接

#### API 不兼容
- 检查 Tonkeeper 版本
- 尝试更新扩展
- 使用标准 TON Connect 方法

## 技术细节

### 1. 扩展检测逻辑
```typescript
// 检查多种可能的 API 结构
if (tonkeeper.tonConnect) {
  // 使用 tonkeeper.tonConnect
} else if (tonkeeper.TonConnect) {
  // 使用 tonkeeper.TonConnect
} else if (tonkeeper.connect) {
  // 使用 tonkeeper.connect
} else {
  // 使用标准 TON Connect
}
```

### 2. 连接状态监听
```typescript
const unsubscribe = tonConnect.onStatusChange((wallet) => {
  if (wallet && wallet.account) {
    // 连接成功
    setConnectionResult({
      address: wallet.account.address,
      publicKey: wallet.account.publicKey
    })
    setIsLoading(false)
  }
})
```

### 3. 错误处理
```typescript
try {
  await tonConnect.connect()
} catch (connectError) {
  console.log('连接需要用户交互:', connectError)
}
```

## 下一步

1. 访问 TON 测试页面
2. 点击 "调试 Tonkeeper API" 查看扩展 API 结构
3. 点击 "连接 Tonkeeper 扩展" 尝试连接
4. 查看控制台日志了解连接过程
5. 如果仍有问题，请提供控制台日志信息

现在 Tonkeeper 扩展连接应该能够正常工作了！
