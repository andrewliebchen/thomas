# Dadbot Monorepo

Welcome to the Dadbot monorepo! This repository contains both the server and client code for Dadbot, a conversational AI chatbot with a focus on a clean client/server architecture.

---

## Overview
Dadbot is designed as a modern, maintainable, and scalable chatbot system. All business logic, memory, and integrations live on the server, while the client (an Expo app) provides a simple, user-friendly chat interface.

- **Server:** Handles all conversation logic, memory, and integrations (e.g., Twilio). Exposes a simple API for clients.
- **Client (Expo App):** A lightweight UI that communicates with the server via API calls.

---

## Repository Structure

```
.
├── app/         # Expo React Native client app
│   └── docs/    # Client-side documentation and plans
├── server/      # Next.js server with all business logic and integrations
│   └── prisma/  # Database schema and migrations
├── brief.md     # High-level architecture brief
└── README.md    # (This file)
```

### Key Directories
- `app/`: The Expo app client. Handles UI and API communication only.
- `server/`: The Next.js server. Handles all business logic, memory, and integrations.
- `brief.md`: Architecture brief and goals.
- `app/docs/`: Engineering plans and technical documentation for the client.

---

## How It Works
- The client app sends user messages to the server via a `/chat` API endpoint, including an authentication token.
- The server processes the message, manages memory and personality, and returns a reply.
- The client displays the reply in the chat UI.

---

## Getting Started
1. **Install dependencies** in both `app/` and `server/`:
   ```sh
   cd app && npm install
   cd ../server && npm install
   ```
2. **Start the server** (from `server/`):
   ```sh
   npm run dev
   ```
3. **Start the client** (from `app/`):
   ```sh
   npx expo start
   ```

---

## Contributing
- Please see the engineering plan in `app/docs/engineering-plan-client-server.md` for current goals and actionable steps.
- All business logic should be implemented server-side. The client should remain a thin UI layer.

---

## License
This project is for internal use and prototyping. Please contact the maintainers for more information about licensing or usage. 