import React from "react";
import { Slide, SlideTheme } from "../types";
import { 
  BarChart, 
  FileText, 
  Clock, 
  BookOpen, 
  Award, 
  Layout, 
  CheckCircle,
  TrendingUp,
  Sliders,
  Sparkles
} from "lucide-react";

interface DashboardViewProps {
  slides: Slide[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  theme: SlideTheme;
  setTheme: (theme: SlideTheme) => void;
  audioEnabled: boolean;
  rawNotes: string;
}

export default function DashboardView({
  slides,
  currentIndex,
  setCurrentIndex,
  theme,
  setTheme,
  audioEnabled,
  rawNotes
}: DashboardViewProps) {
  
  // Calculations
  const totalSlides = slides.length;
  
  const calculateStats = () => {
    let words = 0;
    let chars = 0;
    slides.forEach(s => {
      words += s.title.split(/\s+/).filter(Boolean).length;
      words += s.body.split(/\s+/).filter(Boolean).length;
      chars += s.title.length + s.body.length;
    });
    
    // Average reading speed is ~130 words per minute for slides
    const readTimeSeconds = Math.round((words / 130) * 60) || 5;
    const formatReadTime = (secs: number) => {
      if (secs < 60) return `${secs} seconds`;
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      return `${mins}m ${remainingSecs}s`;
    };

    return {
      words,
      chars,
      readTimeStr: formatReadTime(readTimeSeconds),
      avgWordsPerSlide: Math.round(words / (totalSlides || 1))
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in">
      
      {/* Creator Pride Card */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-4.5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Award className="w-24 h-24 text-indigo-400" />
        </div>
        <div className="flex items-center gap-2.5 mb-2 relative z-10">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-4 h-4 animate-pulse" />
          </span>
          <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-widest uppercase">Project Creator</span>
        </div>
        <h3 className="text-sm font-bold text-slate-100 mb-1 relative z-10">Meshack Mewa</h3>
        <p className="text-xs text-slate-300 leading-relaxed relative z-10">
          A creative learner at the <span className="text-blue-400 font-semibold underline decoration-wavy">MPESA Foundation Academy</span> 🎓.
        </p>
        <p className="text-[10px] text-slate-500 mt-2 italic relative z-10">
          "Dedicated to building interactive, infinite-possibility workspace presentation suites."
        </p>
      </div>

      {/* Presentation Metrics Matrix */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Slide Count</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-blue-400">{totalSlides}</span>
            <span className="text-[10px] text-slate-500">pages</span>
          </div>
        </div>
        
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Est. Read Time</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-emerald-400 truncate max-w-full">{stats.readTimeStr}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Total Words</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-purple-400">{stats.words}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Density Index</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-slate-300">{stats.avgWordsPerSlide} words/p</span>
          </div>
        </div>
      </div>

      {/* Slide Navigation List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-blue-400" />
            Slide Index Explorer
          </label>
          <span className="text-[10px] text-slate-500">{totalSlides} slides total</span>
        </div>

        <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                currentIndex === idx
                  ? "bg-blue-600/10 border-blue-500/50 text-blue-300"
                  : "bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center gap-2 truncate max-w-[85%]">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono ${
                  currentIndex === idx ? "bg-blue-500 text-white" : "bg-slate-850 text-slate-500"
                }`}>
                  {idx + 1}
                </span>
                <span className="text-xs font-medium truncate">{slide.title || "(Untitled Slide)"}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 shrink-0">
                {slide.body.split(/\s+/).filter(Boolean).length} words
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Word Density chart */}
      <div className="space-y-3">
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          Word Distribution Ratio
        </label>
        
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
          {slides.map((slide, idx) => {
            const wordCount = slide.body.split(/\s+/).filter(Boolean).length;
            const maxWords = Math.max(...slides.map(s => s.body.split(/\s+/).filter(Boolean).length), 1);
            const percentage = Math.min((wordCount / maxWords) * 100, 100);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span className={currentIndex === idx ? "text-blue-400 font-bold" : ""}>Slide {idx + 1}</span>
                  <span>{wordCount} words</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentIndex === idx ? "bg-blue-500" : "bg-indigo-600/40"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
