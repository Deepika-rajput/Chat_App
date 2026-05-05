

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";   // ← already in your project

// ── 1. SOCKET SERVER URL ──────────────────────────────────────
//    Change this to your backend URL (Render / localhost)
const SOCKET_URL = "https://your-backend.onrender.com"; // ← CHANGE

// ── 2. YOUR NAME / USERNAME ───────────────────────────────────
//    Replace with however you store the logged-in user's name
const MY_NAME = "You"; // ← CHANGE  (e.g. from localStorage, props, context)

export default function App() {
  // ── 3. CONTACTS LIST ─────────────────────────────────────────
  //    Replace this static array with your real contacts/rooms
  //    Each object needs: { id, name, initials, preview, time, unread, online }
  const [contacts, setContacts] = useState([
    { id: 1, name: "Ananya Raj",   initials: "AR", preview: "sounds good!",      time: "2m",       unread: 3, online: true,  color: "a" },
    { id: 2, name: "Sahil Kumar",  initials: "SK", preview: "can you review?",   time: "18m",      unread: 0, online: true,  color: "b" },
    { id: 3, name: "Priya Mehta",  initials: "PM", preview: "sent a file",       time: "1h",       unread: 1, online: false, color: "c" },
    { id: 4, name: "Rohan Singh",  initials: "RS", preview: "tomorrow works",    time: "3h",       unread: 0, online: false, color: "d" },
    { id: 5, name: "Neha Verma",   initials: "NV", preview: "Thanks!",           time: "Yesterday",unread: 0, online: false, color: "e" },
  ]); // ← CHANGE  (fetch from your API or derive from Socket.IO room list)

  // ── 4. ACTIVE CONTACT ────────────────────────────────────────
  const [activeContact, setActiveContact] = useState(contacts[0]); // ← CHANGE if needed

  // ── 5. MESSAGES ──────────────────────────────────────────────
  //    Replace this with your real message state.
  //    Each message: { id, text, sender, time, isMine }
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Are you free for a quick call later today? 👋", sender: "Ananya Raj", time: "10:24 AM", isMine: false },
    { id: 2, text: "Hey Ananya! Yeah, I'm free after 3 PM. Does that work?",  sender: MY_NAME,      time: "10:26 AM", isMine: true  },
    { id: 3, text: "Perfect! 3 PM works great.",                              sender: "Ananya Raj", time: "10:27 AM", isMine: false },
    { id: 4, text: "Also, can you look at the design files before the call?", sender: "Ananya Raj", time: "10:28 AM", isMine: false },
    { id: 5, text: "Got it, will review now. The color choices look really clean 🎨", sender: MY_NAME, time: "10:45 AM", isMine: true },
    { id: 6, text: "Thank you!! Spent a lot of time on those 😅 sounds good!", sender: "Ananya Raj", time: "10:47 AM", isMine: false },
  ]); // ← CHANGE  (load from your API on contact switch)

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping]   = useState(true); // ← CHANGE  (drive with socket "typing" event)
  const messagesEndRef = useRef(null);
  const socketRef      = useRef(null);

  // ── 6. SOCKET.IO SETUP ───────────────────────────────────────
  useEffect(() => {
    socketRef.current = io(SOCKET_URL); // ← CHANGE  (add auth options if needed)

    // ── 7. RECEIVE A MESSAGE ─────────────────────────────────────
    //    Your backend emits "message" — adjust event name if different
    socketRef.current.on("message", (data) => { // ← CHANGE event name if needed
      setMessages((prev) => [
        ...prev,
        {
          id:     Date.now(),
          text:   data.text,    // ← CHANGE  (match your payload shape)
          sender: data.sender,  // ← CHANGE
          time:   new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMine: false,
        },
      ]);
    });

    // ── 8. TYPING INDICATOR ──────────────────────────────────────
    socketRef.current.on("typing", () => setIsTyping(true));   // ← CHANGE event name if needed
    socketRef.current.on("stopTyping", () => setIsTyping(false)); // ← CHANGE event name if needed

    return () => socketRef.current.disconnect();
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── 9. SEND A MESSAGE ─────────────────────────────────────────
  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg = {
      text:   inputText,
      sender: MY_NAME,          // ← CHANGE
      room:   activeContact.id, // ← CHANGE  (use room name / contact id your backend expects)
    };
    socketRef.current.emit("message", msg); // ← CHANGE event name if needed
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: inputText, sender: MY_NAME, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isMine: true },
    ]);
    setInputText("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── AVATAR COLOR MAP ─────────────────────────────────────────
  const avatarStyle = {
    a: { background: "rgba(108,142,255,0.2)", color: "#6c8eff" },
    b: { background: "rgba(62,207,142,0.2)",  color: "#3ecf8e" },
    c: { background: "rgba(245,166,35,0.2)",  color: "#f5a623" },
    d: { background: "rgba(232,121,160,0.2)", color: "#e879a0" },
    e: { background: "rgba(168,139,250,0.2)", color: "#a78bfa" },
  };

  return (
    <>
      {/* ── GOOGLE FONT (add to your index.html <head> instead for production) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; }
        :root {
          --bg:      #0d0f14;
          --bg2:     #13161e;
          --bg3:     #1a1e28;
          --bg4:     #222736;
          --border:  rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --text:    #e8eaf0;
          --text2:   #8b90a0;
          --text3:   #555b6e;
          --accent:  #6c8eff;
          --accent2: #4f6de0;
          --green:   #3ecf8e;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 2px; }
        textarea { scrollbar-width: none; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--bg)", color:"var(--text)", fontFamily:"'Sora', sans-serif", fontSize:14 }}>

        {/* ════════════════════════════════
            LEFT SIDEBAR — CONTACTS
            ════════════════════════════════ */}
        <aside style={{ width:280, minWidth:280, background:"var(--bg2)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>

          {/* Logo + Search */}
          <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, background:"var(--accent)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💬</div>
              {/* ── 10. APP NAME ── ← CHANGE */}
              <span style={{ fontSize:16, fontWeight:600, letterSpacing:"-0.3px" }}>Chat<span style={{ color:"var(--accent)" }}>Flow</span></span>
            </div>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:13 }}>🔍</span>
              <input placeholder="Search conversations…" style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px 8px 34px", color:"var(--text)", fontFamily:"'Sora',sans-serif", fontSize:13, outline:"none" }} />
            </div>
          </div>

          {/* Contact list */}
          <div style={{ flex:1, overflowY:"auto" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text3)", padding:"14px 20px 8px" }}>Direct Messages</div>

            {/* ── 11. MAP YOUR CONTACTS ── */}
            {contacts.map((c) => (
              <div key={c.id}
                onClick={() => setActiveContact(c)}
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:"10px 20px",
                  cursor:"pointer", position:"relative", background: activeContact.id === c.id ? "var(--bg3)" : "transparent",
                  transition:"background 0.15s",
                }}>
                {activeContact.id === c.id && (
                  <div style={{ position:"absolute", left:0, top:8, bottom:8, width:3, background:"var(--accent)", borderRadius:"0 3px 3px 0" }} />
                )}
                {/* Avatar */}
                <div style={{ width:40, height:40, minWidth:40, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, position:"relative", ...avatarStyle[c.color] }}>
                  {c.initials}
                  {c.online && <div style={{ position:"absolute", bottom:1, right:1, width:9, height:9, background:"var(--green)", borderRadius:"50%", border:"2px solid var(--bg2)" }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.name}</div>
                  <div style={{ fontSize:12, color:"var(--text2)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:2 }}>{c.preview}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                  <span style={{ fontSize:11, color:"var(--text3)" }}>{c.time}</span>
                  {c.unread > 0 && <span style={{ background:"var(--accent)", color:"white", fontSize:10, fontWeight:600, padding:"2px 6px", borderRadius:20 }}>{c.unread}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom — current user */}
          <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, minWidth:34, borderRadius:"50%", background:"rgba(108,142,255,0.2)", color:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, position:"relative" }}>
              {MY_NAME.slice(0,2).toUpperCase()} {/* ← CHANGE: user initials */}
              <div style={{ position:"absolute", bottom:1, right:1, width:9, height:9, background:"var(--green)", borderRadius:"50%", border:"2px solid var(--bg2)" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500 }}>{MY_NAME}</div> {/* ← CHANGE */}
              <div style={{ fontSize:11, color:"var(--green)" }}>● Active now</div>
            </div>
            <button style={{ width:32, height:32, borderRadius:8, border:"none", background:"transparent", color:"var(--text2)", cursor:"pointer", fontSize:14 }}>⚙️</button>
          </div>
        </aside>

        {/* ════════════════════════════════
            MAIN CHAT AREA
            ════════════════════════════════ */}
        <main style={{ flex:1, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", background:"var(--bg)" }}>

          {/* Chat header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, minWidth:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, position:"relative", ...avatarStyle[activeContact.color] }}>
                {activeContact.initials}
                {activeContact.online && <div style={{ position:"absolute", bottom:1, right:1, width:9, height:9, background:"var(--green)", borderRadius:"50%", border:"2px solid var(--bg)" }} />}
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.2px" }}>{activeContact.name}</div>
                <div style={{ fontSize:12, color:"var(--green)", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:6, height:6, background:"var(--green)", borderRadius:"50%", display:"inline-block" }} />
                  {activeContact.online ? "Active now" : "Offline"}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {["📞","📹","🔍","⋯"].map((icon, i) => (
                <button key={i} style={{ width:36, height:36, borderRadius:10, border:"none", background:"transparent", color:"var(--text2)", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>

            <div style={{ display:"flex", alignItems:"center", gap:12, color:"var(--text3)", fontSize:11, fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase" }}>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
              Today
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
            </div>

            {/* ── 12. RENDER MESSAGES ── */}
            {messages.map((msg) => (
              <div key={msg.id} style={{ display:"flex", flexDirection:"column", alignItems: msg.isMine ? "flex-end" : "flex-start" }}>
                {!msg.isMine && <div style={{ fontSize:11, fontWeight:600, color:"var(--text2)", marginBottom:3, paddingLeft:40 }}>{msg.sender}</div>}
                <div style={{ display:"flex", alignItems:"flex-end", gap:10, flexDirection: msg.isMine ? "row-reverse" : "row" }}>
                  {!msg.isMine && (
                    <div style={{ width:28, height:28, minWidth:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, ...avatarStyle[activeContact.color] }}>
                      {activeContact.initials}
                    </div>
                  )}
                  <div>
                    <div style={{
                      maxWidth:420, padding:"10px 14px", lineHeight:1.5, fontSize:13.5, wordBreak:"break-word",
                      borderRadius: msg.isMine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                      background: msg.isMine ? "var(--accent2)" : "var(--bg3)",
                      color: msg.isMine ? "white" : "var(--text)",
                      border: msg.isMine ? "none" : "1px solid var(--border)",
                    }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize:10, color:"var(--text3)", marginTop:4, padding:"0 4px", textAlign: msg.isMine ? "right" : "left" }}>{msg.time}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* ── 13. TYPING INDICATOR ── driven by isTyping state above */}
            {isTyping && (
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, minWidth:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:600, ...avatarStyle[activeContact.color] }}>
                  {activeContact.initials}
                </div>
                <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"18px 18px 18px 6px", padding:"12px 16px", display:"flex", gap:4 }}>
                  {[0,200,400].map((delay) => (
                    <div key={delay} style={{ width:6, height:6, borderRadius:"50%", background:"var(--text3)", animation:`typing 1.2s ease-in-out ${delay}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)" }}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:10, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:16, padding:"10px 12px" }}>
              <button style={{ width:30, height:30, borderRadius:8, border:"none", background:"transparent", color:"var(--text3)", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>📎</button>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Message ${activeContact.name}…`} // ← auto-updates with contact
                rows={1}
                style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"var(--text)", fontFamily:"'Sora',sans-serif", fontSize:13.5, lineHeight:1.5, resize:"none", minHeight:20, maxHeight:120, overflowY:"auto" }}
              />
              <button style={{ width:30, height:30, borderRadius:8, border:"none", background:"transparent", color:"var(--text3)", cursor:"pointer", fontSize:16, flexShrink:0 }}>😊</button>
              <button
                onClick={sendMessage}
                style={{ width:34, height:34, borderRadius:10, border:"none", background:"var(--accent)", color:"white", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                ➤
              </button>
            </div>
          </div>
        </main>

        {/* ════════════════════════════════
            RIGHT PANEL — CONTACT DETAILS
            ════════════════════════════════ */}
        <aside style={{ width:260, minWidth:260, background:"var(--bg2)", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", overflowY:"auto" }}>

          {/* Profile */}
          <div style={{ padding:"28px 20px 20px", display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:600, marginBottom:12, border:"2px solid rgba(108,142,255,0.3)", position:"relative", ...avatarStyle[activeContact.color] }}>
              {activeContact.initials}
              {activeContact.online && <div style={{ position:"absolute", bottom:2, right:2, width:12, height:12, background:"var(--green)", borderRadius:"50%", border:"2px solid var(--bg2)" }} />}
            </div>
            {/* ── 14. PROFILE DETAILS ── ← CHANGE: pull from your user data */}
            <div style={{ fontSize:15, fontWeight:600, marginBottom:3 }}>{activeContact.name}</div>
            <div style={{ fontSize:12, color:"var(--text2)" }}>UI/UX Designer · Mumbai</div> {/* ← CHANGE */}
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text2)", background:"var(--bg3)", border:"1px solid var(--border)", padding:"4px 10px", borderRadius:20 }}>💼 Design</div>
              <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text2)", background:"var(--bg3)", border:"1px solid var(--border)", padding:"4px 10px", borderRadius:20 }}>🕐 3h zone</div>
            </div>
          </div>

          {/* Shared files */}
          <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text3)", marginBottom:12 }}>Shared Files</div>
            {/* ── 15. SHARED FILES ── ← CHANGE: map your actual file history */}
            {[
              { name:"design_v3_final.fig", size:"2.4 MB", icon:"📄", bg:"rgba(108,142,255,0.15)" },
              { name:"user_research.xlsx",  size:"840 KB", icon:"📊", bg:"rgba(62,207,142,0.12)" },
              { name:"sprint_notes.pdf",    size:"1.1 MB", icon:"📋", bg:"rgba(245,166,35,0.12)" },
            ].map((f) => (
              <div key={f.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10, background:"var(--bg3)", border:"1px solid var(--border)", marginBottom:6, cursor:"pointer" }}>
                <div style={{ width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, background:f.bg, flexShrink:0 }}>{f.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.name}</div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>{f.size}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ padding:"16px 20px" }}>
            <div style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text3)", marginBottom:12 }}>Quick Actions</div>
            {["📌 Pin conversation","🔕 Mute notifications"].map((label) => (
              <button key={label} style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px", color:"var(--text2)", fontFamily:"'Sora',sans-serif", fontSize:12, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>{label}</button>
            ))}
            <button style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px", color:"#f09595", fontFamily:"'Sora',sans-serif", fontSize:12, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:8 }}>🗑️ Clear chat</button>
          </div>
        </aside>
      </div>

      {/* Typing animation keyframes */}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30%            { opacity: 1;   transform: translateY(-3px); }
        }
      `}</style>
    </>
  );
}
