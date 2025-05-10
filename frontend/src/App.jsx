import { useState } from 'react'
import './App.css'
// const Login = require('./components/Login');
import Login from './components/Login'
import { Routes, Route} from 'react-router-dom'
import Signup from './components/Signup'
import Dashboard from './components/Dashborad'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold underline">
          Todo App
        </h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </>
  )
}

export default App
