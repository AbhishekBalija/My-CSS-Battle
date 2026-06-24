# CSSBattle Analytics & Archive Platform

A fully automated platform that collects, archives, and visualizes CSSBattle solutions. Built with a Chrome extension that automatically detects submissions and pushes data to GitHub, which then triggers Vercel deployments for a zero-maintenance analytics website.

![CSSBattle Analytics](https://img.shields.io/badge/CSSBattle-Analytics-6366f1?style=for-the-badge&logo=css3)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06b6d4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite)

---

## 🎯 Project Overview

This project automates the entire workflow of tracking CSSBattle progress:

```
CSSBattle → Chrome Extension → GitHub API → GitHub Repository → Vercel Auto Deploy → Analytics Website
```

**No manual steps required.** Just solve challenges on CSSBattle and everything else happens automatically.

---

## ✨ Features

### 📊 Analytics Dashboard

- **Profile Statistics**: Rating, rank, streaks, total score, and country ranking
- **Daily Targets**: Track daily puzzle progress with calendar heatmap
- **Battle Solutions**: Browse all battle solutions with sorting and search
- **Visual Analytics**: Interactive charts for score trends, character efficiency, and solve patterns
- **Solution Viewer**: View target images, code, and metadata for each solution

### 🤖 Chrome Extension (Manifest V3)

- **Auto-detection**: Automatically captures solutions on submission
- **Cross-browser**: Works on Chrome, Edge, Arc, and other Chromium browsers
- **GitHub Integration**: Pushes data directly to GitHub repository via API
- **Zero Config**: Set up once with GitHub token, then forget

### 🏗️ Architecture

- **No Backend**: GitHub serves as the database
- **No Database**: JSON files in the repository store all data
- **Auto Deploy**: Vercel rebuilds on every push to main
- **Static Hosting**: Fast, free, and globally distributed

---

## 📁 Project Structure

```
├── extension/                 # Chrome Extension (Manifest V3)
│   ├── background.js          # Service worker for GitHub API calls
│   ├── content-main.js        # Main content script (MAIN world)
│   ├── content.js             # Content script (ISOLATED world)
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic
│   └── manifest.json          # Extension manifest
│
├── src/                       # React Website
│   ├── components/
│   │   ├── battles/           # Battle-related components
│   │   ├── daily/             # Daily target components
│   │   ├── ui/                # Reusable UI components
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── VoiceLine.tsx
│   ├── lib/
│   │   ├── analytics.ts       # Analytics computations
│   │   ├── data.ts            # Data fetching & processing
│   │   └── utils.ts           # Utility functions
│   ├── pages/
│   │   ├── Analytics.tsx      # Analytics dashboard
│   │   ├── Battles.tsx        # Battle solutions list
│   │   ├── Daily.tsx          # Daily targets page
│   │   ├── Home.tsx           # Landing page
│   │   ├── PageNotFound.tsx   # 404 page
│   │   └── Solutions.tsx      # Individual solution view
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── utils/
│   │   └── icons.tsx          # Icon components
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
│
├── data/                      # JSON data files (auto-updated by extension)
│   ├── battleSolutions.json   # All battle solutions
│   └── dailySolutions.json    # All daily target solutions
│
├── content/                   # Profile data
│   ├── profile.json           # Current profile stats
│   └── profileHistory.json    # Historical profile data
│
├── public/                    # Static assets
├── docs/                      # Documentation
├── .github/workflows/         # CI workflows
│   └── react-doctor.yml       # React Doctor scanning
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── index.html
└── opencode.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Bun (recommended) or npm/yarn
- GitHub Personal Access Token (for extension)

### Website Development

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run linting
bun run lint
```

### Chrome Extension Setup

1. **Build the extension** (if needed):

   ```bash
   # The extension uses vanilla JS - no build step required
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/` folder

3. **Configure GitHub Token**:
   - Click the extension icon
   - Enter your GitHub Personal Access Token with `repo` scope
   - Set the target repository (e.g., `username/cssbattle-data`)
   - Save settings

4. **Use CSSBattle normally** - solutions will auto-sync!

---

## 📦 Data Format

### Battle Solution

```json
{
  "id": "1",
  "name": "Simply Square",
  "type": "battle",
  "battleNumber": 1,
  "score": 807.23,
  "match": 100,
  "characters": 69,
  "colors": ["#5d3a3a", "#b5e0ba"],
  "date": "2026-06-20",
  "timestamp": "2026-06-20T18:29:48.838Z",
  "tags": ["css"],
  "url": "https://cssbattle.dev/play/1",
  "targetImage": "https://cssbattle.dev/targets/1.png",
  "code": "<style>&{background:conic-gradient(at 50vw 50vw,#5d3a3a 75%,#b5e0ba 0}"
}
```

### Daily Solution

```json
{
  "id": "u8sYQf7PKPxu7IUeUNc6",
  "name": "Daily Target — Jun 1, 2026",
  "type": "daily",
  "score": 674.74,
  "match": 100,
  "characters": 176,
  "colors": ["#D19F37", "#FEF9CE"],
  "date": "Jun 1, 2026",
  "timestamp": "2026-06-23T11:47:57.384Z",
  "tags": ["css"],
  "url": "https://cssbattle.dev/play/u8sYQf7PKPxu7IUeUNc6",
  "targetImage": "https://firebasestorage.googleapis.com/...",
  "code": "<style>&{background:radial-gradient(1q,#D19F37 32q,#FEF9CE)93q/10pc 50vw;margin:62 112;*{background:radial-gradient(1q,#FEF9CE 53q,#D19F37);corner-shape:scoop;border-radius:53q"
}
```

### Profile Data

```json
{
  "userId": "pQ9KG3zTaHVaEr09zgJdyvWF5a62",
  "username": "abhishek_balija",
  "displayName": "Abhishek A N",
  "avatar": null,
  "rating": 1200,
  "rank": 1949,
  "totalScore": 45145.62,
  "currentStreak": 52,
  "longestStreak": 83,
  "dailyTargetsPlayed": 282,
  "dailyAvgMatch": 99.67,
  "dailyAvgChars": 240,
  "totalPlayers": 451138,
  "country": "India",
  "whatYouDo": "Web Developer",
  "links": {
    "website": "https://abhishekbalija.xyz",
    "github": "AbhishekBalija",
    "twitter": "@AbhishekBalija1",
    "linkedin": "/in/abhishek-balija-551701221"
  }
}
```

---

## 🛠️ Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| **Frontend**     | React 19, TypeScript, React Router 7 |
| **Styling**      | Tailwind CSS 4, CSS Variables        |
| **Animations**   | Motion (Framer Motion)               |
| **Charts**       | Recharts 3                           |
| **Icons**        | Lucide React                         |
| **Build**        | Vite 8                               |
| **Linting**      | ESLint 10, TypeScript ESLint         |
| **Extension**    | Manifest V3, Vanilla JS              |
| **Hosting**      | Vercel (auto-deploy from GitHub)     |
| **Data Storage** | GitHub Repository (JSON files)       |

---

## 📈 Pages & Routes

| Route            | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `/`              | Home page with hero, recent daily targets, and recent battles |
| `/daily`         | Daily targets timeline with calendar heatmap and stats        |
| `/battles`       | All battle solutions with search, sort, and filter            |
| `/analytics`     | Comprehensive analytics dashboard with charts                 |
| `/solutions/:id` | Individual solution detail view                               |

---

## 🔧 Configuration

### Environment Variables (Vercel)

No environment variables needed for the website - all data comes from JSON files in the repo.

### Extension Configuration

Configure via the extension popup:

- **GitHub Token**: Personal Access Token with `repo` scope
- **Repository**: Target repo in format `owner/repo`
- **Branch**: Default `main`

---

## 📊 Analytics Features

- **Score Distribution**: Histogram of scores across all solutions
- **Character Efficiency**: Characters vs. score scatter plot
- **Solve Timeline**: Heatmap calendar of daily activity
- **Streak Tracking**: Current and longest streaks
- **Color Usage**: Most used colors in solutions
- **Progress Over Time**: Score and rank progression charts

---

## 🤝 Contributing

This is a personal project, but suggestions and issues are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a PR

---

## 📄 License

MIT License - feel free to use this as a template for your own CSSBattle tracking!

---

## 🙏 Acknowledgments

- [CSSBattle](https://cssbattle.dev/) - The amazing platform that makes CSS golf fun
- [Vercel](https://vercel.com/) - For seamless auto-deployment
- [GitHub](https://github.com/) - For free hosting and API access
- All the open-source libraries that make this possible

---

## 📞 Contact

- **Website**: [abhishekbalija.xyz](https://abhishekbalija.xyz)
- **GitHub**: [@AbhishekBalija](https://github.com/AbhishekBalija)
- **Twitter**: [@AbhishekBalija1](https://twitter.com/AbhishekBalija1)
- **LinkedIn**: [Abhishek Balija](https://linkedin.com/in/abhishek-balija-551701221)

---

_Built with ❤️ for the CSSBattle community_
