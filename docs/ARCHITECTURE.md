# PoseGenius AI - Architecture Overview

## 1. System Design Philosophy

PoseGenius AI is engineered as an **offline-first, zero-cost, privacy-respecting** mobile photography pose director.

### Core Architecture Principles:
1. **Zero Mandatory Paid APIs**: The entire core experience—searching 100+ curated pose archetypes, live camera guidance, skeleton alignment, and AI pose recommendations—operates completely free without paid subscriptions or accounts.
2. **On-Device Computer Vision**: Live camera frames are analyzed locally using Google MediaPipe Pose Landmarker standards. Zero camera frames are streamed to remote clouds.
3. **Provider-Independent AI**: Offline rule-based deterministic matching serves as the primary AI engine. Optional adapters allow connecting self-hosted models (Ollama) or open-weight free tiers without hardcoding credentials.
4. **Legal & Ethical Media Discovery**: Online image search pulls solely from vetted, openly-licensed repositories (Openverse and Wikimedia Commons), enforcing full CC license attribution.

---

## 2. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              USER INTERFACE                             |
|  (Expo Router / Tabs: Home, Explore, Live Coach, AI Coach, Favorites)   |
+---------------------+--------------------+--------------------+---------+
                      |                    |                    |
                      v                    v                    v
         +-----------------------+ +---------------+ +--------------------+
         |   PoseFilterService   | |   AI Engine   | |   ImageDiscovery   |
         |  - Category Matching  | |  (Provider    | |  - Openverse API   |
         |  - Tag Intersection   | |   Interface)  | |  - Wikimedia API   |
         |  - Fast Local Index   | +-------+-------+ |  - Web Fallback    |
         +-----------+-----------+         |         +---------+----------+
                     |                     |                   |
                     v                     v                   v
         +-----------------------+ +---------------+ +--------------------+
         | 100+ Seed Poses Store | | Local Offline | | CC Licensing Engine|
         | (Typed Archetypes)    | | Rule Matching | | (Attribution Auto) |
         +-----------+-----------+ +-------+-------+ +--------------------+
                     |                     |
                     +----------+----------+
                                |
                                v
               +----------------------------------+
               |        Live Camera Coach         |
               | - Expo Camera Preview (Front/Back)
               | - Capture Timer & Flash Controls |
               | - Dynamic SVG PoseStickFigure    |
               | - Real-time Skeleton Overlay     |
               +----------------+-----------------+
                                |
                                v
               +----------------------------------+
               |    On-Device Computer Vision     |
               | - PoseLandmarker Native Module   |
               | - 33 Normalized MediaPipe Joints |
               | - PoseMatching Angle Engine      |
               | - Actionable Posture Hints       |
               +----------------------------------+
```

---

## 3. Component Breakdown

### A. Real-Time Camera & Pose Guidance (`app/(tabs)/live-coach.tsx`)
- **CameraView**: Powered by `expo-camera` SDK 57, supporting seamless front and rear lens toggling, exposure/flash settings ('off' | 'on' | 'auto'), and shutter timers (0s, 3s, 5s, 10s) with animated visual countdowns.
- **Strict Camera Lifecycle (Unmount on Blur)**: Uses `useIsFocused` to unmount `CameraView` immediately when navigating away or closing the camera, releasing hardware camera sessions (`CameraDevice`) and preventing battery drain or background camera locking.
- **Explicit Close Action**: Prominent close button (`X`) instantly terminates detection, clears intervals, and safely navigates back to Home.
- **AR Target Pose Skeleton Stencil (`SkeletonOverlay.tsx`)**: Generates and projects a 33-point target pose skeleton guide across the viewfinder with glowing AR cyan bones, joint nodes, head silhouette, and rule-of-thirds grid.
- **Opacity & Mode Controls**: Real-time opacity stepping (35% to 95%) and mode toggles (Fullscreen AR Overlay, Mini Card, or Both) allow the user to balance between viewing their subject and viewing the pose stencil.
- **Next/Prev Shutter Flow**: Quickly switch through poses while keeping the camera open.

### B. Computer Vision & Landmark Normalization (`src/services/poseMatchingService.ts`)
- **Landmark Mapping**: Represents standard MediaPipe 33-point body topology (Nose, Shoulders, Elbows, Wrists, Hips, Knees, Ankles).
- **Scale & Translation Invariance**: Evaluates poses using joint angles:
  $$\theta = \arccos\left(\frac{\vec{BA} \cdot \vec{BC}}{|\vec{BA}||\vec{BC}|}\right)$$
  ensuring distances from the camera do not distort detection.
- **Coaching Engine**:
  - Upper-body alignment vs lower-body alignment scoring (0-100%).
  - Actionable directions: head tilt correction, shoulder level checks, arm angle matching, and weight shift suggestions.
  - Zero false claims: When native CV models are loading or unavailable, transparently guides the user through posture instructions without fabricating detections.

### C. Offline Recommendation Engine (`src/services/recommendationService.ts` & `localAiProvider.ts`)
- **Natural Language Parsing**: Analyzes unstructured queries for people count (solo, couple, group), outfits (dress, blazer, hat), settings (waterfall, beach, cafe), and occasions (travel, wedding, graduation).
- **Enrichment Synthesis**: Dynamically inserts contextual posture notes (e.g. flow of dress in wind, hand on hat brim, weight shift).

### D. Online Discovery Service (`src/services/imageDiscovery/openverseService.ts`)
- Integrates with Openverse public REST endpoints and Wikimedia Commons search APIs.
- Filters by non-commercial and commercial Creative Commons licenses (`CC0`, `CC BY`, `CC BY-SA`).
- Preserves full metadata: Title, Creator, Source URL, and standardized attribution notice.
- Fallback button directly opens public web image search in browser.

### E. Storage & Local Persistence (`src/services/storageService.ts`)
- Utilizes `@react-native-async-storage/async-storage` for local persistence:
  - Saved favorites
  - Recently viewed pose history
  - User custom notes per pose
  - AI and camera configuration preferences
- Zero cloud account or sign-up mandatory.
