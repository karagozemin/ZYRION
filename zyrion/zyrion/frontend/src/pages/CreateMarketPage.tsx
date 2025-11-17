import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../lib/wallet'
import { createMarket } from '../lib/contract'
import { showToast } from '../components/Toast'

export default function CreateMarketPage() {
  const navigate = useNavigate()
  const { isConnected } = useWallet()
  
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('60') // minutes
  const [options, setOptions] = useState<string[]>(['', '']) // Start with 2 empty options
  const [correctAnswer, setCorrectAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (correctAnswer === options[index]) {
        setCorrectAnswer('')
      }
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    if (correctAnswer === options[index]) {
      setCorrectAnswer(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (!isConnected) {
        throw new Error('Please connect your wallet first')
      }

      if (!question.trim()) {
        throw new Error('Please enter a market question')
      }

      if (!description.trim()) {
        throw new Error('Please enter a market description')
      }

      const validOptions = options.filter(opt => opt.trim() !== '')
      if (validOptions.length < 2) {
        throw new Error('Please add at least 2 options')
      }

      if (!correctAnswer || !validOptions.includes(correctAnswer)) {
        throw new Error('Please select the correct answer')
      }

      const durationNum = parseInt(duration)
      if (isNaN(durationNum) || durationNum < 1) {
        throw new Error('Please enter a valid duration')
      }

      console.log('Creating market...', { question, description, duration: durationNum, options: validOptions, correctAnswer })
      
      const { operationId, market } = await createMarket(
        question, 
        description, 
        durationNum,
        validOptions,
        correctAnswer,
        10 // maxReward: 10 LIN
      )
      
      console.log('Market created! Operation ID:', operationId, 'Market:', market)
      
      showToast('Market created successfully!', 'success')
      navigate('/')
    } catch (err: any) {
      console.error('Error creating market:', err)
      setError(err.message || 'Failed to create market')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400">
            Please connect your Linera wallet to create a market
          </p>
        </div>
      </div>
    )
  }

  const validOptions = options.filter(opt => opt.trim() !== '')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Create Question Market
        </h1>
        <p className="text-gray-400 text-lg">
          Create a question with multiple choice answers (Polymarket style)
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Market Question */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Market Question *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What will be the price of Bitcoin at the end of 2024?"
              required
            />
          </div>

          {/* Market Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
              placeholder="Describe the market and how it will be resolved..."
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Answer Options * (at least 2)
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg border border-gray-600"
              >
                + Add Option
              </button>
            </div>
          </div>

          {/* Correct Answer */}
          {validOptions.length >= 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Correct Answer * (This will be revealed after market ends)
              </label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select correct answer...</option>
                {validOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-400">
                Winners will receive 2x their bet (max 10 LIN per winner)
              </p>
            </div>
          )}

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Market Duration (minutes) *
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="60"
              min="1"
              required
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDuration('60')}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
              >
                1 hour
              </button>
              <button
                type="button"
                onClick={() => setDuration('1440')}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
              >
                1 day
              </button>
              <button
                type="button"
                onClick={() => setDuration('10080')}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
              >
                1 week
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-purple-900 bg-opacity-20 border border-purple-700 rounded-lg">
            <h3 className="font-semibold text-purple-400 mb-2">📋 How it works</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Users select an option and bet LIN tokens</li>
              <li>• After market ends, correct answer is revealed</li>
              <li>• Winners receive 2x their bet (max 10 LIN per winner)</li>
              <li>• Rewards are distributed automatically</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || validOptions.length < 2 || !correctAnswer}
            >
              {isSubmitting ? 'Creating Market...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
