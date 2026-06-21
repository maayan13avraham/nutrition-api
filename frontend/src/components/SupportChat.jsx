import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect, sendSupportMessage, onNutritionistStatus, offNutritionistStatus } from '../services/socketService';
import api from '../services/api';
import './SupportChat.css';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNutritionistOnline, setIsNutritionistOnline] = useState(false);

  const bottomRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // Load persisted chat history once on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    if (!stored.userId) return;
    api.get(`/api/chat/history/${stored.userId}`)
      .then(({ data }) => {
        if (!data.success) return;
        setMessages(data.data.map((m) => ({
          self:      m.senderRole === 'user',
          from:      m.senderRole === 'nutritionist' ? (m.senderName || 'תזונאי') : undefined,
          content:   m.content,
          timestamp: m.createdAt,
        })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handlePrivateMessage = ({ from, content, timestamp }) => {
      setMessages((prev) => [...prev, { self: false, from, content, timestamp }]);
      if (!isOpenRef.current) setUnreadCount((c) => c + 1);
    };

    const handleNutritionistStatus = ({ online }) => {
      setIsNutritionistOnline(online);
    };

    const socket = connect();
    socket.on('private_message', handlePrivateMessage);
    onNutritionistStatus(handleNutritionistStatus);

    return () => {
      socket.off('private_message', handlePrivateMessage);
      offNutritionistStatus(handleNutritionistStatus);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const handleSend = useCallback((e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendSupportMessage(trimmed);
    setMessages((prev) => [...prev, {
      self: true,
      content: trimmed,
      timestamp: new Date().toISOString(),
    }]);
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
            <button
              className="support-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className={`nutritionist-status-badge${isNutritionistOnline ? ' status-online' : ' status-offline'}`}>
            <span className="status-dot" />
            <span>{isNutritionistOnline ? 'תזונאי זמין בצ\'אט' : 'אין תזונאי זמין כרגע'}</span>
          </div>

          <div className="support-chat-body ai-chat-body">
            {messages.length === 0 && (
              <p className="support-chat-empty">שלח הודעה לתמיכת תזונאי 👋</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-bubble ${m.self ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
              >
                {!m.self && <span className="support-sender">{m.from}</span>}
                {m.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form className="ai-input-row" onSubmit={handleSend} dir="rtl">
            <input
              className="ai-input"
              placeholder="כתוב הודעה..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
