import { useState, useEffect } from 'react'
import socketService from '../services/socket'

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [totalPlayers, setTotalPlayers] = useState(0)

  useEffect(() => {
    // Listen for leaderboard updates from server
    socketService.onLeaderboardUpdate((data) => {
      setLeaderboard(data.leaderboard || [])
      setTotalPlayers(data.players || 0)
    })

    // Cleanup is handled by socket service
    return () => {}
  }, [])

  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      {leaderboard.length === 0 ? (
        <p>No players yet...</p>
      ) : (
        <ol>
          {leaderboard.map((player, index) => (
            <li key={player.id || index}>
              {player.name || 'An unnamed cell'}: {Math.round(player.massTotal || 0)}
            </li>
          ))}
        </ol>
      )}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#bbb' }}>
        Total players: {totalPlayers}
      </div>
    </div>
  )
}

export default Leaderboard