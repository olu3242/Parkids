// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { X, Send, Minimize2 } from "lucide-react";

// type Sender = "agent" | "user";

// interface Message {
//   id: number;
//   text: string;
//   sender: Sender;
//   time: string;
//   avatar?: string;
// }

// const QUICK_REPLIES = [
//   "How do I add a child?",
//   "What age groups are supported?",
//   "How does family voting work?",
//   "Is my data private?",
// ];

// const AGENT_RESPONSES: string[] = [
//   "Great question! I'd love to help your family get the most out of Parent-Kids. 🌟",
//   "Of course! Let me walk you through that step by step.",
//   "Happy to help! Parent-Kids is designed to make this super easy for families.",
//   "That's a common question — here's everything you need to know! 😊",
// ];

// function getCurrentTime(): string {
//   return new Date().toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// export const LiveChatWidget = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       text: "Hi there! 👋 I'm Parki, your family support specialist. How can I help your family today?",
//       sender: "agent",
//       time: "Now",
//       avatar: "👩‍👧",
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [responseIdx, setResponseIdx] = useState(0);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isTyping]);

//   const handleSend = (text: string = inputMessage) => {
//     const trimmed = text.trim();
//     if (!trimmed) return;

//     const userMsg: Message = {
//       id: Date.now(),
//       text: trimmed,
//       sender: "user",
//       time: getCurrentTime(),
//     };
//     setMessages((prev) => [...prev, userMsg]);
//     setInputMessage("");
//     setIsTyping(true);

//     setTimeout(() => {
//       setIsTyping(false);
//       const agentMsg: Message = {
//         id: Date.now() + 1,
//         text: AGENT_RESPONSES[responseIdx % AGENT_RESPONSES.length],
//         sender: "agent",
//         time: getCurrentTime(),
//         avatar: "👩‍👧",
//       };
//       setMessages((prev) => [...prev, agentMsg]);
//       setResponseIdx((i) => i + 1);
//     }, 1500);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") handleSend();
//   };

//   /* ── Closed: floating trigger ── */
//   if (!isOpen) {
//     return (
//       <button
//         onClick={() => setIsOpen(true)}
//         aria-label="Open chat"
//         className="fixed bottom-12 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-700 to-orange-400 text-2xl flex items-center justify-center shadow-[0_8px_28px_rgba(124,58,237,0.40)] hover:scale-110 hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(124,58,237,0.50)] transition-all duration-300 group"
//       >
//         💬
//         <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white text-white text-[10px] font-black flex items-center justify-center">
//           1
//         </span>
//         <span className="absolute bottom-[calc(100%+10px)] right-0 bg-violet-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//           Chat with Parki 👋
//         </span>
//       </button>
//     );
//   }

//   /* ── Open: chat panel ── */
//   return (
//     <div
//       className={`fixed bottom-4 right-[clamp(8px,2vw,24px)] z-50 w-[clamp(320px,96vw,384px)] rounded-[28px] overflow-hidden flex flex-col shadow-[0_28px_72px_rgba(92,33,182,0.16),0_4px_16px_rgba(92,33,182,0.10)] bg-[rgba(253,251,255,0.96)] backdrop-blur-2xl border border-white/90 transition-all duration-300 ease-&lsqb;cubic-bezier(.22,1,.36,1)&rsqb; ${
//         isMinimized ? "h-[68px]" : "h-[500px]"
//       }`}
//     >
//       {/* ── Header ── */}
//       <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-br from-[#2d1b69] to-[#7c3aed] flex-shrink-0">
//         <div className="flex items-center gap-2.5">
//           <div className="relative">
//             <div className="w-10 h-10 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center text-xl">
//               👩‍👧
//             </div>
//             <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
//           </div>
//           <div>
//             <p
//               className="font-black text-white text-[1rem] leading-tight"
//               style={{ fontFamily: "'Fraunces', serif" }}
//             >
//               Parki
//             </p>
//             <p className="text-[0.65rem] text-white/60 font-semibold">
//               Family Support Specialist · Online
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-1">
//           <button
//             onClick={() => setIsMinimized((v) => !v)}
//             className="w-8 h-8 rounded-[9px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
//             aria-label="Minimize"
//           >
//             <Minimize2 size={15} />
//           </button>
//           <button
//             onClick={() => setIsOpen(false)}
//             className="w-8 h-8 rounded-[9px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
//             aria-label="Close"
//           >
//             <X size={15} />
//           </button>
//         </div>
//       </div>

