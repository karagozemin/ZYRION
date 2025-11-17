import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MarketCard from '../components/MarketCard'
import { useWallet } from '../lib/wallet'
import { getAllMarkets, Market } from '../lib/contract'

export default function MyMarketsPage() {
  const { isConnected, address } = useWallet()
  const [myMarkets, setMyMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      loadMyData()
    }
    
    // Reload data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected && address) {
        loadMyData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Periodically check and update market status (every 30 seconds)
    // This ensures expired markets are automatically locked
    const interval = setInterval(() => {
      if (isConnected && address) {
        loadMyData()
      }
    }, 30000) // 30 seconds
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [isConnected, address])

  const loadMyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const allMarkets = await getAllMarkets()
      
      // Filter markets I created
      const created = allMarkets.filter(m => m.creator.toLowerCase() === address?.toLowerCase())
      setMyMarkets(created)
    } catch (err: any) {
      console.error('Error loading my data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your markets
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading your markets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          My Markets
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your prediction markets
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadMyData}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Markets I Created ({myMarkets.length})
          </h2>
          <Link to="/create" className="btn btn-primary">
            + Create New Market
          </Link>
        </div>

        {myMarkets.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No markets created yet
            </h3>
            <p className="text-gray-400 mb-4">
              Launch your first prediction market on your microchain
            </p>
            <Link to="/create" className="btn btn-primary">
              Create Market
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}



