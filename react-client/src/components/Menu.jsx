import { useState } from 'react'
import socketService from '../services/socket'

function Menu({ onStartGame }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [connecting, setConnecting] = useState(false)

  const handleStartGame = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    
    // Simple alphanumeric validation like the original
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError('Nick must be alphanumeric characters only!')
      return
    }

    setError('')
    setConnecting(true)

    try {
      // Connect to server
      socketService.connect()
      
      // Wait for connection and join game
      setTimeout(() => {
        socketService.joinGame(name)
        setConnecting(false)
        onStartGame(name)
      }, 1000) // Small delay to ensure connection is established
    } catch (err) {
      setError('Failed to connect to server')
      setConnecting(false)
    }
  }

  const handleSpectate = () => {
    // TODO: Implement spectate mode
    console.log('Spectate mode not implemented yet')
  }

  return (
    <div className="menu-container">
      <h1>Agar.io HR</h1>
      <input
        type="text"
        placeholder="Enter your name here"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
        maxLength={25}
        autoFocus
      />
      {error && <div style={{ color: '#ff6b6b', fontSize: '12px', margin: '5px 0' }}>{error}</div>}
      <button onClick={handleStartGame} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Play'}
      </button>
      <button onClick={handleSpectate}>Spectate</button>
      <button onClick={() => console.log('Settings not implemented yet')}>Settings</button>
    </div>
  )
}

export default Menu