import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import TokenHolder from './pages/tokenHolder'
import Wallet from './pages/Wallet'
import FourMeme from './pages/FourMeme'
import Debug from './pages/Debug'
import MultiChainWallet from './pages/MultiChainWallet'
import TronTest from './pages/TronTest'
import MetaMaskTest from './pages/MetaMaskTest'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/tokenHolder" element={<TokenHolder />} />
            <Route path="/fourMeme" element={<FourMeme />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/multichain" element={<MultiChainWallet />} />
            <Route path="/tron-test" element={<TronTest />} />
            <Route path="/metamask-test" element={<MetaMaskTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
