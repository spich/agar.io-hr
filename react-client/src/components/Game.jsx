import { useEffect, useRef, useState } from 'react'
import socketService from '../services/socket'

function Game({ playerName, onReturnToMenu }) {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState(null)
  const [mouseTarget, setMouseTarget] = useState({ x: 0, y: 0 })
  // Use ref to access latest mouseTarget value in heartbeat interval
  const mouseTargetRef = useRef({ x: 0, y: 0 })
  
  // Arrow key movement state
  const [pressedKeys, setPressedKeys] = useState({})
  const [controlMode, setControlMode] = useState('mouse') // 'mouse' or 'keyboard'
  const pressedKeysRef = useRef({})
  const controlModeRef = useRef('mouse')

  // Separate useEffect for canvas setup and socket listeners - runs only when playerName changes
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

    // Set up keyboard event listeners for arrow keys
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        // Switch to keyboard control mode when arrow keys are used
        setControlMode('keyboard')
        controlModeRef.current = 'keyboard'
        
        // Update pressed keys state
        setPressedKeys(prev => ({ ...prev, [e.key]: true }))
        pressedKeysRef.current = { ...pressedKeysRef.current, [e.key]: true }
      }
    }

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Remove key from pressed keys
        setPressedKeys(prev => {
          const newKeys = { ...prev }
          delete newKeys[e.key]
          return newKeys
        })
        pressedKeysRef.current = { ...pressedKeysRef.current }
        delete pressedKeysRef.current[e.key]
      }
    }

    // Add keyboard listeners to window to catch arrow keys globally
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Set up socket event listeners - only once per game session
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

    // Game render loop - runs independently of mouse target changes
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

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [playerName]) // Only depends on playerName, not gameState or mouseTarget

  // Separate useEffect for heartbeat interval - runs continuously while connected
  useEffect(() => {
    let targetInterval
    
    // Helper function to calculate keyboard target based on pressed arrow keys
    const calculateKeyboardTarget = () => {
      let deltaX = 0
      let deltaY = 0
      
      if (pressedKeysRef.current.ArrowLeft) deltaX -= 1
      if (pressedKeysRef.current.ArrowRight) deltaX += 1
      if (pressedKeysRef.current.ArrowUp) deltaY -= 1
      if (pressedKeysRef.current.ArrowDown) deltaY += 1
      
      // Normalize diagonal movement to maintain consistent speed
      if (deltaX !== 0 && deltaY !== 0) {
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        deltaX /= length
        deltaY /= length
      }
      
      // Scale movement to a reasonable distance (similar to mouse range)
      const moveDistance = 200
      return {
        x: deltaX * moveDistance,
        y: deltaY * moveDistance
      }
    }
    
    // Start heartbeat interval to continuously send target to server
    const startHeartbeat = () => {
      targetInterval = setInterval(() => {
        if (socketService.isConnected) {
          let targetToSend
          
          // Use keyboard target if in keyboard mode and keys are pressed
          if (controlModeRef.current === 'keyboard' && 
              Object.keys(pressedKeysRef.current).length > 0) {
            targetToSend = calculateKeyboardTarget()
          } else {
            // Use mouse target
            targetToSend = mouseTargetRef.current
          }
          
          // Send current target as heartbeat to maintain connection
          socketService.sendTarget(targetToSend)
        }
      }, 1000 / 60) // 60 FPS - ensures smooth gameplay and maintains connection
    }

    startHeartbeat()

    return () => {
      // Clean up interval only when component unmounts or effect re-runs
      if (targetInterval) {
        clearInterval(targetInterval)
      }
    }
  }, []) // Empty dependency array - runs once and maintains interval throughout game session

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
      
      // Use the same radius calculation as the server: radius = 4 + sqrt(mass) * 6
      // This ensures the player ball grows proportionally with mass
      const radius = 4 + Math.sqrt(cell.mass) * 6
      
      if (x > -radius && x < ctx.canvas.width + radius && y > -radius && y < ctx.canvas.height + radius) {
        // Draw cell body
        ctx.fillStyle = `hsl(${player.hue || 0}, 50%, 50%)`
        ctx.strokeStyle = `hsl(${player.hue || 0}, 50%, 30%)`
        ctx.lineWidth = isCurrentPlayer ? 3 : 1
        
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Draw center dot (stays in the center of the ball)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()

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

  // Handle mouse movement for targeting - switches back to mouse control when mouse moves
  const handleMouseMove = (e) => {
    // Switch back to mouse control when mouse is moved after keyboard usage
    if (controlMode === 'keyboard') {
      setControlMode('mouse')
      controlModeRef.current = 'mouse'
    }
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const target = {
      x: e.clientX - rect.left - canvas.width / 2,
      y: e.clientY - rect.top - canvas.height / 2
    }
    setMouseTarget(target)
    // Update ref so heartbeat interval can access latest value
    mouseTargetRef.current = target
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