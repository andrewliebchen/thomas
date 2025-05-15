# Dad App Engineering Plan

## Overview
This document outlines the engineering plan for building the Dad app, a personal companion app for Andrew Liebchen. The plan follows an iterative approach using the skateboard > bike > motorcycle > car model, allowing for functional iterations at each stage.

## Technical Stack
- **Framework**: Expo with Expo Go for development
- **State Management**: React Context API (ThemeProvider)
- **Navigation**: React Navigation (Stack + Tab Navigation)
- **API**: OpenAI GPT-4 and GPT-4o-mini (for summarization)
- **Local Storage**: SQLite (expo-sqlite)
- **Push Notifications**: Expo Notifications (planned)
- **Deployment**: TestFlight (iOS only)

## Project Structure
```
dad-app/
├── src/
│   ├── screens/
│   │   ├── ChatScreen.tsx     # Main chat interface
│   │   ├── ListScreen.tsx     # Tab navigation container
│   │   ├── ThreadsScreen.tsx  # Thread list view
│   │   └── MemoriesScreen.tsx # Memories view
│   ├── components/
│   │   ├── ThreadList.tsx     # Thread selection and management UI
│   │   └── ChatMessage.tsx    # Individual message component
│   ├── services/
│   │   ├── database.ts        # SQLite database service
│   │   ├── openai.ts         # OpenAI API integration
│   │   ├── summary.ts        # Conversation summarization service
│   │   └── prompts/
│   │       └── dad.ts        # Dad's personality system
│   ├── theme/
│   │   ├── components.tsx    # Theme-aware UI components
│   │   └── ThemeProvider.tsx # Theme context and provider
│   └── types/
│       ├── chat.ts          # Chat-related types
│       └── navigation.ts    # Navigation types
├── assets/                  # Static assets
└── App.tsx                 # Root component and navigation setup
```

## Phase 1: Skateboard (MVP) - ✅ COMPLETED
**Goal**: Create a basic functional app with core chat functionality and local storage.

**Features**:
1. ✅ Basic chat interface with Dad
   - Message bubbles with user/Dad distinction
   - Input field with send button
   - Enter key support for sending messages
2. ✅ Simple theme implementation with Theme UI
   - Dark/light mode support
   - Consistent styling across components
3. ✅ Local storage for conversation history
   - SQLite database implementation
   - Thread-based conversation management
   - Message persistence
4. ✅ Basic error handling and loading states
   - API error handling
   - Loading indicators
   - Error messages in chat
5. ✅ Dad's personality and background setup
   - Core personality traits defined
   - Background details established
   - Prompting system implemented
   - Emotional intelligence and support focus

**Implementation Details**:
1. **Database Schema**:
   ```sql
   -- Threads table
   CREATE TABLE threads (
     id TEXT PRIMARY KEY NOT NULL,
     title TEXT NOT NULL,
     createdAt INTEGER NOT NULL,
     lastMessageAt INTEGER NOT NULL,
     summary TEXT,
     lastSummarizedMessageId TEXT
   );

   -- Messages table
   CREATE TABLE messages (
     id TEXT PRIMARY KEY NOT NULL,
     text TEXT NOT NULL,
     isUser INTEGER NOT NULL,
     timestamp INTEGER NOT NULL,
     threadId TEXT NOT NULL,
     FOREIGN KEY (threadId) REFERENCES threads (id)
   );
   ```

2. **Key Components**:
   - `ChatScreen`: Main interface handling message display and input
   - `ThreadList`: Manages chat thread selection and creation
   - `DatabaseService`: Handles all SQLite operations
   - `ThemeProvider`: Manages app-wide theming

3. **State Management**:
   - Local state for messages and UI
   - Context for theme management
   - SQLite for persistent storage

## Phase 2: Bike (In Progress)
**Goal**: Enhance the app with persistent memory and improved UI/UX.

**Features**:
1. ✅ Conversation history with summarization
   - Thread-based conversation management
   - Automatic summarization using GPT-4o-mini
   - Cross-thread memory system
   - Personal details retention
2. ✅ Improved navigation and UI structure
   - Stack navigation for main flow
   - Tab navigation for threads and memories
   - Proper safe area handling
   - Consistent styling across screens
3. ✅ Enhanced database reliability
   - Robust initialization process
   - Error recovery mechanisms
   - AsyncStorage integration
   - User-friendly error handling
4. ✅ Thread management improvements
   - Swipe-to-delete functionality for threads
   - Automatic cleanup of empty threads
   - Improved thread list UI
