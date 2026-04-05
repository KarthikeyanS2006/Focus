# 🌸 桜 花 Focus - Sakura Focus

![Japanese Style](https://img.shields.io/badge/style-Japanese%20Anime-FF6B8A?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-0.79-blue?style=for-the-badge)
![Expo](https://img.shields.io/badge/Expo-53-green?style=for-the-badge)

> 武士道の精神でポモドーロ集中 - Pomodoro Focus with Bushido Spirit

![Sakura Banner](./assets/sakura-banner.png)

## ✨ Features / 特徴

- 🌸 **Cherry Blossom Animations** - Beautiful sakura petals falling
- ⚔️ **Katana-Inspired UI** - Sharp, elegant Japanese aesthetic
- 🎌 **Bilingual Interface** - Japanese + English support
- 🔥 **Samurai Streak System** - Build your focus discipline
- 📊 **Battle Statistics** - Track your focus victories
- 💫 **Anime Effects** - Glowing orbs, energy pulses, and dramatic transitions
- 🎨 **Sakura Color Palette** - Cherry blossom pink, crimson, gold accents
- ⏱️ **Strict Pomodoro Timer** - 25min focus, 5min break cycles

## 🏯 Getting Started / 始め方

### 1. Install Dependencies / 依存関係のインストール

```bash
npm install
# or
pnpm install
```

### 2. Start the Project / プロジェクトの開始

```bash
npm run start         # Expo 開発サーバーを開始
npm run android       # Android エミュレータを起動
npm run ios           # iOS シミュレータを起動
npm run web           # Web バージョンを開始
```

### 3. Reset Project / プロジェクトをリセット

```bash
npm run reset-project
```

### 4. Lint / リント

```bash
npm run lint
```

## 🎨 Theme Colors / テーマカラー

| Color | Hex | Usage |
|-------|-----|-------|
| Sakura Pink | `#FF6B8A` | Primary accent |
| Cherry Blossom | `#FFB7C5` | Decorative elements |
| Crimson | `#DC143C` | Danger/important |
| Gold | `#FFD700` | Success/streaks |
| Ink Black | `#0a0a0a` | Background |
| Neon Blue | `#00D9FF` | Stats accents |

## 🗂️ Project Structure / プロジェクト構造

```
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Timer screen / タイマー画面
│   │   ├── stats.tsx       # Statistics / 統計
│   │   ├── history.tsx     # Session history / 履歴
│   │   └── _layout.tsx     # Tab navigation / タブナビゲーション
│   └── _layout.tsx          # Root layout / ルートレイアウト
├── components/
│   └── ui/
│       ├── SakuraAnimation.tsx  # Cherry blossom effects
│       ├── AnimeEffects.tsx     # Pulse glow, energy orbs
│       ├── CircularTimer.tsx    # Animated timer ring
│       └── ...
├── constants/
│   └── theme.ts            # Japanese anime theme
├── hooks/
│   └── useTimer.ts         # Pomodoro logic
└── contexts/
    └── TimerContext.tsx    # Timer state management
```

## 🎬 Animations / アニメーション

### Sakura Animation
Beautiful falling cherry blossom petals with physics-based movement.

```tsx
import { SakuraAnimation } from '@/components/ui/SakuraAnimation';

// Usage
<SakuraAnimation intensity="medium" />
```

### Energy Effects
Anime-style glowing orbs and pulse effects.

```tsx
import { PulseGlow, EnergyOrb } from '@/components/ui/AnimeEffects';

// Glowing pulse
<PulseGlow color="#FF6B8A" size={200} intensity={1} />

// Energy orb
<EnergyOrb color="#FFD700" size={60} isActive={true} />
```

## 🧘 Usage / 使い方

1. **Start Focus** - 開始を押して25分間の集中セッションを開始
2. **Stay Focused** - 電話を伏せて置いて、気が散ったら分心を記録
3. **Take Breaks** - 5分間の休憩でリラックス
4. **Build Streaks** - 毎日続けて連勝を記録

## 📱 Tech Stack / 技術スタック

- **React Native** 0.79.4
- **React** 19.0.0
- **Expo** ~53.0.12
- **Expo Router** ~5.1.0
- **TypeScript** ~5.8.3
- **React Native Reanimated** 3.17.4
- **Lottie** for advanced animations

## 🎌 Japanese Phrases / 日本語のフレーズ

| Japanese | English | Usage |
|----------|---------|-------|
| 集中 | Focus | Stay concentrated |
| 準備完了 | Ready | Timer is prepared |
| 深度集中 | Deep Focus | Intense focus mode |
| 休憩時間 | Break Time | Rest period |
| 連勝 | Winning Streak | Consecutive days |
| 一生懸命 | Hard Work | Maximum effort |

## 📜 License / ライセンス

Private - All rights reserved

## 🙏 Credits / クレジット

Inspired by Japanese anime aesthetics, samurai spirit, and the beauty of sakura blossoms.

---

*継続は力なり - Constancy sharpens skill* 🌸
