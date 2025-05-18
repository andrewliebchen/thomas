# Dadbot: System Summary

Dadbot is a conversational AI system with a clear client-server architecture:

## Client (Expo React Native App)
- Provides a chat interface for users.
- Sends user messages to the server via a `/chat` API endpoint, including an authentication token.
- Displays server replies in the chat UI.
- Includes a dedicated Journal screen to view AI-generated journal entries.

## Server (Next.js)
- Handles all conversation logic, memory, and integrations (e.g., Twilio).
- Processes incoming messages, manages conversation state, and generates replies.
- After a set number of exchanged messages, automatically generates a private journal entry using an LLM (OpenAI). This entry reflects on the recent conversation from the "Dad" persona's perspective.
- Stores journal entries in a database and exposes them via a `/api/journal` endpoint.
- Supports deleting journal entries via the API.

## Journal Feature
- Journal entries are concise, AI-generated reflections about the ongoing relationship, not visible to the other chat participant.
- The client fetches and displays these entries in a paged, card-like interface.

## Key Principles
- All business logic and memory are server-side; the client is a thin UI layer.
- The system is designed for maintainability, scalability, and clear separation of concerns. 