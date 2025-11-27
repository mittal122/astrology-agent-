import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Bot, User, Sparkles, ShieldAlert, CheckCircle2, Star, BrainCircuit, Activity, Calendar, ArrowRight, Map, Flower } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Types ---
type Sender = 'bot' | 'user';

interface Message {
  id: string;
  sender: Sender;
  text: React.ReactNode;
  timestamp: Date;
}

interface UserData {
  name: string;
  birthDetails: string;
  locationFocus: string;
  problems: string;
  comfortLevel: string;
}

type ModuleType = 'onboarding' | 'analyzer' | 'daily' | 'longterm' | 'remedy';

// --- Onboarding Agent Logic ---
const OnboardingModule: React.FC<{ onComplete: (data: UserData) => void }> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthDetails: '',
    locationFocus: '',
    problems: '',
    comfortLevel: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial Greeting
  useEffect(() => {
    if (step === 0 && messages.length === 0) {
      addBotMessage("Namaste! 🙏 Welcome to your Vedic Action Guidance System.\n\nMain hoon aapka Onboarding Assistant. Before we start, I need to understand you better so we can create a powerful plan for you.\n\nSabse pehle, aapka shubh naam (Full Name) kya hai?");
    }
  }, []);

  const addBotMessage = (text: string, delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: text,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    }]);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    addUserMessage(text);
    setInputText('');
    processStep(step, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processStep = (currentStep: number, input: string) => {
    // Simple state machine for the conversation
    switch (currentStep) {
      case 0: // Name collected
        setUserData(prev => ({ ...prev, name: input }));
        addBotMessage(`Nice to meet you, ${input}! ✨\n\nAb mujhe aapki **Birth Details** chahiye taaki charts accurate banein.\n\nPlease share:\n- Date of Birth (DD/MM/YYYY)\n- Time of Birth (Exact or Approx)\n- Place of Birth (City, Country)`);
        setStep(1);
        break;

      case 1: // Birth details collected
        setUserData(prev => ({ ...prev, birthDetails: input }));
        addBotMessage("Got it. Details note kar liye hain. 📝\n\nAbhi aap **Kahan rehte hain** (Current City)?\n\nAur aapka **Main Focus Area** kya hai?\n(e.g., Career, Money, Business, Love/Marriage, Health, Spirituality)");
        setStep(2);
        break;
      
      case 2: // Location & Focus collected
        setUserData(prev => ({ ...prev, locationFocus: input }));
        addBotMessage("Understood. Har kisi ki life mein kuch challenges hote hain.\n\nAapki **Top 2-3 Problems** ya chintaayein kya hain jinka solution aap dhoond rahe hain? Khul ke batayein.");
        setStep(3);
        break;

      case 3: // Problems collected
        setUserData(prev => ({ ...prev, problems: input }));
        addBotMessage("Main samajh sakta hoon. Hum ispe kaam karenge. 💪\n\nEk aakhri sawaal: Remedies ke liye, kya aap **Mantras/Rituals** ke saath comfortable hain, ya sirf **Practical Habits** prefer karenge? (Ya fir dono ka mix?)");
        setStep(4);
        break;

      case 4: // Comfort level collected
        const finalData = { ...userData, comfortLevel: input };
        setUserData(finalData);
        setStep(5);
        
        // Summary & Conclusion
        setTimeout(() => {
            const summary = (
              <div className="space-y-2 text-sm bg-system-bg/50 p-3 rounded border border-system-border/50">
                <p><strong className="text-system-accent">Name:</strong> {finalData.name}</p>
                <p><strong className="text-system-accent">Birth:</strong> {finalData.birthDetails}</p>
                <p><strong className="text-system-accent">Focus:</strong> {finalData.locationFocus}</p>
                <p><strong className="text-system-accent">Issues:</strong> {finalData.problems}</p>
                <p><strong className="text-system-accent">Preferences:</strong> {input}</p>
              </div>
            );
            
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: 'bot',
              text: summary,
              timestamp: new Date()
            }]);
            
            addBotMessage("Shukriya! Maine aapki details note kar li hain. ✅\n\n⚠️ **Please Note:** I do not provide medical, legal, or guaranteed financial advice. This guidance is based on Vedic Astrology principles to help you align your actions.\n\nI will now use these details to generate your **Astro-Action Plan**. Stand by...");
            
            // Wait a bit then trigger completion
            setTimeout(() => {
              onComplete(finalData);
            }, 3000);
        }, 800);
        break;
        
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-system-bg/50 overflow-hidden rounded-lg">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                msg.sender === 'user' 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : 'bg-system-accent/10 border-system-accent/30 text-system-accent'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Bubble */}
              <div className={`p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100 rounded-tr-none'
                  : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start w-full animate-pulse">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-system-accent/10 border border-system-accent/30 flex items-center justify-center">
                 <Bot size={14} className="text-system-accent" />
               </div>
               <div className="bg-zinc-800/50 border border-zinc-700/50 px-4 py-3 rounded-lg rounded-tl-none">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-system-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                   <span className="w-1.5 h-1.5 bg-system-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                   <span className="w-1.5 h-1.5 bg-system-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-system-bg border-t border-system-border">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={step < 5 ? "Type your answer here..." : "Session complete. Please wait..."}
            disabled={step >= 5}
            className="w-full bg-zinc-900/50 text-system-text border border-zinc-700 rounded-md py-3 pl-4 pr-12 focus:outline-none focus:border-system-accent focus:ring-1 focus:ring-system-accent/20 transition-all placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || step >= 5}
            className="absolute right-2 p-1.5 bg-system-accent text-black rounded hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-[10px] text-zinc-600 mt-2 text-center font-mono">
          PRESS ENTER TO SEND • MODULE_ID: INTAKE_V1
        </div>
      </div>
    </div>
  );
};

// --- Astro Analyzer Module ---
const AstroAnalyzer: React.FC<{ userData: UserData, onNext: () => void }> = ({ userData, onNext }) => {
  const [status, setStatus] = useState<'analyzing' | 'done' | 'error'>('analyzing');
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);

  // Loading Steps Text
  const loadingTexts = [
    "Aligning planetary coordinates...",
    "Calculating lunar mansions (Nakshatras)...",
    "Analyzing numerological vibrations...",
    "Synthesizing life patterns...",
    "Generating practical insights..."
  ];

  useEffect(() => {
    // Cycle through loading texts
    if (status === 'analyzing') {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingTexts.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const generateAnalysis = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `
          You are the **Astro Profile Analyzer** for a Hindu/Vedic Astrology based Action Guidance System.
          Your job:
          - Generate a simplified but meaningful personality and life-pattern reading based on user data.
          
          Focus on:
          - Strengths
          - Weakness trends
          - Emotional patterns
          - Career tendency
          - Relationship approach
          - Decision-making style
          - Spiritual inclination
          - Lucky elements (colors, days, numbers)

          Rules:
          - Explain everything in simple Hinglish.
          - Do NOT make fixed "future predictions."
          - Provide symbolic interpretations, not absolutes.
          - Avoid technical overloading (no heavy Sanskrit jargon unless explained simply).
          - Connect each pattern to a practical insight for real life.
          
          Output format (Use Markdown for headers and bullet points):
          1. Short summary (2-3 lines)
          2. Strength patterns
          3. Challenge areas
          4. Life tendencies (career, relationships, money, emotions)
          5. Practical meaning of their Rashi / Nakshatra / Numerology
        `;

        const userPrompt = JSON.stringify(userData);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        if (response.text) {
          setAnalysis(response.text);
          setStatus('done');
        } else {
          throw new Error("No response generated");
        }
      } catch (error) {
        console.error("Analysis failed", error);
        setStatus('error');
      }
    };

    generateAnalysis();
  }, [userData]);

  if (status === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="relative w-32 h-32">
          {/* Spinning Rings */}
          <div className="absolute inset-0 border-2 border-dashed border-system-accent/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-4 border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
          <div className="absolute inset-8 border border-zinc-500/30 rounded-full flex items-center justify-center bg-black">
            <Star className="text-yellow-500 w-8 h-8 animate-pulse" fill="currentColor" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-widest">ANALYZING COSMIC DATA</h2>
          <p className="text-system-accent font-mono text-sm h-6">
            {'>'} {loadingTexts[loadingStep]}
          </p>
        </div>

        <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
           <div className="h-full bg-system-accent/50 animate-[progress_2s_ease-in-out_infinite] w-1/3"></div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-400 space-y-4">
        <ShieldAlert size={48} />
        <p>Cosmic Interference Detected (API Error). Please try again.</p>
        <button 
           onClick={() => window.location.reload()}
           className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white text-sm"
        >
          Reset System
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Header Card */}
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6">
             <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
               <BrainCircuit className="text-purple-400" size={24} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white">Astro Profile Analysis</h2>
               <p className="text-xs text-zinc-400">Personalized Insights for {userData.name}</p>
             </div>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-system-accent prose-strong:text-zinc-200 prose-p:text-zinc-400 prose-li:text-zinc-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
          </div>
          
          <div className="pt-6 border-t border-zinc-800 flex justify-end">
            <button
              onClick={onNext}
              className="flex items-center gap-2 bg-system-accent text-black px-5 py-2.5 rounded font-bold hover:bg-green-400 transition-colors"
            >
              <span>View Daily Action Plan</span>
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

// --- Daily Action Agent Module ---
const DailyActionAgent: React.FC<{ userData: UserData, onNext: () => void }> = ({ userData, onNext }) => {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [plan, setPlan] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingTexts = [
    "Scanning daily transits...",
    "Aligning lunar energies...",
    "Calculating practical rituals...",
    "Optimizing schedule for success...",
    "Synthesizing daily guidance..."
  ];

  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingTexts.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const generatePlan = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `
          You are the **Daily Astro Action Agent**.

          Input: User’s birth details + their current concerns.

          Your job:
          - Give a 1-day actionable guidance plan, not superstition.
          - Keep it practical, simple, and helpful.

          Your output must contain:

          1. **Daily Theme (2–3 lines)**  
          2. **Do’s (5–7 items)**  
             - Mix of practical habits + simple spiritual actions.  
          3. **Don’ts (3–5 items)**  
          4. **One Reflection Question**  
          5. **A 1-line astro reasoning** based on the day’s energy (moon, transit, or symbolic meaning).

          Rules:
          - No fear, no negativity.
          - No medical/legal/financial claims.
          - Use soft Vedic language but stay understandable.
          - Avoid exact future predictions.
        `;

        const userPrompt = JSON.stringify(userData);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        if (response.text) {
          setPlan(response.text);
          setStatus('done');
        } else {
          throw new Error("No response generated");
        }
      } catch (error) {
        console.error("Daily plan generation failed", error);
        setStatus('error');
      }
    };

    generatePlan();
  }, [userData]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 border-t-2 border-r-2 border-amber-500/50 rounded-full animate-[spin_2s_linear_infinite]"></div>
          <div className="absolute inset-2 border-b-2 border-l-2 border-orange-500/50 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Calendar className="text-amber-500 w-10 h-10 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-widest">GENERATING DAILY PLAN</h2>
          <p className="text-amber-500 font-mono text-sm h-6">
            {'>'} {loadingTexts[loadingStep]}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
     return (
       <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-400 space-y-4">
         <ShieldAlert size={48} />
         <p>Daily Sync Failed. Cosmic signals interrupted.</p>
         <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white text-sm"
         >
           Retry
         </button>
       </div>
     );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-3xl mx-auto space-y-6">
           {/* Header */}
           <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Calendar className="text-amber-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Daily Astro Action Plan</h2>
                <p className="text-xs text-zinc-400">Practical Guidance for Today</p>
              </div>
           </div>

           {/* Content */}
           <div className="prose prose-invert prose-sm max-w-none prose-headings:text-amber-400 prose-strong:text-zinc-200 prose-p:text-zinc-400 prose-li:text-zinc-400">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
           </div>
           
           {/* Navigation to Long Term */}
           <div className="pt-6 border-t border-zinc-800 flex justify-end">
             <button
               onClick={onNext}
               className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-2.5 rounded font-bold hover:bg-cyan-400 transition-colors"
             >
               <span>View Long-Term Roadmap</span>
               <ArrowRight size={16} />
             </button>
           </div>
           
           <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};

// --- Long Term Planner Agent Module ---
const LongTermPlannerAgent: React.FC<{ userData: UserData, onNext: () => void }> = ({ userData, onNext }) => {
  const [period, setPeriod] = useState<'Week' | 'Month' | 'Year'>('Month');
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [plan, setPlan] = useState<string>('');
  
  // Cache the plans to avoid regenerating when switching back and forth
  const [cache, setCache] = useState<Record<string, string>>({});

  useEffect(() => {
    // If we have it in cache, use it
    if (cache[period]) {
      setPlan(cache[period]);
      setStatus('done');
      return;
    }

    const generatePlan = async () => {
      setStatus('loading');
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `
          You are the **Long-Term Astro Planner Agent**.

          Your job:
          - Provide a roadmap for the user’s next: ${period}
          
          Structure your output like this:

          1. **Big Theme** (overall energy of the period)
          2. **Career/Study Plan**
             - 3–7 steps
          3. **Money Plan**
             - 3–5 steps
          4. **Relationships/Family Plan**
             - 3–5 steps
          5. **Health/Energy Plan**
             - 2–4 steps
          6. **Spiritual/Inner Work Plan**
             - 2–5 steps
          7. **Period Priorities**
             - Top 3 focus points

          Rules:
          - All steps MUST be practical.
          - Use simple Hinglish.
          - Connect actions to Vedic symbolism (e.g., “Shani = discipline”, “Surya = confidence”).
          - Do not promise guaranteed future events.
          - Focus strictly on the time period: **Next ${period}**.
        `;

        const userPrompt = JSON.stringify(userData);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        if (response.text) {
          setPlan(response.text);
          setCache(prev => ({ ...prev, [period]: response.text as string }));
          setStatus('done');
        } else {
          throw new Error("No response generated");
        }
      } catch (error) {
        console.error("Long term plan generation failed", error);
        setStatus('error');
      }
    };

    generatePlan();
  }, [userData, period]); // Removed cache from dependency to prevent loops, though logic handles it

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      {/* Tab Selection */}
      <div className="flex border-b border-zinc-800 bg-black/20">
        {(['Week', 'Month', 'Year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-3 text-sm font-bold tracking-wide transition-colors ${
              period === p 
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/20' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Next {p}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Map className="w-12 h-12 text-cyan-500 animate-pulse" />
            <p className="text-cyan-500 font-mono text-sm">Charting your {period.toLowerCase()}ly course...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-400 space-y-4">
             <ShieldAlert size={48} />
             <p>Plan generation failed. Please try again.</p>
             <button 
                onClick={() => setStatus('loading')} // Retry by resetting status
                className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white text-sm"
             >
               Retry
             </button>
          </div>
        )}

        {status === 'done' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out]">
             {/* Header */}
             <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Map className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Long-Term Roadmap</h2>
                  <p className="text-xs text-zinc-400">Strategic Guidance for the Next {period}</p>
                </div>
             </div>

             {/* Content */}
             <div className="prose prose-invert prose-sm max-w-none prose-headings:text-cyan-400 prose-strong:text-zinc-200 prose-p:text-zinc-400 prose-li:text-zinc-400">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
             </div>
             
             {/* Navigation to Remedies */}
             <div className="pt-6 border-t border-zinc-800 flex justify-end">
               <button
                 onClick={onNext}
                 className="flex items-center gap-2 bg-pink-500 text-black px-5 py-2.5 rounded font-bold hover:bg-pink-400 transition-colors"
               >
                 <span>View Remedies</span>
                 <ArrowRight size={16} />
               </button>
             </div>
             
             <div className="h-8"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Remedy Agent Module ---
const RemedyAgent: React.FC<{ userData: UserData }> = ({ userData }) => {
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [remedies, setRemedies] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingTexts = [
    "Scanning planetary afflictions...",
    "Finding karmic balancers...",
    "Selecting safe mantras...",
    "Identifying healing rituals...",
    "Synthesizing remedies..."
  ];

  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingTexts.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const generateRemedies = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `
          You are the **Hindu Astrology Remedy Agent**.

          Input: User’s problem + birth context.

          Your job:
          Provide remedies in 3 balanced categories:

          1) **Mind & Inner Work Remedies**  
          2) **Behavioural/Karma Remedies**  
          3) **Spiritual/Ritual Remedies** (ONLY simple & safe)

          Examples:  
          - Mantra chanting (short, easy)  
          - Lighting diya  
          - Offering water to the sun  
          - Charity  
          - Color therapy  
          - Small fast ONLY if the user is healthy  

          Rules:
          - NO extreme fasts, animal sacrifice, black magic, or expensive gemstones.
          - Always add:
            "For health/money/legal issues, consult a professional too."
          - For each remedy, mention:
            - Why it helps (reason)  
            - How often (daily/weekly)  
            - How long (7 days, 21 days, etc.)
          
          Format: Use Markdown.
        `;

        const userPrompt = JSON.stringify(userData);

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });

        if (response.text) {
          setRemedies(response.text);
          setStatus('done');
        } else {
          throw new Error("No response generated");
        }
      } catch (error) {
        console.error("Remedy generation failed", error);
        setStatus('error');
      }
    };

    generateRemedies();
  }, [userData]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="relative w-28 h-28">
           {/* Flower/Lotus Animation */}
           <div className="absolute inset-0 flex items-center justify-center animate-[spin_10s_linear_infinite]">
             <div className="w-24 h-24 border-2 border-pink-500/20 rounded-full"></div>
           </div>
           <div className="absolute inset-0 flex items-center justify-center animate-[spin_8s_linear_infinite_reverse]">
             <div className="w-20 h-20 border-2 border-rose-500/30 rounded-full"></div>
           </div>
           <div className="absolute inset-0 flex items-center justify-center">
             <Flower className="text-pink-500 w-10 h-10 animate-pulse" />
           </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white tracking-widest">CURATING REMEDIES</h2>
          <p className="text-pink-500 font-mono text-sm h-6">
            {'>'} {loadingTexts[loadingStep]}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
     return (
       <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-400 space-y-4">
         <ShieldAlert size={48} />
         <p>Remedy Generation Failed. Cosmic signals interrupted.</p>
         <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 text-white text-sm"
         >
           Retry
         </button>
       </div>
     );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900/50">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-3xl mx-auto space-y-6">
           {/* Header */}
           <div className="flex items-center gap-4 border-b border-zinc-800 pb-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                <Flower className="text-pink-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Vedic Remedies</h2>
                <p className="text-xs text-zinc-400">Healing & Karmic Balancing</p>
              </div>
           </div>

           {/* Content */}
           <div className="prose prose-invert prose-sm max-w-none prose-headings:text-pink-400 prose-strong:text-zinc-200 prose-p:text-zinc-400 prose-li:text-zinc-400">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{remedies}</ReactMarkdown>
           </div>
           
           <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleType>('onboarding');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    // Transition delay
    setTimeout(() => {
      setCurrentModule('analyzer');
    }, 500);
  };
  
  const handleAnalyzerNext = () => {
    setCurrentModule('daily');
  };

  const handleDailyNext = () => {
    setCurrentModule('longterm');
  };
  
  const handleLongTermNext = () => {
    setCurrentModule('remedy');
  };

  const getModuleIcon = () => {
    switch(currentModule) {
      case 'onboarding': return <Sparkles className="w-4 h-4 text-system-accent" />;
      case 'analyzer': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'daily': return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'longterm': return <Map className="w-4 h-4 text-cyan-500" />;
      case 'remedy': return <Flower className="w-4 h-4 text-pink-500" />;
    }
  };

  const getModuleColor = () => {
     switch(currentModule) {
      case 'onboarding': return 'bg-system-accent/10';
      case 'analyzer': return 'bg-purple-500/10';
      case 'daily': return 'bg-amber-500/10';
      case 'longterm': return 'bg-cyan-500/10';
      case 'remedy': return 'bg-pink-500/10';
    }
  };

  const getModuleIndicator = () => {
     switch(currentModule) {
      case 'onboarding': return 'bg-green-500';
      case 'analyzer': return 'bg-purple-500';
      case 'daily': return 'bg-amber-500';
      case 'longterm': return 'bg-cyan-500';
      case 'remedy': return 'bg-pink-500';
    }
  };

  const getModuleName = () => {
     switch(currentModule) {
      case 'onboarding': return 'ONBOARDING_INTAKE';
      case 'analyzer': return 'ASTRO_ANALYZER';
      case 'daily': return 'DAILY_ASTRO_ACTION';
      case 'longterm': return 'LONG_TERM_PLANNER';
      case 'remedy': return 'REMEDY_AGENT';
    }
  };

  return (
    <div className="min-h-screen bg-system-bg text-system-text font-mono flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Main Container */}
      <div className="z-10 w-full max-w-2xl h-[85vh] flex flex-col border border-system-border bg-black/80 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/5">
        
        {/* Header */}
        <div className="bg-zinc-900/80 px-4 py-3 flex items-center justify-between border-b border-system-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded transition-colors ${getModuleColor()}`}>
               {getModuleIcon()}
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-gray-200">
                {getModuleName()}
              </h1>
              <div className="text-[10px] text-system-muted flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${getModuleIndicator()}`}></span>
                ONLINE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              V.1.0.6
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative">
          {currentModule === 'onboarding' && (
             <OnboardingModule onComplete={handleOnboardingComplete} />
          )}
          
          {currentModule === 'analyzer' && userData && (
            <AstroAnalyzer userData={userData} onNext={handleAnalyzerNext} />
          )}
          
          {currentModule === 'daily' && userData && (
            <DailyActionAgent userData={userData} onNext={handleDailyNext} />
          )}
          
          {currentModule === 'longterm' && userData && (
            <LongTermPlannerAgent userData={userData} onNext={handleLongTermNext} />
          )}

          {currentModule === 'remedy' && userData && (
            <RemedyAgent userData={userData} />
          )}
        </div>
        
        {/* Footer Status Bar */}
        <div className="bg-zinc-950 px-4 py-1.5 text-[10px] text-zinc-500 border-t border-system-border flex justify-between shrink-0">
          <div className="flex gap-4">
             <span>SECURE_CONN: <span className="text-green-900">ESTABLISHED</span></span>
             <span>LATENCY: 24ms</span>
          </div>
          <div className="flex gap-2 items-center">
             <ShieldAlert size={10} />
             <span>PRIVACY_MODE: HIGH</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(39, 39, 42, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.8);
        }
      `}</style>
    </div>
  );
};

export default App;