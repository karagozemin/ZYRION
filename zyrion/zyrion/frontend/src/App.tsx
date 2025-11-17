import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import CreateMarketPage from './pages/CreateMarketPage'
import MarketDetailPage from './pages/MarketDetailPage'
import MyMarketsPage from './pages/MyMarketsPage'
import DarkVeil from './components/DarkVeil'
import { SimulationFeed } from './components/SimulationFeed'

function App() {
  return (
    <Router>
      <div className="min-h-screen relative">
        {/* DarkVeil Background - covers entire viewport and extends below */}
        <div className="fixed inset-0 z-0" style={{ width: '100vw', height: '150vh' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <DarkVeil 
              speed={0.3}
              hueShift={0}
              noiseIntensity={0}
              scanlineIntensity={0}
              warpAmount={0}
              resolutionScale={0.5}
            />
          </div>
          {/* Dark overlay for better readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 min-h-screen">
          <Header />
          <SimulationFeed />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateMarketPage />} />
              <Route path="/market/:id" element={<MarketDetailPage />} />
              <Route path="/my-markets" element={<MyMarketsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App



