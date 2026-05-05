import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-backend-we25.onrender.com"); // ← unchanged

// Each tab gets a unique random ID — persists for the tab's lifetime
const MY_ID = Math.random().toString(36).slice(2, 9);

const EMOJIS = [
  "😀","😂","😍","🥹","😎","😭","😅","🤔","🥳","😴",
  "👍","👎","👏","🙌","🤝","❤️","🔥","✨","🎉","💯",
  "😡","😱","🤯","🥺","😇","🤗","😏","🫡","💀","🫠",
];

function Chat() {
  const [messages, setMessages]         = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojis, setShowEmojis]     = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // ── SOCKET LOGIC — same as original, just adds senderId to payload ──
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socket.off("message");
  }, []);

  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = {
        text:      messageInput,
        timestamp: new Date(),
        senderId:  MY_ID,   // ← new: tells each tab who sent it
      };
      socket.emit("message", message);
      setMessageInput("");
      setShowEmojis(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const addEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .chat-wrap {
          display: flex; justify-content: center; align-items: center;
          width: 100vw; height: 100vh;
          background: #0d0f14;
          font-family: 'Sora', sans-serif;
        }
        .chat-window {
          width: 440px; height: 640px;
          background: #13161e;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          position: relative;
        }

        /* Header */
        .chat-header {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .header-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(108,142,255,0.2); color: #6c8eff;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; position: relative;
        }
        .header-avatar::after {
          content: ''; position: absolute; bottom: 1px; right: 1px;
          width: 10px; height: 10px; background: #3ecf8e;
          border-radius: 50%; border: 2px solid #13161e;
        }
        .header-name { font-size: 15px; font-weight: 600; color: #e8eaf0; }
        .header-status {
          font-size: 12px; color: #3ecf8e;
          display: flex; align-items: center; gap: 5px; margin-top: 2px;
        }
        .status-dot { width: 6px; height: 6px; background: #3ecf8e; border-radius: 50%; }
        .my-id-badge {
          margin-left: auto;
          font-size: 10px; color: #555b6e;
          background: #1a1e28;
          border: 1px solid rgba(255,255,255,0.07);
          padding: 4px 10px; border-radius: 20px;
          font-family: monospace;
        }

        /* Messages */
        .messages-area {
          flex: 1; overflow-y: auto;
          padding: 20px;
          display: flex; flex-direction: column; gap: 10px;
          scrollbar-width: thin; scrollbar-color: #222736 transparent;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: #222736; border-radius: 2px; }

        .msg-row { display: flex; flex-direction: column; }
        .msg-row.mine   { align-items: flex-end; }
        .msg-row.theirs { align-items: flex-start; }

        .bubble {
          max-width: 75%;
          padding: 10px 14px;
          font-size: 13.5px; line-height: 1.5;
          word-break: break-word;
        }
        /* YOUR messages — blue, right side */
        .bubble.mine {
          background: #4f6de0;
          color: white;
          border-radius: 18px 18px 6px 18px;
        }
        /* OTHER tab's messages — dark, left side */
        .bubble.theirs {
          background: #1a1e28;
          border: 1px solid rgba(255,255,255,0.07);
          color: #e8eaf0;
          border-radius: 18px 18px 18px 6px;
        }
        .msg-time {
          font-size: 10px; color: #555b6e;
          margin-top: 4px; padding: 0 4px;
        }
        .msg-label {
          font-size: 10px; font-weight: 600;
          margin-bottom: 3px; padding: 0 4px;
        }
        .msg-label.mine   { color: #6c8eff; }
        .msg-label.theirs { color: #8b90a0; }

        /* Empty state */
        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: #555b6e; gap: 10px; font-size: 13px;
        }
        .empty-icon { font-size: 36px; }

        /* Emoji picker */
        .emoji-picker {
          position: absolute;
          bottom: 76px; left: 16px; right: 16px;
          background: #1a1e28;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 4px;
          z-index: 10;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
        }
        .emoji-btn {
          border: none; background: transparent;
          font-size: 20px; cursor: pointer;
          padding: 4px; border-radius: 8px;
          transition: background 0.1s;
          display: flex; align-items: center; justify-content: center;
        }
        .emoji-btn:hover { background: rgba(255,255,255,0.08); }

        /* Input bar */
        .input-bar { padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.07); }
        .input-container {
          display: flex; align-items: center; gap: 8px;
          background: #1a1e28;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 10px 14px;
          transition: border-color 0.2s;
        }
        .input-container:focus-within { border-color: rgba(108,142,255,0.4); }
        .msg-input {
          flex: 1; background: transparent;
          border: none; outline: none;
          color: #e8eaf0; font-family: 'Sora', sans-serif; font-size: 13.5px;
        }
        .msg-input::placeholder { color: #555b6e; }
        .emoji-toggle {
          border: none; background: transparent;
          font-size: 18px; cursor: pointer; padding: 2px;
          border-radius: 6px; flex-shrink: 0;
          transition: transform 0.15s;
        }
        .emoji-toggle:hover { transform: scale(1.2); }
        .send-btn {
          width: 34px; height: 34px; border-radius: 10px; border: none;
          background: #6c8eff; color: white; cursor: pointer; font-size: 15px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.15s, transform 0.1s;
        }
        .send-btn:hover { background: #4f6de0; }
        .send-btn:active { transform: scale(0.95); }
      `}</style>

      <div className="chat-wrap">
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <div className="header-avatar">💬</div>
            <div>
              <div className="header-name">Global Chat</div>
              <div className="header-status">
                <span className="status-dot" /> Live
              </div>
            </div>
            {/* Small badge showing your tab's ID */}
            <div className="my-id-badge">you: #{MY_ID}</div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">💬</span>
                <span>No messages yet. Say hello!</span>
              </div>
            )}

            {messages.map((msg, index) => {
              const isMine = msg.senderId === MY_ID;
              return (
                <div key={index} className={`msg-row ${isMine ? "mine" : "theirs"}`}>
                  <div className={`msg-label ${isMine ? "mine" : "theirs"}`}>
                    {isMine ? "You" : `#${msg.senderId}`}
                  </div>
                  <div className={`bubble ${isMine ? "mine" : "theirs"}`}>
                    {msg.text}
                  </div>
                  <span className="msg-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="emoji-picker">
              {EMOJIS.map((emoji) => (
                <button key={emoji} className="emoji-btn" onClick={() => addEmoji(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="input-bar">
            <div className="input-container">
              <button className="emoji-toggle" onClick={() => setShowEmojis((v) => !v)}>
                😊
              </button>
              <input
                ref={inputRef}
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
