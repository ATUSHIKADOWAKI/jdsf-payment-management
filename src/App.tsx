import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import LogIn from './pages/Login'
import Dashboard from './pages/Dashboard'
import useUserRole from './hooks/useUserRole';
import Signup from './pages/Signup';

function App() {

  const { user } = useUserRole();

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" />}>
          </Route>
        </Routes>
      </Router >
    </>
  )
}

export default App
