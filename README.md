# Auto Domain Saver

A complete end-to-end system for automatically detecting and saving website domains as you browse, complete with a Chrome/Edge Manifest V3 extension, Node.js + Express backend with SSRF security and metadata extraction, and a sleek React + Tailwind CSS v3 web dashboard.

---

## 🛠️ Project Structure

- **`backend/`**: Node.js + Express REST API server with SSRF protection, OpenGraph/Twitter/Favicon metadata scraper, and Mongoose database model (with zero-config local memory fallback).
- **`frontend/`**: Web Dashboard built with React, Vite, Tailwind CSS v3, `lucide-react`, and `react-hot-toast`, built on a single-source-of-truth **Global Shared UI Component Foundation** (`Button`, `Input`, `Textarea`, `Card`, `Badge`, `Modal`, `Loader`, `EmptyState`, `ErrorPage`, `Toast`).
- **`extension/`**: Chrome / Edge Browser Extension (Manifest V3) with background service worker tab tracking, domain extraction, backend duplicate checking, and popup interface matching the system architecture diagram.

---

## 🚀 Quick Start Guide

### 1. Start the Backend Server
```bash
cd backend
npm start
```
*The backend runs on `http://localhost:5000`.*

### 2. Start the Web Dashboard
```bash
cd frontend
npm run dev
```
*The web dashboard runs on `http://localhost:5173`.*

### 3. Load the Browser Extension in Chrome / Edge
1. Open Chrome or Edge and navigate to `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode** toggle in the top right.
3. Click **Load unpacked**.
4. Select the `auto_url_saver/extension` folder.
5. Visit any website (e.g. `https://github.com/facebook/react` or `https://react.dev/learn`). The extension will automatically detect the domain and save it once to your backend!

---

## 🧪 Running Tests
```bash
cd backend
npm test
```
