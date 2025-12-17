import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TrackOrder from './pages/TrackOrder';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-900 text-white font-sans">
        <Navbar />
        <div className="container mx-auto p-4 pt-20">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/track" element={<TrackOrder />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
