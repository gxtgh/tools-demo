import { useState, useEffect } from 'react'
import { useContractReads, useAccount, useChainId } from 'wagmi'
import { mainnet, sepolia, bsc, bscTestnet } from 'wagmi/chains'
import FourMemeAbi from '../assets/abi/four1.json'

const FOUR_MEME_ADDRESS = '0x5c952063c7fc8610FFDB798152D69F0B9550762b'

interface ContractData {
  owner?: string
  launchFee?: bigint
  totalTemplates?: bigint
  // 其他可能的合约数据
}

export default function FourMeme() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [contractData, setContractData] = useState<ContractData | null>(null)

  // 批量查询合约数据
  const { data: readData, isLoading, error } = useContractReads({
    contracts: [
      // 查询合约所有者
      {
        address: FOUR_MEME_ADDRESS as `0x${string}`,
        abi: FourMemeAbi ,
        functionName: 'signer',
      },
      {
        address: FOUR_MEME_ADDRESS as `0x${string}`,
        abi: FourMemeAbi ,
        functionName: 'owner',
      },
      {
        address: FOUR_MEME_ADDRESS as `0x${string}`,
        abi: FourMemeAbi ,
        functionName: '_tokenInfos',
        args: ['0xa1de999b06eb2aafb58b7dd0cdc95e3518714444'],
      },
    ],
  })

  console.log('readData',readData)

  // 处理合约数据
  useEffect(() => {
    if (readData && readData.length >= 3) {
      const [owner, ] = readData
      setContractData({
        owner: owner.result as string,
        // launchFee: launchFee.result as bigint,
        // totalTemplates: totalTemplates.result as bigint,
      })
    }
  }, [readData])

  // 格式化数字显示
  const formatNumber = (value: bigint) => {
    return value.toString()
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 获取当前网络名称
  const getChainName = (chainId: number) => {
    switch (chainId) {
      case mainnet.id:
        return 'Ethereum 主网'
      case sepolia.id:
        return 'Sepolia 测试网'
      case bsc.id:
        return 'BSC 主网'
      case bscTestnet.id:
        return 'BSC 测试网'
      default:
        return `未知网络 (${chainId})`
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>FOUR_MEME 合约信息查询</h1>
      
      {/* 网络信息 */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <p style={{ margin: 0 }}>
          <strong>合约地址:</strong> {FOUR_MEME_ADDRESS}
        </p>
        <p style={{ margin: '5px 0 0 0' }}>
          <strong>当前网络:</strong> {getChainName(chainId)}
        </p>
        <p style={{ margin: '5px 0 0 0' }}>
          <strong>钱包状态:</strong> {isConnected ? '✅ 已连接' : '❌ 未连接'}
        </p>
        {isConnected && (
          <p style={{ margin: '5px 0 0 0' }}>
            <strong>我的地址:</strong> {formatAddress(address || '')}
          </p>
        )}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p>正在查询合约数据...</p>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          <strong>查询错误:</strong> {error.message}
        </div>
      )}

      {/* 合约信息 */}
      {contractData && (
        <div style={{ 
          padding: '25px', 
          border: '2px solid #2196f3', 
          borderRadius: '12px',
          backgroundColor: '#e3f2fd',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginTop: 0, color: '#1565c0' }}>合约基本信息</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {contractData.owner && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>合约所有者:</strong>
                <span style={{ fontFamily: 'monospace' }}>
                  {formatAddress(contractData.owner)}
                </span>
              </div>
            )}
            {contractData.launchFee !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>启动费用:</strong>
                <span>{formatNumber(contractData.launchFee)} wei</span>
              </div>
            )}
            {contractData.totalTemplates !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>模板总数:</strong>
                <span>{formatNumber(contractData.totalTemplates)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 合约功能说明 */}
      <div style={{ 
        padding: '20px',
        backgroundColor: '#f3e5f5',
        borderRadius: '8px',
        border: '1px solid #ce93d8'
      }}>
        <h4 style={{ marginTop: 0, color: '#7b1fa2' }}>🔧 合约功能说明</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>这是一个代币创建和交易平台合约</li>
          <li>支持创建新代币、添加流动性、买卖代币等功能</li>
          <li>使用 wagmi 批量查询合约状态信息</li>
          <li>数据直接从区块链获取，确保准确性</li>
          <li>支持多网络切换（Ethereum、BSC）</li>
        </ul>
      </div>

      {/* 原始数据调试 */}
      {readData && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', color: '#666' }}>
            查看原始查询数据
          </summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(readData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
