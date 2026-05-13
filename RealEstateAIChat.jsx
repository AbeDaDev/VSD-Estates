import { useState, useRef, useEffect } from "react";
import aiAgentImage from "./images/AI Agent.png";

const SYSTEM_PROMPT = `You are Victor, an expert real estate AI assistant helping clients find their dream home. You work alongside a real estate agent and your job is to:

1. Understand the client's needs: budget, location preferences, home size (bedrooms/bathrooms), must-haves (garage, yard, pool, etc.), lifestyle (commute, schools, walkability), and timeline.
2. Ask smart, natural follow-up questions one at a time — don't overwhelm with a list of questions.
3. Help narrow down neighborhoods, home styles, and features based on what they share.
4. Provide helpful context about home-buying (mortgage basics, what to look for in a home tour, etc.) when relevant.
5. Summarize the client's preferences clearly so the agent can act on them.
6. Be warm, encouraging, and conversational — not robotic.

Start by warmly greeting the client and asking one opening question to understand what brings them here today.

Keep responses concise and friendly — this is a chat, not an essay. Use short paragraphs. Occasionally use an emoji to keep the tone warm 🏡`;

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "12px 16px" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: "50%", background: "#c9a96e",
        animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`,
        display: "inline-block"
      }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
  </div>
);

const Message = ({ msg }) => {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12, animation: "fadeUp 0.3s ease"
    }}>
      {!isUser && (
        <div style={{
          width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #c9a96e, #8b6914)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, marginRight: 12, flexShrink: 0, marginTop: 2,
          boxShadow: "0 2px 8px rgba(201,169,110,0.4)"
        }}>
          <img src={aiAgentImage} alt="AI agent" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{
        maxWidth: "75%", padding: "11px 16px",
        background: isUser
          ? "linear-gradient(135deg, #1a1a2e, #16213e)"
          : "rgba(255,255,255,0.06)",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        border: isUser ? "none" : "1px solid rgba(201,169,110,0.2)",
        color: isUser ? "#f0e6d3" : "#e8ddd0",
        fontSize: 14, lineHeight: 1.6,
        boxShadow: isUser ? "0 2px 12px rgba(26,26,46,0.4)" : "0 2px 12px rgba(0,0,0,0.2)"
      }}>
        {msg.content}
      </div>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
};

export default function RealEstateAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      sendToAI([], true);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendToAI = async (history, isGreeting = false) => {
    setIsLoading(true);
    try {
      const msgs = isGreeting
        ? [{ role: "user", content: "Hello, I'm looking for a home." }]
        : history;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: msgs
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I'm having trouble connecting. Please try again.";
      const assistantMsg = { role: "assistant", content: reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    await sendToAI(newMessages);
  };

  const handleSummarize = async () => {
    if (messages.length < 4) return;
    setShowSummary(true);
    setSummary("Generating summary...");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a real estate assistant. Given a conversation, produce a clean structured summary for the agent with: Budget, Location Preferences, Home Requirements, Lifestyle Needs, Timeline, and any Red Flags or Notes. Be concise and use bullet points.",
          messages: [
            ...messages,
            { role: "user", content: "Please summarize this client's home requirements for my agent." }
          ]
        })
      });
      const data = await res.json();
      setSummary(data.content?.[0]?.text || "Could not generate summary.");
    } catch {
      setSummary("Failed to generate summary.");
    }
  };

  const quickPrompts = [
    "I'm a first-time buyer 🏠",
    "Looking for investment property 📈",
    "Relocating for work 🚗",
    "Upsizing for family 👨‍👩‍👧"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position: "fixed", bottom: 112, right: 28, zIndex: 1000,
          width: 72, height: 72, borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #c9a96e, #8b6914)",
          boxShadow: "0 6px 28px rgba(201,169,110,0.55)",
          cursor: "pointer", fontSize: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="Chat with Victor"
      >
        {isOpen ? "✕" : <img src={aiAgentImage} alt="AI agent" style={{ width: "76%", height: "76%", borderRadius: "50%", objectFit: "cover" }} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 192, right: 28, zIndex: 999,
          width: 380, height: 580, borderRadius: 20,
          background: "linear-gradient(160deg, #0f0f1a 0%, #1a1a2e 50%, #0d1117 100%)",
          border: "1px solid rgba(201,169,110,0.25)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,169,110,0.1)",
          display: "flex", flexDirection: "column",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)"
        }}>
          <style>{`
            @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.3); border-radius: 2px; }
          `}</style>

          {/* Header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(201,169,110,0.15)",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a96e, #8b6914)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, boxShadow: "0 3px 14px rgba(201,169,110,0.45)"
              }}>
                <img src={aiAgentImage} alt="AI agent" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color: "#f0e6d3", fontWeight: "bold", fontSize: 15, letterSpacing: "0.5px" }}>Victor</div>
                <div style={{ color: "#c9a96e", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase" }}>AI Home Advisor</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {messages.length >= 4 && (
                <button onClick={handleSummarize} style={{
                  background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)",
                  color: "#c9a96e", borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                  fontSize: 11, letterSpacing: "0.5px"
                }} title="Generate client summary for agent">
                  📋 Summary
                </button>
              )}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: "#4ade80",
                boxShadow: "0 0 8px #4ade80", alignSelf: "center"
              }} />
            </div>
          </div>

          {/* Summary Modal */}
          {showSummary && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 20,
              background: "rgba(10,10,20,0.97)", zIndex: 10,
              padding: 20, display: "flex", flexDirection: "column"
            }}>
              <div style={{ color: "#c9a96e", fontSize: 13, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>
                📋 Client Summary for Agent
              </div>
              <div style={{
                flex: 1, overflowY: "auto", color: "#e8ddd0", fontSize: 13, lineHeight: 1.8,
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14,
                border: "1px solid rgba(201,169,110,0.15)", whiteSpace: "pre-wrap"
              }}>
                {summary}
              </div>
              <button onClick={() => setShowSummary(false)} style={{
                marginTop: 12, background: "linear-gradient(135deg, #c9a96e, #8b6914)",
                border: "none", color: "#0f0f1a", borderRadius: 10, padding: "10px",
                cursor: "pointer", fontSize: 13, fontWeight: "bold"
              }}>
                Back to Chat
              </button>
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
            {messages.length === 0 && !isLoading && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <div style={{ width: 84, height: 84, margin: "0 auto 12px", borderRadius: "50%", overflow: "hidden", boxShadow: "0 3px 14px rgba(201,169,110,0.45)" }}>
                  <img src={aiAgentImage} alt="AI agent" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ color: "#c9a96e", fontSize: 13, letterSpacing: "0.5px" }}>Connecting to Victor...</div>
              </div>
            )}
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (show only at start) */}
          {messages.length <= 1 && !isLoading && (
            <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {quickPrompts.map(p => (
                <button key={p} onClick={() => { setInput(p); setTimeout(() => inputRef.current?.focus(), 0); }}
                  style={{
                    background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)",
                    color: "#c9a96e", borderRadius: 20, padding: "5px 12px",
                    cursor: "pointer", fontSize: 11, whiteSpace: "nowrap"
                  }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "12px 16px", borderTop: "1px solid rgba(201,169,110,0.15)",
            display: "flex", gap: 10, alignItems: "flex-end"
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about homes, neighborhoods, budget..."
              rows={1}
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,169,110,0.2)", borderRadius: 12,
                color: "#f0e6d3", padding: "10px 14px", fontSize: 13,
                fontFamily: "inherit", outline: "none", resize: "none",
                lineHeight: 1.5, maxHeight: 100, overflowY: "auto",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "rgba(201,169,110,0.6)"}
              onBlur={e => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: 40, height: 40, borderRadius: "50%", border: "none",
                background: input.trim() && !isLoading
                  ? "linear-gradient(135deg, #c9a96e, #8b6914)"
                  : "rgba(201,169,110,0.15)",
                color: input.trim() && !isLoading ? "#0f0f1a" : "#c9a96e",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
