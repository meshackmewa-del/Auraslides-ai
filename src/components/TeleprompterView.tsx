import React, { useState, useEffect, useRef } from "react";
import { Slide } from "../types";
import { Play, Pause, RotateCcw, Type, Sliders, Volume2 } from "lucide-react";

interface TeleprompterViewProps {
  slides: Slide[];
  currentIndex: number;
}

export default function TeleprompterView({ slides, currentIndex }: TeleprompterViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2); // 1 to 5
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg" | "xl" | "huge">("lg");
  const [useAllSlides, setUseAllSlides] = useState<boolean>(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  // Auto-scroll loop
  useEffect(() => {
    const scroll = () => {
      if (scrollContainerRef.current && isPlaying) {
        const el = scrollContainerRef.current;
        // speed scaling factor
        const pixelStep = speed * 0.25;
        el.scrollTop += pixelStep;
        
        // If reached bottom, pause
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
          setIsPlaying(false);
        }
      }
      if (isPlaying) {
        requestRef.current = requestAnimationFrame(scroll);
      }
    };

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(scroll);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Restart scroll if we change slides
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentIndex, useAllSlides]);

  const handleReset = () => {
    setIsPlaying(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Compile teleprompter text
  const getPromptText = () => {
    if (useAllSlides) {
      return slides.map((s, idx) => `[Slide ${idx + 1}: ${s.title}]\n${s.body}`).join("\n\n");
    }
    const current = slides[currentIndex];
    if (!current) return "No content available.";
    return `[${current.title}]\n\n${current.body}`;
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-sm";
      case "md": return "text-base";
      case "lg": return "text-xl sm:text-2xl";
      case "xl": return "text-3xl";
      case "huge": return "text-4xl sm:text-5xl font-extrabold";
    }
  };

  return (
    <div className="space-y-4 text-left font-sans animate-fade-in">
      
      {/* Overview notice */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Teleprompter Assistant</h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Read slide contents naturally while presenting. Controls allow you to adjust pace and text readability.
        </p>
      </div>

      {/* Speed & Size Panel */}
      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 space-y-3.5">
        
        {/* Toggle Mode */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Content Range:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => { setUseAllSlides(false); handleReset(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                !useAllSlides 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Active Slide Only
            </button>
            <button
              onClick={() => { setUseAllSlides(true); handleReset(); }}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                useAllSlides 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              Full Deck
            </button>
          </div>
        </div>

        {/* Speed Adjustment */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-blue-400" />
              Scroll Speed:
            </span>
            <span className="font-mono text-blue-400 font-bold">{speed}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Font Size Selection */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            Size Selector:
          </span>
          <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded-lg">
            {(["sm", "md", "lg", "xl", "huge"] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`py-1 rounded text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                  fontSize === sz 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Prompter Scrolling Screen */}
      <div className="relative">
        {/* Mirror Line guide in the center of the teleprompter window */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t border-dashed border-red-500/40 pointer-events-none z-10 flex items-center justify-end pr-2">
          <span className="bg-red-950 text-red-400 text-[8px] px-1 font-mono rounded opacity-60">FOCUS GUIDE</span>
        </div>

        <div 
          ref={scrollContainerRef}
          className="h-[280px] overflow-y-auto bg-black rounded-xl p-5 border border-slate-800 scroll-smooth custom-scrollbar relative flex flex-col"
        >
          {/* Scroll fade masks */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

          <p className={`whitespace-pre-wrap leading-relaxed text-center font-bold tracking-normal font-sans py-24 select-none ${getFontSizeClass()} text-emerald-400`}>
            {getPromptText()}
          </p>
        </div>
      </div>

      {/* Player Controller Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            isPlaying 
              ? "bg-amber-600/20 border-amber-500/50 text-amber-300 hover:bg-amber-600/30" 
              : "bg-blue-600 border-blue-500 text-white hover:bg-blue-500"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-amber-300" />
              <span>Pause Scroll</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Start Auto Scroll</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Rewind to start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rewind</span>
        </button>
      </div>

    </div>
  );
}
