import { useState, useEffect } from 'react'
import MarketList from '../components/MarketList'
import { getAllMarkets, Market } from '../lib/contract'

// Mock markets removed - now using DEFAULT_MOCK_MARKETS from mockMarkets.ts
// Old mock markets kept for reference (commented out):
/*
const MOCK_MARKETS: Market[] = [
  {
    id: 1001,
    creator: 'AU12STCVmpQSBeFjDVPM9ErxJJFJtjMZtkTuGtfQzfa3LWN4h2XDJ',
    question: 'Which cryptocurrency will have the highest market cap in 2025?',
    description: 'Based on CoinMarketCap data on January 1, 2025.',
    endTime: Date.now() - (1 * 24 * 60 * 60 * 1000), // Ended 1 day ago
    status: 'Resolved',
    options: ['Bitcoin', 'Ethereum', 'Solana', 'Cardano'],
    correctAnswer: 'Bitcoin',
    bets: {
      'Bitcoin': String(1250.50 * 1e9), // 1250.50 MAS in nanoMAS
      'Ethereum': String(850.25 * 1e9),
      'Solana': String(420.75 * 1e9),
      'Cardano': String(180.50 * 1e9),
    },
    totalPool: String(2702.00 * 1e9), // Total in nanoMAS
    winningOption: 'Up',
    createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
    resolutionPrice: 0,
    maxReward: 10,
  },
  {
    id: 1002,
    creator: 'AU12STCVmpQSBeFjDVPM9ErxJJFJtjMZtkTuGtfQzfa3LWN4h2XDJ',
    question: 'What will be the main AI trend in 2025?',
    description: 'Based on industry reports and market analysis.',
    endTime: Date.now() - (2 * 24 * 60 * 60 * 1000),
    status: 'Resolved',
    options: ['AGI Breakthrough', 'AI Regulation', 'Multimodal AI', 'AI Hardware'],
    correctAnswer: 'AGI Breakthrough',
    bets: {
      'AGI Breakthrough': String(680.00 * 1e9),
      'AI Regulation': String(920.50 * 1e9),
      'Multimodal AI': String(350.25 * 1e9),
      'AI Hardware': String(210.75 * 1e9),
    },
    totalPool: String(2161.50 * 1e9),
    winningOption: 'Up',
    createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000),
    resolutionPrice: 0,
    maxReward: 10,
  },
  {
    id: 1003,
    creator: 'AU12STCVmpQSBeFjDVPM9ErxJJFJtjMZtkTuGtfQzfa3LWN4h2XDJ',
    question: 'Which tech company will have the best stock performance in Q1 2025?',
    description: 'Based on stock price performance from Jan 1 to Mar 31, 2025.',
    endTime: Date.now() - (3 * 24 * 60 * 60 * 1000),
    status: 'Resolved',
    options: ['Apple', 'Microsoft', 'Nvidia', 'Google'],
    correctAnswer: 'Nvidia',
    bets: {
      'Apple': String(450.25 * 1e9),
      'Microsoft': String(680.50 * 1e9),
      'Nvidia': String(1850.75 * 1e9),
      'Google': String(520.00 * 1e9),
    },
    totalPool: String(2501.50 * 1e9),
    winningOption: 'Up',
    createdAt: Date.now() - (18 * 24 * 60 * 60 * 1000),
    resolutionPrice: 0,
    maxReward: 10,
  },
  {
    id: 1004,
    creator: 'AU12STCVmpQSBeFjDVPM9ErxJJFJtjMZtkTuGtfQzfa3LWN4h2XDJ',
    question: 'What will be the most popular programming language in 2025?',
    description: 'Based on GitHub and Stack Overflow developer surveys.',
    endTime: Date.now() - (4 * 24 * 60 * 60 * 1000),
    status: 'Resolved',
    options: ['Python', 'JavaScript', 'Rust', 'TypeScript'],
    correctAnswer: 'Python',
    bets: {
      'Python': String(420.00 * 1e9),
      'JavaScript': String(580.50 * 1e9),
      'Rust': String(180.25 * 1e9),
      'TypeScript': String(320.75 * 1e9),
    },
    totalPool: String(1501.50 * 1e9),
    winningOption: 'Up',
    createdAt: Date.now() - (22 * 24 * 60 * 60 * 1000),
    resolutionPrice: 0,
    maxReward: 10,
  },
  {
    id: 1005,
    creator: 'AU12STCVmpQSBeFjDVPM9ErxJJFJtjMZtkTuGtfQzfa3LWN4h2XDJ',
    question: 'Which social media platform will gain the most users in 2025?',
    description: 'Based on official user growth reports.',
    endTime: Date.now() - (5 * 24 * 60 * 60 * 1000),
    status: 'Resolved',
    options: ['TikTok', 'Instagram', 'X (Twitter)', 'LinkedIn'],
    correctAnswer: 'TikTok',
    bets: {
      'TikTok': String(2100.00 * 1e9),
      'Instagram': String(350.25 * 1e9),
      'X (Twitter)': String(180.50 * 1e9),
      'LinkedIn': String(120.25 * 1e9),
    },
    totalPool: String(2751.00 * 1e9),
    winningOption: 'Up',
    createdAt: Date.now() - (25 * 24 * 60 * 60 * 1000),
    resolutionPrice: 0,
    maxReward: 10,
  },
]
*/

export default function HomePage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMarkets()
    
    // Reload markets when page becomes visible (e.g., returning from create page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMarkets()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Periodically check and update market status (every 30 seconds)
    // This ensures expired markets are automatically locked
    const interval = setInterval(() => {
      loadMarkets()
    }, 30000) // 30 seconds
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])

  const loadMarkets = async () => {
    try {
      setLoading(true)
      setError(null)
      const allMarkets = await getAllMarkets()
      
      // getAllMarkets already includes mock markets if needed
      setMarkets(allMarkets)
    } catch (err: any) {
      console.error('Error loading markets:', err)
      setError(err.message || 'Failed to load markets')
      // getAllMarkets already includes mock markets as fallback
      setMarkets([])
    } finally {
      setLoading(false)
    }
  }

  // Filter markets based on selected filter
  const filteredMarkets = markets.filter((market) => {
    if (filter === 'active') {
      return market.status === 'Active' && Date.now() < market.endTime
    }
    if (filter === 'resolved') {
      return market.status === 'Resolved'
    }
    return true // 'all'
  })
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Real-Time Prediction Markets
        </h1>
        <p className="text-gray-400 text-lg">
          Create and trade on decentralized prediction markets powered by Linera blockchain
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Markets
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Resolved
          </button>
        </div>

        <div className="text-gray-400">
          <span className="font-semibold text-white">{filteredMarkets.length}</span> markets found
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadMarkets}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <MarketList markets={filteredMarkets} loading={loading} />
    </div>
  )
}




