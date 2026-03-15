import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import SymptomChecker from './pages/SymptomChecker'
import Results from './pages/Results'
import NearbyHospitals from './pages/NearbyHospitals'
import Summary from './pages/Summary'

export default function App() {
  const [conversationData, setConversationData] = useState({
    messages: [],
    analysis: null,
  })

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/checker"
            element={
              <SymptomChecker
                conversationData={conversationData}
                setConversationData={setConversationData}
              />
            }
          />
          <Route
            path="/results"
            element={<Results analysis={conversationData.analysis} messages={conversationData.messages} />}
          />
          <Route path="/hospitals" element={<NearbyHospitals analysis={conversationData.analysis} />} />
          <Route
            path="/summary"
            element={<Summary messages={conversationData.messages} analysis={conversationData.analysis} />}
          />
        </Routes>
      </div>
    </Router>
  )
}
