
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Phone, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  Menu,
  X,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Truck,
  Zap,
  Locate,
  Globe,
  Mic,
  MicOff,
  Loader2,
  Send,
  MessageCircle,
  Headphones,
  CalendarDays,
  Image as ImageIcon
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Chat } from '@google/genai';

// Global constants
const BOOKING_URL = "https://calendly.com/booknow12/consulation-septicgrowth";

// --- Conversational AI Widget Component ---

const AIWidget = ({ lang }: { lang: 'en' | 'fr' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const chatRef = useRef<Chat | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `
    You are a professional sales assistant for SepticGrowth, a niche marketing agency that works ONLY with septic tank and well water service companies in the United States and Canada.
    Your main objective is to engage septic & well water business owners, identify fit, explain the system simply, and book a discovery call.

    TARGET AUDIENCE: Septic pumping, installation, well water services. Busy owners on job sites.
    CORE POSITIONING: SepticGrowth helps these companies get more calls, more 5-star reviews, and never miss a lead using automated systems.
    
    BOOKING LINK: When the user is ready to book, or after 4-6 messages, provide this exact link: ${BOOKING_URL}
    
    STYLE: Professional, respectful, blue-collar friendly. No hype. Speak clearly as if on a phone call.
    
    CONVERSATION FLOW:
    1. GREET: Ask if they run a septic or well company.
    2. QUALIFY: Ask about their city and current review count.
    3. OFFER DEMO: Book a 10-minute demo call using the link provided.
    
    Response Language: Respond entirely in ${lang === 'en' ? 'English' : 'French'}.
  `;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;
    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3-pro-preview',
          config: { systemInstruction }
        });
      }
      
      const response = await chatRef.current.sendMessage({ message: userMsg });
      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { role: 'ai', text }]);
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: lang === 'en' ? 'Sorry, I encountered an error. Please try again.' : 'Désolé, j\'ai rencontré une erreur. Veuillez réessayer.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): { data: string; mimeType: string } => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopLive = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLive(false);
    setIsConnecting(false);
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
  };

  const startLive = async () => {
    setIsConnecting(true);
    setMode('voice');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
        },
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionRef.current?.sendRealtimeInput({ media: pcmBlob });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioBase64 = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioBase64) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioBase64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) {
                try { s.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopLive(),
          onerror: (e) => {
            console.error("Live Error:", e);
            stopLive();
          },
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Connection Error:", err);
      stopLive();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      {isOpen && (
        <div className="w-[400px] h-[600px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden flex flex-col mb-4 animate-in slide-in-from-bottom-8 duration-500 ease-out pointer-events-auto">
          {/* Header */}
          <div className="bg-navy p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-field-green rounded-full flex items-center justify-center">
                  <Truck size={20} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-navy rounded-full"></div>
              </div>
              <div>
                <span className="font-bold text-lg block leading-tight">SepticGrowth Pro</span>
                <span className="text-white/60 text-xs font-medium uppercase tracking-widest">{lang === 'en' ? 'Sales Assistant' : 'Assistant Vente'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                   if (isLive) stopLive();
                   setMode(mode === 'chat' ? 'voice' : 'chat');
                }}
                className={`p-2.5 rounded-xl transition-all duration-300 ${mode === 'voice' ? 'bg-field-green scale-110 shadow-lg shadow-field-green/40' : 'hover:bg-white/10'}`}
                title={mode === 'chat' ? 'Switch to Voice' : 'Switch to Chat'}
              >
                {mode === 'chat' ? <Phone size={20}/> : <MessageCircle size={20}/>}
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2.5 rounded-xl transition-all">
                <X size={22} />
              </button>
            </div>
          </div>
          
          {/* Chat/Phone Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col scroll-smooth">
            {mode === 'chat' ? (
              <div className="p-6 flex flex-col gap-4">
                {messages.length === 0 && !isTyping ? (
                  <div className="mt-20 text-center px-6 animate-in fade-in zoom-in duration-700">
                    <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-navy">
                      <Zap size={32} />
                    </div>
                    <h4 className="font-bold text-navy text-xl mb-3">
                      {lang === 'en' ? 'Ready to grow your business?' : 'Prêt à booster votre business ?'}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {lang === 'en' 
                        ? 'Hey there! Do you run a septic or well water service company? I can show you how to get more jobs automatically.' 
                        : 'Bonjour ! Gérez-vous une entreprise de services septiques ? Je peux vous aider à automatiser vos contrats.'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`max-w-[85%] p-4 rounded-2xl shadow-sm leading-relaxed text-sm animate-in slide-in-from-bottom-2 duration-300 ${
                      msg.role === 'ai' 
                        ? 'bg-white border border-slate-200 self-start text-slate-800' 
                        : 'bg-navy text-white self-end font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="bg-white border border-slate-200 self-start p-4 rounded-2xl flex gap-1.5 items-center shadow-sm">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="relative mb-8">
                  <div className={`w-32 h-32 bg-navy rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isLive ? 'scale-110' : 'scale-100'}`}>
                    {isLive ? (
                       <div className="flex items-end gap-1.5 h-12">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`w-1.5 bg-field-green rounded-full animate-pulse`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                          ))}
                       </div>
                    ) : (
                      <Headphones size={48} className="text-white/20" />
                    )}
                  </div>
                  {isLive && (
                    <div className="absolute -inset-4 border-2 border-field-green/20 rounded-full animate-ping"></div>
                  )}
                </div>
                <h3 className="text-2xl font-black text-navy mb-2">
                  {isConnecting ? (lang === 'en' ? 'Connecting...' : 'Connexion...') : 
                   isLive ? (lang === 'en' ? 'On Air' : 'En Ligne') : 
                   (lang === 'en' ? 'Voice Call' : 'Appel Vocal')}
                </h3>
                <p className="text-slate-400 text-sm max-w-[240px]">
                  {isLive 
                    ? (lang === 'en' ? 'Speak naturally. I am listening and ready to help you grow.' : 'Parlez naturellement. Je vous écoute.') 
                    : (lang === 'en' ? 'Start a real-time conversation with our AI agent.' : 'Démarrez une conversation en temps réel avec notre agent.')}
                </p>
                
                {!isLive && !isConnecting && (
                  <div className="mt-8 flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <ShieldCheck size={12} className="text-field-green" />
                    No transcripts • Private call
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="p-6 border-t border-slate-100 bg-white shrink-0">
            {mode === 'chat' ? (
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={lang === 'en' ? 'Ask about growing your business...' : 'Posez une question...'}
                  className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-field-green transition-all placeholder:text-slate-400"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputText.trim()}
                  className="bg-navy text-white p-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-navy/20"
                >
                  <Send size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {!isLive && !isConnecting ? (
                  <button 
                    onClick={startLive}
                    className="w-full bg-field-green hover:bg-green-700 text-white font-bold py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-field-green/30 active:scale-[0.98]"
                  >
                    <Phone size={22} />
                    <span className="text-base">{lang === 'en' ? 'Start AI Sales Call' : 'Démarrer l\'appel IA'}</span>
                  </button>
                ) : (
                  <button 
                    onClick={stopLive}
                    disabled={isConnecting}
                    className={`w-full ${isConnecting ? 'bg-slate-200 text-slate-400' : 'bg-red-500 hover:bg-red-600 text-white'} font-bold py-4.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]`}
                  >
                    {isConnecting ? <Loader2 size={22} className="animate-spin" /> : <MicOff size={22} />}
                    <span className="text-base">{isConnecting ? (lang === 'en' ? 'Connecting...' : 'Connexion...') : (lang === 'en' ? 'End Call' : 'Terminer')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-navy text-white rounded-2xl flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(15,23,42,0.5)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 active:scale-90 group relative pointer-events-auto"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <div className="absolute right-full mr-5 whitespace-nowrap bg-white text-navy px-4 py-3 rounded-2xl text-sm font-bold shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 flex items-center gap-3">
            <Zap size={18} className="text-field-green" />
            {lang === 'en' ? 'Talk to our AI Agent' : 'Parlez à notre IA'}
          </div>
        )}
      </button>
    </div>
  );
};

// --- Localization Content ---

const content = {
  en: {
    nav: { home: "Home", how: "How It Works", services: "Services", results: "Results", about: "About", book: "Book a Call" },
    hero: {
      tag: "Exclusive to Septic & Well Services",
      title: "Capture more leads",
      titleAccent: "automatically.",
      desc: "We help septic pumping and well water companies in the U.S. & Canada secure more local jobs with simple automated systems that never let a lead slip through the cracks.",
      bullets: ["Instant text-back for missed office calls", "24/7 lead capture while you're in the field", "High-converting pages built for service trucks"],
      ctaPrimary: "Book a Free Demo",
      ctaSecondary: "Watch How It Works"
    },
    problem: {
      title: "Field Work is Busy. Sales Shouldn't Be.",
      quote: "The hardest part of the job shouldn't be catching the phone.",
      items: [
        { title: "Missing Calls on the Job", desc: "When you're in a tank, you can't answer. That's money lost to the next guy on Google." },
        { title: "Low Local Visibility", desc: "If you aren't showing up in emergencies, you're invisible to 90% of your market." },
        { title: "Slow Lead Follow-up", desc: "If you don't reply in 5 minutes, 80% of customers call a competitor." },
        { title: "No System for Tracking", desc: "Losing track of estimate calls makes it impossible to follow up and close." }
      ]
    },
    how: {
      title: "How We Get You More Jobs",
      subtitle: "Three simple steps to a more profitable business.",
      steps: [
        { step: "01", title: "Plug & Play Setup", desc: "We set up your local numbers and landing page. You don't have to touch a thing." },
        { step: "02", title: "Automated Leads", desc: "Every time you're on a job and miss a call, our system starts the conversation automatically." },
        { step: "03", title: "More Booked Jobs", desc: "With better responsiveness, your schedule stays full year-round." }
      ]
    },
    services: {
      title: "Our Service Stack",
      subtitle: "Specific tools designed for the unique needs of septic and well service teams.",
      items: [
        { title: "Missed Call Text Back", desc: "Immediately capture every missed call via text, keeping homeowners from moving on." },
        { title: "Niche Landing Pages", desc: "High-speed, mobile-optimized sites built specifically for the industry." },
        { title: "24/7 AI Lead Capture", desc: "A smart assistant that handles questions while you're in the field." },
        { title: "Local Optimization", desc: "Show up first when people search for emergency repairs." },
        { title: "Lead Management", desc: "A dead-simple app to see all your leads and messages in one place." },
        { title: "Route Lead Tracking", desc: "See where your calls are coming from to optimize your service areas." }
      ]
    },
    footer: {
      desc: "The only marketing partner dedicated exclusively to helping septic and well water service companies.",
      rights: "© 2024 SepticGrowth Pro. Specialized Lead Systems for Field Service Pros."
    },
    ctaFinal: {
      title: "Ready to fill your schedule?",
      desc: "Stop losing jobs to the competition. Let us handle the tech while you handle the trucks."
    }
  },
  fr: {
    nav: { home: "Accueil", how: "Fonctionnement", services: "Services", results: "Résultats", about: "À Propos", book: "Réserver un appel" },
    hero: {
      tag: "Exclusif aux Services de Septique et Puits",
      title: "Captez plus de leads",
      titleAccent: "automatiquement.",
      desc: "Nous aidons les entreprises de pompage de fosses septiques et d'eau de puits aux États-Unis et au Canada à obtenir plus de contrats locaux grâce à des systèmes automatisés simples.",
      bullets: ["Réponse par SMS instantanée pour les appels manqués", "Capture de leads 24/7 pendant que vous êtes sur le terrain", "Pages à haute conversion conçues pour les camions de service"],
      ctaPrimary: "Réserver une démo gratuite",
      ctaSecondary: "Voir comment ça marche"
    },
    problem: {
      title: "Le terrain est occupé. Les ventes ne devraient pas l'être.",
      quote: "La partie la plus difficile ne devrait pas être de répondre au téléphone.",
      items: [
        { title: "Appels manqués en service", desc: "Quand vous êtes dans une fosse, vous ne pouvez pas répondre. C'est de l'argent perdu au profit du voisin." },
        { title: "Faible visibilité locale", desc: "Si vous n'apparaissez pas lors d'urgences, vous êtes invisible pour 90% de votre marché." },
        { title: "Suivi trop lent", desc: "Si vous ne répondez pas en 5 minutes, 80% des clients appellent un concurrent." },
        { title: "Aucun système de suivi", desc: "Perdre la trace des demandes de devis rend le suivi et la clôture impossibles." }
      ]
    },
    how: {
      title: "Comment nous vous trouvons des contrats",
      subtitle: "Trois étapes simples vers une entreprise plus rentable.",
      steps: [
        { step: "01", title: "Installation Clé en Main", desc: "Nous configurons vos numéros locaux et votre page. Vous n'avez rien à faire." },
        { step: "02", title: "Leads Automatisés", desc: "Chaque fois que vous manquez un appel, notre système entame la conversation automatiquement." },
        { step: "03", title: "Plus de Contrats", desc: "Avec une meilleure réactivité, votre emploi du temps reste plein toute l'année." }
      ]
    },
    services: {
      title: "Notre Gamme de Services",
      subtitle: "Des outils spécifiques conçus pour les besoins uniques des services septiques.",
      items: [
        { title: "SMS suite à Appel Manqué", desc: "Capturez immédiatement chaque appel manqué par SMS, empêchant les clients de partir." },
        { title: "Pages de Destination de Niche", desc: "Sites rapides et optimisés pour mobile, conçus spécifiquement pour l'industrie." },
        { title: "Capture de Leads IA 24/7", desc: "Un assistant intelligent qui gère les questions pendant que vous êtes sur le terrain." },
        { title: "Optimisation Locale", desc: "Apparaissez en premier lors des recherches de réparations d'urgence." },
        { title: "Gestion des Leads", desc: "Une application ultra-simple pour voir tous vos leads et messages en un seul endroit." },
        { title: "Suivi des Itinéraires", desc: "Voyez d'où proviennent vos appels pour optimiser vos zones de service." }
      ]
    },
    footer: {
      desc: "Le seul partenaire marketing dédié exclusivement aux entreprises de fosses septiques et d'eau de puits.",
      rights: "© 2024 SepticGrowth Pro. Systèmes de leads spécialisés pour les pros du terrain."
    },
    ctaFinal: {
      title: "Prêt à remplir votre calendrier ?",
      desc: "Arrêtez de perdre des contrats. Laissez-nous gérer la technologie pendant que vous gérez les camions."
    }
  }
};

// --- Helper for Smooth Scrolling ---
const handleGlobalNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  } else if (id === 'top') {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// --- Components ---

const LanguageToggle = ({ lang, setLang }: { lang: 'en' | 'fr', setLang: (l: 'en' | 'fr') => void }) => (
  <button 
    onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-navy px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-200"
  >
    <Globe size={14} />
    {lang === 'en' ? 'FRANÇAIS' : 'ENGLISH'}
  </button>
);

const Navbar = ({ lang, setLang }: { lang: 'en' | 'fr', setLang: (l: 'en' | 'fr') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = content[lang].nav;

  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setIsOpen(false);
    handleGlobalNavClick(e, id);
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => onNavClick(e as any, 'top')}>
            <div className="bg-navy p-2 rounded-lg">
              <Truck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-navy tracking-tight uppercase">SEPTIC<span className="text-field-green">GROWTH</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#how-it-works" onClick={(e) => onNavClick(e, 'how-it-works')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.how}</a>
            <a href="#services" onClick={(e) => onNavClick(e, 'services')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.services}</a>
            <a href="#results" onClick={(e) => onNavClick(e, 'results')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.results}</a>
            <a href="#about" onClick={(e) => onNavClick(e, 'about')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.about}</a>
            <LanguageToggle lang={lang} setLang={setLang} />
            <a 
              href={BOOKING_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-navy text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-navy/20"
            >
              {t.book}
            </a>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <LanguageToggle lang={lang} setLang={setLang} />
            <button onClick={() => setIsOpen(!isOpen)} className="text-navy">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-2">
          <a href="#how-it-works" onClick={(e) => onNavClick(e, 'how-it-works')} className="block px-3 py-4 text-base font-semibold text-slate-700 border-b border-slate-50">{t.how}</a>
          <a href="#services" onClick={(e) => onNavClick(e, 'services')} className="block px-3 py-4 text-base font-semibold text-slate-700 border-b border-slate-50">{t.services}</a>
          <div className="pt-4">
            <a 
              href={BOOKING_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center w-full bg-navy text-white py-4 rounded-xl font-bold"
            >
              {t.book}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].hero;
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-field-green/10 text-field-green px-4 py-2 rounded-full text-sm font-bold mb-6">
            <ShieldCheck size={18} />
            <span>{t.tag}</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-navy leading-[1.1] mb-6">
            {t.title} <span className="text-field-green">{t.titleAccent}</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
            {t.desc}
          </p>
          
          <ul className="space-y-4 mb-10">
            {t.bullets.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-lg font-medium text-slate-700">
                <CheckCircle2 className="text-field-green" size={24} />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={BOOKING_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-navy text-white px-8 py-5 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-navy/20 flex items-center justify-center gap-2 group"
            >
              {t.ctaPrimary} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="bg-white text-navy border-2 border-slate-200 px-8 py-5 rounded-xl font-bold text-lg hover:border-navy transition-all flex items-center justify-center gap-2">
              {t.ctaSecondary}
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-2/5 h-full hidden lg:block -z-10">
          <img 
            src="https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?auto=format&fit=crop&q=80&w=1200" 
            alt="Service Truck" 
            className="w-full h-full object-cover rounded-l-[100px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
      </div>
    </section>
  );
}

const ProblemSection = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].problem;
  const icons = [<Phone className="text-red-500" />, <Locate className="text-red-500" />, <Clock className="text-red-500" />, <Zap className="text-red-500" />];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-navy mb-4">{t.title}</h2>
          <p className="text-lg text-slate-600 italic">"{t.quote}"</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.items.map((p, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="mb-4">{icons[i]}</div>
              <h3 className="text-xl font-bold text-navy mb-3">{p.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].how;
  return (
    <section id="how-it-works" className="py-24 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">{t.title}</h2>
          <p className="text-slate-400 max-w-xl mx-auto">{t.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-800 z-0"></div>
          {t.steps.map((item, i) => (
            <div key={i} className="relative z-10 text-center">
              <div className="w-20 h-20 bg-field-green rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black shadow-xl">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Services = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].services;
  const icons = [<Phone />, <Droplets />, <MessageSquare />, <TrendingUp />, <Calendar />, <Truck />];
  
  return (
    <section id="services" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-navy mb-4">{t.title}</h2>
          <p className="text-lg text-slate-600">{t.subtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {t.items.map((s, i) => (
            <div key={i} className="group p-8 rounded-2xl border border-slate-100 bg-white hover:border-field-green transition-all shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-navy group-hover:bg-field-green group-hover:text-white transition-all mb-6">
                {icons[i]}
              </div>
              <h4 className="text-xl font-bold text-navy mb-3">{s.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = ({ lang }: { lang: 'en' | 'fr' }) => {
  const isEn = lang === 'en';

  return (
    <section id="about" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-navy mb-6">{isEn ? "Built Specifically for Septic & Well Pros" : "Conçu spécifiquement pour les pros du septique"}</h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            {isEn ? "Most agencies serve dentists, lawyers, and florists. We realized the septic and well water industry was being ignored or overcharged for generic services that don't fit the field-service reality." : "La plupart des agences servent des dentistes ou des fleuristes. Nous avons réalisé que l'industrie du septique était ignorée ou surfacturée pour des services génériques inadaptés."}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 font-bold text-navy text-sm sm:text-base">
              <CheckCircle2 className="text-field-green" size={18} /> {isEn ? "100% Niche Focus" : "100% Focus Niche"}
            </div>
            <div className="flex items-center gap-2 font-bold text-navy text-sm sm:text-base">
              <CheckCircle2 className="text-field-green" size={18} /> {isEn ? "No Long Contracts" : "Sans engagement"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].footer;
  const nav = content[lang].nav;
  return (
    <footer className="bg-navy pt-20 pb-10 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={(e: any) => handleGlobalNavClick(e, 'top')}>
              <div className="bg-field-green p-2 rounded-lg">
                <Truck className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight uppercase">SEPTIC<span className="text-field-green">GROWTH</span></span>
            </div>
            <p className="max-w-sm mb-6">{t.desc}</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#top" onClick={(e) => handleGlobalNavClick(e, 'top')} className="hover:text-field-green transition-colors">{nav.home}</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleGlobalNavClick(e, 'how-it-works')} className="hover:text-field-green transition-colors">{nav.how}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Contact</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>septicgrowth4@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-xs">
          <p>{t.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const t = content[lang];

  return (
    <div id="top" className="antialiased selection:bg-field-green selection:text-white">
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <ProblemSection lang={lang} />
      <HowItWorks lang={lang} />
      <Services lang={lang} />
      
      <section id="results" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-navy mb-4">{lang === 'en' ? "The Impact of Better Systems" : "L'impact de meilleurs systèmes"}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4 mb-4 text-field-green"><Zap size={24} /><h4 className="font-bold text-navy text-xl">{lang === 'en' ? "Instant Engagement" : "Engagement Instantané"}</h4></div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {lang === 'en' 
                  ? "Most septic companies lose 60% of their leads because they can't answer while servicing a tank. We ensure you are the first professional they talk to."
                  : "La plupart des entreprises perdent 60% de leurs leads car elles ne peuvent pas répondre en service. Nous assurons que vous soyez le premier contact."}
              </p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4 mb-4 text-navy"><TrendingUp size={24} /><h4 className="font-bold text-navy text-xl">{lang === 'en' ? "Market Dominance" : "Dominance du Marché"}</h4></div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {lang === 'en'
                  ? "We help local owners out-position regional franchises without massive ad budgets."
                  : "Nous aidons les propriétaires locaux à surclasser les franchises régionales sans budgets publicitaires massifs."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <About lang={lang} />
      
      <section className="py-24 bg-navy text-white text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-black mb-6">{t.ctaFinal.title}</h2>
          <p className="text-xl text-slate-400 mb-10">{t.ctaFinal.desc}</p>
          <a 
            href={BOOKING_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex bg-field-green text-white px-10 py-6 rounded-2xl font-black text-xl hover:bg-green-700 transition-all shadow-2xl items-center justify-center gap-3 mx-auto"
          >
            {t.nav.book} <ArrowRight />
          </a>
        </div>
      </section>

      <Footer lang={lang} />
      <AIWidget lang={lang} />
    </div>
  );
}
