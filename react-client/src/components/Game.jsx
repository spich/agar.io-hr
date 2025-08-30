import { useEffect, useRef } from 'react'

function Game({ playerName, onReturnToMenu }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // Initialize canvas context
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size to fill the container
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Placeholder game rendering
    const drawGame = () => {
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw grid pattern (placeholder)
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      const gridSize = 50
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw placeholder player cell
      ctx.fillStyle = '#2ecc71'
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, 2 * Math.PI)
      ctx.fill()
      
      // Draw player name
      ctx.fillStyle = 'white'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(playerName, canvas.width / 2, canvas.height / 2 + 5)
    }

    drawGame()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [playerName])

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onReturnToMenu()
    }
    // TODO: Add game controls (space for split, w for feed, etc.)
  }

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      tabIndex={1}
      onKeyDown={handleKeyPress}
      style={{ outline: 'none' }}
    />
  )
}

export default Game