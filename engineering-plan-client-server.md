# Engineering Plan: Client/Server Refactor for Dadbot

## Overview
This document outlines the engineering plan to refactor Dadbot into a true client/server architecture within a monorepo. The goal is to create a slim Expo app client that communicates with a Next.js server, which will handle all business logic, memory, and integrations.

---

## Goals
- **Server-centric logic:** All business logic, memory, and integrations (e.g., Twilio) live on the backend.
- **Thin client:** The Expo app is a UI-only layer, sending/receiving messages via a simple API.
- **Simple initial authentication:** Use a hardcoded token for now, with future plans for more robust auth.
- **API contract:** Implement a single `/chat` POST endpoint for all chat interactions.
- **Persistent memory:** Server stores conversation/memory.
- **Testing:** Validate the full client-server loop.

---

## Actionable Steps

### 1. Audit and Remove Duplicated Logic
- **Identify business logic** (e.g., prompt handling, memory, personality) in the Expo app (`app/`).
- **Move all business logic** to the server (`server/`).
- **Ensure the client** only handles UI and API calls.
- **Status:** ✅ Complete. All business logic, memory, and persistence have been removed from the client. The client is now a thin UI that only sends/receives messages via the `/chat` API. All client screens have been refactored to remove local business logic and persistence.

### 2. Define and Implement the `/chat` API
- **Server:**
  - Create a `/chat` POST endpoint in the Next.js server.
  - Accepts `{ auth_token, message }` in the request body.
  - Returns `{ reply }` in the response.
  - Implement a simple auth check for the hardcoded token.
  - Route all chat logic, memory, and personality through this endpoint.

### 3. Refactor the Client (Expo App)
- **UI:**
  - Display a chat log and input field.
- **API Integration:**
  - Send messages to the `/chat` endpoint, including the auth token.
  - Display the server's reply in the chat log.
- **Remove any business logic** from the client.

### 4. Testing
- **End-to-end testing:**
  - User sends a message in the app.
  - Server processes and replies.
  - App displays the reply.
- **Add basic logging** on the server for debugging.

### 5. Prepare for Future Enhancements
- **Authentication:**
  - Plan for a more robust auth system (allow list, per-user tokens).
- **Twilio Integration:**
  - Consider how Twilio integration will work with the new architecture.
- **Documentation:**
  - Document the API contract in a shared location for future contributors.
- **Shared Types:**
  - If types/interfaces are shared, consider a `common/` or `shared/` folder/package.
- **Automated Testing:**
  - Add scripts to test the end-to-end flow.

---

## Deliverables for This Phase
- A working Expo app client that:
  - Has a minimal chat UI.
  - Sends messages to the Next.js server via the `/chat` endpoint.
  - Receives and displays replies from the server.
- A Next.js server that:
  - Implements the `/chat` endpoint.
  - Handles all business logic, memory, and personality.
  - Uses a hardcoded auth token for now.

---

## Timeline & Milestones
1. **Code Audit & Cleanup:** 1 day
2. **API Implementation:** 1 day
3. **Client Refactor:** 1 day
4. **Testing & Debugging:** 1 day
5. **Documentation & Handoff:** 0.5 day

---

## Success Criteria
- The Expo app does not contain any business logic or memory.
- All chat logic and memory are handled by the server.
- The client and server communicate only via the `/chat` API.
- The full chat loop works reliably for a small test group.

---

## Future Considerations
- Expand authentication as needed.
- Add more endpoints or features as the product evolves.
- Expand Twilio and other integrations on the server side. 