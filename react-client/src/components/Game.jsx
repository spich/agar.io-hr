import { useEffect, useRef, useState } from 'react'
import socketService from '../services/socket'

function Game({ playerName, onReturnToMenu }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState(null)
  const [mouseTarget, setMouseTarget] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size to fill the container
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Notify server of window resize
      if (socketService.socket) {
        socketService.socket.emit('windowResized', {
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight
        })
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Set up socket event listeners
    socketService.onWelcome((playerData, gameSizes) => {
      console.log('Welcome message received:', playerData, gameSizes)
    })

    socketService.onGameUpdate((playerData, visiblePlayers, visibleFood, visibleMass, visibleViruses) => {
      setGameState({
        playerData,
        visiblePlayers,
        visibleFood,
        visibleMass,
        visibleViruses
      })
    })

    // Game render loop
    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = '#111'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      if (!gameState) {
        // Show loading state
        ctx.fillStyle = '#ffffff'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Connecting to game...', canvas.width / 2, canvas.height / 2)
        requestAnimationFrame(gameLoop)
        return
      }

      const { playerData, visiblePlayers, visibleFood, visibleMass, visibleViruses } = gameState

      // Calculate camera position (center on player)
      const offsetX = playerData ? canvas.width / 2 - playerData.x : 0
      const offsetY = playerData ? canvas.height / 2 - playerData.y : 0

      // Draw grid
      drawGrid(ctx, offsetX, offsetY)

      // Draw food
      if (visibleFood) {
        visibleFood.forEach(food => {
          drawFood(ctx, food, offsetX, offsetY)
        })
      }

      // Draw mass food
      if (visibleMass) {
        visibleMass.forEach(mass => {
          drawMassFood(ctx, mass, offsetX, offsetY)
        })
      }

      // Draw viruses
      if (visibleViruses) {
        visibleViruses.forEach(virus => {
          drawVirus(ctx, virus, offsetX, offsetY)
        })
      }

      // Draw players
      if (visiblePlayers) {
        visiblePlayers.forEach(player => {
          drawPlayer(ctx, player, offsetX, offsetY, playerData && player.id === playerData.id)
        })
      }

      requestAnimationFrame(gameLoop)
    }

    gameLoop()

    // Send target updates regularly
    const targetInterval = setInterval(() => {
      if (socketService.isConnected) {
        socketService.sendTarget(mouseTarget)
      }
    }, 1000 / 60) // 60 FPS

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      clearInterval(targetInterval)
    }
  }, [playerName, gameState, mouseTarget])

  // Helper function to draw grid
  const drawGrid = (ctx, offsetX, offsetY) => {
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    const gridSize = 50
    
    for (let x = offsetX % gridSize; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, ctx.canvas.height)
      ctx.stroke()
    }
    
    for (let y = offsetY % gridSize; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }
  }

  // Helper function to draw food
  const drawFood = (ctx, food, offsetX, offsetY) => {
    const x = food.x + offsetX
    const y = food.y + offsetY
    
    // Only draw if visible on screen
    if (x > -20 && x < ctx.canvas.width + 20 && y > -20 && y < ctx.canvas.height + 20) {
      ctx.fillStyle = food.color || '#4CAF50'
      ctx.beginPath()
      ctx.arc(x, y, food.radius || 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // Helper function to draw mass food
  const drawMassFood = (ctx, mass, offsetX, offsetY) => {
    const x = mass.x + offsetX
    const y = mass.y + offsetY
    
    if (x > -30 && x < ctx.canvas.width + 30 && y > -30 && y < ctx.canvas.height + 30) {
      ctx.fillStyle = mass.color || '#ff6b6b'
      ctx.beginPath()
      ctx.arc(x, y, mass.radius || 8, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  // Helper function to draw viruses
  const drawVirus = (ctx, virus, offsetX, offsetY) => {
    const x = virus.x + offsetX
    const y = virus.y + offsetY
    
    if (x > -50 && x < ctx.canvas.width + 50 && y > -50 && y < ctx.canvas.height + 50) {
      ctx.fillStyle = virus.fill || '#33ff33'
      ctx.strokeStyle = virus.stroke || '#19D119'
      ctx.lineWidth = virus.strokeWidth || 3
      ctx.beginPath()
      ctx.arc(x, y, virus.radius || 35, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }
  }

  // Helper function to draw players
  const drawPlayer = (ctx, player, offsetX, offsetY, isCurrentPlayer = false) => {
    if (!player.cells) return

    player.cells.forEach(cell => {
      const x = cell.x + offsetX
      const y = cell.y + offsetY
      const radius = Math.sqrt(cell.mass) * 0.4 // Convert mass to radius
      
      if (x > -radius && x < ctx.canvas.width + radius && y > -radius && y < ctx.canvas.height + radius) {
        // Draw cell body
        ctx.fillStyle = `hsl(${player.hue || 0}, 50%, 50%)`
        ctx.strokeStyle = `hsl(${player.hue || 0}, 50%, 30%)`
        ctx.lineWidth = isCurrentPlayer ? 3 : 1
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Draw player name
        if (player.name && radius > 20) {
          ctx.fillStyle = 'white'
          ctx.font = Math.max(12, radius / 3) + 'px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(player.name, x, y + 4)
        }
      }
    })
  }

  // Handle mouse movement for targeting
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const target = {
      x: e.clientX - rect.left - canvas.width / 2,
      y: e.clientY - rect.top - canvas.height / 2
    }
    setMouseTarget(target)
  }

  // Handle keyboard controls
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onReturnToMenu()
      return
    }
    
    switch(e.key.toLowerCase()) {
      case 'w':
      case ' ':
        e.preventDefault()
        socketService.feed()
        break
      case 'r':
        e.preventDefault() 
        socketService.split()
        break
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      tabIndex={1}
      onKeyDown={handleKeyPress}
      onMouseMove={handleMouseMove}
      style={{ outline: 'none', cursor: 'crosshair' }}
    />
  )
}

export default Game