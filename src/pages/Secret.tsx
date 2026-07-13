import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flame,
  ArrowLeft,
  Dices,
  HelpCircle,
  Award,
  Compass,
  Check,
  RotateCw
} from "lucide-react";

// Types for the Poses
interface Pose {
  id: string;
  name: string;
  category: "Cuddling" | "Intimate" | "Playful" | "Sensation" | "Acrobatic";
  spiciness: number; // 1 to 5
  description: string;
  howTo: string;
  benefits: string;
  tip: string;
  illustration: React.ReactNode;
}

// Custom SFW Minimalist / Abstract Neon Vector Illustrations
const PosesData: Pose[] = [
  {
    id: "spooning",
    name: "Cozy Spooning",
    category: "Cuddling",
    spiciness: 1,
    description: "Nestled side-by-side like matching silverware. This pose is perfect for quiet mornings, breathing together, and sharing slow, comforting caresses.",
    howTo: "Both lay on your sides facing the same direction. The partner behind wraps their arms around the front partner, nestling closely against their back.",
    benefits: "Reduces anxiety, fosters deep security, and maximizes tactile surface contact.",
    tip: "Coordinate your breathing—inhale and exhale in unison to achieve deep physiological synchronization.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-spoon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff758c" />
            <stop offset="100%" stopColor="#ff7eb3" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Abstract Inner C-shape (Partner 1) */}
        <path d="M60 140 C 30 110, 30 70, 70 50 C 90 40, 110 50, 115 70" stroke="url(#grad-spoon)" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
        {/* Abstract Outer C-shape (Partner 2) */}
        <path d="M80 155 C 50 120, 50 80, 90 60 C 110 50, 130 60, 135 80" stroke="url(#grad-spoon)" strokeWidth="10" strokeLinecap="round" filter="url(#glow)" />
        {/* Floating Hearts */}
        <path d="M140 50 C135 45, 125 45, 120 50 C115 45, 105 45, 100 50 C100 60, 115 75, 120 80 C125 75, 140 60, 140 50 Z" fill="#ff758c" filter="url(#glow)" className="animate-pulse" />
        <circle cx="50" cy="160" r="4" fill="#ff7eb3" />
        <circle cx="160" cy="110" r="6" fill="#ff758c" opacity="0.5" />
      </svg>
    )
  },
  {
    id: "lotus",
    name: "Tantric Lotus",
    category: "Intimate",
    spiciness: 3,
    description: "An ancient seated pose of deep alignment, face-to-face. It prioritizes profound eye contact and spiritual connection over rapid movement.",
    howTo: "One partner sits cross-legged (Lotus style). The other partner sits on their lap, wrapping their legs around the first partner's waist and arms around their neck.",
    benefits: "Intense emotional intimacy, face-to-face communication, and deep emotional grounding.",
    tip: "Maintain uninterrupted eye contact for at least 2 minutes. The world around you will quickly fade away.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-lotus" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8a2387" />
            <stop offset="50%" stopColor="#e94057" />
            <stop offset="100%" stopColor="#f27121" />
          </linearGradient>
        </defs>
        {/* Lotus Flower base */}
        <path d="M40 140 C 70 160, 130 160, 160 140 C 180 160, 120 180, 100 180 C 80 180, 20 160, 40 140 Z" fill="url(#grad-lotus)" opacity="0.3" />
        {/* Concentric Energy Waves */}
        <circle cx="100" cy="100" r="50" stroke="url(#grad-lotus)" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
        <circle cx="100" cy="100" r="70" stroke="url(#grad-lotus)" strokeWidth="1" strokeDasharray="3,6" opacity="0.2" />
        {/* Two Intersecting Vertical Silhouettes (Abstract union) */}
        <path d="M85 70 C 85 55, 115 55, 115 70 C 115 85, 95 100, 100 130" stroke="url(#grad-lotus)" strokeWidth="8" strokeLinecap="round" />
        <path d="M115 75 C 115 60, 85 60, 85 75 C 85 90, 105 105, 100 135" stroke="#f27121" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <circle cx="100" cy="50" r="8" fill="#e94057" />
      </svg>
    )
  },
  {
    id: "doggy_wild",
    name: "The Passionate Wave",
    category: "Playful",
    spiciness: 4,
    description: "Highly energetic and exciting, this pose channels instinctual passion and rhythmic play, offering deep angles of physical connection.",
    howTo: "One partner kneels on all fours (hands and knees). The other partner kneels directly behind, holding the hips for support and rhythm control.",
    benefits: "Exciting, high-tempo rhythm, and allows freedom of motion for both partners.",
    tip: "Use light, slow hip caresses to balance out the high energy and keep the connection intensely mutual.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-wild" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f12711" />
            <stop offset="100%" stopColor="#f5af19" />
          </linearGradient>
        </defs>
        {/* Kneeling Base Figure (Abstract Line) */}
        <path d="M40 130 L 70 130 L 100 100 L 140 100" stroke="#f5af19" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        {/* Active Arching Figure */}
        <path d="M80 145 L 110 145 L 130 95 L 115 65" stroke="url(#grad-wild)" strokeWidth="10" strokeLinecap="round" />
        {/* Lightning Bolt Sparkles of Energy */}
        <path d="M150 50 L 140 65 L 155 70 L 145 90" stroke="#f12711" strokeWidth="3" strokeLinecap="round" strokeJoin="round" />
        <circle cx="120" cy="50" r="6" fill="#f12711" />
        <circle cx="160" cy="120" r="4" fill="#f5af19" />
      </svg>
    )
  },
  {
    id: "cradle",
    name: "The Sensual Cradle",
    category: "Cuddling",
    spiciness: 2,
    description: "A deeply protective and warm cuddle where one partner holds the other fully in their lap, shielding them from the outside world.",
    howTo: "The receiving partner sits comfortably upright against a headboard or cushions. The other partner reclines between their thighs, resting their head against their chest.",
    benefits: "Fosters intense feelings of safety, relief from stress, and full upper body warmth.",
    tip: "The sitting partner can gently play with the other's hair or trace their fingers over their collarbones.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-cradle" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c6ff" />
            <stop offset="100%" stopColor="#0072ff" />
          </linearGradient>
        </defs>
        {/* Big cradling arc representing protection */}
        <path d="M40 80 C 40 140, 160 140, 160 80" stroke="url(#grad-cradle)" strokeWidth="10" strokeLinecap="round" />
        {/* Inner protected sphere */}
        <circle cx="100" cy="90" r="25" stroke="#00c6ff" strokeWidth="4" strokeDasharray="4,4" />
        <path d="M100 75 C97 70, 91 70, 88 73 C85 70, 79 70, 76 73 C76 80, 88 91, 88 95 C88 91, 100 80, 100 75 Z" fill="#0072ff" />
        <circle cx="100" cy="90" r="12" fill="#00c6ff" opacity="0.3" />
      </svg>
    )
  },
  {
    id: "massage",
    name: "Sweet Massage",
    category: "Sensation",
    spiciness: 2,
    description: "A physical meditation. Rhythmic glide and pressure are applied to melt away tension, transitioning bodies into a state of high physical sensitivity.",
    howTo: "One partner lies flat on their stomach on a comfortable surface. The other kneels over or beside them, using warm hands or oils to rub down their spine and shoulders.",
    benefits: "Oxytocin release, deep muscle relaxation, and lowers defensive psychological barriers.",
    tip: "Heat up your hands by rubbing them together vigorously before making initial contact with your partner's skin.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-massage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#11998e" />
            <stop offset="100%" stopColor="#38ef7d" />
          </linearGradient>
        </defs>
        {/* Curved Back Line */}
        <path d="M30 110 Q 100 130 170 110" stroke="url(#grad-massage)" strokeWidth="8" strokeLinecap="round" />
        {/* Abstract Hand lines/waves representing strokes */}
        <path d="M85 85 Q 100 70 115 85" stroke="#38ef7d" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path d="M75 65 Q 100 50 125 65" stroke="#11998e" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        {/* Magic relaxation stars */}
        <path d="M150 60 L 153 66 L 160 67 L 155 72 L 156 79 L 150 75 L 144 79 L 145 72 L 140 67 L 147 66 Z" fill="#38ef7d" />
        <circle cx="50" cy="80" r="3" fill="#11998e" />
      </svg>
    )
  },
  {
    id: "intimacy_loop",
    name: "The Intimacy Loop",
    category: "Intimate",
    spiciness: 5,
    description: "Commonly referred to as 69, this position embodies perfect reciprocity. It allows both partners to simultaneously give and receive sensory delight.",
    howTo: "Lying down in opposite directions, with one partner positioned on top of the other, aligning faces with each other's intimate areas.",
    benefits: "Perfect equality in pleasure, sensory heightening, and dual playful focus.",
    tip: "Take turns leading the rhythm; when one partner is actively receiving, the other relaxes into a slow glide.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-loop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        {/* Stylized Yin-Yang Intertwined 69 Style Shapes */}
        <path d="M70 110 C70 80, 110 80, 110 110 C110 130, 90 145, 70 145 C50 145, 40 130, 40 110" stroke="url(#grad-loop)" strokeWidth="8" strokeLinecap="round" />
        <path d="M130 90 C130 120, 90 120, 90 90 C90 70, 110 55, 130 55 C150 55, 160 70, 160 90" stroke="url(#grad-loop)" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
        <circle cx="110" cy="110" r="6" fill="#f43f5e" />
        <circle cx="90" cy="90" r="6" fill="#fb923c" />
      </svg>
    )
  },
  {
    id: "butterfly",
    name: "The Butterfly Flutter",
    category: "Acrobatic",
    spiciness: 4,
    description: "An elegant, dynamic pose where the receiving partner is slightly elevated, encouraging fluid rhythmic motions and effortless intimacy.",
    howTo: "One partner lies on the edge of a bed or on elevated cushions, bringing their knees up toward their chest. The other partner stands or kneels, leaning over them.",
    benefits: "Excellent angles, effortless physical flow, and very high visual feedback.",
    tip: "Place a soft silk pillow under the lower back to maximize natural curves and elevate comfort.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-butter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* Butterfly wings styling representing body elevation */}
        <path d="M100 100 C70 50, 40 80, 100 120" fill="url(#grad-butter)" opacity="0.4" />
        <path d="M100 100 C130 50, 160 80, 100 120" fill="url(#grad-butter)" opacity="0.4" />
        <path d="M100 100 C80 130, 60 140, 100 160" fill="url(#grad-butter)" opacity="0.2" />
        <path d="M100 100 C120 130, 140 140, 100 160" fill="url(#grad-butter)" opacity="0.2" />
        {/* Antennas and main axis */}
        <line x1="100" y1="60" x2="100" y2="160" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
        <path d="M100 60 Q 90 45 80 50" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
        <path d="M100 60 Q 110 45 120 50" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "bridge_pose",
    name: "The Bridge of Arch",
    category: "Acrobatic",
    spiciness: 4,
    description: "A gorgeous, core-engaging pose where one partner arches their back, providing beautiful angles and dynamic rhythmic flexibility.",
    howTo: "One partner lies on their back, bending knees and raising their pelvis upward to form an arch (supported by elbows or pillows). The other kneels over them.",
    benefits: "Strengthens cores, unlocks deeper angles, and provides a playful physical challenge.",
    tip: "Use stacked cushions underneath the hips to hold the arch effortlessly without tiring your muscles.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-bridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* High Arched Line */}
        <path d="M30 150 C 30 70, 170 70, 170 150" stroke="url(#grad-bridge)" strokeWidth="12" strokeLinecap="round" />
        {/* Sparkles under the bridge */}
        <circle cx="100" cy="110" r="10" fill="#10b981" opacity="0.3" />
        <circle cx="100" cy="110" r="4" fill="#3b82f6" />
        <path d="M100 80 Q 100 140 100 150" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      </svg>
    )
  },
  {
    id: "kiss_velvet",
    name: "The Velvet Kiss",
    category: "Sensation",
    spiciness: 4,
    description: "An oral sensory game that prioritizes lip sensitivity, breath control, and tasting. Deeply slow, gentle, and incredibly electric.",
    howTo: "One partner relaxes completely. The other partner kisses their way slowly down the neck, shoulders, chest, and other highly sensitive zones.",
    benefits: "Extreme tactile focus, builds strong anticipation, and highly sensitive oral response.",
    tip: "Vary your temperature. Take a sip of warm tea or cold water just before kissing your partner's sensitive areas.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-kiss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        {/* Stylized plump lips */}
        <path d="M50 100 C 70 85, 95 85, 100 95 C 105 85, 130 85, 150 100 C 130 115, 70 115, 50 100 Z" fill="url(#grad-kiss)" />
        <path d="M50 102 C 80 112, 120 112, 150 102 C 120 125, 80 125, 50 102 Z" fill="#b91c1c" />
        {/* Sparkles / Love bursts */}
        <circle cx="155" cy="70" r="5" fill="#f43f5e" />
        <path d="M165 60 L 167 66 L 173 67 L 168 72 L 169 78 L 165 75 L 161 78 L 162 72 L 157 67 L 163 66 Z" fill="#ef4444" />
      </svg>
    )
  },
  {
    id: "gently_glide",
    name: "The Gentle Glide",
    category: "Sensation",
    spiciness: 3,
    description: "A manual, tactile exercise focusing on slow rhythmic friction across arms, hands, thighs, or intimate regions, building a slow-burn heat.",
    howTo: "Use hands to stroke and clasp your partner in slow, coordinated, sliding patterns. Keep constant skin-on-skin contact.",
    benefits: "Improves touch awareness, synchronizes pulse rates, and is deeply customizable.",
    tip: "Use feather-light pressure first (just the tips of your fingers), then transition into firmer, warm pressure.",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-glide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Sleek gliding hand silhouette lines */}
        <path d="M60 140 C 70 110, 110 110, 130 80 C 140 60, 160 50, 170 55" stroke="url(#grad-glide)" strokeWidth="6" strokeLinecap="round" />
        <path d="M40 120 C 50 90, 90 90, 110 60 C 120 40, 140 30, 150 35" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M120 140 Q 140 160 160 140" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="110" r="3" fill="#f59e0b" />
      </svg>
    )
  }
];

