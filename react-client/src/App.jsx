import { useState } from 'react'
import socketService from './services/socket'
import Menu from './components/Menu'
import Game from './components/Game'
import Leaderboard from './components/Leaderboard'
import Chat from './components/Chat'

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu' or 'playing'
  const [playerName, setPlayerName] = useState('')

  const startGame = (name) => {
    setPlayerName(name)
    setGameState('playing')
  }

  const returnToMenu = () => {
    // Disconnect from server when returning to menu
    socketService.disconnect()
    setGameState('menu')
    setPlayerName('')
  }

  return (
    <div className="game-container">
      {gameState === 'menu' ? (
        <Menu onStartGame={startGame} />
      ) : (
        <>
          <Game playerName={playerName} onReturnToMenu={returnToMenu} />
          <Leaderboard />
          <Chat playerName={playerName} />
        </>
      )}
    </div>
  )
}

export default App