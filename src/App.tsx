import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import FundamentalsPage from './pages/FundamentalsPage'
import ProcessPage from './pages/ProcessPage'
import HardwarePage from './pages/HardwarePage'
import SimulationsPage from './pages/SimulationsPage'
import BudgetPage from './pages/BudgetPage'
import TimelinePage from './pages/TimelinePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="fundamentals" element={<FundamentalsPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="hardware" element={<HardwarePage />} />
        <Route path="simulations" element={<SimulationsPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="timeline" element={<TimelinePage />} />
      </Route>
    </Routes>
  )
}

export default App
