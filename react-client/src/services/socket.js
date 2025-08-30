import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.callbacks = {}
  }

  // Connect to the server
  connect(serverUrl = 'http://localhost:3000') {
    if (this.socket) {
      return this.socket
    }

    this.socket = io(serverUrl, {
      query: { type: 'player' }
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    return this.socket
  }

  // Join game with player name
  joinGame(playerName) {
    if (this.socket) {
      const playerData = {
        name: playerName,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      }
      this.socket.emit('respawn', playerData)
    }
  }

  // Send movement target
  sendTarget(target) {
    if (this.socket) {
      this.socket.emit('0', target) // Original client uses '0' for heartbeat/target
    }
  }

  // Send split command
  split() {
    if (this.socket) {
      this.socket.emit('2')
    }
  }

  // Send feed command  
  feed() {
    if (this.socket) {
      this.socket.emit('1')
    }
  }

  // Send chat message
  sendChatMessage(message) {
    if (this.socket) {
      this.socket.emit('playerChat', {
        sender: 'player', // Will be set by server
        message: message
      })
    }
  }

  // Listen for game state updates
  onGameUpdate(callback) {
    if (this.socket) {
      this.socket.on('serverTellPlayerMove', callback)
    }
  }

  // Listen for leaderboard updates
  onLeaderboardUpdate(callback) {
    if (this.socket) {
      this.socket.on('leaderboard', callback)
    }
  }

  // Listen for chat messages
  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('serverSendPlayerChat', callback)
    }
  }

  // Listen for system messages
  onSystemMessage(callback) {
    if (this.socket) {
      this.socket.on('serverMSG', callback)
    }
  }

  // Listen for player join/disconnect events
  onPlayerJoin(callback) {
    if (this.socket) {
      this.socket.on('playerJoin', callback)
    }
  }

  onPlayerDisconnect(callback) {
    if (this.socket) {
      this.socket.on('playerDisconnect', callback)
    }
  }

  // Listen for welcome message (game initialization)
  onWelcome(callback) {
    if (this.socket) {
      this.socket.on('welcome', callback)
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Check if connected
  getConnectionStatus() {
    return this.isConnected
  }
}

// Create a singleton instance
const socketService = new SocketService()

export default socketService