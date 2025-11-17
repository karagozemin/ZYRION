import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useWallet } from '../lib/wallet'
import { shortAddress } from '../lib/linera'
import { getCurrentPoints, getPointsHistory } from '../lib/mockMode'
import { showToast } from './Toast'
import logo from '../assets/logo.png'

export default function Header() {
  const { isConnected, address, connect, disconnect } = useWallet()
  const [points, setPoints] = useState(0)
  const [showPoints, setShowPoints] = useState(false)

  useEffect(() => {
    // Load initial points
    setPoints(getCurrentPoints())

    // Listen for points updates
    const handlePointsUpdate = () => {
      setPoints(getCurrentPoints())
    }

    window.addEventListener('pointsUpdated', handlePointsUpdate)
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate)
  }, [])

  const handleConnect = async () => {
    try {
      await connect()
      showToast('Wallet connected successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to connect:', error)
      showToast(error.message || 'Failed to connect wallet. Please install Linera wallet.', 'error')
    }
  }

  const pointsHistory = getPointsHistory()

  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-md border-b border-gray-700 border-opacity-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="ZYRION Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <span className="text-2xl font-bold text-white">ZYRION</span>
                <p className="text-xs text-gray-400">on Linera</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Markets
              </Link>
              <Link 
                to="/create" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Create
              </Link>
              <Link 
                to="/my-markets" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                My Markets
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Points Display */}
            <div className="relative">
              <button
                onClick={() => setShowPoints(!showPoints)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <span>⭐</span>
                <span>{points} Points</span>
              </button>
              
              {showPoints && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 z-50">
                  <div className="text-white font-semibold mb-2">Points Activity</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pointsHistory.length === 0 ? (
                      <div className="text-gray-400 text-sm">No activity yet</div>
                    ) : (
                      pointsHistory.map((entry, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="text-white">{entry.title}</div>
                          <div className="text-green-400">+{entry.points} points</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gray-700 rounded-lg">
                  <div className="text-gray-400 text-xs">Connected</div>
                  <div className="text-white font-medium">{shortAddress(address)}</div>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
              >
                Connect Linera Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
