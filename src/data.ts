import { Slide } from "./types";

export interface NotebookSample {
  name: string;
  text: string;
}

export const NOTEBOOK_SAMPLES: NotebookSample[] = [
  {
    name: "🚀 Quantum Computing 101",
    text: `Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers.
    
Key Concepts:
• Superposition: Unlike classical bits that are either 0 or 1, qubits can exist in a state of superposition, representing both 0 and 1 simultaneously. This enables exponential processing parallelisms.
• Entanglement: A unique quantum link where the state of one qubit instantaneously determines the state of another, no matter how far apart they are.
• Quantum Decoherence: The loss of quantum state due to environmental interference. This is the biggest engineering obstacle to scaling quantum processors.

Key Applications:
• Advanced Cryptography: Shattering current encryption protocols while creating highly secure quantum communication keys.
• Molecular Modeling: Simulating molecular interactions at an atomic scale to discover life-saving drugs in days rather than decades.
• Portfolio Optimization: Solving extremely complex routing, supply chain, and portfolio problems in seconds.`
  },
  {
    name: "🎨 The Art of Minimalism",
    text: `Minimalism in modern design is not about creating an empty space; it is about intentionality, absolute clarity, and focus.

Core Principles:
• Negative Space: Also known as white space. It gives elements room to breathe and directs the viewer's attention to the most important content.
• High Typographic Contrast: Pairing massive, bold display headings with highly legible, small-scale sans-serif or mono text blocks.
• Functional Color: Using a single, carefully chosen accent color rather than chaotic multi-color palettes.

Famous Design Philosophies:
• "Less is more" — Ludwig Mies van der Rohe.
• "Form follows function" — Louis Sullivan.
• "Good design is as little design as possible" — Dieter Rams.`
  },
  {
    name: "🌿 Photosynthesis Process",
    text: `Photosynthesis is the biological chemical engine of nature, converting solar energy into organic fuel.

The Two Core Phases:
1. Light-Dependent Reactions:
• Takes place inside the thylakoid membranes of chloroplasts.
• Chlorophyll pigments absorb sunlight and split water molecules (H2O), releasing oxygen (O2) as a byproduct.
• Generates ATP and NADPH chemical energy carriers.

2. Light-Independent Reactions (The Calvin Cycle):
• Occurs in the stroma of the chloroplast.
• Uses ATP and NADPH to convert carbon dioxide (CO2) from the air into glucose (sugar).
• Does not directly require light, but depends on the immediate products of the light reactions.`
  }
];

export const DEFAULT_SLIDES: Slide[] = [
  {
    title: "Welcome to AuraSlide Studio",
    body: `AuraSlide Studio converts your raw research, structured docs, or messy thoughts into beautiful, presentation-ready slides using Google Gemini.

• Paste your materials into the source document node on the left.
• Trigger the Google AI generation pipeline.
• Watch as your concepts are organized with cinematic motion.`
  },
  {
    title: "Cinematic Prezi-Style Fluidity",
    body: `Transition between ideas seamlessly using dynamic camera-based zoom motions.

• Each slide movement uses micro-animations to shift canvas scaling.
• Experience instant auditory feedback on every slide shift.
• Supports keyboard Left/Right arrows for full screen control.`
  },
  {
    title: "Gamma Style Color Matrices",
    body: `Switch your presentation's aesthetic in real-time with curated themes:

• Modern Canvas: Crisp, minimal layout styled with clean margins and negative space.
• Cyber Studio: Sleek slate canvas with vivid electric glow borders.
• Neon Deep: Luminous magenta-to-violet linear gradients.`
  }
];
