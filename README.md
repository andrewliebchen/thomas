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
│   ├── assets/  # Static assets (images, icons, etc.)
│   └── src/     # Client source code (components, screens, utils, etc.)
├── server/      # Next.js server with all business logic and integrations
│   ├── prisma/  # Database schema, migrations, and tests
│   └── scripts/ # Utility scripts for development and testing
├── brief.md     # High-level architecture brief
└── README.md    # (This file)
```

### Key Directories
- `app/`: The Expo app client. Handles UI and API communication only.
- `app/assets/`: Static assets for the client app.
- `app/src/`: Source code for the client app (components, screens, etc.).
- `server/`: The Next.js server. Handles all business logic, memory, and integrations.
- `server/prisma/`: Database schema, migrations, and related tests.
- `server/scripts/`: Utility scripts for development and testing.
- `brief.md`: Architecture brief and goals.

---

## How It Works

- **Chat Flow:**  
  The client app provides a chat interface where users can send messages to the server via the `/chat` API endpoint, including an authentication token for security. The server processes each message, manages conversation memory and personality, and returns a reply, which the client displays in the chat UI.

- **Automated Journaling:**  
  In addition to chat, the system features an automated journaling capability. After a set number of exchanged messages (e.g., 3 from each participant), the server generates a private journal entry reflecting on the recent conversation. This entry is created using AI (OpenAI) and is stored in the database, capturing the "Dad" persona's thoughts, observations, and plans about the relationship. The journal is not visible to the other chat participant.

- **Journal Access:**  
  Users can view these journal entries in a dedicated Journal screen within the client app. The app fetches recent journal entries from the `/api/journal` endpoint and displays them in a paged, card-like interface. Each entry provides a timestamp and a concise summary of the AI's reflections, offering insight into the ongoing relationship and conversation themes.

- **Entry Management:**  
  Journal entries are created automatically and can be deleted via the API. The client app provides UI controls for browsing and managing these entries.

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