//       {!isMinimized && (
//         <>
//           {/* ── Messages ── */}
//           <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 bg-gradient-to-br from-violet-50/40 to-orange-50/20">
//             {messages.map((msg) => {
//               const isUser = msg.sender === "user";
//               return (
//                 <div
//                   key={msg.id}
//                   className={`flex ${isUser ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`flex items-end gap-2 max-w-[82%] ${
//                       isUser ? "flex-row-reverse" : ""
//                     }`}
//                   >
//                     {!isUser && (
//                       <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-sm flex-shrink-0">
//                         {msg.avatar}
//                       </div>
//                     )}
//                     <div>
//                       <div
//                         className={`px-3.5 py-2.5 text-[0.82rem] font-medium leading-relaxed ${
//                           isUser
//                             ? "bg-gradient-to-br from-[#2d1b69] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(45,27,105,0.22)] rounded-[18px_18px_4px_18px]"
//                             : "bg-white/90 text-[#1a0f3a] shadow-[0_2px_8px_rgba(92,33,182,0.08)] border border-violet-100/50 rounded-[18px_18px_18px_4px]"
//                         }`}
//                       >
//                         {msg.text}
//                       </div>
//                       <p
//                         className={`text-[0.62rem] text-[#7c6fa0] mt-1 px-1 ${
//                           isUser ? "text-right" : "text-left"
//                         }`}
//                       >
//                         {msg.time}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {/* Typing indicator */}
//             {isTyping && (
//               <div className="flex items-end gap-2">
//                 <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-sm">
//                   👩‍👧
//                 </div>
//                 <div className="bg-white/90 px-4 py-3 rounded-[18px_18px_18px_4px] shadow-[0_2px_8px_rgba(92,33,182,0.08)] border border-violet-100/50 flex gap-1.5 items-center">
//                   {[0, 150, 300].map((delay, i) => (
//                     <span
//                       key={i}
//                       className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
//                       style={{ animationDelay: `${delay}ms` }}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* ── Quick replies ── */}
//           <div className="px-3.5 py-2 border-t border-violet-100/60 bg-white/80 flex flex-wrap gap-1.5">
//             {QUICK_REPLIES.map((reply) => (
//               <button
//                 key={reply}
//                 onClick={() => handleSend(reply)}
//                 className="text-[0.68rem] font-bold px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-colors"
//               >
//                 {reply}
//               </button>
//             ))}
//           </div>

//           {/* ── Input ── */}
//           <div className="px-3.5 py-3 border-t border-violet-100/60 bg-white/90 rounded-b-[28px] flex items-center gap-2">
//             <input
//               type="text"
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Ask us anything… "
//               className="flex-1 px-4 py-2.5 rounded-full border border-violet-200 bg-violet-50/40 text-[#1a0f3a] text-[0.82rem] font-medium placeholder:text-[#7c6fa0] focus:outline-none focus:border-violet-500 transition-colors"
//             />
//             <button
//               onClick={() => handleSend()}
//               disabled={!inputMessage.trim()}
//               className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
//                 inputMessage.trim()
//                   ? "bg-gradient-to-br from-violet-700 to-orange-400 text-white shadow-[0_4px_14px_rgba(124,58,237,0.30)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(124,58,237,0.40)]"
//                   : "bg-violet-100 text-[#7c6fa0] cursor-not-allowed"
//               }`}
//               aria-label="Send"
//             >
//               <Send size={16} />
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Minimize2,
  MessageCircle,
  Hand,
  Bot,
  Sparkles,
} from "lucide-react";

type Sender = "agent" | "user";

interface Message {
  id: number;
  text: string;
  sender: Sender;
  time: string;
  avatar?: string;
}

const QUICK_REPLIES = [
  "How do I add a child?",
  "What age groups are supported?",
  "How does family voting work?",
  "Is my data private?",
];

