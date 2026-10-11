# PoseGenius AI 📸✨

> **Free, on-device, AI-powered photo pose assistant mobile app for Android and iOS.**  
> Built with React Native, Expo SDK 57, TypeScript, Expo Router, and MediaPipe computer vision architecture.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🌟 Overview & Key Principles

PoseGenius AI helps anyone take better photos by providing:
1. **Live Camera Pose Assistant**: Real-time guidance overlay directly on your camera preview with countdown timers, lens toggles, flash modes, opacity controls, and next/prev pose switching while shooting.
2. **On-Device Computer Vision & Skeleton Guidance**: SVG skeleton landmarks and posture alignment engine analyzing body angles (head, shoulders, elbows, hips, knees).
3. **100+ Offline Pose Library**: Curated dataset of 100 distinct pose archetypes with step-by-step instructions for head, arms, legs, torso, lighting, camera angles, and framing.
4. **Interactive Geometric Visualizer (`PoseStickFigure`)**: Procedural vector silhouette diagrams representing each posture with zero copyright reliance.
5. **Real Online Image Discovery**: Search Openverse and Wikimedia Commons public media with automatic CC license attribution and browser search fallbacks.
6. **Multi-Provider AI Coach**: Fast, 100% offline rule-based recommendation engine by default, plus optional configurable adapters for self-hosted models (Ollama) or free-tier providers.
7. **100% Free & Privacy-First**: No mandatory paid APIs, no subscriptions, zero user accounts, and zero cloud uploads of camera photos.

---

## 📱 Application Screens

| Screen | Features |
| :--- | :--- |
| **Home (`/`)** | Hero Camera Coach launcher, offline readiness badge (100+ poses ready), curated poses carousel with vector previews, trending category tiles, recent history, and quick actions. |
| **Explore (`/explore`)** | Segmented switcher for **Local Library (100+)** vs **Discover Online (Openverse / Wiki)**. Multi-criteria filters, full-text search, and direct camera links. |
| **Live Coach (`/live-coach`)** | Fullscreen live camera preview (`expo-camera`), front/rear camera switching, flash control, countdown timers (3s, 5s, 10s), skeleton overlay, floating reference card, opacity slider, real-time posture coaching hints, and shutter capture with instant preview modal. |
| **Pose Details (`/pose/[id]`)** | Comprehensive posture breakdown (head, shoulders, arms, hands, torso, legs, feet), camera angle & framing, facial expression guidance, lighting & environment tips, similar pose recommendations, and "Use in Camera Coach" action. |
| **AI Pose Coach (`/ai-coach`)** | Natural language request director (e.g. *"Solo travel in a blue dress near a waterfall"*), quick scenario chips, structured step-by-step direction cards, difficulty scoring, alternative poses, and direct live camera launch. |
| **Favorites (`/favorites`)** | Saved pose collection stored offline in `AsyncStorage`, direct "Live Coach" shortcut per pose, remove favorite, and clear all. |
| **Settings (`/settings`)** | Offline-only toggle, configurable AI provider (Ollama / Groq / OpenRouter), custom endpoint & API key inputs, camera overlay default opacity presets (30% - 90%), cache clearing, and complete local data erasure. |

---

## 🚀 Installation & Running

### Prerequisites
- Node.js `v20.x` or `v24.x`
- npm (configured with `legacy-peer-deps=true` in `.npmrc`)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run the Development Server
```bash
npx expo start
```
- Press `a` to open on an Android emulator.
- Or scan the QR code with **Expo Go** on a physical Android device connected to the same Wi-Fi.

### 3. Run Automated Tests
```bash
npm test
```
*Runs all 5 test suites (42 passing tests for filter services, offline AI matching, computer vision angle math, and Openverse licensing).*

### 4. Run TypeScript Check
```bash
npx tsc --noEmit
```
*Validates 100% strict type safety across all components and services.*

---

## 🛠️ Native Android Build (Development Client / APK)

PoseGenius AI is configured with Expo Continuous Native Generation (CNG):

### Generate Native Android Project
```bash
npx expo prebuild --platform android
```

### Build & Run Native Android App
```bash
npx expo run:android
```

### Build Standalone APK via EAS (Cloud - No Local Android Studio Required)
```bash
npx eas-cli build --platform android --profile preview
```

---

## 🤖 AI Engine Architecture

PoseGenius AI employs a **provider-independent architecture**:

1. **Default Local Engine (`LocalRuleBasedAIProvider`)**:
   - 100% Free & 100% Offline.
   - Extracts semantic tokens (people count, outfits, settings, occasions, moods) and matches with 100+ seed pose archetypes.
   - Generates contextual instructions (e.g. drape of a dress in the breeze, holding hat brim, weight shifts).
