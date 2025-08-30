import { useState, useEffect, useRef } from 'react'

function Chat({ playerName }) {
  const [messages, setMessages] = useState([
    { type: 'system', text: 'Welcome to Agar.io HR!' },
    { type: 'system', text: 'Chat functionality coming soon...' },
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      // Handle commands
      if (inputValue.startsWith('-')) {
        handleCommand(inputValue)
        setInputValue('')
        return
      }

      // Add message to chat
      const newMessage = {
        type: 'player',
        text: `${playerName}: ${inputValue}`,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, newMessage])
      setInputValue('')
      
      // TODO: Send message via WebSocket to server
      console.log('Sending message:', newMessage)
    }
    
    if (e.key === 'Escape') {
      setInputValue('')
      // TODO: Return focus to game canvas
    }
  }

  const handleCommand = (message) => {
    // TODO: Implement chat commands like -help, -ping, etc.
    if (message.startsWith('-help')) {
      setMessages(prev => [...prev, {
        type: 'system',
        text: 'Available commands: -help, -ping (more coming soon...)'
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