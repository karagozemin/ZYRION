import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import BettingModal from '../components/BettingModal'
import { getAllMarkets, Market, getClaimableRewards, claimReward } from '../lib/contract'
import { useWallet } from '../lib/wallet'
import { formatLineraAmount } from '../lib/linera'

export default function MarketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [market, setMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimableRewards, setClaimableRewards] = useState<any[]>([])
  const [claiming, setClaiming] = useState(false)
  const { address, isConnected } = useWallet()

  useEffect(() => {
    loadMarket()
  }, [id])

  useEffect(() => {
    if (market && address && (market.status === 'Locked' || market.status === 'Resolved')) {
      loadClaimableRewards()
    }
  }, [market, address])

  // Reload market when bet is placed
  useEffect(() => {
    const handleMarketUpdate = () => {
      loadMarket()
      if (market && address && (market.status === 'Locked' || market.status === 'Resolved')) {
        loadClaimableRewards()
      }
    }

    window.addEventListener('marketUpdated', handleMarketUpdate)
    return () => {
      window.removeEventListener('marketUpdated', handleMarketUpdate)
    }
  }, [market, address])

  const loadMarket = async () => {
    if (!id) {
      setError('Market ID not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const marketId = parseInt(id)
      const allMarkets = await getAllMarkets()
      const foundMarket = allMarkets.find(m => m.id === marketId)
      
      if (!foundMarket) {
        setError(`Market ${marketId} not found`)
        setLoading(false)
        return
      }
      
      setMarket(foundMarket)
    } catch (err: any) {
      console.error('Error loading market:', err)
      setError(err.message || 'Failed to load market')
    } finally {
      setLoading(false)
    }
  }

  const loadClaimableRewards = async () => {
    if (!market || !address) return
    
    try {
      const rewards = await getClaimableRewards(market.id, address)
      setClaimableRewards(rewards)
    } catch (err: any) {
      console.error('Error loading claimable rewards:', err)
    }
  }

  const handleClaimReward = async (betId: number) => {
    if (!market) return
    
    setClaiming(true)
    try {
      await claimReward(market.id, betId)
      alert('Reward claimed successfully!')
      await loadClaimableRewards()
      await loadMarket() // Reload market data
    } catch (err: any) {
      console.error('Error claiming reward:', err)
      alert(err.message || 'Failed to claim reward')
    } finally {
      setClaiming(false)
    }
  }

  // Mock bets (will be replaced with real data later)
  const mockBets: Array<{ user: string; option: 'Up' | 'Down'; amount: string; timestamp: number }> = []

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading market...</p>
        </div>
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back to Markets
        </button>
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-400 mb-4">{error || 'Market not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go to Markets
          </button>
        </div>
      </div>
    )
  }

  // Check if this is a question-answer style market
  const isQuestionAnswerMarket = market.options && market.options.length > 0
  
  // For old format (UP/DOWN)
  // totalUpBets and totalDownBets are in LIN (string), but totalPool might be in nanoLIN
  const upBets = parseFloat(market.totalUpBets || '0')
  const downBets = parseFloat(market.totalDownBets || '0')
  // totalPool is in nanoLIN (string), convert to LIN
  const totalPoolNano = BigInt(market.totalPool || '0')
  const totalPool = Number(totalPoolNano) / 1e9 // Convert nanoLIN to LIN
  const upPercentage = totalPool > 0 ? (upBets / totalPool) * 100 : 50
  const downPercentage = totalPool > 0 ? (downBets / totalPool) * 100 : 50

  // For new format (question-answer)
  const optionBets = market.bets || {}
  // optionBets values are in nanoLIN (string), convert to LIN for display
  const optionTotals = market.options?.map(opt => {
    const betAmountNano = BigInt(optionBets[opt] || '0')
    const betAmountLIN = Number(betAmountNano) / 1e9 // Convert nanoLIN to LIN
    return {
      option: opt,
      amount: betAmountLIN
    }
  }) || []
  const totalOptionPool = optionTotals.reduce((sum, opt) => sum + opt.amount, 0)
  
  // Use totalOptionPool for question-answer markets, totalPool for old format
  const displayTotalPool = isQuestionAnswerMarket ? totalOptionPool : totalPool

  const isExpired = market.endTime <= Date.now()
  const timeDisplay = isExpired 
    ? 'Ended ' + formatDistanceToNow(new Date(market.endTime), { addSuffix: true })
    : formatDistanceToNow(new Date(market.endTime), { addSuffix: true })

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
      >
        ← Back to Markets
      </button>

      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-white flex-1">
            {market.question}
          </h1>
          <span className={`badge ml-4 ${
            market.status === 'Active' ? 'badge-success' :
            market.status === 'Locked' ? 'badge-warning' :
            'badge-secondary'
          }`}>
            {market.status}
          </span>
        </div>

        {market.description && (
          <p className="text-gray-300 mb-6">{market.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Pool</div>
            <div className="text-2xl font-bold text-white">{displayTotalPool.toFixed(2)} LIN</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">{isExpired ? 'Ended' : 'Ends In'}</div>
            <div className="text-2xl font-bold text-white">
              {timeDisplay}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Bets</div>
            <div className="text-2xl font-bold text-white">{mockBets.length}</div>
          </div>
        </div>

        {/* Question-Answer Style Market */}
        {isQuestionAnswerMarket ? (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>Answer Options</span>
              <span className="text-white font-semibold">{totalOptionPool.toFixed(2)} LIN Total</span>
            </div>
            
            <div className="space-y-3">
              {market.options!.map((option, index) => {
                // Get amount from optionTotals (already converted to LIN)
                const optionTotal = optionTotals.find(opt => opt.option === option)
                const amount = optionTotal?.amount || 0
                const percentage = totalOptionPool > 0 ? (amount / totalOptionPool) * 100 : 0
                const isCorrect = market.status === 'Resolved' && market.correctAnswer === option
                
                return (
                  <div key={index} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{option}</span>
                        {isCorrect && (
                          <span className="badge badge-success text-xs">✓ Correct Answer</span>
                        )}
                      </div>
                      <span className="text-white font-semibold">{amount.toFixed(2)} LIN</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                    {market.status === 'Active' && (
                      <button
                        onClick={() => setSelectedOption(option)}
                        className="w-full btn bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Bet on this option
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            
            {(market.status === 'Locked' || market.status === 'Resolved') && market.correctAnswer && (
              <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                <p className="text-green-400 font-semibold">
                  ✓ Correct Answer: {market.correctAnswer}
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  Winners receive 2x their bet (max 10 LIN per winner)
                </p>
              </div>
            )}

            {/* Claimable Rewards */}
            {isConnected && address && claimableRewards.length > 0 && (
              <div className="mt-4 p-4 bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg">
                <h3 className="text-purple-400 font-semibold mb-3">🎉 You Won!</h3>
                {claimableRewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between mb-2 p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-semibold">Option: {reward.option}</p>
                      <p className="text-gray-400 text-sm">
                        Reward: {formatLineraAmount(BigInt(reward.reward_amount))} LIN
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimReward(reward.id!)}
                      disabled={claiming || reward.claimed}
                      className="btn bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                    >
                      {reward.claimed ? 'Claimed' : 'Claim Reward'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Old UP/DOWN Format */
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Pool Distribution</span>
            </div>
            
            <div className="flex h-12 rounded-lg overflow-hidden mb-3">
              <div 
                className="bg-green-600 flex items-center justify-center text-white font-medium"
                style={{ width: `${upPercentage}%` }}
              >
                {upPercentage > 15 && `${upPercentage.toFixed(1)}%`}
              </div>
              <div 
                className="bg-red-600 flex items-center justify-center text-white font-medium"
                style={{ width: `${downPercentage}%` }}
              >
                {downPercentage > 15 && `${downPercentage.toFixed(1)}%`}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">↑ UP</span>
                <span className="text-white font-semibold">{upBets.toFixed(2)} LIN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-lg">↓ DOWN</span>
                <span className="text-white font-semibold">{downBets.toFixed(2)} LIN</span>
              </div>
            </div>
          </div>
        )}

        {market.status === 'Active' && !isQuestionAnswerMarket && (
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedOption('up')}
              className="flex-1 btn bg-green-600 hover:bg-green-700 text-lg py-3"
            >
              ↑ Bet UP
            </button>
            <button
              onClick={() => setSelectedOption('down')}
              className="flex-1 btn bg-red-600 hover:bg-red-700 text-lg py-3"
            >
              ↓ Bet DOWN
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Bets</h2>
        
        {mockBets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No bets yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {mockBets.map((bet, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${bet.option === 'Up' ? 'text-green-400' : 'text-red-400'}`}>
                    {bet.option === 'Up' ? '↑' : '↓'} {bet.option}
                  </span>
                  <span className="text-gray-400 text-sm">{bet.user}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{bet.amount} LIN</div>
                  <div className="text-gray-400 text-sm">
                    {formatDistanceToNow(bet.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOption && (
        <BettingModal
          marketId={market.id}
          option={selectedOption}
          onClose={() => setSelectedOption(null)}
        />
      )}
    </div>
  )
}