// List of Cozy Actions/Dice
const Locations = [
  "Cozy Bed",
  "Moonlit Living Room",
  "Warm Shower / Bath",
  "Under a blanket fort",
  "Sleek Rug on the Floor",
  "Kitchen Counter"
];

const Moods = [
  "Wear a soft blindfold",
  "Whisper sweet things only",
  "Play dim candlelight & jazz",
  "Incorporate massage oils",
  "Slow, deep breathing only",
  "Continuous soft eye-contact"
];

export default function Secret() {
  const [selectedPose, setSelectedPose] = useState<Pose>(PosesData[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [spicinessFilter, setSpicinessFilter] = useState<number | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string | "All">("All");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Challenge Dice State
  const [currentLocation, setCurrentLocation] = useState(Locations[0]);
  const [currentMood, setCurrentMood] = useState(Moods[0]);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(180); // Default 3 minutes
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(180);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Confetti / Completion state
  const [showReward, setShowReward] = useState(false);

  // Audio Context Ref for Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Init Audio Context on first interaction
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Synthesize custom sound effects
  const playSound = (type: "spin" | "land" | "dice" | "alarm") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "spin") {
        // High playful arcade beep
        osc.type = "sine";
        osc.frequency.setValueAtTime(300 + Math.random() * 400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "land") {
        // Beautiful harmonious triple chime chord
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C major chord
        frequencies.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = "triangle";
          o.frequency.setValueAtTime(freq, ctx.currentTime);
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05 + idx * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8 + idx * 0.1);
          o.start();
          o.stop(ctx.currentTime + 1.2);
        });
      } else if (type === "dice") {
        // Wooden rolling sound effect
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120 + Math.random() * 80, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === "alarm") {
        // Pure soothing pulse sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // Filtered list of poses
  const filteredPoses = PosesData.filter((pose) => {
    const matchSpiciness = spicinessFilter === "All" || pose.spiciness === spicinessFilter;
    const matchCategory = categoryFilter === "All" || pose.category === categoryFilter;
    return matchSpiciness && matchCategory;
  });

  // Handle Main Roulette Roll
  const rollRoulette = () => {
    if (isRolling || filteredPoses.length === 0) return;
    setIsRolling(true);
    setShowReward(false);

    let count = 0;
    const maxSpins = 12 + Math.floor(Math.random() * 8);
    const intervalTime = 120;

    const spin = () => {
      const randomIndex = Math.floor(Math.random() * filteredPoses.length);
      setSelectedPose(filteredPoses[randomIndex]);
      playSound("spin");

      count++;
      if (count < maxSpins) {
        setTimeout(spin, intervalTime + count * 15); // Gradual slowdown
      } else {
        setIsRolling(false);
        playSound("land");
      }
    };

    spin();
  };

  // Handle Dice Rolling
  const rollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);

    let count = 0;
    const interval = setInterval(() => {
      setCurrentLocation(Locations[Math.floor(Math.random() * Locations.length)]);
      setCurrentMood(Moods[Math.floor(Math.random() * Moods.length)]);
      playSound("dice");
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsRollingDice(false);
      }
    }, 100);
  };

  // Handle Intimacy Countdown Timer
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            playSound("alarm");
            setShowReward(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const toggleTimer = () => {
    getAudioContext(); // Enable sound
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSecondsLeft(timerDuration);
    setShowReward(false);
  };

  const changeTimerPreset = (minutes: number) => {
    const sec = minutes * 60;
    setTimerDuration(sec);
    setTimerSecondsLeft(sec);
    setTimerRunning(false);
    setShowReward(false);
  };

  // Helper to format remaining time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Auto roll once on initial load (with user safety check)
  useEffect(() => {
    if (filteredPoses.length > 0 && selectedPose === PosesData[0]) {
      // Just set a random one initially
      setSelectedPose(filteredPoses[Math.floor(Math.random() * filteredPoses.length)]);
    }
  }, []);

  // Automatically select a matching pose if the current one doesn't match the active filters
  useEffect(() => {
    if (filteredPoses.length > 0) {
      const isMatch = filteredPoses.some((p) => p.id === selectedPose.id);
      if (!isMatch) {
        setSelectedPose(filteredPoses[0]);
      }
    }
  }, [spicinessFilter, categoryFilter, filteredPoses, selectedPose.id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-12 transition-colors duration-300">
      {/* Animating gradient bar at the top */}
      <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 animate-gradient-xy"></div>

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-500 dark:text-slate-400"
              title="Return to Hub"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Heart size={18} fill="currentColor" className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                  Cupid's Roulette
                </h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
                  Wellness & Intimacy Connection Game
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                getAudioContext();
                setSoundEnabled(!soundEnabled);
              }}
              className={`p-2.5 rounded-2xl transition-all ${
                soundEnabled
                  ? "bg-pink-50 dark:bg-pink-950/40 text-pink-500"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Giant Screen - Column 7 */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Filters Container */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Spiciness Meter
              </span>
              <div className="flex gap-1.5">
                {["All", 1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSpicinessFilter(level as any);
                      getAudioContext();
                    }}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      spicinessFilter === level
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20"
                        : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {level === "All" ? "All" : "🔥".repeat(level as number)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Pose Category
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  getAudioContext();
                }}
                className="bg-slate-50 dark:bg-slate-700 border-none outline-none rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer min-w-[140px]"
              >
                <option value="All">🌌 All Categories</option>
                <option value="Cuddling">🧸 Cozy Cuddles</option>
                <option value="Intimate">💖 Deep Intimacy</option>
                <option value="Playful">⚡ Playful Energy</option>
                <option value="Sensation">🌸 tactile sensory</option>
                <option value="Acrobatic">🤸 acrobatic flow</option>
              </select>
            </div>
          </div>

          {/* The Giant Screen */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-[40px] p-6 md:p-8 shadow-2xl border-4 border-pink-500/30 flex flex-col items-center justify-between min-h-[440px] overflow-hidden group">
            {/* Ambient Background Glow Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Title Ribbon */}
            <div className="relative z-10 bg-slate-800/80 backdrop-blur-md py-1.5 px-4 rounded-full border border-slate-700 text-[11px] font-bold text-pink-400 uppercase tracking-widest shadow-inner mb-4 flex items-center gap-1.5">
              <Sparkles size={12} className="animate-spin text-pink-400" />
              <span>ORACLE OF CONNECTION</span>
            </div>

            {/* Displaying Screen Frame */}
            <div className="w-full flex-1 flex flex-col items-center justify-center relative py-4">
              {isRolling ? (
                // Rolling/Spinning Slot Machine Display State
                <div className="flex flex-col items-center justify-center gap-3 animate-pulse">
                  <div className="w-24 h-24 rounded-full border-4 border-pink-500/40 border-t-pink-500 animate-spin"></div>
                  <p className="text-sm font-semibold tracking-wider text-pink-500 uppercase font-mono animate-bounce mt-2">
                    Shuffling Poses...
                  </p>
                </div>
              ) : filteredPoses.length === 0 ? (
                // No poses matching filters state
                <div className="text-center py-8 space-y-3">
                  <p className="text-slate-500 text-sm">No intimacy poses fit this exact combo.</p>
                  <button
                    onClick={() => {
                      setSpicinessFilter("All");
                      setCategoryFilter("All");
                    }}
                    className="text-xs text-pink-500 hover:underline font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                // Selected Pose Display State
                <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                  {/* SFW SVG Illustration Container */}
                  <div className="w-full max-w-[260px] aspect-square flex items-center justify-center mb-4 relative drop-shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                    {selectedPose.illustration}
                  </div>

                  {/* Pose Details */}
                  <div className="text-center space-y-2 max-w-lg relative z-10 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="bg-pink-500/15 text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedPose.category}
                      </span>
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-0.5">
                        <Flame size={12} fill="currentColor" />
                        {"🔥".repeat(selectedPose.spiciness)}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {selectedPose.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md mx-auto italic">
                      "{selectedPose.description}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Giant Roulette Button */}
            <div className="w-full relative z-10 pt-4 flex justify-center">
              <button
                onClick={() => {
                  getAudioContext();
                  rollRoulette();
                }}
                disabled={isRolling}
                className="w-full max-w-[320px] py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white text-md font-bold rounded-2xl shadow-xl shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-white/20 disabled:opacity-50"
              >
                <Heart size={20} fill="currentColor" className={isRolling ? "animate-spin" : "animate-bounce"} />
                <span>{isRolling ? "SELECTING POSE..." : "SPIN ROULETTE 💘"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right - Guide & Sub-games - Column 5 */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Pose guide instructions card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <Compass size={18} className="text-pink-500 animate-spin-slow" />
              <span>Pose Playbook</span>
            </h2>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-widest block">
                  How to Practice
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPose.howTo}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  Relationship Benefit
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPose.benefits}
                </p>
              </div>

              <div className="bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/50 dark:border-pink-900/40 rounded-2xl p-3.5 flex items-start gap-2.5">
                <Sparkles size={16} className="text-pink-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                    Intimacy Tip
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {selectedPose.tip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Scenario Dice Roller */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Dices size={18} className="text-pink-500" />
                <span>Scenario Dice Roller</span>
              </h2>
              <button
                onClick={() => {
                  getAudioContext();
                  rollDice();
                }}
                disabled={isRollingDice}
                className="text-xs text-pink-500 hover:text-pink-600 font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <RotateCw size={12} className={isRollingDice ? "animate-spin" : ""} />
                ROLL DICE
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Spur spontaneity by rolling randomized backdrops and special game limitations for your poses.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Dice 1: Location */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  📍 Where to perform
                </span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[36px] flex items-center justify-center">
                  {currentLocation}
                </p>
              </div>

              {/* Dice 2: Action Constraint */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  🎲 Special Condition
                </span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[36px] flex items-center justify-center">
                  {currentMood}
                </p>
              </div>
            </div>
          </div>

          {/* Connected Timer Tool */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <Timer size={18} className="text-pink-500" />
              <span>Intimacy Challenge Timer</span>
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Build mutual endurance, synchronicity, and focus. Choose a duration and hold your chosen pose together.
            </p>

            <div className="flex items-center justify-between gap-4 pt-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Remaining Time
                </span>
                <span className="text-3xl font-black font-mono tracking-wider text-slate-800 dark:text-slate-100">
                  {formatTime(timerSecondsLeft)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={toggleTimer}
                  aria-label={timerRunning ? "Pause Timer" : "Start Timer"}
                  className={`p-3 rounded-xl text-white transition-all shadow-md ${
                    timerRunning
                      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                      : "bg-pink-500 hover:bg-pink-600 shadow-pink-500/10"
                  }`}
                >
                  {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={resetTimer}
                  aria-label="Reset Timer"
                  className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 rounded-xl transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Presets Row */}
            <div className="flex gap-2 justify-center">
              {[1, 3, 5].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    getAudioContext();
                    changeTimerPreset(mins);
                  }}
                  className={`flex-1 py-1.5 px-3 border rounded-xl text-xs font-bold transition-all ${
                    timerDuration === mins * 60
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-sm"
                      : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700"
                  }`}
                >
                  {mins} Min{mins > 1 ? "s" : ""}
                </button>
              ))}
            </div>

            {/* Achievement / Completion Card */}
            {showReward && (
              <div className="bg-gradient-to-r from-amber-500/10 to-pink-500/10 border-2 border-amber-500/30 rounded-2xl p-4 text-center space-y-2 animate-in zoom-in-95 duration-300">
                <Award className="mx-auto text-amber-500 animate-bounce" size={28} />
                <h4 className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  Challenge Completed! 🎉
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Beautifully done. Take a moment to cuddle, breathe, and appreciate each other's touch.
                </p>
                <button
                  onClick={() => setShowReward(false)}
                  className="text-[10px] text-pink-500 hover:underline font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Guidance / Intimacy Safety */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <HelpCircle size={14} />
          <span>Intimacy & Connection Ground Rules</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-lg mx-auto">
          Cupid's Roulette is designed for playful exploration and connection. Consent, comfort, and direct communication are essential. Move at your own pace, adjust poses with pillows for joint safety, and enjoy the intimacy journey!
        </p>
      </footer>
    </div>
  );
}
