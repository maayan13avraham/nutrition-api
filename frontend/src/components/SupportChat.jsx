import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect, joinRoom, sendMessage, emitTyping, disconnect } from '../services/socketService';
import './SupportChat.css';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.userId;

  useEffect(() => {
    const socket = connect();
    joinRoom();

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpenRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on('user_typing', ({ firstName }) => {
      setTypingUser(firstName);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingUser(''), 2000);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('online_users');
      disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const handleChange = useCallback((e) => {
    setInput(e.target.value);
    emitTyping();
  }, []);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  }, [input]);

  return (
    <>
      <button
        className="support-chat-fab"
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        title="Nutritionist Support Chat"
        aria-label="Open support chat"
      >
        💬
        {unreadCount > 0 && (
          <span className="support-chat-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="support-chat-panel">
          <div className="ai-chat-header-bar support-chat-header">
            <span className="ai-icon">👨‍⚕️</span>
            <span className="ai-title">תמיכת תזונאי</span>
            <span className="support-online-count">
              {onlineUsers.length} מחוברים
            </span>
            <button
              className="support-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="support-chat-body ai-chat-body">
            {messages.length === 0 && (
              <p className="support-chat-empty">שלח הודעה לתמיכת תזונאי 👋</p>
            )}
            {messages.map((m, i) =>
              m.system ? (
                <div key={i} className="support-chat-system">
                  {m.content}
                </div>
              ) : (
                <div
                  key={i}
                  className={`chat-bubble ${
                    m.userId === currentUserId
                      ? 'chat-bubble-user'
                      : 'chat-bubble-assistant'
                  }`}
                >
                  {m.userId !== currentUserId && (
                    <span className="support-sender">{m.firstName}</span>
                  )}
                  {m.content}
                </div>
              )
            )}
            {typingUser && (
              <div className="support-typing">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
                <span className="support-typing-name">{typingUser} מקליד...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="ai-input-row" onSubmit={handleSend} dir="rtl">
            <input
              className="ai-input"
              placeholder="כתוב הודעה..."
              value={input}
              onChange={handleChange}
              autoFocus
            />
            <button className="ai-send-btn" type="submit" disabled={!input.trim()}>
              שלח
            </button>
          </form>
        </div>
      )}
    </>
  );
}
