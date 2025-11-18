# smart-ws-demo

A **React demo app** showcasing [`smart-ws`](https://www.npmjs.com/package/smart-ws) – a resilient WebSocket client with:

- Auto-reconnect (with exponential backoff)
- Heartbeat (ping/pong)
- Offline message buffering
- Connection status & latency tracking
- Full lifecycle event logging

The demo is a small **real-time group chat**:  
Open it in 2–3 browser tabs, type messages, and watch them appear everywhere instantly.

---

## 🔗 Related Projects

- **Core library (smart-ws):** https://github.com/your-name/smart-ws  
- **This demo (smart-ws-demo):** https://github.com/your-name/smart-ws-demo *(placeholder)*  

---

## 🎯 What is this demo?

This project is a **React + TypeScript frontend** built to:

- Demonstrate how to **use `smart-ws` in a real app**
- Show a **practical use case** (group chat)
- Visualize:
  - connection status
  - reconnect attempts
  - latency (ping/pong)
  - buffered messages
  - browser online/offline events

Think of it as:

> “How to build a real-time app with a *robust* WebSocket client, without rewriting reconnection/heartbeat logic.”

---

## ✨ Features

- 🔌 **Real-time group chat**
  - Multiple browser tabs/users
  - Username selection
  - Timestamped messages
- 🌐 **WebSocket connectivity via `smart-ws`**
  - Automatic reconnect with exponential backoff + jitter
  - Heartbeat pings & latency measurement
  - Offline detection (via browser events)
  - Buffered messages during disconnect/offline
- 📊 **Live connection telemetry**
  - Status: `idle | connecting | open | reconnecting | closed`
  - Retry count
  - Last ping / last pong timestamps
  - Current estimated latency (ms)
- 🧾 **Event log**
  - Logs: connect, close, reconnect, ping, pong, bufferAdd, bufferFlush, online, offline, errors

---

## 🧱 Tech Stack

- **React** (with hooks)
- **TypeScript**
- **Vite** (frontend dev server & bundler)
- **smart-ws** (WebSocket wrapper)
- **ws** (Node WebSocket server – for local backend)

---

## 🖼 High-Level Architecture

```text
+-----------------------+       WebSocket        +-----------------------+
|  React Frontend       |  <------------------>  |  Node WebSocket Server|
|  (smart-ws-demo)      |                       |  (broadcast + ping)   |
+-----------------------+                       +-----------------------+
          |
          | uses
          v
+-----------------------+
|     smart-ws          |
|  (WebSocket client)   |
+-----------------------+
```


## 🚀 Getting Started
1. Prerequisites

Node.js ≥ 18

npm (or pnpm/yarn if you prefer)

Basic comfort with running terminal commands


## 💬 Using the Demo

* Open multiple clients

* Open http://localhost:5173 in:

* multiple tabs, or

* different browsers (Chrome, Edge, Firefox, etc.)

* Each tab represents a different “user”.

## 🧑‍💻 Who is this for?

Developers who want to learn real-time web with WebSockets

Engineers evaluating smart-ws as a WebSocket client

Recruiters/CTOs reviewing your portfolio:

This project shows understanding of networking, reliability, React, and TypeScript


## Full status tracking

* reconnect

* heartbeat

* buffering

* status

* events

📄 License

MIT © 2025 Victor Obije