const AGENT_RESPONSES: string[] = [
  "Great question! I'd love to help your family get the most out of Parent-Kids. 🌟",
  "Of course! Let me walk you through that step by step.",
  "Happy to help! Parent-Kids is designed to make this super easy for families.",
  "That's a common question — here's everything you need to know! 😊",
];

function getCurrentTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! 👋 I'm Parki, your family support specialist. How can I help your family today?",
      sender: "agent",
      time: "Now",
      avatar: "agent",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [responseIdx, setResponseIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string = inputMessage) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
      time: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const agentMsg: Message = {
        id: Date.now() + 1,
        text: AGENT_RESPONSES[responseIdx % AGENT_RESPONSES.length],
        sender: "agent",
        time: getCurrentTime(),
        avatar: "agent",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setResponseIdx((i) => i + 1);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  /* ── Agent avatar icon ── */
  const AgentAvatar = ({ className = "" }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <Bot size={16} className="text-violet-600" />
    </div>
  );

  /* ── Closed: floating trigger ── */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        className="fixed bottom-12 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-700 to-orange-400 text-2xl flex items-center justify-center shadow-[0_8px_28px_rgba(124,58,237,0.40)] hover:scale-110 hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(124,58,237,0.50)] transition-all duration-300 group"
      >
        <MessageCircle size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white text-white text-[10px] font-black flex items-center justify-center">
          1
        </span>
        <span className="absolute bottom-[calc(100%+10px)] right-0 bg-violet-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1">
          Chat with Parki <Hand size={12} className="text-white" />
        </span>
      </button>
    );
  }

  /* ── Open: chat panel ── */
  return (
    <div
      className={`fixed bottom-4 right-[clamp(8px,2vw,24px)] z-50 w-[clamp(320px,96vw,384px)] rounded-[28px] overflow-hidden flex flex-col shadow-[0_28px_72px_rgba(92,33,182,0.16),0_4px_16px_rgba(92,33,182,0.10)] bg-[rgba(253,251,255,0.96)] backdrop-blur-2xl border border-white/90 transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
        isMinimized ? "h-[68px]" : "h-[500px]"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-br from-[#2d1b69] to-[#7c3aed] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <p
              className="font-black text-white text-[1rem] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Parki
            </p>
            <p className="text-[0.65rem] text-white/60 font-semibold">
              Family Support Specialist · Online
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="w-8 h-8 rounded-[9px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 size={15} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-[9px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 bg-gradient-to-br from-violet-50/40 to-orange-50/20">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[82%] ${
                      isUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <AgentAvatar />
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-3.5 py-2.5 text-[0.82rem] font-medium leading-relaxed ${
                          isUser
                            ? "bg-gradient-to-br from-[#2d1b69] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(45,27,105,0.22)] rounded-[18px_18px_4px_18px]"
                            : "bg-white/90 text-[#1a0f3a] shadow-[0_2px_8px_rgba(92,33,182,0.08)] border border-violet-100/50 rounded-[18px_18px_18px_4px]"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p
                        className={`text-[0.62rem] text-[#7c6fa0] mt-1 px-1 ${
                          isUser ? "text-right" : "text-left"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center">
                  <AgentAvatar />
                </div>
                <div className="bg-white/90 px-4 py-3 rounded-[18px_18px_18px_4px] shadow-[0_2px_8px_rgba(92,33,182,0.08)] border border-violet-100/50 flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Quick replies ── */}
          <div className="px-3.5 py-2 border-t border-violet-100/60 bg-white/80 flex flex-wrap gap-1.5">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="text-[0.68rem] font-bold px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* ── Input ── */}
          <div className="px-3.5 py-3 border-t border-violet-100/60 bg-white/90 rounded-b-[28px] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask us anything… "
              className="flex-1 px-4 py-2.5 rounded-full border border-violet-200 bg-violet-50/40 text-[#1a0f3a] text-[0.82rem] font-medium placeholder:text-[#7c6fa0] focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                inputMessage.trim()
                  ? "bg-gradient-to-br from-violet-700 to-orange-400 text-white shadow-[0_4px_14px_rgba(124,58,237,0.30)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(124,58,237,0.40)]"
                  : "bg-violet-100 text-[#7c6fa0] cursor-not-allowed"
              }`}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
