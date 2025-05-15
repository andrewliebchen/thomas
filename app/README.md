# Dad App

A personal companion app that provides emotional support and guidance through AI-powered conversations. Built with React Native and Expo.

## Features

- 💬 AI-powered chat interface with personalized responses
- 🌓 Dark/light mode support
- 💾 Local storage for conversation history
- 🧵 Thread-based chat organization
- 🤖 Powered by OpenAI's GPT-4
- 🔄 Robust database with error recovery
- 🧠 Cross-thread memory system

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)
- OpenAI API key
- Apple Developer Account (for TestFlight deployment)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dad.git
cd dad
```

2. Install dependencies:
```bash
cd dad-app
npm install
```

3. Create a `.env` file in the `dad-app` directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npx expo start
```

5. Run on your device:
   - iOS: Press `i` to open in iOS Simulator
   - Android: Press `a` to open in Android Emulator
   - Physical device: Scan the QR code with the Expo Go app

## TestFlight Deployment

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to EAS:
```bash
eas login
```

3. Configure your app:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios --profile production
```

5. Submit to TestFlight:
```bash
eas submit --platform ios
```

6. Configure App Store Connect API Key:
```bash
eas credentials
```
Follow the interactive prompts to set up your API key.

## Development

The app is structured in phases following the skateboard > bike > motorcycle > car model:

- **Phase 1 (Skateboard)**: ✅ Basic chat functionality and local storage
- **Phase 2 (Bike)**: In Progress - Enhanced memory and UI improvements
- **Phase 3 (Motorcycle)**: Planned - Advanced features and experience improvements
- **Phase 4 (Car)**: Planned - Polish and deployment

See [engineering-plan.md](engineering-plan.md) for detailed implementation plans.

## Project Structure

```
dad-app/
├── src/
│   ├── screens/          # App screens
│   ├── components/       # Reusable components
│   │   └── DatabaseInitializer.tsx  # Database initialization component
│   ├── services/         # API and database services
│   │   ├── database.ts   # SQLite database service with error recovery
│   │   └── memory.ts     # Memory management service
│   ├── theme/           # Theme configuration
│   └── types/           # TypeScript type definitions
├── docs/                # Documentation
│   └── database-implementation.md  # Database implementation details
├── assets/              # Static assets
└── App.tsx              # Root component
```

## Contributing

This is a personal project. Please contact the repository owner for any questions or suggestions.

## License

Private - All rights reserved 