# Dadbot Architecture Brief

## Goal
Refactor Dadbot so the server handles all business logic, and the client app becomes a thin front-end. Prepare for a small test group and future multi-client access, starting with a single shared auth token.

## Architecture Overview
- **Server**: Hosts Dadbot’s personality, memory, and conversation logic. Exposes a simple API.
- **Client (Expo App)**: Lightweight UI that sends/receives messages via the API.

## Separation of Concerns
- All memory, personality, logic, and integrations (e.g. Twilio) live server-side.
- The client just renders UI and handles user input/output.

## Initial Auth Approach
- Use a single hardcoded auth token for now.
- Plan to expand with a device ID allow list or token-per-user model later.

## Server Responsibilities
- `/chat` POST endpoint:
  - Accepts: `auth_token`, `message`
  - Returns: server-generated reply
- Persistent memory (file or DB)
- Optional: Twilio SMS support
- Basic logging for dev/debugging

## Client Responsibilities
- Simple chat UI (chat log + input field)
- Send/receive messages via API
- Include auth token in requests
- Built with Expo, easy to distribute

## Next Steps
1. **Define API**:
   - `POST /chat`
   - Body: `{ auth_token: string, message: string }`
   - Response: `{ reply: string }`

2. **Server Setup**:
   - Express server
   - Core logic and memory handling
   - Single-token auth check

3. **Client Update**:
   - Minimal UI
   - API call integration

4. **Testing**:
   - Run through full app-server loop
   - Validate message sending, reply display

5. **Future Prep**:
   - Add allow list or token-per-user scheme
   - Expand Twilio integration if needed
