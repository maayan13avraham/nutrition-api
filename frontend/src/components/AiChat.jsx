import React, { useState, useEffect, useRef } from 'react';
import { streamChat } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import './AiChat.css';

const UI = {
  he: {
    title: 'עוזר התזונה החכם',
    placeholder: 'שאל שאלה על התפריט שלך...',
    send: 'שלח',
    error: 'אירעה שגיאה. נסה שוב.',
    suggestions: [
      'הסבר לי על הערכים התזונתיים של התפריט שלי',
      'האם יש חלבון מספק בתפריט הנוכחי?',
      'הצע לי תחליף בריא לאחת הארוחות',
    ],
  },
  en: {
    title: 'Smart Nutrition Assistant',
    placeholder: 'Ask a question about your menu...',
    send: 'Send',
    error: 'An error occurred. Please try again.',
    suggestions: [
      'Explain the nutritional values of my menu',
      'Is there enough protein in the current menu?',
      'Suggest a healthy alternative for one of the meals',
    ],
  },
};

export default function AiChat({ profile, menu }) {
  const { lang } = useLanguage();
  const ui = UI[lang] || UI.he;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesRef = useRef([]);
  const bottomRef = useRef(null);
  const profileRef = useRef(profile);
  const menuRef = useRef(menu);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { menuRef.current = menu; }, [menu]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function extractMeal(recipe) {
    if (!recipe || !recipe.name) return null;
    return {
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      mealType: recipe.mealType,
    };
  }

  async function sendMessage(text, currentProfile = profileRef.current, currentMenu = menuRef.current) {
    if (isStreaming) return;

    const history = [...messagesRef.current, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setIsStreaming(true);

    const safeMenu = {
      breakfast: extractMeal(currentMenu?.breakfast),
      lunch:     extractMeal(currentMenu?.lunch),
      dinner:    extractMeal(currentMenu?.dinner),
    };

    await streamChat(
      { profile: currentProfile, menu: safeMenu, messages: history, lang },
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;
          updated[last] = { ...updated[last], content: updated[last].content + chunk };
          return updated;
        });
      },
      () => setIsStreaming(false),
      () => {
        setIsStreaming(false);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;
          if (!updated[last].content) {
            updated[last] = { ...updated[last], content: ui.error };
          }
          return updated;
        });
      }
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim(), profile, menu);
  }

  const isEmpty = messages.length === 0;

  return (
    <section className="ai-chat-section">
      <div className="ai-chat-header-bar">
        <span className="ai-icon">🤖</span>
        <span className="ai-title">{ui.title}</span>
      </div>

      <div className="ai-chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble chat-bubble-${msg.role}`}>
            {msg.content
              ? msg.content
              : msg.role === 'assistant' && isStreaming && i === messages.length - 1
              ? <span className="typing-indicator"><span /><span /><span /></span>
              : null}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isEmpty && !isStreaming && (
        <div className="ai-suggestions">
          {ui.suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s, profile, menu)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ai-input-row" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        <input
          className="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={ui.placeholder}
          disabled={isStreaming}
        />
        <button type="submit" className="ai-send-btn" disabled={isStreaming || !input.trim()}>
          {isStreaming ? '⏳' : ui.send}
        </button>
      </form>
    </section>
  );
}
