# PoseGenius AI - AI Providers & Free Tier Guide

This guide explains how AI recommendations work in PoseGenius AI, why paid subscriptions are not required, and how to connect optional free open-weight models.

---

## 1. Honest Breakdown of AI Services

### The Common Misconception
Many users confuse **consumer web chat** (e.g. chatgpt.com) with **developer APIs**:
- ChatGPT Free Web Chat is an interactive website for consumers, **not a developer API**.
- OpenAI API, Claude API, etc. require paid credits or credit card billing per million tokens.
- **PoseGenius AI never claims paid APIs are free**, and never relies on unofficial web scraping.

---

## 2. Supported AI Providers in PoseGenius AI

### Provider 1: Local Rule-Based Recommendation Engine (Default)
- **Cost**: 100% Free forever.
- **Internet Needed**: No (100% offline).
- **Latency**: Instant (< 10 milliseconds).
- **Privacy**: Absolute zero network transmission.
- **Mechanism**:
  - Parses natural language tokens (outfits, occasions, settings, framing, people count).
  - Deterministically ranks and scores all 100+ curated pose archetypes.
  - Dynamically enriches advice with outfit drape tips, camera angles, and posture instructions.

---

### Provider 2: Self-Hosted Local Models (Ollama)
Run open-weight models completely free on your own PC without any third-party clouds or quotas!

1. Download Ollama from [ollama.com](https://ollama.com).
2. Start a lightweight open-weight model:
   ```bash
   ollama run mistral
   # or
   ollama run llama3:8b
   ```
3. In PoseGenius AI **Settings**:
   - Turn OFF "Offline-Only Mode".
   - Turn ON "Enable Online AI Adapter".
   - Set **Custom AI Endpoint URL**:
     - On Android Emulator: `http://10.0.2.2:11434/v1/chat/completions`
     - On Physical Device: `http://<your-pc-ip>:11434/v1/chat/completions`
   - Set **Model Name**: `mistral` or `llama3:8b`
   - Leave API key blank.

---

### Provider 3: Free-Tier Online Providers

If you choose to use an online API provider, several options offer genuine free tiers:

1. **Groq Cloud (Free Developer Tier)**:
   - Provides free developer access with generous requests-per-minute limits for open models (`llama-3.1-8b-instant`).
   - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
2. **OpenRouter (Free Open-Weight Models)**:
   - Provides models ending with `:free` (such as `mistralai/mistral-7b-instruct:free`).
   - Endpoint: `https://openrouter.ai/api/v1/chat/completions`
3. **Hugging Face Serverless Inference API**:
   - Free rate-limited inference for popular open-weight checkpoints.

---

## 3. Privacy & Safety Guarantee

- **Zero API Keys in Binary**: PoseGenius AI contains no hardcoded API secrets in its APK bundle.
- **Secure Local Storage**: User-configured keys are stored only in on-device encrypted AsyncStorage.
- **Automatic Fallback**: If an online provider experiences rate limiting, network disconnect, or timeout (8-second threshold), PoseGenius AI automatically falls back to the deterministic local offline engine without interrupting the user.
