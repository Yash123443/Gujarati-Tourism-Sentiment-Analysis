import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import OverviewPage from './pages/OverviewPage'
import AnalyzerPage from './pages/AnalyzerPage'

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
      </Routes>
    </div>
  )
}