2. **Optional Online / Self-Hosted Adapter (`FreeOnlineAIAdapter`)**:
   - Easily connect your own local open-weight model via Ollama:
     ```bash
     ollama run mistral
     ```
     Endpoint on Android Emulator: `http://10.0.2.2:11434/v1/chat/completions`
   - Or connect free-tier models via Groq or OpenRouter (`mistralai/mistral-7b-instruct:free`).
   - Automatically falls back to the local offline engine if network drops or times out (8s limit).

For full configuration instructions, see [`docs/AI_PROVIDERS.md`](docs/AI_PROVIDERS.md).

---

## ⚖️ Legal & Licensing

- **Zero Copyrighted Bundled Photos**: Procedural SVG geometric stick figures (`PoseStickFigure`) are rendered on-the-fly for every pose archetype.
- **Openverse & Wikimedia Commons**: Remote searches only pull from vetted Creative Commons and public domain repositories (`CC0`, `CC BY`, `CC BY-SA`). Full attribution (title, creator, source URL, license) is automatically rendered.
- **Zero Web Scraping**: The app never scrapes private sites or bypasses paywalls.

For full licensing details, see [`docs/IMAGE_LICENSING.md`](docs/IMAGE_LICENSING.md).

---

## 🔒 Privacy Guarantee

- **Zero Camera Uploads**: All camera previews and MediaPipe posture evaluations run strictly on the device.
- **Zero Accounts**: No registration, login, email, or tracker required.
- **Local Storage**: All favorites and settings stay on your phone.

For complete privacy details, see [`docs/PRIVACY.md`](docs/PRIVACY.md).

---

## 📚 Project Structure

```
Pose Cam/
├── app/
│   ├── _layout.tsx                     # Root navigation layout
│   ├── settings.tsx                    # Settings & AI configuration
│   ├── pose/
│   │   └── [id].tsx                    # Pose detail screen with hero stick figure
│   └── (tabs)/
│       ├── _layout.tsx                 # Bottom tabs configuration
│       ├── index.tsx                   # Home screen (Curated poses, Live Coach banner)
│       ├── explore.tsx                 # Explore (Local Library vs Discover Online)
│       ├── live-coach.tsx              # Live Camera Coach with skeleton & timers
│       ├── ai-coach.tsx                # AI Pose Coach with natural language input
│       └── favorites.tsx               # Saved poses collection with direct camera link
├── src/
│   ├── components/
│   │   ├── PoseStickFigure.tsx         # Geometric SVG pose visualizer
│   │   └── SkeletonOverlay.tsx         # Live camera landmark & framing overlay
│   ├── data/
│   │   └── seedPoses.ts                # 100+ curated pose instruction archetypes
│   ├── services/
│   │   ├── poseFilterService.ts        # Search, category, tag, and pagination filters
│   │   ├── recommendationService.ts    # Rule-based offline recommendation engine
│   │   ├── poseMatchingService.ts      # Joint angles, framing, and posture hints
│   │   ├── storageService.ts           # AsyncStorage persistence for favorites & notes
│   │   ├── ai/
│   │   │   ├── aiProviderInterface.ts  # Typed IAIProvider interface
│   │   │   ├── localAiProvider.ts      # 100% offline structured AI engine
│   │   │   ├── freeOnlineAiProvider.ts # Configurable Ollama / Groq / OpenRouter adapter
│   │   │   └── aiProviderFactory.ts    # Preference-based provider resolution
│   │   ├── imageDiscovery/
│   │   │   └── openverseService.ts     # Openverse & Wikimedia Commons API client
│   │   └── poseDetection/
│   │       └── poseLandmarkerService.ts# MediaPipe native module bridge
│   ├── types/
│   │   ├── pose.ts                     # Core Pose and Filter type definitions
│   │   └── landmarks.ts                # 33 MediaPipe landmark indices and connections
├── modules/
│   └── pose-landmarker/                # Native Android MediaPipe Kotlin module
├── docs/
│   ├── ARCHITECTURE.md                 # Complete technical architecture
│   ├── ANDROID_SETUP.md                # Android SDK, Gradle, and EAS build guide
│   ├── AI_PROVIDERS.md                 # Free AI options, Ollama, and Groq guide
│   ├── IMAGE_LICENSING.md              # Creative Commons licensing compliance
│   └── PRIVACY.md                      # On-device processing & privacy policy
├── jest.config.js                      # Jest configuration for unit tests
└── tsconfig.json                       # TypeScript compiler options
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
