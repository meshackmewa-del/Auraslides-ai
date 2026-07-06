/**
 * Synthesizes a futuristic, elegant Prezi-style whoosh transition sound effect
 * using the Web Audio API. This avoids external asset fetching latency or network failures.
 */
export const playWhooshSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // Create white noise buffer
    const duration = 0.35; // seconds
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // Create source
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Bandpass filter to sculpt the whoosh sweep
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 4.0; // high resonance
    
    // Sweep frequency exponentially from low to high and back
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration);
    
    // Gain node for clean envelope shaping
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1); // peak volume
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    // Connect nodes
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    // Start noise
    noiseSource.start();
    noiseSource.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn("Web Audio API not allowed or supported yet:", error);
  }
};

/**
 * Synthesizes a soft, clean UI click feedback sound.
 */
export const playClickSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Fail silently
  }
};

/**
 * Synthesizes a modern bubbly interface pop sound.
 */
export const playPopSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    
    // We can layer two sine waves with different frequencies and slightly staggered envelopes to get a beautiful "pop"
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    osc1.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.18);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(600, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
    
    gain1.gain.setValueAtTime(0.001, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    
    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(ctx.currentTime + 0.18);
    
    osc2.start();
    osc2.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Fail silently
  }
};

/**
 * Plays the chosen sound type.
 */
export const playSelectedSound = (soundType: "whoosh" | "click" | "pop") => {
  if (soundType === "whoosh") {
    playWhooshSound();
  } else if (soundType === "click") {
    playClickSound();
  } else if (soundType === "pop") {
    playPopSound();
  }
};
