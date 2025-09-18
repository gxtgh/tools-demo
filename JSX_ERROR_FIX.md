# JSX 语法错误修复报告

## 问题描述

项目构建时出现以下错误：

```
Transform failed with 1 error:
/Users/code/source/dev-demo/src/pages/tron/queryBalance/index.tsx:134:42: ERROR: The character ">" is not valid inside a JSX element
```

## 问题分析

错误发生在面包屑导航中使用了裸露的 ">" 字符，这在 JSX 中是无效的语法。

### 错误位置
- 文件: `src/pages/tron/queryBalance/index.tsx`
- 行数: 第115行（实际错误位置）
- 问题: `<span style={{ margin: '0 8px' }}>></span>`

### 根本原因
在 JSX 中，">" 字符有特殊含义（标签结束符），不能直接在 JSX 元素内容中使用，需要进行 HTML 实体编码。

## 解决方案

### 1. 修复面包屑导航

将所有包含 ">" 字符的 JSX 元素修改为使用 HTML 实体：

```tsx
// 错误的写法
<span style={{ margin: '0 8px' }}>></span>

// 正确的写法
<span style={{ margin: '0 8px' }}>&gt;</span>
```

### 2. 修复的文件

#### Tron 余额查询页面
```tsx
// src/pages/tron/queryBalance/index.tsx:115
<span style={{ margin: '0 8px' }}>&gt;</span>
```

#### Bitcoin 余额查询页面
```tsx
// src/pages/bitcoin/queryBalance/index.tsx:115
<span style={{ margin: '0 8px' }}>&gt;</span>
```

#### Ethereum 余额查询页面
```tsx
// src/pages/ethereum/queryBalance/index.tsx:123
<span style={{ margin: '0 8px' }}>&gt;</span>
```

## 技术细节

### 1. JSX 语法规则
- JSX 中的特殊字符需要进行转义
- ">" 字符必须使用 `&gt;` HTML 实体
- "<" 字符必须使用 `&lt;` HTML 实体
- "&" 字符必须使用 `&amp;` HTML 实体

### 2. 常见的 HTML 实体
- `&gt;` → >
- `&lt;` → <
- `&amp;` → &
- `&quot;` → "
- `&apos;` → '

### 3. 最佳实践
- 在 JSX 中避免直接使用特殊字符
- 使用 HTML 实体或 Unicode 转义
- 考虑使用 CSS 伪元素来显示特殊字符

## 修复后的效果

### 面包屑导航显示
```
Tron 钱包 > 余额查询
Bitcoin 钱包 > 余额查询
Ethereum 钱包 > 余额查询
```

### 验证结果
- ✅ JSX 语法错误已修复
- ✅ 面包屑导航正常显示
- ✅ 所有页面正常访问
- ✅ 构建错误已解决

## 预防措施

### 1. 代码检查
- 使用 ESLint 检查 JSX 语法
- 在开发时注意特殊字符的使用
- 定期运行构建检查

### 2. 替代方案
```tsx
// 方案1: 使用 HTML 实体
<span>&gt;</span>

// 方案2: 使用 Unicode
<span>{'>'}</span>

// 方案3: 使用 CSS 伪元素
<span className="breadcrumb-separator"></span>
```

### 3. 工具配置
- 配置编辑器高亮 JSX 语法错误
- 使用 TypeScript 严格模式
- 启用实时语法检查

## 相关文件

- `src/pages/tron/queryBalance/index.tsx` - 主要修复文件
- `src/pages/bitcoin/queryBalance/index.tsx` - 修复文件
- `src/pages/ethereum/queryBalance/index.tsx` - 修复文件

现在所有的 JSX 语法错误都已修复，项目可以正常构建和运行了！
