import { useEffect, useRef, useState } from 'react'

const GREETING = {
  role: 'model',
  text: "Hi! I'm Sai's AI assistant. Ask me anything about his projects, skills, or background.",
}

const suggestions = ['What has Sai built?', "What's his tech stack?", 'Is he open to opportunities?']

// Floating chat widget backed by /api/chat (Gemini, server-side key).
export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages, busy, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    const next = [...messages, { role: 'user', text: trimmed }]
    setMessages(next)
    setInput('')
    setBusy(true)

    try {
      // Skip the canned greeting; send the recent turns for context.
      const payload = next.filter((m) => m !== GREETING).slice(-12)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })
      const data = await res.json()
      if (!res.ok || !data.reply) throw new Error(data.error || 'No reply')
      setMessages((m) => [...m, { role: 'model', text: data.reply }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'model',
          text: "Sorry — I couldn't reach my brain just now. Please try again, or email Sai directly at bikumandlasaisatwik@gmail.com.",
          error: true,
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        className={`chatbot-fab ${open ? 'chatbot-fab--open' : ''}`}
        aria-label={open ? 'Close chat' : 'Chat with my AI assistant'}
        title={open ? 'Close chat' : 'Chat with my AI assistant'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-8 8H4l1.6-3.2A8 8 0 1 1 21 12z" />
            <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth="2.6" />
          </svg>
        )}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Chat with Sai's AI assistant">
          <header className="chatbot-head">
            <span className="chatbot-dot" aria-hidden="true" />
            <div>
              <strong>Sai's AI Assistant</strong>
              <p>Powered by Gemini</p>
            </div>
          </header>

          <div className="chatbot-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chatbot-msg chatbot-msg--${m.role === 'user' ? 'user' : 'bot'}${m.error ? ' chatbot-msg--error' : ''}`}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="chatbot-msg chatbot-msg--bot chatbot-typing" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="chatbot-suggestions">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="chatbot-inputrow"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={500}
              placeholder="Ask about Sai…"
              onChange={(e) => setInput(e.target.value)}
              aria-label="Your question"
            />
            <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.5 1.5 7 9M14.5 1.5l-4.8 13-2.7-5.5L1.5 6.3l13-4.8z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
