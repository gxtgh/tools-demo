# Vite + React + TypeScript + AppKit 钱包连接项目

这是一个使用 Vite、React、TypeScript 和 AppKit 构建的 Web3 应用示例，支持多种钱包连接和多链网络，具备完整的路由系统。

## 功能特性

- ⚡️ Vite - 快速的构建工具
- ⚛️ React 19 - 现代化的 React 框架
- 🔷 TypeScript - 类型安全
- 👛 AppKit - 企业级钱包连接 UI
- 🔗 Wagmi - React Hooks for Ethereum
- 🌐 支持多个网络（Ethereum、BSC）
- 🔄 网络切换功能
- 🧭 React Router - 客户端路由系统
- 📱 响应式设计

## 页面结构

### 🏠 首页 (`/`)
- 钱包连接功能
- 网络切换
- 余额显示
- 基本的 Web3 交互演示

### 👛 钱包页面 (`/wallet`)
- 详细的钱包信息展示
- 专业的网络切换界面
- 钱包管理功能
- 连接状态管理

### ℹ️ 关于页面 (`/about`)
- 项目技术栈介绍
- 支持的网络和钱包列表
- 当前连接状态显示

## 支持的网络

- **Ethereum 主网** - ETH 主链
- **Sepolia 测试网** - ETH 测试链
- **BSC 主网** - 币安智能链主网
- **BSC 测试网** - 币安智能链测试网

## 支持的钱包

- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow
- Trust Wallet
- 以及更多...

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

创建 `.env` 文件并添加以下配置：

```env
# Alchemy API Key (可选，用于更好的 ETH 网络 RPC 性能)
# 获取地址: https://www.alchemy.com/
VITE_ALCHEMY_ID=your_alchemy_api_key_here

# WalletConnect Project ID (推荐配置)
# 获取地址: https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

**注意：** 即使不配置环境变量，项目也能正常运行，会使用公共 RPC 节点。

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/           # 可复用组件
│   └── Navigation.tsx   # 导航栏组件
├── pages/               # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Wallet.tsx      # 钱包管理页面
│   └── About.tsx       # 关于页面
├── wagmi.ts            # Wagmi 配置文件，包含网络和 RPC 配置
├── main.tsx            # 应用入口，配置提供者
├── App.tsx             # 主应用组件，路由配置
└── ...
```

## 主要组件说明

### App.tsx
主应用组件，包含：
- React Router 路由配置
- 页面布局结构
- 导航组件集成

### Navigation.tsx
导航栏组件，提供：
- 页面间导航链接
- 当前页面高亮显示
- 钱包连接状态指示器
- 响应式设计

### pages/Home.tsx
首页组件，展示：
- AppKit 连接按钮
- 钱包连接状态
- 账户地址显示
- 当前网络显示
- 余额查询
- 网络切换按钮
- 断开连接功能

### pages/Wallet.tsx
钱包管理页面，提供：
- 详细的钱包信息展示
- 专业的网络切换界面
- 分类的网络选择（Ethereum/BSC）
- 钱包操作功能

### pages/About.tsx
关于页面，包含：
- 项目技术栈介绍
- 支持的网络详情
- 支持的钱包列表
- 当前连接状态

### wagmi.ts
配置了 Wagmi 和 AppKit，包括：
- 支持的区块链网络（Ethereum 主网/测试网、BSC 主网/测试网）
- RPC 节点配置
- WalletConnect 项目 ID
- 应用信息

## 网络配置详情

### Ethereum 网络
- **主网**: 使用 Alchemy 或公共 RPC
- **Sepolia**: 使用 Alchemy 或公共测试网 RPC

### BSC 网络
- **主网**: `https://bsc-dataseed1.binance.org`
- **测试网**: `https://data-seed-prebsc-1-s1.binance.org:8545`

## 路由配置

应用使用 React Router 实现客户端路由：

- `/` - 首页，基本的钱包连接和网络切换
- `/wallet` - 钱包管理页面，详细的钱包功能
- `/about` - 关于页面，项目信息和技术栈

## 自定义配置

### 添加新页面

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/App.tsx` 中添加新的路由
3. 在 `src/components/Navigation.tsx` 中添加导航链接

### 添加更多网络

在 `src/wagmi.ts` 中的 `chains` 数组中添加更多网络：

```typescript
import { polygon, arbitrum } from 'wagmi/chains'

chains: [mainnet, sepolia, bsc, bscTestnet, polygon, arbitrum],
```

### 自定义 AppKit 主题

可以在 `AppKitProvider` 中添加自定义主题：

```tsx
<AppKitProvider theme="auto" mode="light">
  <App />
</AppKitProvider>
```

## 使用说明

1. **导航**: 使用顶部导航栏在不同页面间切换
2. **连接钱包**: 在首页或钱包页面点击 "Connect Wallet" 按钮
3. **查看信息**: 连接后可以看到钱包地址、当前网络和余额
4. **切换网络**: 使用网络切换按钮在不同链之间切换
5. **管理钱包**: 在钱包页面进行详细的钱包管理操作

## 常见问题

### Q: 为什么会有 React 版本警告？
A: AppKit 目前还不完全支持 React 19，但使用 `--legacy-peer-deps` 安装后可以正常工作。

### Q: 如何获取 WalletConnect Project ID？
A: 访问 [WalletConnect Cloud](https://cloud.walletconnect.com/) 注册并创建项目。

### Q: 如何获取 Alchemy API Key？
A: 访问 [Alchemy](https://www.alchemy.com/) 注册并创建应用。

### Q: BSC 网络切换失败怎么办？
A: 确保您的钱包已添加 BSC 网络，或者钱包会自动提示添加网络配置。

### Q: 如何添加 BSC 测试网代币？
A: 可以通过 [BSC 测试网水龙头](https://testnet.binance.org/faucet-smart) 获取测试 BNB。

### Q: 如何添加新的页面？
A: 在 `src/pages/` 目录创建新组件，然后在 `App.tsx` 中添加路由，在 `Navigation.tsx` 中添加导航链接。

## 相关链接

- [AppKit 文档](https://docs.reown.com/)
- [Wagmi 文档](https://wagmi.sh/)
- [Viem 文档](https://viem.sh/)
- [Vite 文档](https://vitejs.dev/)
- [React Router 文档](https://reactrouter.com/)
- [BSC 文档](https://docs.bnbchain.org/)

## 许可证

MIT
