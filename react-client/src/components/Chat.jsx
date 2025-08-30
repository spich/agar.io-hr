import { useState, useEffect, useRef } from 'react'
import socketService from '../services/socket'

function Chat({ playerName }) {  // eslint-disable-line no-unused-vars
  const [messages, setMessages] = useState([
    { type: 'system', text: 'Welcome to Agar.io HR!', timestamp: Date.now() },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Listen for chat messages from server
    socketService.onChatMessage((data) => {
      const newMessage = {
        type: 'player',
        text: `${data.sender}: ${data.message}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, newMessage])
    })

    // Listen for system messages
    socketService.onSystemMessage((message) => {
      const systemMessage = {
        type: 'system',
        text: message,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, systemMessage])
    })

    // Listen for player join/disconnect events
    socketService.onPlayerJoin((data) => {
      const joinMessage = {
        type: 'system', 
        text: `${data.name || 'An unnamed cell'} joined the game`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, joinMessage])
    })

    socketService.onPlayerDisconnect((data) => {
      const leaveMessage = {
        type: 'system',
        text: `${data.name || 'An unnamed cell'} left the game`, 
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, leaveMessage])
    })

    return () => {}
  }, [])

  const handleSendMessage = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Handle commands
      if (inputValue.startsWith('-')) {
        handleCommand(inputValue)
        setInputValue('')
        return
      }

      // Send message to server
      socketService.sendChatMessage(inputValue.substring(0, 35)) // Limit message length
      setInputValue('')
    }
    
    if (e.key === 'Escape') {
      setInputValue('')
      // Return focus to game canvas
      const canvas = document.querySelector('.game-canvas')
      if (canvas) canvas.focus()
    }
  }

  const handleCommand = (message) => {
    // Handle local chat commands
    if (message.startsWith('-help')) {
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Available commands: -help, -ping (more coming soon...)',
        timestamp: Date.now()
      }])
    } else if (message.startsWith('-ping')) {
      // Simple ping check
      const startTime = Date.now()
      socketService.socket?.emit('pingcheck')
      socketService.socket?.once('pongcheck', () => {
        const latency = Date.now() - startTime
        setMessages(prev => [...prev, {
          type: 'system',
          text: `Ping: ${latency}ms`,
          timestamp: Date.now()
        }])
      })
    } else {
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Unknown command. Type -help for available commands.',
        timestamp: Date.now()
      }])
    }
  }

  return (
    <div className="chat">
      <ul className="chat-messages">
        {messages.map((message, index) => (
          <li 
            key={index}
            style={{
              color: message.type === 'system' ? '#bbb' : '#fff',
              fontStyle: message.type === 'system' ? 'italic' : 'normal'
            }}
          >
            {message.text}
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
      <input
        type="text"
        className="chat-input"
        placeholder="Chat here..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleSendMessage}
        maxLength={35}
      />
    </div>
  )
}

export default Chat