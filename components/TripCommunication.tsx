import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './Layout';
import { Button, Input } from './UI';
import { TripRequest, UserRole, ChatMessage } from '../types';
import { getSmartReplies } from '../services/geminiService';

interface Props {
  trip: TripRequest;
  currentUserRole: UserRole;
  initialMode: 'CHAT' | 'CALL';
  onSendMessage: (text: string) => void;
  onBack: () => void;
}

export const TripCommunication: React.FC<Props> = ({ 
  trip, 
  currentUserRole, 
  initialMode, 
  onSendMessage, 
  onBack 
}) => {
  const [mode, setMode] = useState<'CHAT' | 'CALL'>(initialMode);
  const [messageText, setMessageText] = useState('');
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const otherPartyName = currentUserRole === UserRole.DRIVER ? trip.passengerName : trip.driverName || 'Driver';
  const otherPartyRole = currentUserRole === UserRole.DRIVER ? 'Passenger' : 'Driver';
  const otherPartyPhoto = currentUserRole === UserRole.DRIVER 
    ? `https://ui-avatars.com/api/?name=${trip.passengerName}&background=random` 
    : trip.driverPhoto || 'https://via.placeholder.com/150';

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trip.chatHistory]);

  // Generate Smart Replies when last message changes
  useEffect(() => {
    const lastMsg = trip.chatHistory[trip.chatHistory.length - 1];
    if (lastMsg && lastMsg.senderRole !== currentUserRole) {
      getSmartReplies(currentUserRole, lastMsg.text, trip.status).then(setSmartReplies);
    } else if (trip.chatHistory.length === 0) {
      setSmartReplies(currentUserRole === UserRole.DRIVER 
        ? ["I'm on my way", "Traffic is heavy", "I've arrived"] 
        : ["Where are you?", "I'm at the pickup point", "Be there in 5"]);
    }
  }, [trip.chatHistory, currentUserRole, trip.status]);

  // Call Timer
  useEffect(() => {
    let interval: any;
    if (isCallActive) {
      interval = setInterval(() => setCallDuration(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Start call logic (simulated)
  useEffect(() => {
    if (mode === 'CALL') {
      // Simulate connection delay
      const timeout = setTimeout(() => setIsCallActive(true), 1500);
      return () => clearTimeout(timeout);
    } else {
      setIsCallActive(false);
      setCallDuration(0);
    }
  }, [mode]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    onSendMessage(text);
    setMessageText('');
    setSmartReplies([]); // Clear replies after sending
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'CALL') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center">
        {/* Call Header */}
        <div className="w-full p-6 flex justify-between items-start">
          <button onClick={() => setMode('CHAT')} className="p-2 bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </button>
          <button onClick={onBack} className="p-2 bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        {/* Profile & Status */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-20">
          <div className="relative mb-8">
             <div className={`absolute inset-0 bg-brand-500 rounded-full blur-xl opacity-30 ${isCallActive ? 'animate-pulse' : ''}`}></div>
             <img src={otherPartyPhoto} alt="Caller" className="w-32 h-32 rounded-full border-4 border-slate-800 relative z-10 object-cover" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{otherPartyName}</h2>
          <p className="text-brand-300 font-medium mb-1">
            {isCallActive ? formatTime(callDuration) : 'Connecting...'}
          </p>
          <p className="text-slate-400 text-sm capitalize">{otherPartyRole}</p>
        </div>

        {/* Trip Info Overlay */}
        <div className="w-full max-w-sm px-6 mb-8">
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                 <span className="text-xs font-bold text-slate-400 uppercase">Current Trip</span>
                 <span className="text-xs text-brand-300 font-mono">{trip.estimatedDuration || '15 min'}</span>
              </div>
              <div className="flex items-start space-x-3">
                 <div className="flex flex-col items-center space-y-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                    <div className="w-0.5 h-6 bg-white/20"></div>
                    <div className="w-2 h-2 bg-white"></div>
                 </div>
                 <div className="flex-1 space-y-3">
                    <div>
                       <p className="text-xs text-slate-400">Pickup</p>
                       <p className="text-sm font-medium leading-tight">{trip.pickupLocation}</p>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400">Dropoff</p>
                       <p className="text-sm font-medium leading-tight">{trip.dropoffLocation}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Call Controls */}
        <div className="w-full max-w-sm px-8 pb-12 flex justify-between items-center">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white'}`}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMuted ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" : "M19.114 9.336a5 5 0 010 5.328M21 7a8 8 0 010 10M15.536 11a1 1 0 010 2"} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMuted ? "M16 9l6 6M22 9l-6 6" : ""} /></svg>
          </button>
          
          <button 
            onClick={() => setMode('CHAT')} 
            className="p-6 bg-red-500 rounded-full shadow-lg shadow-red-500/50 hover:bg-red-600 transition-transform active:scale-95"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21l-1.498-4.493A1 1 0 005.3 3H5z" /></svg>
          </button>

          <button className="p-4 bg-white/10 rounded-full text-white">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout title={otherPartyName} showBack onBack={onBack}>
      {/* Sticky Call Header */}
      <div className="bg-white border-b border-slate-100 p-3 flex items-center justify-between sticky top-[60px] z-40 shadow-sm">
         <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden mr-3">
              <img src={otherPartyPhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{otherPartyRole}</p>
              <p className="text-xs text-brand-600 font-medium">Trip in Progress</p>
            </div>
         </div>
         <button 
           onClick={() => setMode('CALL')}
           className="bg-brand-50 p-2.5 rounded-full text-brand-600 hover:bg-brand-100 transition-colors"
         >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
         </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 pb-32">
         {trip.chatHistory.length === 0 && (
           <div className="text-center py-10">
             <p className="text-slate-400 text-sm">Start a conversation with {otherPartyName}</p>
           </div>
         )}
         
         <div className="space-y-4">
           {trip.chatHistory.map((msg) => {
             const isMe = msg.senderRole === currentUserRole;
             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'}`}>
                   <p className="text-sm">{msg.text}</p>
                   <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </p>
                 </div>
               </div>
             )
           })}
           <div ref={messagesEndRef} />
         </div>
      </div>

      {/* Footer Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-100 max-w-md mx-auto">
         {/* Smart Replies */}
         {smartReplies.length > 0 && (
           <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 pb-1">
             {smartReplies.map((reply, i) => (
               <button 
                 key={i}
                 onClick={() => handleSend(reply)}
                 className="whitespace-nowrap px-4 py-1.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-xs font-semibold hover:bg-brand-100 transition-colors"
               >
                 {reply}
               </button>
             ))}
           </div>
         )}

         <div className="flex items-center gap-2">
            <input 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(messageText)}
            />
            <button 
              disabled={!messageText.trim()}
              onClick={() => handleSend(messageText)}
              className="p-3 bg-brand-600 text-white rounded-full disabled:opacity-50 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
         </div>
      </div>
    </Layout>
  );
};