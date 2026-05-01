# FocusMode (Sakura Focus) — Full App Plan

## What the App Currently Does
A Japanese-themed Pomodoro timer app (React Native / Expo) with 3 tabs:
- **Timer** ([index.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/index.tsx)) — Circular countdown, distraction logging, goal selector, widgets
- **Stats** ([stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx)) — Daily score, week chart, distraction count, insight card
- **History** ([history.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/history.tsx)) — Flat list of all sessions

Plus a **Settings** screen (profile, blocked apps list, notifications, ambient sounds, share/rate).

---

## 🔴 What to Remove (Dead / Misleading Code)

| Location | What | Why Remove |
|---|---|---|
| [settings.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx) L427-436 | "About Regain" section + [handleShare](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx#127-137) mentions "Regain", "Multiplayer Focus Rooms" | App is actually called **Sakura Focus** — wrong brand name, confusing |
| [settings.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx) L294-307 | Duplicate "About" card (Version + Built with Expo) | There's already an "About Regain" block below; two about sections is clutter |
| [settings.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx) L138-148 | [handleRateApp](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx#138-150) → `Alert.alert('Thank you!')` | Fake rate flow, no real store link — just remove button or link to actual store |
| [index.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/index.tsx) L1, [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx) L1, [history.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/history.tsx) L1 | `// Powered by Sakura Focus - ...` / `// Powered by OnSpace.AI` comments | Stale/wrong credits in every file |
| [storageService.ts](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts) L1 | `// Powered by OnSpace.AI` | Same |
| [app/(tabs)/_layout.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/_layout.tsx) | Any "Regain" label if present | Brand consistency |
| [CompanionContext.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/contexts/CompanionContext.tsx) | Entire file (unused — `contexts/` context that is never consumed anywhere in the app) | Dead code |
| [types/companion.ts](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/types/companion.ts) | Entire file (companion types, never used) | Dead code |

---

## 🟡 What to Fix (Bugs & UX Issues)

### 1. Stats screen — daily goal is hardcoded
- **File:** [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx) line 70
- **Bug:** `Goal: 240 min (4 hours)` is hardcoded. The user sets their `dailyGoalMinutes` in Settings, but Stats screen ignores it.
- **Fix:** Read [getUserProfile()](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#209-230) in `useStats` or directly in [StatsScreen](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx#16-166), pass `dailyGoalMinutes` into the progress bar.

### 2. Goal tracker only shows 1 goal
- **File:** [index.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/index.tsx) line 238
- **Bug:** `goalTargets[0]` is always used — if the user adds multiple goals, only the first is shown and the "Add Goal" button displays even though code tries to add goals on top of each other.
- **Fix:** Support multiple goals (scrollable list), or clearly cap at 1 and disable "Add Goal" when one exists.

### 3. [updateGoalTargetProgress](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#284-304) always passes only first goal's ID
- **File:** [index.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/index.tsx) line 74
- **Bug:** [updateGoalTargetProgress(targets[0]?.id || '')](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#284-304) — the fallback `''` means it silently passes an empty ID and updates nothing; should update all goals.
- **Fix:** Loop over all targets in [updateGoalTargetProgress](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#284-304) or call it for each.

### 4. Settings [handleSaveProfile](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx#182-191) resets `createdAt`
- **File:** [settings.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx) line 184-190
- **Bug:** [saveUserProfile](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#231-234) is called with `createdAt: new Date().toISOString()` — overwrites the real account creation date every time the user saves.
- **Fix:** Load existing `createdAt` from profile before saving.

### 5. History tab is missing the session `goal` field
- **File:** [history.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/history.tsx) SessionItem component
- **Bug:** Sessions store a `goal` field (e.g. "Studying", "Coding") but it's never shown in the history list.
- **Fix:** Show the goal badge in each [SessionItem](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/history.tsx#29-75).

### 6. Stats `todayGoal` hardcoded `240` in progress %
- **File:** [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx) line 75
- [(todayMinutes / 240) * 100](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/types/index.ts#22-33) — same hardcoded bug, should use `dailyGoalMinutes`.

### 7. Streak resets only on app open, not real-time
- **File:** [storageService.ts](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts) [resetStreakIfMissed](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#100-112)
- Though minor, the streak check is only during load — no timer-based midnight check. Low priority but worth noting.

---

## 🟢 What to Add (New Features — by Priority)

### Priority 1 — Core Usefulness

#### A. Custom Timer Durations
- **Where:** [Settings](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#16-23) screen, new "Timer" section
- **What:** Let users set their own focus duration (default 25 min), short break (5 min), long break (15 min)
- **How:** Add fields to [AppSettings](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/storageService.ts#16-23) type (`focusDuration`, `shortBreakDuration`, `longBreakDuration`), read them in `TimerContext`

#### B. Daily Goal Respected Everywhere
- **Where:** [useStats.ts](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/hooks/useStats.ts), [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx)
- **What:** Read `dailyGoalMinutes` from profile and use it in the progress bar, score, and goal text
- **Why:** Currently hardcoded to 240 min — many users set their own daily goal in settings but see the wrong progress

#### C. Session Notes / Tags
- **Where:** `AbandonModal` or new post-session modal
- **What:** After completing a session, show a quick note field + mood emoji picker. Store with the [Session](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/types/index.ts#22-33) object.
- **Type change:** Add `note?: string` and `mood?: 'great' | 'ok' | 'tired'` to [Session](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/types/index.ts#22-33) type

#### D. Multiple Goal Targets + Progress
- **Where:** [index.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/index.tsx) Goal Tracker widget
- **What:** Show all goal targets in a horizontal scroll, not just the first one. Add completion celebration animation.

### Priority 2 — Stats & Insights

#### E. Monthly / All-Time Tab in Stats
- **Where:** [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx)
- **What:** A toggle (Week / Month / All Time) above the chart card. Month view shows 30-day bar chart, All Time shows total hours.

#### F. Distraction Breakdown
- **Where:** [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx)
- **What:** A pie or bar chart showing distractions by category (Social Media, YouTube, Games, etc.). Data already stored in `DistractionLog[]` — just aggregate and display.

#### G. Best Day / Longest Streak Card
- **Where:** [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx)
- **What:** A card showing "Best Day: 6h on Tuesday" and "Longest Streak: 12 days" — motivational milestones.

### Priority 3 — Engagement & Polish

#### H. Daily Reminder Notification
- **Where:** [notificationService.ts](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/services/notificationService.ts), [settings.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx)
- **What:** Let users set a daily reminder time ("Start your focus session!"). The infrastructure for `expo-notifications` already exists.

#### I. Rotating Quotes (multiple, not just 継続は力なり)
- **Where:** [index.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/index.tsx) and [stats.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/%28tabs%29/stats.tsx) quote cards
- **What:** Add 10–15 Japanese + English motivational quotes, rotate randomly or daily. Currently both screens always show the same quote.

#### J. Onboarding Improvements
- **Where:** [welcome.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/welcome.tsx)
- **What:** After name input, ask: preferred timer duration, daily goal minutes — so defaults are personalized from day 1.

#### K. Haptic Feedback on timer complete
- **Where:** `TimerContext` (wherever session completes)
- **What:** Use `expo-haptics` to vibrate on session/break completion — simple one-line addition, feels premium.

#### L. Dark / Light mode toggle in Settings (manual override)
- **Where:** [settings.tsx](file:///d:/Projects/React%20expo/FOcus/FocusMode-main/app/settings.tsx)
- **What:** Currently respects system color scheme. Add a manual override toggle so users can force dark mode regardless of system setting.

---

## 🔵 How to Build — Implementation Order

```
Phase 1 — Remove Clutter (1 day)
  1. Remove "About Regain", fix brand name to Sakura Focus everywhere
  2. Remove CompanionContext.tsx and companion.ts (delete files)
  3. Remove fake Rate App button (or disable it)
  4. Fix handleSaveProfile createdAt bug (settings.tsx)

Phase 2 — Fix Core Bugs (1–2 days)
  5. Fix hardcoded dailyGoalMinutes in stats.tsx (read from profile)
  6. Fix updateGoalTargetProgress to update all goals
  7. Add goal field display in history.tsx SessionItem

Phase 3 — Custom Timer Duration (2 days)
  8. Add focusDuration/breakDuration to AppSettings type
  9. Add Settings UI fields for custom durations
 10. Read settings in TimerContext instead of hardcoded 25/5/15

Phase 4 — Session Notes & Mood (1–2 days)
 11. Add note + mood to Session type
 12. Build post-session modal (shown after focus session completes)
 13. Show note in History list

Phase 5 — Stats Enhancements (2–3 days)
 14. Week/Month/All-Time toggle in stats screen
 15. Distraction category breakdown chart
 16. Best day / longest streak cards

Phase 6 — Polish (1–2 days)
 17. Rotating quotes (10–15 quotes)
 18. Haptic feedback on timer complete (expo-haptics)
 19. Daily reminder notification UI in settings
 20. Onboarding improvements (ask for timer preferences)
```

---

## 🔬 Verification Plan

Since this is a React Native / Expo project, verification is done by:

### Running the App
```sh
cd "d:\Projects\React expo\FOcus\FocusMode-main"
npx expo start
```
Then press `a` for Android emulator or scan QR for physical device.

### Manual Test Checklist (per Phase)
| Test | Steps |
|---|---|
| Brand cleanup | Open Settings → confirm no "Regain" text anywhere |
| Daily goal in stats | Set daily goal to 60 min in Settings → go to Stats → progress bar should fill at 60 min |
| Custom timer | Set focus to 10 min in Settings → start timer → confirm countdown starts at 10:00 |
| Multiple goals | Add 2 goal targets → confirm both show on home screen |
| Session notes | Complete a session → confirm note modal appears → open History → note shows |
| History goal badge | Start session with "Coding" goal → complete it → open History → "Coding" badge visible |
| Rotating quotes | Open app 5 times → confirm quote changes |
| Haptics | Complete a session on a physical device → confirm vibration |

### No automated tests currently exist in this project.
> [!NOTE]
> The project has no `__tests__` directory or jest config. All verification is manual via the Expo dev server.
