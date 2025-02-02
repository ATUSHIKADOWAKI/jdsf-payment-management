import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LogIn from './pages/Login'
import AppLayout from './components/common/AppLayout'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route index element={<LogIn />} />
          <Route path="/" element={<AppLayout />}>
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
