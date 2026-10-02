# Polyglot Push-to-Talk Voice Translator 🎙️🌍

A modern, highly responsive real-time voice translation application powered by the Gemini AI API. Built with React, Vite, and Express, this application allows users to engage in natural, bidirectional spoken conversations across different languages with a seamless push-to-talk interface.

## ✨ Features

- **Push-to-Talk Interface**: Hold to speak, release to translate – designed for natural conversational flow.
- **Multimodal Gemini AI Integration**: Direct audio ingestion using the latest Gemini models for highly accurate transcription and translation, preserving nuance and context.
- **Tone Control**: Choose between "Casual/Colloquial" and "Formal" tones. Supports specific conversational vernaculars (e.g., Amiyaneh for Persian).
- **Phonetic Transliteration**: Get helpful transliterations (e.g., Fingilish for Persian, Romaji for Japanese) to help you pronounce the translated text.
- **Text-to-Speech (TTS) Integration**: Auto-play translated responses or replay them on demand.
- **Bidirectional Support**: Easily swap origin and target languages on the fly.
- **Responsive UI**: A beautiful, modern interface built with Tailwind CSS and Lucide React icons.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd polyglot-push-to-talk-voice-translator
   ```

2. **Install dependencies**:
   Using `npm` (or `bun`, `pnpm`, `yarn`):
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   This will start both the Express API backend and the Vite React frontend concurrently.

5. **Open the App**:
   Navigate to `http://localhost:3000` in your browser.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (v4), Framer Motion
- **Backend**: Express.js, TypeScript
- **AI/ML**: `@google/genai` (Gemini Flash & Flash-Lite models)
- **Audio Processing**: Multer (memory storage for seamless upload)

## 📁 Project Structure

- `/src`: React frontend application
  - `/components`: UI components organized by feature (auth, layout, translate, settings)
  - `/hooks`: Custom React hooks for microphone and speech synthesis (`useVoiceRecorder`, `useSpeechPlayer`)
  - `/services`: Frontend integration logic
- `/app/api`: Additional backend API routes (if any)
- `server.ts`: The main Express backend server and API endpoint definition (`/api/translate`)

## 📄 License

This project is open-source. Feel free to modify and distribute as needed.
