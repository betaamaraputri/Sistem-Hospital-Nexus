import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from './services/geminiService';
import { Message, Role } from './types';
import { SendIcon, BotIcon, UserIcon, MedicalIcon, CalendarIcon, BillingIcon, PatientIcon } from './components/Icon';
import QuickAction from './components/QuickAction';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: 'Selamat datang di Sistem Rumah Sakit. Saya adalah Koordinator AI Anda. Bagaimana saya bisa membantu Anda hari ini? Saya dapat menghubungkan Anda dengan Rekam Medis, Penagihan, Manajemen Pasien, atau Penjadwalan.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTool]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCurrentTool(null);

    try {
      const responseText = await sendChatMessage(text, (toolName) => {
        setCurrentTool(toolName);
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.SYSTEM,
        text: "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setCurrentTool(null);
    }
  };

  const formatToolName = (name: string) => {
    switch(name) {
      case 'medical_records_agent': return 'Sub-agen Rekam Medis';
      case 'billing_insurance_agent': return 'Sub-agen Penagihan & Asuransi';
      case 'patient_management_agent': return 'Sub-agen Manajemen Pasien';
      case 'appointment_scheduler_agent': return 'Sub-agen Penjadwal Janji Temu';
      default: return 'Sub-agen';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-gray-800 overflow-hidden font-sans">
      
      {/* Sidebar - Context/Info */}
      <div className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 p-6 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M2 12h20"></path></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-900">Hospital System</h1>
            <p className="text-xs text-blue-600 font-medium tracking-wide uppercase">Nexus Coordinator</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Kemampuan Sistem</h2>
          <div className="space-y-3">
             <QuickAction 
              label="Cek Rekam Medis" 
              subLabel="Riwayat, Lab & Diagnosa" 
              icon={<MedicalIcon />} 
              onClick={() => handleSend("Tampilkan rekam medis terakhir untuk pasien Budi Santoso")}
            />
            <QuickAction 
              label="Jadwal Dokter" 
              subLabel="Buat atau ubah janji" 
              icon={<CalendarIcon />} 
              onClick={() => handleSend("Saya ingin membuat janji temu dengan Dr. Hartono untuk Budi Santoso besok")}
            />
            <QuickAction 
              label="Info Tagihan" 
              subLabel="Status pembayaran & Asuransi" 
              icon={<BillingIcon />} 
              onClick={() => handleSend("Cek status tagihan untuk pasien Budi Santoso")}
            />
            <QuickAction 
              label="Registrasi Pasien" 
              subLabel="Pendaftaran baru" 
              icon={<PatientIcon />} 
              onClick={() => handleSend("Saya ingin mendaftarkan pasien baru bernama Andi Wijaya")}
            />
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Privasi Data:</strong> Sistem ini menggunakan enkripsi tingkat lanjut. Semua data pasien yang ditampilkan di sini adalah simulasi (mock) untuk tujuan demonstrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full bg-white shadow-xl md:my-6 md:rounded-2xl md:h-[calc(100vh-3rem)] md:border border-gray-200 overflow-hidden">
        
        {/* Header Mobile */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-100 bg-white">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3">
            <span className="font-bold text-lg">+</span>
          </div>
          <span className="font-bold text-gray-900">Hospital Nexus</span>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide bg-gradient-to-b from-white to-slate-50">
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-4 ${msg.role === Role.USER ? 'flex-row-reverse' : ''} animate-fadeIn`}
            >
              {/* Avatar */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm
                ${msg.role === Role.USER ? 'bg-gray-100' : 'bg-blue-50 border border-blue-100'}
              `}>
                {msg.role === Role.USER ? <UserIcon /> : <BotIcon />}
              </div>

              {/* Message Content */}
              <div className={`
                max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm md:text-base leading-relaxed shadow-sm
                ${msg.role === Role.USER 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : msg.role === Role.SYSTEM 
                    ? 'bg-red-50 text-red-800 border border-red-100' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'}
              `}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-2 opacity-70 ${msg.role === Role.USER ? 'text-blue-100' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading / Tool Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center animate-pulse">
                <BotIcon />
              </div>
              <div className="space-y-2">
                {currentTool ? (
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-medium border border-amber-100 animate-pulse">
                    <svg className="animate-spin h-3 w-3 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghubungi {formatToolName(currentTool)}...
                  </div>
                ) : (
                  <div className="flex gap-1 h-6 items-center px-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="flex items-end gap-2 relative bg-gray-50 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ketik permintaan Anda di sini... (Contoh: Cek tagihan Budi Santoso)"
              className="w-full bg-transparent border-none text-gray-700 placeholder-gray-400 p-4 max-h-32 focus:ring-0 resize-none"
              rows={1}
              style={{ minHeight: '3.5rem' }}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="mb-2 mr-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:shadow-none flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">AI dapat melakukan kesalahan. Harap verifikasi informasi penting.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
