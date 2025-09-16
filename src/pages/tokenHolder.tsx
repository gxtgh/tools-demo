import { useState } from 'react'

interface TokenInfo {
  token: {
    holders: number;
    // 其他可能的 token 属性
  };
  // 其他可能的属性
}

interface Holder {
  holder: string;
  balance: string | number;
}

function TokenHolder() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [holders, setHolders] = useState<Holder[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tokenAddress) {
      fetch(`https://api.agacve.com/v1api/v3/stats/holders?token_id=${tokenAddress}-bsc`)
        .then(response => response.json())
        .then(data => {
          console.log('holders',data);
          setHolders(data.data.holderStats)
        })
        .catch(error => {
          console.error('Error fetching data:', error)  
        })
      fetch(`https://api.agacve.com/v1api/v3/tokens/${tokenAddress}-bsc`,{
        headers: {
          'x-auth': 'f38006247387ff12eabde0791bb26ec91749648119639156965'
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('token',data)
          setTokenInfo(data.data)
        })
        .catch(error => {
          console.error('Error fetching data:', error)  
        })
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>ave查询代币持有者</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="输入代币合约地址"
          style={{
            padding: '8px',
            width: '300px',
            marginRight: '10px'
          }}
        />
        <button
          type="submit"
          disabled={!tokenAddress}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !tokenAddress ? 'not-allowed' : 'pointer',
            opacity: !tokenAddress ? 0.7 : 1
          }}
        >
          查询
        </button>
      </form>
      {
        !!tokenInfo && <div>代币持有人数：{tokenInfo?.token?.holders}</div>
      }
      {
        holders.length > 0 && <ul>
          <li>
            <span>地址</span>
            <span>数量</span>
          </li>
          {
            holders.map((holder: Holder) => (
              <li key={holder.holder} style={{display: 'flex', justifyContent: 'space-between'}}>
                <span>{holder.holder}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span>{holder.balance}</span>
              </li>
            ))
          }
        </ul>
      }
    </div>
  )
}

export default TokenHolder 