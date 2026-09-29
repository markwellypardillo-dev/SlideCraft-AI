# 🎓 SlideCraft AI — Presentation & Pedagogical Curriculum Architect

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38b2ac.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_%2F_2.0-8e75ff.svg?logo=google)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-ffca28.svg?logo=firebase)](https://firebase.google.com/)

> **SlideCraft AI** transforms teaching materials, lecture transcripts, syllabi, research papers, and documents into structured, high-impact presentation slide decks with synchronized pedagogical scripts, dual-coding visual prompt blueprints (for Midjourney/DALL-E), formative assessments, and a Canva & PPT-style master layout studio.

---

## 🌟 Key Features

### ⚡ 1. AI Curriculum-to-Slide Generation
* **Multi-Modal Dual Coding:** Generates slide titles, high-density pedagogical takeaways, cognitive chunking bullets (Miller's Law 7±2 compliance), and educator verbal scripts.
* **Document & Syllabus Uploader:** Paste raw curriculum text, lesson plans, research papers, or syllabus documents to synthesize structured presentations instantly.
* **Configurable Presentation Profiles:** Choose target audience, academic grade level, illustration styles, color palettes, and session structures.

### 🎨 2. Master Template Architect Studio (Canva & PPT-Style Visual Canvas)
* **Drag-and-Drop Widescreen 16:9 Canvas:** Build reusable custom master slide templates with text frames, cards, badges, and geometric vector elements.
* **Dynamic AI Slot Variable Bindings:** Bind custom elements to dynamic AI variables (`{{slide_title}}`, `{{headline}}`, `{{bullet_1}}`, `{{ai_visual_art}}`, `{{session_tag}}`, etc.). When instructors generate decks with your master template, Gemini automatically injects lesson data into these slots!
* **Touch-Friendly Mobile & Tablet Support:** Fully responsive mobile workstation featuring touch dragging, corner scaling, and a precision **Touch D-Pad Nudge Controller** (±1px, ±5px, ±10px, ±25px, and 1-tap Auto-Center).
* **Live AI Preview Fill:** Test how raw curriculum content will render in real time before publishing master templates.

### 🛠️ 3. Figma-Style Floating Canvas Dock
* **Streamlined Workspace:** Consolidates all slide controls into a clean, floating bottom dock to keep the slide creation viewport uncluttered.
* **1-Click Tool Switcher:** Switch between `Canvas Stage`, `Markdown Curriculum Outline`, and `Deck Grid Overview`.
* **Gemini AI Magic Menu:** Transform slides on the fly:
  * 🪄 *Simplify:* Reduce cognitive load for beginner learners.
  * 🧠 *Deepen:* Increase academic rigor with empirical evidence and mechanisms.
  * 🎨 *New Visual Prompt:* Fresh creative art direction for image generators.
  * 🌐 *Translate:* Generate bilingual and localized versions.
* **Typography & Archetype Switcher:** Swap curated font pairings (*Modern Minimal*, *Editorial Academic*, *Technical STEM*, *Warm Creative*) and layout archetypes (*Title Hero*, *Split Comparison*, *Big Stat*, *3-Column Grid*, *Timeline Flow*, *Socratic Discussion*).

### 🖼️ 4. Visual Prompt Blueprints & Art Studio
* **Midjourney & DALL-E Optimized Prompts:** Generates production-ready visual generation prompts with aspect ratios, color palettes, and lighting instructions.
* **Custom SVG Art Engine:** Real-time visual vectors rendered directly on slide previews when third-party graphics are not available.
* **Universal Design for Learning (UDL):** Embedded screen-reader alternative text (alt text) for every visual asset.

### 🧑‍🏫 5. Presenter Practice Mode
* Full-screen presenter workstation equipped with:
  * Dual-view speaker notes and synchronized pacing timers.
  * Classroom interaction triggers, verbal transition scripts, and common student misconception callouts.
  * Slide navigation with keyboard shortcuts (`Arrow keys`, `Spacebar`, `Esc`).

### 📝 6. Cornell Notes & Pedagogy Companion
* Auto-generates structured Cornell note-taking sheets containing primary cues, summaries, and self-test questions.
* Formative check-for-understanding quizzes mapped across Bloom's Taxonomy.

### 💾 7. Multi-Format Exports
* **Interactive HTML Deck:** Standalone offline presentation playable in any browser.
* **Microsoft PowerPoint (.pptx):** Fully native editable PowerPoint presentation generated via `pptxgenjs`.
* **Printable Document / PDF:** Clean format designed for student handouts.
* **Markdown:** Portable text format for obsidian, notion, or github documentation.

### 📱 8. Progressive Web App (PWA) & Offline Ready
* High-resolution icons, web app manifest, and service worker caching for offline access and native desktop/mobile installation.

---

## 🏗️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion |
| **Backend / Server** | Node.js, Express, TSX |
| **AI Integration** | `@google/genai` (Google Gemini 2.5 / 2.0 Flash) |
| **Build & Tooling** | Vite 8, `@tailwindcss/vite`, `vite-plugin-pwa` |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |
| **Presentation Export** | PPTXGenJS, Canvas Confetti |

---

## 📋 Prerequisites

Make sure you have the following installed on your machine:

1. **Node.js:** `v18.0.0` or higher (`v20.x` or `v22.x` recommended)  
   Check version: `node -v`
2. **Package Manager:** `npm` (comes with Node), `pnpm`, or `yarn`
3. **Google Gemini API Key:**  
   Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. *(Optional)* **Firebase Project:**  
   Required only if you want persistent user accounts, cloud syncing, and administrative template sharing.

---

## 🚀 Quick Start Guide (Installation & Setup)

Follow these steps to run SlideCraft AI locally on your system:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/slidecraft-ai.git
cd slidecraft-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to create your `.env` file:
```bash
cp .env.example .env
```

Open `.env` in your text editor and provide your **Google Gemini API Key**:
```env
# Google Gemini API Key
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Server Port (default is 3000)
PORT=3000

# App URL
APP_URL="http://localhost:3000"
```

### 4. Configure Firebase (Optional but Recommended)
SlideCraft AI integrates with Firebase for cloud saving and educator authentication.

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Firebase Authentication** (Google Sign-In and Email/Password).
3. Copy `firebase-applet-config.example.json` to `firebase-applet-config.json`:
   ```bash
   cp firebase-applet-config.example.json firebase-applet-config.json
   ```
4. Fill in your Firebase web app configuration credentials:
   ```json
   {
     "projectId": "your-firebase-project-id",
     "appId": "your-firebase-app-id",
     "apiKey": "your-firebase-api-key",
     "authDomain": "your-firebase-project-id.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-firebase-project-id.firebasestorage.app",
     "messagingSenderId": "your-messaging-sender-id"
   }
   ```
   *(Note: The app will run locally even without Firebase, saving decks to session storage and local state).*

### 5. Launch the Development Server
```bash
npm run dev
```

The Express backend and Vite frontend will start in tandem:
```
SlideCraft AI Studio server running at http://localhost:3000
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the full-stack server (`server.ts`) in development mode with Vite HMR middleware on port `3000`. |
| `npm run build` | Compiles TypeScript and builds the production frontend bundle into `dist/`. |
| `npm run start` | Runs the Node.js production server serving the static build from `dist/`. |
| `npm run preview` | Runs the Vite preview server for the compiled production assets. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) to verify code integrity without building. |
| `npm run clean` | Deletes build artifacts (`dist/` and `server.js`). |

---

## 📂 Project Structure

```text
slidecraft-ai/
├── public/                     # Static assets, PWA manifest, service worker, icons
│   ├── manifest.json           # Web App Manifest for PWA installation
│   ├── sw.js                   # Service worker for offline caching
│   ├── pwa-192x192.png         # High-resolution PWA icons
│   ├── pwa-512x512.png
│   └── favicon.svg
├── src/
│   ├── components/             # React UI Components
│   │   ├── admin/
│   │   │   └── TemplateArchitectStudio.tsx  # Master Slide Designer (Canva/PPT visual canvas)
│   │   ├── AccessibilityDrawer.tsx          # WCAG & UDL compliance auditor
│   │   ├── AdminDashboard.tsx               # Platform admin & master template management
│   │   ├── AIPedagogyCompanion.tsx          # Socratic tutor & lesson assistant
│   │   ├── AssessmentsHub.tsx               # Quiz & Bloom's Taxonomy checkpoint manager
│   │   ├── DocumentUploader.tsx             # Lecture note & document ingestion
│   │   ├── ExportModal.tsx                  # Export to PPTX, HTML, PDF, Markdown
│   │   ├── FloatingCanvasDock.tsx           # Figma-style floating toolbar
│   │   ├── PresenterPracticeMode.tsx        # Full-screen dual-view presentation deck
│   │   ├── PWAInstallButton.tsx             # 1-click PWA installer with device detection
│   │   ├── Sidebar.tsx                      # Primary navigation rail
│   │   ├── SlideDeckWorkspace.tsx           # Core slide editing workstation
│   │   ├── SlideVisualCanvas.tsx            # Live 16:9 slide renderer with custom vectors
│   │   └── VisualBlueprintGallery.tsx       # AI prompt art gallery
│   ├── hooks/                  # Custom React hooks (e.g., usePWAInstall)
│   ├── services/               # API clients & backend communication
│   │   ├── firebase.ts         # Firebase initialization, Auth, & Firestore rules
│   │   ├── templateService.ts  # Master slide template Firestore CRUD operations
│   │   └── exportService.ts    # PPTX and HTML export handlers
│   ├── types/                  # TypeScript interface definitions (deck, template, admin)
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # Client entry point
├── server.ts                   # Express server with Gemini API proxy & Vite integration
├── vite.config.ts              # Vite 8 configuration with PWA & Tailwind v4 plugins
├── firestore.rules             # Production Firebase security rules
├── firebase-blueprint.json     # Data entities and permissions schema
├── .env.example                # Example environment variables template
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🌐 Production Deployment

### Option A: Google Cloud Run / Docker Container
1. Build the production application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```
3. Set environment variable `NODE_ENV=production` and `PORT=8080` (or your cloud platform's default port).

### Option B: Node.js Host (Render, Railway, DigitalOcean, VPS)
1. Link your GitHub repository.
2. Build command:
   ```bash
   npm install && npm run build
   ```
3. Start command:
   ```bash
   npm run start
   ```
4. Add `GEMINI_API_KEY` to the environment variables settings on your hosting dashboard.

---

## 🔒 Security & Privacy

* **Server-Side API Proxy:** The Gemini API key is kept server-side in `server.ts` and is never exposed to the client-side JavaScript bundle.
* **Sanitized Inputs:** All file uploads, prompts, and document parsing requests are validated and sanitized prior to LLM processing.
* **Role-Based Access Control:** Admin features (such as platform template publication) are safeguarded with Firebase Authentication roles (`admin`, `educator`, `pro_scholar`).

---

## 🤝 Contributing

Contributions, feedback, and pull requests are welcome!

1. Fork the Project.
2. Create your Feature Branch: `git checkout -b feature/AmazingFeature`
3. Commit your Changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the Branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal, educational, or commercial projects.
