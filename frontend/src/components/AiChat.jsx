import React, { useState, useEffect, useRef } from 'react';
import { streamChat } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import './AiChat.css';

// Static UI strings for both supported languages
const UI = {
  he: {
    title: 'עוזר התזונה החכם',
    placeholder: 'שאל שאלה על התפריט שלך...',
    send: 'שלח',
    // Auto-sent on mount to kick off an explanation of the proposed menu
    initMsg: 'הסבר לי מדוע התפריט הזה מתאים לי ומה היתרונות שלו.',
    error: 'אירעה שגיאה. נסה שוב.',
    suggestions: [
      'מה היתרונות של התפריט הזה?',
      'הצע חלופה לארוחת הצהריים',
      'תן לי טיפים תזונתיים',
      'איך התפריט עוזר למטרה שלי?',
    ],
  },
  en: {
    title: 'Smart Nutrition Assistant',
    placeholder: 'Ask a question about your menu...',
    send: 'Send',
    initMsg: 'Explain why this menu suits me and what its benefits are.',
    error: 'An error occurred. Please try again.',
    suggestions: [
      'What are the benefits of this menu?',
      'Suggest a lunch alternative',
      'Give me nutritional tips',
      'How does this menu help my goal?',
    ],
  },
};

// AI chat widget that explains the personalized menu and answers user questions via streaming
export default function AiChat({ profile, menu }) {
  const { lang } = useLanguage();
  const ui = UI[lang] || UI.he;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  // Ref prevents the auto-send from firing more than once across re-renders
  const initialized = useRef(false);
  // Always reflects the latest messages array without causing stale closures in async callbacks
  const messagesRef = useRef([]);
  const bottomRef = useRef(null);
  // Keep profile/menu in refs so sendMessage always reads the current dashboard state,
  // even if props changed between the last render and when an async callback fires
  const profileRef = useRef(profile);
  const menuRef = useRef(menu);

  // Keep the ref in sync with state so streaming callbacks always append to the latest history
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Sync profile/menu refs immediately whenever the dashboard passes updated props
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { menuRef.current = menu; }, [menu]);

  // Scroll to the newest message whenever the chat history grows
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send an initial question on mount to immediately explain the proposed menu
  useEffect(() => {
    if (!initialized.current && profile && menu) {
      initialized.current = true;
      sendMessage(ui.initMsg);
    }
  }, [profile, menu]);

  // Append the user message and an empty assistant placeholder, then start the stream
  async function sendMessage(text) {
    if (isStreaming) return;

    const history = [...messagesRef.current, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setIsStreaming(true);

    // Explicitly extract the fields the backend mealLine() reads so the payload is a clean
    // minimal object regardless of what extra properties Sequelize may attach to the recipe.
    const extractMeal = (recipe) => {
      if (!recipe) return null;
      return {
        name: recipe.name,
        calories: recipe.calories,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        mealType: recipe.mealType,
      };
    };
    const currentMenu = menuRef.current || {};
    const safeMenu = {
      breakfast: extractMeal(currentMenu.breakfast),
      lunch: extractMeal(currentMenu.lunch),
      dinner: extractMeal(currentMenu.dinner),
    };

    // Use refs so the request always carries the current dashboard menu/profile,
    // even if this function is called from a stale closure or before re-render settles
    await streamChat(
      { profile: profileRef.current, menu: safeMenu, messages: history, lang },
      // Append each arriving text chunk to the last (assistant) message
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;
          updated[last] = { ...updated[last], content: updated[last].content + chunk };
          return updated;
        });
      },
      () => setIsStreaming(false),
      // On error, replace the empty assistant message with the error string
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

  // Submit the text input as a new user message
  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
  }

  // Quick-suggestion chips are only shown before the first back-and-forth exchange
  const showSuggestions = messages.length <= 1 && !isStreaming;

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
              // Show animated typing dots while the last assistant message is still streaming
              : msg.role === 'assistant' && isStreaming && i === messages.length - 1
              ? <span className="typing-indicator"><span /><span /><span /></span>
              : null}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {showSuggestions && (
        <div className="ai-suggestions">
          {ui.suggestions.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
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
