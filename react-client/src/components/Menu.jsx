import { useState } from 'react'

function Menu({ onStartGame }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleStartGame = () => {
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
    onStartGame(name)
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
      <button onClick={handleStartGame}>Play</button>
      <button onClick={handleSpectate}>Spectate</button>
      <button onClick={() => console.log('Settings not implemented yet')}>Settings</button>
    </div>
  )
}

export default Menu