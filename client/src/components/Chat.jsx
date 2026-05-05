import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-backend-we25.onrender.com"); // ← unchanged

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);

  // ── SOCKET LOGIC — completely unchanged from your original ──
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
    return () => {
      socket.off("message");
    };
  }, [messages]);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = { text: messageInput, timestamp: new Date() };
      socket.emit("message", message);
      setMessageInput("");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .chat-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
          background: #0d0f14;
          font-family: 'Sora', sans-serif;
        }
        .chat-window {
          width: 420px;
          height: 620px;
          background: #13161e;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
        }

        /* Header */
        .chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #13161e;
        }
        .header-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(108,142,255,0.2);
          color: #6c8eff;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600;
          position: relative;
        }
        .header-avatar::after {
          content: '';
          position: absolute; bottom: 1px; right: 1px;
          width: 10px; height: 10px;
          background: #3ecf8e;
          border-radius: 50%;
          border: 2px solid #13161e;
        }
        .header-name {
          font-size: 15px; font-weight: 600;
          color: #e8eaf0; letter-spacing: -0.2px;
        }
        .header-status {
          font-size: 12px; color: #3ecf8e;
          display: flex; align-items: center; gap: 5px; margin-top: 2px;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: #3ecf8e; border-radius: 50%;
        }
        .header-icons {
          margin-left: auto;
          display: flex; gap: 4px;
        }
        .icon-btn {
          width: 34px; height: 34px;
          border-radius: 10px; border: none;
          background: transparent; color: #555b6e;
          cursor: pointer; font-size: 15px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover { background: #1a1e28; color: #8b90a0; }

        /* Messages */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scrollbar-width: thin;
          scrollbar-color: #222736 transparent;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: #222736; border-radius: 2px; }

        .msg-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start; /* all left — since no username distinction */
        }
        .bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px 18px 18px 6px;
          background: #1a1e28;
          border: 1px solid rgba(255,255,255,0.07);
          color: #e8eaf0;
          font-size: 13.5px;
          line-height: 1.5;
          word-break: break-word;
        }
        .msg-time {
          font-size: 10px;
          color: #555b6e;
          margin-top: 4px;
          padding: 0 4px;
        }

        /* Input */
        .input-bar {
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .input-container {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #1a1e28;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 10px 14px;
          transition: border-color 0.2s;
        }
        .input-container:focus-within {
          border-color: rgba(108,142,255,0.4);
        }
        .msg-input {
          flex: 1;
          background: transparent;
          border: none; outline: none;
          color: #e8eaf0;
          font-family: 'Sora', sans-serif;
          font-size: 13.5px;
        }
        .msg-input::placeholder { color: #555b6e; }
        .send-btn {
          width: 34px; height: 34px;
          border-radius: 10px; border: none;
          background: #6c8eff; color: white;
          cursor: pointer; font-size: 15px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .send-btn:hover { background: #4f6de0; }
        .send-btn:active { transform: scale(0.95); }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #555b6e;
          gap: 10px;
          font-size: 13px;
        }
        .empty-icon { font-size: 36px; }
      `}</style>

      <div className="chat-wrap">
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <div className="header-avatar">💬</div>
            <div>
              <div className="header-name">Global Chat</div>
              <div className="header-status">
                <span className="status-dot" />
                Live
              </div>
            </div>
            <div className="header-icons">
              <button className="icon-btn">🔍</button>
              <button className="icon-btn">⋯</button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <span>No messages yet. Say hello!</span>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className="msg-row">
                <div className="bubble">{msg.text}</div>
                <span className="msg-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-bar">
            <div className="input-container">
              <input
                className="msg-input"
                type="text"
                placeholder="Type a message…"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <button className="send-btn" onClick={sendMessage}>➤</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Chat;