5. Improved UI with animations and transitions
6. Basic mood tracking
7. Push notifications for check-ins

**Implementation Progress**:
1. ✅ Implemented conversation history view
2. ✅ Added basic summarization using GPT-4o-mini
   - Summary generation at appropriate intervals
   - Focus on personal details and important information
   - Cross-thread memory integration
3. ✅ Enhanced navigation structure
   - Added tab navigation for threads and memories
   - Fixed layout issues with safe areas
   - Improved thread list UI
4. ✅ Improved database reliability
   - Added DatabaseInitializer component
   - Implemented retry mechanism for initialization
   - Added error recovery for critical database errors
   - Improved AsyncStorage integration
   - Added proper database closing and reopening
5. ✅ Enhanced thread management
   - Added swipe-to-delete functionality using react-native-swipe-list-view
   - Implemented automatic cleanup of empty threads when navigating away
   - Improved thread list UI with better touch handling
6. 🚧 Next Steps:
   - Add animations for screen transitions
   - Implement mood tracking UI
   - Set up push notifications
   - Polish thread and memory views

**Technical Changes**:
1. **Enhanced Navigation Structure**:
   - Stack Navigator for main app flow
   - Tab Navigator for threads and memories
   - Proper safe area handling with SafeAreaProvider
   - Consistent header styling

2. **Memory System Architecture**:
   - Created `summary.ts` service for managing conversation summaries
   - Implemented cross-thread memory by including summaries from all threads
   - Enhanced Dad's personality prompt to better utilize memory context
   - Optimized summary generation to focus on personal details

3. **Database Reliability Improvements**:
   - Created `DatabaseInitializer` component to ensure proper initialization
   - Added retry mechanism with maximum attempts to prevent infinite loops
   - Implemented error recovery for critical database errors
   - Added proper database closing and reopening during recovery
   - Improved AsyncStorage integration with better error handling
   - Added detailed logging for debugging database issues

4. **Thread Management Enhancements**:
   - Integrated react-native-swipe-list-view for thread deletion
   - Added automatic cleanup of empty threads on navigation
   - Improved thread list UI with better touch handling
   - Enhanced error handling for thread operations

5. **Performance Optimizations**:
   - Using GPT-4o-mini for summarization to reduce API costs
   - Efficient database queries for thread management
   - Cleaned up logging for better performance
   - Optimized thread list rendering with proper list virtualization

## Phase 3: Motorcycle
**Goal**: Add advanced features and improve the overall experience.

**Features**:
1. Creative companion mode
2. Visual timeline for mood tracking
3. Enhanced memory system
   - Improved personalization based on user preferences
   - Better context awareness for emotional support
4. Improved check-in system

**Implementation Steps**:
1. Implement creative companion mode with photo/note storage
2. Create visual timeline for mood tracking
3. Enhance memory system with better summarization
4. Improve check-in system with more personalized prompts

## Phase 4: Car
**Goal**: Polish the app and add final touches.

**Features**:
1. Advanced personalization
2. Performance optimizations
3. Final UI/UX improvements
4. TestFlight deployment

**Implementation Steps**:
1. Implement advanced personalization options
2. Optimize performance and reduce API calls
3. Final UI/UX improvements
4. Prepare for TestFlight deployment:
   - Configure app.json with proper iOS settings
   - Set up EAS build configuration
   - Create App Store Connect API Key
   - Build and submit to TestFlight
   - Configure TestFlight testing groups

**TestFlight Deployment Process**:
1. **Prerequisites**:
   - Apple Developer Account
   - App Store Connect App ID
   - Apple Team ID
   - App Store Connect API Key

2. **Configuration**:
   - Update app.json with bundle identifier
   - Configure eas.json with production settings
   - Set up API key using `eas credentials`

3. **Build and Submit**:
   - Build iOS app with `eas build`
   - Submit to TestFlight with `eas submit`
   - Monitor build status in App Store Connect

4. **TestFlight Setup**:
   - Configure internal testing group
   - Add test users
   - Set up app metadata
   - Configure privacy policy

## Development Workflow
1. Set up development environment with Expo Go
2. Implement features iteratively
3. Test on physical device
4. Deploy to TestFlight for beta testing

## Success Metrics
- The app feels emotionally real and personally helpful
- Andrew wants to open it, not because he "should," but because it helps
- It evolves with Andrew and stays relevant to his emotional and creative life
- Dad remembers personal details across conversations, creating a more personalized experience 