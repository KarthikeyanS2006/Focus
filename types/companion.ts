// Powered by Sakura Focus - AI Companion Types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface CompanionState {
  currentScreen: string;
  todayMinutes: number;
  streak: number;
  distractionCount: number;
  sessionGoal?: string;
  isActive: boolean;
}

export const SIMPLE_RESPONSES = {
  greeting: [
    "Hello! I'm your focus companion. Ask me about focus tips or your progress!",
    "Hi there! How can I help you stay focused today?",
    "Welcome! I can help you with focus advice and track your progress.",
  ],
  focus: [
    "Great choice! Try the Pomodoro technique: 25 min focus, 5 min break.",
    "Stay strong! Remove distractions and keep your phone face-down.",
    "Focus tip: Set specific goals before starting each session.",
  ],
  distraction: [
    "Distractions happen! Close your eyes, breathe, and return to focus.",
    "Don't worry. Try listing what's distracting you, then let it go.",
    "Environment matters. Put your phone in another room!",
  ],
  stats: [
    "Check the Stats tab for your detailed progress report!",
    "Your history shows your dedication. Keep building those habits!",
    "Consistency is key. Every session counts!",
  ],
  settings: [
    "Configure your focus environment in Settings. Add blocked apps!",
    "Set your daily goal and customize your experience!",
    "Check blocked apps to avoid distractions during focus time.",
  ],
  streak: [
    `You're building great habits! Keep the streak going!`,
    "Streaks represent consistency. Each day builds on the last!",
    "Amazing dedication! A streak shows real commitment.",
  ],
  break: [
    "Breaks are important! Rest your mind to stay productive.",
    "Take a walk, stretch, or grab some water during breaks!",
    "Great job! Breaks help you maintain focus long-term.",
  ],
  motivation: [
    "You're doing amazing! Every minute of focus builds your skills.",
    "Proud of your effort! Progress, not perfection!",
    "Keep going! Small steps lead to big achievements.",
  ],
  tips: [
    "Put your phone face-down on the table! It helps you resist checking it.",
    "Sit quietly and take a deep breath before starting your focus session.",
    "Remove distractions - put your phone in another room!",
    "Create a calm environment: dim the lights, sit comfortably, and focus.",
    "Keep your phone out of sight to avoid temptation during focus time.",
    "Sit up straight, close your eyes, and reset your focus before starting!",
    "A clean workspace helps a clear mind - prepare your area first!",
    "Put your phone face-down - interruptions reset your focus habit!",
    "Sit quietly, breathe deep, and clear your mind before focusing.",
  ],
};

export function getSimpleResponse(input: string, state: CompanionState): string {
  const lower = input.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return SIMPLE_RESPONSES.greeting[Math.floor(Math.random() * SIMPLE_RESPONSES.greeting.length)];
  }
  if (lower.includes('focus') || lower.includes('start') || lower.includes('timer')) {
    return SIMPLE_RESPONSES.focus[Math.floor(Math.random() * SIMPLE_RESPONSES.focus.length)];
  }
  if (lower.includes('distract') || lower.includes('can\'t focus') || lower.includes('help')) {
    return SIMPLE_RESPONSES.distraction[Math.floor(Math.random() * SIMPLE_RESPONSES.distraction.length)];
  }
  if (lower.includes('stat') || lower.includes('progress') || lower.includes('history')) {
    return SIMPLE_RESPONSES.stats[Math.floor(Math.random() * SIMPLE_RESPONSES.stats.length)];
  }
  if (lower.includes('setting') || lower.includes('block') || lower.includes('app')) {
    return SIMPLE_RESPONSES.settings[Math.floor(Math.random() * SIMPLE_RESPONSES.settings.length)];
  }
  if (lower.includes('streak') || lower.includes('day') || lower.includes('consecutive')) {
    return SIMPLE_RESPONSES.streak[Math.floor(Math.random() * SIMPLE_RESPONSES.streak.length)];
  }
  if (lower.includes('break') || lower.includes('rest') || lower.includes('pause')) {
    return SIMPLE_RESPONSES.break[Math.floor(Math.random() * SIMPLE_RESPONSES.break.length)];
  }
  if (lower.includes('motivate') || lower.includes('encourage') || lower.includes('proud')) {
    return SIMPLE_RESPONSES.motivation[Math.floor(Math.random() * SIMPLE_RESPONSES.motivation.length)];
  }
  if (lower.includes('tip') || lower.includes('advice') || lower.includes('how to focus') || lower.includes('phone') || lower.includes('sit') || lower.includes('quiet')) {
    return SIMPLE_RESPONSES.tips[Math.floor(Math.random() * SIMPLE_RESPONSES.tips.length)];
  }
  
  return SIMPLE_RESPONSES.greeting[Math.floor(Math.random() * SIMPLE_RESPONSES.greeting.length)];
}
