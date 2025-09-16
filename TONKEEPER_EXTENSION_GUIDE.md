# Tonkeeper 浏览器扩展连接指南

## 问题描述

用户反馈使用了 Tonkeeper 浏览器扩展，但连接不上。

## 解决方案

我已经添加了专门的 Tonkeeper 浏览器扩展支持，现在有两种连接方式：

### 1. 专门的 Tonkeeper 扩展连接

#### 在 TON 测试页面
1. 访问 `/ton-test` 页面
2. 点击 **"连接 Tonkeeper 扩展"** 按钮（紫色按钮）
3. 系统会自动检测 Tonkeeper 扩展
4. 如果检测到扩展，会直接使用扩展的连接方法

#### 在多链钱包页面
1. 访问 `/multichain` 页面
2. 点击 TON 钱包的 "连接钱包" 按钮
3. 系统会优先尝试使用 Tonkeeper 扩展

### 2. 连接流程

#### 自动检测流程
1. **检测扩展**: 检查 `window.tonkeeper` 是否存在
2. **使用扩展 API**: 如果检测到扩展，使用 `tonkeeper.tonConnect`
3. **监听连接**: 监听连接状态变化
4. **处理结果**: 连接成功后更新状态

#### 备用方案
如果扩展不可用，会回退到标准 TON Connect 方法：
1. 生成连接 URI
2. 尝试直接打开 Tonkeeper
3. 提供复制 URI 选项

### 3. 故障排除

#### 检查扩展状态
1. 确保 Tonkeeper 扩展已安装
2. 确保扩展已启用
3. 确保扩展已解锁

#### 检查扩展 API
在浏览器控制台中运行：
```javascript
console.log('Tonkeeper 扩展:', window.tonkeeper)
console.log('TonConnect 实例:', window.tonkeeper?.tonConnect)
```

#### 常见问题
- **扩展未检测到**: 确保扩展已安装并启用
- **连接超时**: 确保 Tonkeeper 已解锁
- **API 不可用**: 尝试刷新页面重新检测

### 4. 技术实现

#### 扩展检测
```typescript
// 检查 Tonkeeper 扩展是否可用
if (typeof window !== 'undefined' && (window as any).tonkeeper) {
  // 使用扩展 API
  const tonkeeper = (window as any).tonkeeper
  const tonConnect = tonkeeper.tonConnect
} else {
  // 使用标准 TON Connect
}
```

#### 连接处理
```typescript
// 使用 Tonkeeper 的 TonConnect 实例
const tonConnect = tonkeeper.tonConnect

// 监听连接状态
const unsubscribe = tonConnect.onStatusChange((wallet) => {
  if (wallet && wallet.account) {
    // 连接成功
    setConnectionResult({
      address: wallet.account.address || '',
      publicKey: wallet.account.publicKey || ''
    })
    unsubscribe()
  }
})

// 尝试连接
tonConnect.connect()
```

### 5. 使用步骤

#### 方法一：使用 TON 测试页面
1. 访问 `/ton-test` 页面
2. 点击 "检测钱包" 按钮确认扩展已检测到
3. 点击 "连接 Tonkeeper 扩展" 按钮
4. 在 Tonkeeper 扩展中确认连接

#### 方法二：使用多链钱包页面
1. 访问 `/multichain` 页面
2. 点击 TON 钱包的 "连接钱包" 按钮
3. 系统会自动尝试使用 Tonkeeper 扩展

### 6. 验证连接

连接成功后，您应该能看到：
- 钱包地址
- 公钥信息
- 连接状态更新

### 7. 调试信息

在 TON 测试页面可以查看：
- 扩展检测状态
- 连接过程日志
- 错误信息详情

### 8. 注意事项

#### 扩展要求
- 确保 Tonkeeper 扩展已安装
- 确保扩展已启用
- 确保扩展已解锁

#### 浏览器兼容性
- Chrome/Chromium 浏览器
- Edge 浏览器
- 其他基于 Chromium 的浏览器

#### 网络要求
- 稳定的网络连接
- 能够访问 TON 网络

## 下一步

1. 确保 Tonkeeper 扩展已安装并启用
2. 访问 TON 测试页面
3. 点击 "检测钱包" 确认扩展被检测到
4. 点击 "连接 Tonkeeper 扩展" 进行连接
5. 在 Tonkeeper 扩展中确认连接请求

现在 Tonkeeper 浏览器扩展应该能够正常连接了！
