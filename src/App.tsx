import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SmartAgent } from './components/SmartAgent';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { VideoEditor } from './pages/VideoEditor';
import { Channel } from './pages/Channel';
import { Studio } from './pages/Studio';
import { Login } from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Sidebar />
        <SmartAgent />

        <main className="pt-16 md:pl-64 min-h-screen">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/upload" element={<VideoEditor />} />
              <Route path="/explore" element={<div>Prozkoumat (WIP)</div>} />
              <Route path="/shorts" element={<div>Shorts (WIP)</div>} />
              <Route path="/subscriptions" element={<div>Odběry (WIP)</div>} />
              <Route path="/library" element={<div>Knihovna (WIP)</div>} />
              <Route path="/history" element={<div>Historie (WIP)</div>} />
              <Route path="/liked" element={<div>Líbí se mi (WIP)</div>} />
              <Route path="/channel/:id" element={<Channel />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="*" element={<div>Stránka nenalezena</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
