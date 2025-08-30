import { useState, useEffect } from 'react'

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([
    { name: 'Player1', score: 1250 },
    { name: 'Player2', score: 980 },
    { name: 'Player3', score: 750 },
    { name: 'Player4', score: 620 },
    { name: 'Player5', score: 500 },
  ])

  useEffect(() => {
    // TODO: Connect to real leaderboard data via WebSocket
    // This is placeholder data that simulates changing scores
    const interval = setInterval(() => {
      setLeaderboard(prev => 
        prev.map(player => ({
          ...player,
          score: Math.max(0, player.score + Math.floor(Math.random() * 21) - 10)
        })).sort((a, b) => b.score - a.score)
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      <ol>
        {leaderboard.map((player, index) => (
          <li key={index}>
            {player.name}: {player.score}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default Leaderboard