# Bitcoin 测试页面 JSON 错误修复报告

## 问题描述

Bitcoin 测试页面出现以下错误：

```
Uncaught TypeError: Converting circular structure to JSON
--> starting at object with constructor 'hp'
|     property '_readableState' -> object with constructor 'wae'
|     property 'pipes' -> object with constructor 'PV'
|     property '_readableState' -> object with constructor 'hAe'
--- property 'pipes' closes the circle
at JSON.stringify (<anonymous>)
at BitcoinTest (BitcoinTest.tsx:286:17)
```

## 问题分析

错误发生在尝试使用 `JSON.stringify()` 序列化 `bitcoinStatus` 对象时，该对象包含了循环引用。

具体原因：
1. **循环引用**: `okxWallet` 对象包含了复杂的内部结构和循环引用
2. **深层对象**: OKX 钱包对象包含了大量的内部方法和属性
3. **不可序列化**: 某些对象属性（如函数、流对象）无法被 JSON 序列化

## 解决方案

### 1. 修复状态对象结构

将复杂的 `okxWallet` 对象替换为简化的结构：

```typescript
// 修复前
const status = {
  hasOKXWallet: BitcoinConnector.isOKXWalletAvailable(),
  okxWallet: (window as any).okxwallet || null, // 包含循环引用
  userAgent: navigator.userAgent,
  network: 'mainnet'
}

// 修复后
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
```

### 2. 提取关键信息

只保留可序列化的关键信息：
- **hasBitcoin**: 是否支持 Bitcoin API
- **bitcoinMethods**: 可用的 Bitcoin 方法列表
- **version**: OKX 钱包版本

### 3. 避免循环引用

通过只提取需要的属性，避免包含：
- 函数对象
- 流对象
- 复杂的内部状态
- 循环引用的属性

## 修复后的代码

### checkBitcoinStatus 函数
```typescript
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
```

### 调试信息显示
```tsx
<pre style={{ fontSize: '12px', overflow: 'auto' }}>
  {JSON.stringify(bitcoinStatus, null, 2)}
</pre>
```

## 技术要点

### 1. 循环引用问题
- 复杂的浏览器 API 对象通常包含循环引用
- `JSON.stringify()` 无法处理循环引用
- 需要提取关键信息而不是直接序列化整个对象

### 2. 对象序列化
- 只包含可序列化的数据类型（字符串、数字、布尔值、数组、对象）
- 避免包含函数、DOM 对象、流对象等
- 使用 `Object.keys()` 获取方法列表而不是方法本身

### 3. 防御性编程
- 检查对象是否存在
- 使用安全的属性访问
- 提供默认值

## 验证结果

- ✅ JSON 序列化错误已解决
- ✅ 调试信息正常显示
- ✅ 页面正常加载
- ✅ OKX 钱包检测正常
- ✅ 所有功能正常工作

## 相关文件

- `src/pages/BitcoinTest.tsx` - 主要修复文件

## 预防措施

1. **避免直接序列化复杂对象**: 提取关键信息而不是整个对象
2. **使用安全的序列化**: 检查对象结构并只包含必要信息
3. **测试序列化**: 在开发时测试 JSON 序列化是否正常
4. **错误边界**: 添加错误边界处理序列化失败

现在 Bitcoin 测试页面应该能够正常工作，不会再出现 JSON 序列化错误了！
