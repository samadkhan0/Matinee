import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Lobby from './pages/Lobby'
import Room from './pages/Room'
import Profile from './pages/Profile'

const Page = ({ children }) => (
  <motion.main
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.main>
)

export default function App() {
  const location = useLocation()
  const inRoom = location.pathname.startsWith('/room/')

  return (
    <>
      {!inRoom && location.pathname !== '/auth' && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Landing /></Page>} />
          <Route path="/auth" element={<Page><Auth /></Page>} />
          <Route path="/lobby" element={<ProtectedRoute><Page><Lobby /></Page></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
          <Route path="/room/:code" element={<ProtectedRoute><Room /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
