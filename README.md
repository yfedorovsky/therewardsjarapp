# Reward Jar

A fun, mobile-first reward tracker for families. Kids earn stars by completing tasks and redeem them for rewards — all wrapped in a delightful jar-themed UI.

## Features

- **Coin Jar** — Drag-and-drop coins into a glass jar with smooth animations
- **Tasks** — Create and complete household or personal tasks to earn stars
- **Rewards** — Set up rewards kids can redeem with their earned stars
- **Family Overview** — See each kid's balance and recent activity at a glance
- **Settings** — Manage kids, tasks, rewards, and export/import data
- **Offline-first** — All data stored locally in IndexedDB, works without internet
- **PWA** — Install to home screen for a native app experience

## Tech Stack

- **React 18** + TypeScript
- **Vite** — Fast dev server and build tool
- **Tailwind CSS 4** — Utility-first styling with CSS-based `@theme` config
- **Framer Motion** — Animations, gestures, drag-and-drop
- **Dexie.js** — IndexedDB wrapper for local-first data persistence
- **Lucide React** — Icon library
- **Workbox** (via vite-plugin-pwa) — Service worker for offline caching

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Screenshot

<!-- Add a screenshot here -->
![App Screenshot](screenshot.png)

## Project Structure

```
src/
  components/
    layout/       # Shell, BottomNav
    jar/          # CoinJar, QuickAddCoins, TopBar, AnimatedPoints
    tasks/        # TaskCard, FilterChips, CompleteTaskSheet, AddTaskSheet
    rewards/      # RewardCard, RedeemSheet, AddRewardSheet
    household/    # KidOverviewCard, ActivityFeed
    settings/     # EditKidSheet, ManageTasksSheet, ManageRewardsSheet
    shared/       # BottomSheet
  hooks/          # useKids context
  lib/            # db.ts, types.ts, seed.ts, constants.ts, timeAgo.ts
  pages/          # JarPage, TasksPage, RewardsPage, HouseholdPage, SettingsPage
  App.tsx
  main.tsx
  index.css
```

## License

MIT
