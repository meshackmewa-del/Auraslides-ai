import { useState, useEffect, useRef, DragEvent } from "react";
import { Slide, SlideTheme } from "./types";
import { NOTEBOOK_SAMPLES, DEFAULT_SLIDES, NotebookSample } from "./data";
import { playSelectedSound, playClickSound, playWhooshSound } from "./sound";
import { motion, AnimatePresence } from "motion/react";

// Import modular dashboard, teleprompter, and games views
import DashboardView from "./components/DashboardView";
import TeleprompterView from "./components/TeleprompterView";
import GamesHubView from "./components/GamesHubView";

import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  FileText, 
  Palette, 
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  BookOpen,
  Book,
  Search,
  MessageSquare,
  Send,
  Bot,
  Gamepad2,
  LayoutDashboard,
  Tv
} from "lucide-react";

export default function App() {
  const [rawNotes, setRawNotes] = useState<string>("");
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [theme, setTheme] = useState<SlideTheme>("dark");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiStatus, setAiStatus] = useState<string>("Ready to design presentation assets.");
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [soundType, setSoundType] = useState<"whoosh" | "click" | "pop">("whoosh");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Search, Limitless ChatGPT (AuraGPT) & Creator Information states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchCredit, setShowSearchCredit] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<"notebook" | "chatgpt" | "dashboard" | "teleprompter" | "games">("notebook");
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "👋 Hello! I am AuraGPT, your powerful, limitless AI companion. Ask me any question, write essays, solve equations, or let me draft complete slide content for you! You can click 'Export to Text Node' on any of my responses to instantly load it as your slide source material.",
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatResponding, setIsChatResponding] = useState<boolean>(false);

  // Global search & Canva edit states
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement>(null);

  // Update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        return;
      }
      if (e.key === "ArrowLeft") {
        navigateSlide(-1);
      } else if (e.key === "ArrowRight") {
        navigateSlide(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides, currentIndex, audioEnabled]);

  // Sync fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const navigateSlide = (direction: number) => {
    const next = currentIndex + direction;
    if (next >= 0 && next < slides.length) {
      if (audioEnabled) {
        playSelectedSound(soundType);
      }
      setCurrentIndex(next);
    }
  };

  const handleIncomingFile = (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setAiStatus(`Extracting text array layers from file storage...`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const textResult = e.target.result;
      if (typeof textResult === "string") {
        setRawNotes(textResult);
        setAiStatus(`File parsed successfully into the Text Node!`);
        if (audioEnabled) playClickSound();
      }
    };

    if (file.name.endsWith('.pdf')) {
      setAiStatus("Extracting raw strings. For production heavy PDFs, converting to .txt first offers maximum reliability.");
    }
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncomingFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: NotebookSample) => {
    if (audioEnabled) playClickSound();
    setUploadedFileName(null);
    setRawNotes(sample.text);
    setAiStatus(`Loaded sample template: "${sample.name.slice(2)}". Click generate below to synthesize.`);
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    // Play a click as audio feedback when turning on
    if (!audioEnabled) {
      setTimeout(() => playClickSound(), 50);
    }
  };

  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    
    if (audioEnabled) playClickSound();

    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Could not activate fullscreen", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  const handleGenerateSlides = async () => {
    if (!rawNotes.trim()) {
      setAiStatus("Please paste or load document data inside the input box.");
      return;
    }

    setIsGenerating(true);
    setAiStatus("Connecting to Google AI Studio pipeline...");
    setGenerationSteps(["Initializing document parsing engine..."]);

    // Staggered status logs for immersive, high-fidelity experience
    const progressIntervals = [
      { delay: 1000, step: "Deconstructing text nodes into semantic clusters..." },
      { delay: 2500, step: "Querying Gemini 3.5-flash for layout orchestration..." },
      { delay: 4500, step: "Polishing typographic pacing and hierarchy..." },
      { delay: 6000, step: "Compiling vector slide deck cards..." }
    ];

    const timers = progressIntervals.map(({ delay, step }) => {
      return setTimeout(() => {
        setGenerationSteps((prev) => [...prev, step]);
        setAiStatus(`AI Status: ${step}`);
      }, delay);
    });

    try {
      const response = await fetch("/api/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawNotes }),
      });

      // Clear the fake loaders once actual response comes
      timers.forEach(clearTimeout);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Internal Server Error");
      }

      const data = await response.json();
      if (data.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setCurrentIndex(0);
        setAiStatus(`Success! Generated ${data.slides.length} slides.`);
        setGenerationSteps((prev) => [...prev, "Generation complete! Enjoy your custom deck."]);
        if (audioEnabled) playSelectedSound(soundType);
      } else {
        throw new Error("No slides returned from the model structure");
      }
    } catch (error: any) {
      timers.forEach(clearTimeout);
      setAiStatus(`API Error: ${error.message || "Failed to contact backend API."}`);
      setGenerationSteps((prev) => [...prev, "❌ Connection failed. Check your Gemini API Key."]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetToDefault = () => {
    if (audioEnabled) playClickSound();
    setSlides(DEFAULT_SLIDES);
    setCurrentIndex(0);
    setRawNotes("");
    setAiStatus("Reset presentation canvas to default welcome deck.");
    setGenerationSteps([]);
  };

  const updateCurrentSlideTitle = (newTitle: string) => {
    const updatedSlides = [...slides];
    if (updatedSlides[currentIndex]) {
      updatedSlides[currentIndex].title = newTitle;
      setSlides(updatedSlides);
    }
  };

  const updateCurrentSlideBody = (newBody: string) => {
    const updatedSlides = [...slides];
    if (updatedSlides[currentIndex]) {
      updatedSlides[currentIndex].body = newBody;
      setSlides(updatedSlides);
    }
  };

  // Cancel any active Speech Synthesis narration when switching slides
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  }, [currentIndex]);

  const handleNarrate = () => {
    if (audioEnabled) playClickSound();
    
    if ("speechSynthesis" in window) {
      if (isNarrating) {
        window.speechSynthesis.cancel();
        setIsNarrating(false);
      } else {
        window.speechSynthesis.cancel();
        const currentSlide = slides[currentIndex];
        if (!currentSlide) return;

        const titleText = currentSlide.title;
        const bodyTextCleaned = currentSlide.body
          .replace(/^- /gm, "")
          .replace(/^\* /gm, "")
          .replace(/^[0-9]+\.\s/gm, "");

        const textToSpeak = `${titleText}. ${bodyTextCleaned}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.onend = () => {
          setIsNarrating(false);
        };
        utterance.onerror = () => {
          setIsNarrating(false);
        };

        setIsNarrating(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Speech synthesis is not supported in this browser.");
    }
  };

  const handleChatSubmit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatResponding) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(updatedMessages);
    setIsChatResponding(true);

    if (audioEnabled) playClickSound();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from ChatGPT companion");
      }

      const data = await response.json();
      setChatMessages((prev) => [...prev, { role: "assistant" as const, content: data.content }]);
      if (audioEnabled) playSelectedSound(soundType);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "⚠️ Sorry, I had trouble processing that request. Please make sure your Gemini API key is configured in the AI Studio environment settings." },
      ]);
    } finally {
      setIsChatResponding(false);
    }
  };

  const handleExportChatToSlides = (content: string) => {
    if (audioEnabled) playClickSound();
    setRawNotes(content);
    setSidebarTab("notebook");
    setAiStatus("Chat content imported to Source Material text node. Click 'Generate Presentation' to convert!");
  };

  // Beautifully render slide bullets with custom icons and staggered entrances
  const renderSlideBodyText = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;
          
          if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const bulletText = trimmed.replace(/^[•\-*]\s*/, "");
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="flex items-start gap-3 text-left"
              >
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                  theme === "light" ? "bg-blue-600" : theme === "vibrant" ? "bg-pink-400 animate-pulse" : "bg-blue-400"
                }`} />
                <p className="text-base md:text-lg leading-relaxed text-inherit opacity-95">{bulletText}</p>
              </motion.div>
            );
          }

          return (
            <motion.p 
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="text-base md:text-lg leading-relaxed text-inherit opacity-90 text-left"
            >
              {trimmed}
            </motion.p>
          );
        })}
      </div>
    );
  };

  const filteredSlideIndices = slides
    .map((slide, index) => ({ slide, index }))
    .filter(
      (item) =>
        item.slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slide.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* EXIT FULLSCREEN / PRESENTER MODE FLOATER */}
      {isPresenterMode && (
        <button
          onClick={() => {
            if (audioEnabled) playClickSound();
            setIsPresenterMode(false);
          }}
          className="fixed top-5 left-5 z-50 bg-rose-600/95 hover:bg-rose-600 border border-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg shadow-rose-950/20 flex items-center gap-1.5 cursor-pointer backdrop-blur transition-all active:scale-95 animate-fade-in"
          id="exitFsBtn"
        >
          ✕ Exit Presenter Mode
        </button>
      )}

      {/* LEFT SIDEBAR: Notebook Source & Controls */}
      <aside className={`bg-[#111827] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col min-h-0 transition-all duration-300 ${
        isPresenterMode ? "w-0 h-0 overflow-hidden opacity-0 border-0 pointer-events-none" : "w-full md:w-[32%]"
      }`}>
         
         {/* Header Title with Book Icon */}
         <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
           <div className="flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
               <BookOpen className="w-4 h-4 text-white animate-pulse" />
             </div>
             <div>
               <h1 className="font-semibold text-sm tracking-wide text-slate-200">AuraSlide Studio</h1>
               <span className="text-[10px] font-mono font-medium text-blue-400/90 tracking-widest uppercase">Notebook Source Node</span>
             </div>
           </div>
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-slate-400">
             <Clock className="w-3 h-3 text-blue-400" />
             <span>{currentTime || "09:27"}</span>
           </div>
         </div>

         {/* Navigation Tabs (Notebook, AuraGPT, Dashboard, Teleprompter, Games) */}
         <div className="flex border-b border-slate-800/80 bg-slate-900/10 shrink-0 overflow-x-auto custom-scrollbar">
           <button
             onClick={() => {
               if (audioEnabled) playClickSound();
               setSidebarTab("notebook");
             }}
             className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold tracking-wider text-center uppercase border-b-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
               sidebarTab === "notebook" 
                 ? "border-blue-500 text-blue-400 bg-slate-900/30" 
                 : "border-transparent text-slate-400 hover:text-slate-200"
             }`}
             title="Draft Notebook source content"
           >
             <Book className="w-3.5 h-3.5 text-blue-400" />
             <span>Draft</span>
           </button>
           <button
             onClick={() => {
               if (audioEnabled) playClickSound();
               setSidebarTab("chatgpt");
             }}
             className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold tracking-wider text-center uppercase border-b-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
               sidebarTab === "chatgpt" 
                 ? "border-emerald-500 text-emerald-400 bg-slate-900/30" 
                 : "border-transparent text-slate-400 hover:text-slate-200"
             }`}
             id="chatgptTabBtn"
             title="AuraGPT limitless chat AI companion"
           >
             <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
             <span>AuraGPT</span>
           </button>
           <button
             onClick={() => {
               if (audioEnabled) playClickSound();
               setSidebarTab("dashboard");
             }}
             className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold tracking-wider text-center uppercase border-b-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
               sidebarTab === "dashboard" 
                 ? "border-indigo-500 text-indigo-400 bg-slate-900/30" 
                 : "border-transparent text-slate-400 hover:text-slate-200"
             }`}
             title="Presentation metrics and explorer"
           >
             <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
             <span>Dashboard</span>
           </button>
           <button
             onClick={() => {
               if (audioEnabled) playClickSound();
               setSidebarTab("teleprompter");
             }}
             className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold tracking-wider text-center uppercase border-b-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
               sidebarTab === "teleprompter" 
                 ? "border-purple-500 text-purple-400 bg-slate-900/30" 
                 : "border-transparent text-slate-400 hover:text-slate-200"
             }`}
             title="Scrolling prompter tool"
           >
             <Tv className="w-3.5 h-3.5 text-purple-400" />
             <span>Prompter</span>
           </button>
           <button
             onClick={() => {
               if (audioEnabled) playClickSound();
               setSidebarTab("games");
             }}
             className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold tracking-wider text-center uppercase border-b-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
               sidebarTab === "games" 
                 ? "border-amber-500 text-amber-400 bg-slate-900/30" 
                 : "border-transparent text-slate-400 hover:text-slate-200"
             }`}
             title="Play break chess or merge tiles"
           >
             <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
             <span>Games</span>
           </button>
         </div>

         {/* Scrollable Content Pane */}
         <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
           
           {sidebarTab === "notebook" ? (
             <div className="space-y-6">
               
               {/* Search & Creator Node */}
               <div className="space-y-3">
                 <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                   <Search className="w-3.5 h-3.5 text-blue-400" />
                   Search & Creator Info
                 </label>
                 <div className="relative">
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => {
                       setSearchQuery(e.target.value);
                       if (e.target.value) setShowSearchCredit(true);
                     }}
                     placeholder="Search slides, keywords, or authors..."
                     className="w-full bg-slate-900/70 border border-slate-800 focus:border-blue-500/80 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-all font-sans"
                   />
                   <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                 </div>

                 {searchQuery && (
                   <motion.div
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-slate-900 border border-blue-500/30 rounded-xl p-3.5 space-y-2.5 text-left"
                   >
                     <div className="flex items-center gap-1.5">
                       <BookOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
                       <span className="text-[10px] font-semibold text-emerald-400 font-mono tracking-wider uppercase">Project Architect Info</span>
                     </div>
                     <p className="text-xs text-slate-200 leading-relaxed">
                       AuraSlide Studio is proudly engineered by <span className="text-emerald-300 font-bold underline">Meshack Mewa</span>, a highly creative learner from <span className="text-blue-300 font-bold">MPESA Foundation Academy</span> 🎓.
                     </p>
                     
                     {/* Filtered slide search results */}
                     <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5">
                       <span className="text-[10px] text-slate-500 font-mono block">Matching Slides:</span>
                       {filteredSlideIndices.length === 0 ? (
                         <span className="text-[10px] text-slate-600 italic block">No slides matched your search query.</span>
                       ) : (
                         <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                           {filteredSlideIndices.map(({ slide, index }) => (
                             <button
                               key={index}
                               onClick={() => {
                                 if (audioEnabled) playClickSound();
                                 setCurrentIndex(index);
                               }}
                               className={`w-full text-left p-2 rounded text-[11px] transition-all flex items-center justify-between cursor-pointer ${
                                 currentIndex === index 
                                   ? "bg-blue-600/25 text-blue-300 border border-blue-500/30" 
                                   : "bg-slate-950/50 hover:bg-slate-800/40 text-slate-400 border border-transparent"
                               }`}
                             >
                               <span className="truncate max-w-[150px] font-medium">{index + 1}. {slide.title}</span>
                               <span className="text-[9px] font-mono text-slate-500">Go ↗</span>
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                   </motion.div>
                 )}
               </div>

               {/* Document Upload Engine */}
               <div className="space-y-3">
                 <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                   <Upload className="w-3.5 h-3.5 text-blue-400" />
                   Document Upload Engine
                 </label>
                 
                 <div
                   onDragOver={handleDragOver}
                   onDragLeave={handleDragLeave}
                   onDrop={handleDrop}
                   className={`relative group border border-dashed rounded-xl p-5 text-center transition-all duration-200 cursor-pointer ${
                     isDraggingFile 
                       ? "border-blue-500 bg-blue-500/10 scale-[0.99]" 
                       : "border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70"
                   }`}
                 >
                   <input
                     type="file"
                     id="docFile"
                     accept=".txt,.pdf"
                     onChange={(e) => {
                       if (e.target.files && e.target.files.length > 0) {
                         handleIncomingFile(e.target.files[0]);
                       }
                     }}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   />
                   
                   <div className="space-y-2">
                     <div className="mx-auto w-10 h-10 rounded-full bg-slate-850/80 flex items-center justify-center border border-slate-800/80 group-hover:scale-105 transition-transform">
                       <Upload className="w-5 h-5 text-blue-400" />
                     </div>
                     
                     <div>
                       <span className="text-xs font-medium text-slate-300 block">
                         {uploadedFileName ? `✔️ Loaded: ${uploadedFileName.substring(0, 20)}...` : "Click to Upload PDF / TXT"}
                       </span>
                       <span className="text-[10px] text-slate-500 mt-1 block">
                         Drag and drop files here to parse
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Quick Examples Selection */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                     <FileText className="w-3.5 h-3.5 text-blue-400" />
                     Template Artifacts
                   </label>
                   <span className="text-[10px] text-slate-500">Quick-load</span>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                   {NOTEBOOK_SAMPLES.map((sample, idx) => (
                     <button
                       key={idx}
                       onClick={() => handleSelectSample(sample)}
                       className="w-full text-left p-2.5 rounded-lg border border-slate-800/70 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800/60 transition-all group flex items-center justify-between cursor-pointer"
                       id={`sample-btn-${idx}`}
                     >
                       <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400 transition-colors">
                         {sample.name}
                       </span>
                       <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                     </button>
                   ))}
                 </div>
               </div>

               {/* Research notes inputs */}
               <div className="space-y-3">
                 <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                   <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                   Source Material
                 </label>
                 <div className="relative">
                   <textarea
                     id="sourceNotes"
                     value={rawNotes}
                     onChange={(e) => setRawNotes(e.target.value)}
                     placeholder="Paste raw research papers, messy notes, topics, or full documents here... Google Gemini will dissect and orchestrate beautiful interactive slides."
                     className="w-full h-56 bg-slate-900/70 border border-slate-800 focus:border-blue-500/80 rounded-xl p-3.5 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:outline-none transition-all custom-scrollbar resize-none font-sans"
                   />
                   {rawNotes && (
                     <button 
                       onClick={() => {
                         setRawNotes("");
                         setUploadedFileName(null);
                       }}
                       className="absolute bottom-3 right-3 text-xs bg-slate-800/90 hover:bg-slate-700 hover:text-white text-slate-400 px-2 py-1 rounded-md transition-all border border-slate-700/50"
                     >
                       Clear
                     </button>
                   )}
                 </div>
               </div>

               {/* AI Generation log / Pipeline status */}
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                     <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                     Execution Status
                   </label>
                   {isGenerating && (
                     <span className="flex h-2 w-2 relative">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                     </span>
                   )}
                 </div>
                 
                 <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5 font-mono text-xs">
                   <div id="aiStatus" className={`italic leading-relaxed ${isGenerating ? 'text-blue-400' : 'text-slate-400'}`}>
                     {aiStatus}
                   </div>
                   
                   {generationSteps.length > 0 && (
                     <div className="border-t border-slate-800/60 pt-2.5 space-y-1.5 text-[11px] text-slate-500">
                       {generationSteps.map((step, index) => (
                         <div key={index} className="flex items-start gap-1.5">
                           <span className="text-blue-500">›</span>
                           <span>{step}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

             </div>
           ) : sidebarTab === "chatgpt" ? (
             
             /* Limitless ChatGPT AuraGPT Companion Tab */
             <div className="space-y-4 flex flex-col justify-between h-full text-left">
               
               <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                   <Bot className="w-4 h-4 text-emerald-400" />
                 </div>
                 <div>
                   <h3 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                     AuraGPT Assistant
                     <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">Limitless</span>
                   </h3>
                   <p className="text-[10px] text-slate-400">Continuous AI chat companion with same ChatGPT capabilities.</p>
                 </div>
               </div>

               {/* Chat Messages */}
               <div className="flex-1 min-h-[320px] max-h-[440px] overflow-y-auto space-y-3.5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 custom-scrollbar flex flex-col">
                 {chatMessages.map((msg, i) => (
                   <div
                     key={i}
                     className={`flex flex-col space-y-1 ${msg.role === "user" ? "items-end text-right" : "items-start text-left"}`}
                   >
                     <div className="flex items-center gap-1">
                       <span className="text-[9px] text-slate-500 font-mono uppercase">
                         {msg.role === "user" ? "You" : "AuraGPT"}
                       </span>
                     </div>
                     <div
                       className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] break-words shadow-sm ${
                         msg.role === "user"
                           ? "bg-blue-600 text-white rounded-tr-none text-left"
                           : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none text-left"
                       }`}
                     >
                       <p className="whitespace-pre-line">{msg.content}</p>

                       {msg.role === "assistant" && i > 0 && (
                         <button
                           onClick={() => handleExportChatToSlides(msg.content)}
                           className="mt-3 w-full py-1.5 px-2.5 rounded bg-emerald-950/60 hover:bg-emerald-900 text-[10px] font-semibold text-emerald-400 border border-emerald-800/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                         >
                           <Sparkles className="w-3 h-3" />
                           Export to Text Node
                         </button>
                       )}
                     </div>
                   </div>
                 ))}

                 {isChatResponding && (
                   <div className="flex items-center gap-2 p-2 text-xs text-slate-500 font-mono italic">
                     <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                     <span>AuraGPT is generating response...</span>
                   </div>
                 )}
               </div>

               {/* Chat Input form */}
               <form onSubmit={handleChatSubmit} className="flex gap-2">
                 <input
                   type="text"
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Ask ChatGPT anything with no limits..."
                   className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 transition-all font-sans"
                 />
                 <button
                   type="submit"
                   disabled={isChatResponding || !chatInput.trim()}
                   className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                     !chatInput.trim() || isChatResponding
                       ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                       : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/25 cursor-pointer"
                   }`}
                 >
                   <Send className="w-3.5 h-3.5" />
                 </button>
               </form>

             </div>
           ) : sidebarTab === "dashboard" ? (
             <DashboardView
               slides={slides}
               currentIndex={currentIndex}
               setCurrentIndex={setCurrentIndex}
               theme={theme}
               setTheme={setTheme}
               audioEnabled={audioEnabled}
               rawNotes={rawNotes}
             />
           ) : sidebarTab === "teleprompter" ? (
             <TeleprompterView
               slides={slides}
               currentIndex={currentIndex}
             />
           ) : (
             <GamesHubView />
           )}

         </div>

         {/* Action Button Dock */}
         <div className="p-4 bg-slate-900/60 border-t border-slate-800/60 flex flex-col gap-2 shrink-0">
           <button
             onClick={handleGenerateSlides}
             disabled={isGenerating || !rawNotes.trim()}
             className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
               !rawNotes.trim() 
                 ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50 shadow-none"
                 : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-blue-600/10 cursor-pointer"
             }`}
             id="generate-slides-btn"
           >
             {isGenerating ? (
               <>
                 <RefreshCw className="w-4 h-4 animate-spin text-white" />
                 <span>Designing Slides...</span>
               </>
             ) : (
               <>
                 <Sparkles className="w-4 h-4 text-white" />
                 <span>Generate Presentation</span>
               </>
             )}
           </button>

           <button
             onClick={handleResetToDefault}
             disabled={isGenerating}
             className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
             id="reset-btn"
           >
             <RotateCcw className="w-3.5 h-3.5" />
             Reset to Welcome Deck
           </button>
         </div>

       </aside>

       {/* RIGHT SIDE: Presentation Stage & Canvas */}
      <main className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative bg-[#0f172a] min-h-0 transition-all duration-300">
        
        {/* Top bar configuration */}
        <div className="flex flex-wrap items-center justify-between w-full max-w-4xl mx-auto gap-4 mb-6" id="configBar">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Theme Selector */}
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-400">Theme:</span>
              <select
                id="themeSelector"
                value={theme}
                onChange={(e) => {
                  if (audioEnabled) playClickSound();
                  setTheme(e.target.value as SlideTheme);
                }}
                className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none focus:ring-0 cursor-pointer pr-1"
              >
                <option value="light" className="bg-slate-900 text-white">Modern Canvas (Light)</option>
                <option value="dark" className="bg-slate-900 text-white">Cyber Studio (Dark)</option>
                <option value="vibrant" className="bg-slate-900 text-white">Neon Deep (Gradient)</option>
              </select>
            </div>

            {/* Sound FX Selector */}
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
              <span className="text-xs text-slate-400">Sound FX:</span>
              <select
                id="soundSelector"
                value={soundType}
                onChange={(e) => {
                  const type = e.target.value as "whoosh" | "click" | "pop";
                  setSoundType(type);
                  if (audioEnabled) {
                    setTimeout(() => playSelectedSound(type), 50);
                  }
                }}
                className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none focus:ring-0 cursor-pointer pr-1"
              >
                <option value="whoosh" className="bg-slate-900 text-white">🔊 Kinetic Whoosh</option>
                <option value="click" className="bg-slate-900 text-white">🔊 Clean Digital Click</option>
                <option value="pop" className="bg-slate-900 text-white">🔊 Modern Interface Pop</option>
              </select>
            </div>

          </div>

          <div className="flex items-center gap-2">
            
            {/* Audio Toggle */}
            <button
              onClick={handleToggleAudio}
              className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer relative group"
              title={audioEnabled ? "Mute Transition Sound" : "Unmute Transition Sound"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-950 text-slate-200 text-[10px] py-1 px-2 rounded font-sans tracking-wide border border-slate-800 whitespace-nowrap">
                Whoosh feedback: {audioEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Global Search trigger with Book & Search Icon */}
            <button
              onClick={() => {
                if (audioEnabled) playClickSound();
                setIsGlobalSearchOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-500/50 cursor-pointer hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-500/20"
              id="global-search-btn"
              title="Global Search"
            >
              <Search className="w-3.5 h-3.5" />
              <Book className="w-3 h-3 text-blue-200" />
              <span>Search Workspace</span>
            </button>

            {/* Custom Presenter Mode Toggle */}
            <button
              onClick={() => {
                if (audioEnabled) playClickSound();
                setIsPresenterMode(!isPresenterMode);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${
                isPresenterMode 
                  ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500" 
                  : "bg-slate-900/50 border-slate-800/60 hover:border-slate-700 text-slate-300 hover:text-white"
              }`}
              id="presenter-mode-btn"
              title="Toggle Widescreen Presenter Mode"
            >
              {isPresenterMode ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-blue-400" />}
              <span>Presenter Mode</span>
            </button>

            {/* Quick fullscreen instructions */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer group relative"
              title="Toggle Fullscreen Mode"
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-blue-400" /> : <Maximize className="w-4 h-4" />}
              <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-950 text-slate-200 text-[10px] py-1 px-2 rounded font-sans tracking-wide border border-slate-800 whitespace-nowrap">
                {isFullscreen ? 'Exit Fullscreen' : 'Present Mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Slide Stage Area */}
        <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto my-auto relative">
          
          <div 
            ref={stageRef}
            id="displayCardStage"
            className={`w-full aspect-[16/9] flex items-center justify-center transition-all duration-500 ${
              isFullscreen 
                ? "bg-slate-950 p-8 sm:p-16 w-screen h-screen max-w-none max-h-none fixed inset-0 z-50 flex flex-col justify-between" 
                : isPresenterMode
                ? "max-w-5xl py-4 sm:py-8"
                : ""
            }`}
          >
            {/* Card Frame (Gamma / Prezi Mix) */}
            <div 
              id="displayCard"
              className={`w-full h-full rounded-2xl shadow-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isPresenterMode 
                  ? "max-w-[840px] max-h-[472px] p-10 sm:p-14" 
                  : "max-w-[760px] max-h-[428px] p-8 sm:p-12"
              } ${
                theme === "light" 
                  ? "bg-slate-50 text-slate-800 border border-slate-200/90 shadow-slate-900/10" 
                  : theme === "vibrant"
                  ? "bg-gradient-to-br from-[#12072b] via-[#1b082e] to-[#2b082d] text-fuchsia-100 border border-fuchsia-900/30 shadow-fuchsia-500/5"
                  : "bg-slate-900 text-slate-100 border border-slate-800 shadow-slate-950/40"
              }`}
            >
              
              {/* Canva Style In-Place Edit Controls */}
              {!isFullscreen && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950/20 px-2 py-0.5 rounded">
                    Canva Mode
                  </span>
                  <button
                    onClick={() => {
                      if (audioEnabled) playClickSound();
                      setIsEditMode(!isEditMode);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer border ${
                      isEditMode
                        ? "bg-amber-600/20 border-amber-500/50 text-amber-300"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{isEditMode ? "✍️ Editing" : "👁️ View"}</span>
                  </button>
                </div>
              )}

              {/* Internal Presentation Header - Fullscreen specific or decorative */}
              {isFullscreen && (
                <div className="flex items-center justify-between w-full pb-4 border-b border-slate-800/50 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">AuraSlide Live Present</span>
                  </div>
                  <button 
                    onClick={toggleFullscreen}
                    className="text-xs text-slate-500 hover:text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700"
                  >
                    Press ESC to Exit
                  </button>
                </div>
              )}

              {/* Prezi Animated Content Node */}
              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.94, rotate: -0.5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.04, rotate: 0.5 }}
                    transition={{ duration: 0.38, ease: [0.25, 1, 0.5, 1] }}
                    className="h-full w-full flex flex-col justify-center"
                  >
                    {/* Slide Title */}
                    {isEditMode ? (
                      <textarea
                        value={slides[currentIndex]?.title || ""}
                        onChange={(e) => updateCurrentSlideTitle(e.target.value)}
                        placeholder="Type Slide Title..."
                        className={`w-full bg-slate-800/10 border border-dashed border-slate-700/50 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-lg font-extrabold font-display tracking-tight mb-5 leading-tight text-left ${
                          isPresenterMode ? "text-3xl sm:text-4xl md:text-5xl" : "text-2xl sm:text-3xl md:text-4xl"
                        } ${
                          theme === "vibrant" 
                            ? "text-fuchsia-100" 
                            : theme === "light"
                            ? "text-slate-950"
                            : "text-white"
                        }`}
                        rows={1}
                      />
                    ) : (
                      <h2 
                        id="displayTitle"
                        className={`font-extrabold font-display tracking-tight mb-5 leading-tight text-left ${
                          isPresenterMode ? "text-3xl sm:text-4xl md:text-5xl" : "text-2xl sm:text-3xl md:text-4xl"
                        } ${
                          theme === "vibrant" 
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-200" 
                            : theme === "light"
                            ? "text-slate-950"
                            : "text-white"
                        }`}
                      >
                        {slides[currentIndex]?.title || "AuraSlide Presentation Layer"}
                      </h2>
                    )}

                    {/* Slide Body */}
                    <div 
                      id="displayBody" 
                      className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 text-left"
                    >
                      {isEditMode ? (
                        <textarea
                          value={slides[currentIndex]?.body || ""}
                          onChange={(e) => updateCurrentSlideBody(e.target.value)}
                          placeholder="Type Slide Body details (use newlines or dash '-' for bullet points)..."
                          className={`w-full h-32 bg-slate-800/10 border border-dashed border-slate-700/50 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-lg font-sans text-sm leading-relaxed text-left ${
                            theme === "light" ? "text-slate-950" : "text-slate-200"
                          }`}
                        />
                      ) : (
                        slides[currentIndex] 
                          ? renderSlideBodyText(slides[currentIndex].body)
                          : <p className="text-slate-500 italic">No presentation content available.</p>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Presentation Card Footer (Slide index details) */}
              <div className="pt-6 border-t border-slate-200/10 mt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>AURA PRESENTATION ENGINE</span>
                <span>SLIDE {currentIndex + 1} OF {slides.length}</span>
              </div>

            </div>

            {/* In-Fullscreen floating controls overlay */}
            {isFullscreen && (
              <div className="mt-6 flex gap-4 items-center justify-center bg-slate-900/90 border border-slate-800 px-6 py-3 rounded-full shadow-2xl">
                <button
                  onClick={() => navigateSlide(-1)}
                  disabled={currentIndex === 0}
                  className={`p-2 rounded-full cursor-pointer hover:bg-slate-800 transition-colors ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'text-white'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-slate-300 font-mono">
                  Slide {currentIndex + 1} / {slides.length}
                </span>
                <button
                  onClick={() => navigateSlide(1)}
                  disabled={currentIndex === slides.length - 1}
                  className={`p-2 rounded-full cursor-pointer hover:bg-slate-800 transition-colors ${currentIndex === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-white'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Media & Slide Track Switcher Navigation Controls */}
        <div className="w-full max-w-4xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/40 pt-6" id="navigationControls">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Controls Active</span>
            <span className="mx-1 text-slate-700">|</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">←</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">→</kbd>
            <span className="text-slate-500">keys supported</span>
          </div>

          <div className="controls flex gap-4 items-center">
            <button
              onClick={handleNarrate}
              className={`py-2 px-4 rounded-full font-semibold text-xs border transition-all flex items-center gap-1.5 cursor-pointer ${
                isNarrating
                  ? "bg-amber-600/20 border-amber-500/50 text-amber-300 animate-pulse"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
              }`}
              id="listen-slide-btn"
              title="Narrate current slide contents using Web Speech API"
            >
              <Volume2 className={`w-4 h-4 ${isNarrating ? 'text-amber-400' : 'text-blue-400'}`} />
              <span>{isNarrating ? "Stop Audio" : "Listen to Slide"}</span>
            </button>

            <button 
              className={`nav-btn py-2 px-5 rounded-full font-semibold text-xs border transition-all flex items-center gap-1 cursor-pointer ${
                currentIndex === 0 
                  ? "bg-slate-900/30 text-slate-600 border-slate-800/50 cursor-not-allowed shadow-none"
                  : "bg-slate-900 hover:bg-slate-800 text-white border-slate-800 hover:border-slate-700 active:scale-95"
              }`}
              onClick={() => navigateSlide(-1)}
              disabled={currentIndex === 0}
              id="prev-slide-btn"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <span 
              id="slideCounter" 
              className="text-xs sm:text-sm font-semibold text-slate-400 font-mono min-w-[76px] text-center"
            >
              Slide {currentIndex + 1} / {slides.length}
            </span>
            
            <button 
              className={`nav-btn py-2 px-5 rounded-full font-semibold text-xs border transition-all flex items-center gap-1 cursor-pointer ${
                currentIndex === slides.length - 1 
                  ? "bg-slate-900/30 text-slate-600 border-slate-800/50 cursor-not-allowed shadow-none"
                  : "bg-slate-900 hover:bg-slate-800 text-white border-slate-800 hover:border-slate-700 active:scale-95"
              }`}
              onClick={() => navigateSlide(1)}
              disabled={currentIndex === slides.length - 1}
              id="next-slide-btn"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>

      {/* Global Workspace Search Modal */}
      <AnimatePresence>
        {isGlobalSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-sans"
            onClick={() => setIsGlobalSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Search input header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex items-center gap-3 relative">
                <Search className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Search slides, continuous AuraGPT chat logs, or raw text node..."
                  className="w-full bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 pr-8"
                />
                <button
                  onClick={() => setIsGlobalSearchOpen(false)}
                  className="absolute right-4 text-slate-500 hover:text-slate-300 p-1 rounded-md hover:bg-slate-800 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Creator Attribution Banner with Book Icon */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900/60 border-b border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Book className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed & engineered by <span className="text-indigo-300 font-bold">Meshack Mewa</span>, a learner from <span className="text-blue-300 font-bold">MPESA Foundation Academy</span> 🎓. Dedicated to limit-free interactive presentations.
                  </p>
                </div>
              </div>

              {/* Results Pane */}
              <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-1 max-h-[50vh]">
                {!globalSearchQuery.trim() ? (
                  <div className="text-center py-8 space-y-2">
                    <Search className="w-10 h-10 text-slate-700 mx-auto" />
                    <h3 className="text-sm font-semibold text-slate-400">Search Workspace</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Type anything to search seamlessly across all generated slide content, the raw material draft node, and your complete continuous AuraGPT conversation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Slide Matches */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Slide Deck Contents</h4>
                      </div>
                      {slides.filter(s => 
                        s.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
                        s.body.toLowerCase().includes(globalSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <p className="text-xs text-slate-600 italic pl-5">No slide matches found.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {slides.map((s, idx) => {
                            const isTitleMatch = s.title.toLowerCase().includes(globalSearchQuery.toLowerCase());
                            const isBodyMatch = s.body.toLowerCase().includes(globalSearchQuery.toLowerCase());
                            if (!isTitleMatch && !isBodyMatch) return null;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (audioEnabled) playClickSound();
                                  setCurrentIndex(idx);
                                  setIsGlobalSearchOpen(false);
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40 transition-all flex flex-col gap-1 cursor-pointer"
                              >
                                <span className="text-xs font-semibold text-blue-400">Slide {idx + 1}: {s.title}</span>
                                <span className="text-[11px] text-slate-400 line-clamp-1">{s.body}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* AuraGPT Chat Matches */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">AuraGPT Chat History</h4>
                      </div>
                      {chatMessages.filter(msg => 
                        msg.content.toLowerCase().includes(globalSearchQuery.toLowerCase())
                      ).length === 0 ? (
                        <p className="text-xs text-slate-600 italic pl-5">No chat match found.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {chatMessages.map((msg, idx) => {
                            if (!msg.content.toLowerCase().includes(globalSearchQuery.toLowerCase())) return null;
                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (audioEnabled) playClickSound();
                                  setSidebarTab("chatgpt");
                                  setIsGlobalSearchOpen(false);
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40 transition-all flex flex-col gap-1 cursor-pointer"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                                    {msg.role === "assistant" ? "AuraGPT response" : "Your query"}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">Jump ↗</span>
                                </div>
                                <span className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{msg.content}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Raw Text Node Matches */}
                    {rawNotes.toLowerCase().includes(globalSearchQuery.toLowerCase()) && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Source Notebook Document Node</h4>
                        </div>
                        <button
                          onClick={() => {
                            if (audioEnabled) playClickSound();
                            setSidebarTab("notebook");
                            setIsGlobalSearchOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40 transition-all flex flex-col gap-1 cursor-pointer"
                        >
                          <span className="text-xs font-semibold text-indigo-400">Draft Source Text matched your query!</span>
                          <span className="text-[11px] text-slate-400 line-clamp-1">{rawNotes}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-center">
                <span className="text-[10px] text-slate-600 font-mono">Press ESC or click outside to dismiss this search dialog</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
