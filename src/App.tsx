import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import LogIn from './pages/Login'
import Dashboard from './pages/Dashboard'
import useUserRole from './hooks/useUserRole';
import Signup from './pages/Signup';
import Payment from './pages/Payment';
import History from './pages/History';
import Account from './pages/Account';

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
            <Route path="/dashboard/history" element={<History />} />
            <Route path="/dashboard/payment" element={<Payment />} />
            <Route path="/dashboard/account" element={<Account />} />
          </Route>
        </Routes>
      </Router >
    </>
  )
}

export default App
