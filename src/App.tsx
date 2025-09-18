import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import TokenHolder from './pages/tokenHolder'
import Wallet from './pages/Wallet'
import FourMeme from './pages/FourMeme'
import Debug from './pages/Debug'
import MultiChainWallet from './pages/MultiChainWallet'
import TronTest from './pages/TronTest'
import MetaMaskTest from './pages/MetaMaskTest'
import TonTest from './pages/TonTest'
import BitcoinTest from './pages/BitcoinTest'
// 新的钱包页面 - 按链组织
import EthereumWallets from './pages/ethereum/wallets'
import EthereumQueryBalance from './pages/ethereum/queryBalance'
import BitcoinWallets from './pages/bitcoin/wallets'
import BitcoinQueryBalance from './pages/bitcoin/queryBalance'
import TronWallets from './pages/tron/wallets'
import TronQueryBalance from './pages/tron/queryBalance'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App" style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ 
          marginLeft: '280px', 
          minHeight: '100vh', 
          flex: 1,
          transition: 'margin-left 0.3s ease'
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/tokenHolder" element={<TokenHolder />} />
            <Route path="/fourMeme" element={<FourMeme />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/multichain" element={<MultiChainWallet />} />
            
            {/* 新的钱包页面 - 按链组织 */}
            <Route path="/ethereum/wallets" element={<EthereumWallets />} />
            <Route path="/ethereum/queryBalance" element={<EthereumQueryBalance />} />
            <Route path="/bitcoin/wallets" element={<BitcoinWallets />} />
            <Route path="/bitcoin/queryBalance" element={<BitcoinQueryBalance />} />
            <Route path="/tron/wallets" element={<TronWallets />} />
            <Route path="/tron/queryBalance" element={<TronQueryBalance />} />
            
            {/* 测试页面 */}
            <Route path="/tron-test" element={<TronTest />} />
            <Route path="/metamask-test" element={<MetaMaskTest />} />
            <Route path="/ton-test" element={<TonTest />} />
            <Route path="/bitcoin-test" element={<BitcoinTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
