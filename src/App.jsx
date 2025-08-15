import React, { useEffect } from 'react'
import LoginSimple from './components/LoginSimple'
import DashboardSimple from './components/DashboardSimple'
import useStoreSimple from './store/useStoreSimple'
import './App.css'

function App() {
  const { isAuthenticated, user } = useStoreSimple()

  useEffect(() => {
    console.log('App inicializada - versão simplificada')
  }, [])

  return (
    <div className="App">
      {isAuthenticated && user ? (
        <DashboardSimple />
      ) : (
        <LoginSimple />
      )}
    </div>
  )
}

export default App

