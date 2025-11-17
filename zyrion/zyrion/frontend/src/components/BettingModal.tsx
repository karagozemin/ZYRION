import { useState } from 'react'
import { useWallet } from '../lib/wallet'
import { placeBet } from '../lib/contract'

interface BettingModalProps {
  marketId: number
  option: string // The selected option string
  onClose: () => void
}

export default function BettingModal({ marketId, option, onClose }: BettingModalProps) {
  const { address, isConnected } = useWallet()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('Placing bet:', { marketId, option, amount })
      
      // Place bet (may include coins parameter if Bearby wallet supports it)
      await placeBet(marketId, option, amount)
      
      alert(`Bet placed successfully!`)
      onClose()
      // Trigger a custom event to reload market data
      window.dispatchEvent(new Event('marketUpdated'))
    } catch (err: any) {
      console.error('Error placing bet:', err)
      setError(err.message || 'Failed to place bet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Place Bet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selected Option
            </label>
            <div className="px-4 py-3 bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg text-white font-semibold">
              {option}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount (LIN)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              required
              className="input w-full"
            />
            <p className="text-sm text-gray-400 mt-2">
              If you win, you'll receive 2x your bet (max 10 LIN)
            </p>
           
          </div>

          <div className="mb-6 p-4 bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">You're betting on:</span>
              <span className="font-bold text-purple-400">
                {option}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Amount:</span>
              <span className="font-bold text-white">
                {amount || '0'} LIN
              </span>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-700">
                <span className="text-gray-300">Potential reward:</span>
                <span className="font-bold text-green-400">
                  {Math.min(parseFloat(amount) * 2, 10).toFixed(2)} LIN
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading || !amount}
            >
              {loading ? 'Placing Bet...' : 'Confirm Bet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
