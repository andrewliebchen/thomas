# Database Implementation

## Overview

The Dad app uses SQLite for local storage, implemented through the `expo-sqlite` package. The database service follows a singleton pattern with proper initialization, error handling, and recovery mechanisms to ensure reliability and prevent crashes.

## Architecture

The database implementation consists of several key components:

1. **DatabaseService**: A singleton class that manages the SQLite database connection and operations
2. **DatabaseInitializer**: A React component that ensures the database is properly initialized before the app renders
3. **Helper Functions**: Utility functions for common database operations

## Database Schema

The database consists of four main tables:

1. **threads**: Stores conversation threads
   ```sql
   CREATE TABLE threads (
     id TEXT PRIMARY KEY NOT NULL,
     title TEXT NOT NULL,
     createdAt INTEGER NOT NULL,
     lastMessageAt INTEGER NOT NULL
   );
   ```

2. **messages**: Stores individual messages within threads
   ```sql
   CREATE TABLE messages (
     id TEXT PRIMARY KEY NOT NULL,
     text TEXT NOT NULL,
     isUser INTEGER NOT NULL,
     timestamp INTEGER NOT NULL,
     threadId TEXT NOT NULL,
     isMemoryContext INTEGER DEFAULT 0,
     FOREIGN KEY (threadId) REFERENCES threads (id)
   );
   ```

3. **memory**: Stores the app's memory context
   ```sql
   CREATE TABLE memory (
     id TEXT PRIMARY KEY NOT NULL,
     content TEXT NOT NULL,
     lastUpdated INTEGER NOT NULL
   );
   ```

4. **memory_buffer**: Stores messages waiting to be processed for memory updates
   ```sql
   CREATE TABLE memory_buffer (
     id TEXT PRIMARY KEY NOT NULL,
     text TEXT NOT NULL,
     isUser INTEGER NOT NULL,
     timestamp INTEGER NOT NULL,
     threadId TEXT NOT NULL,
     FOREIGN KEY (threadId) REFERENCES threads (id)
   );
   ```

## Initialization Process

The database initialization follows a robust process to prevent crashes:

1. **Singleton Instance**: The `DatabaseService` class uses a singleton pattern to ensure only one database connection exists.

2. **Lazy Initialization**: The database is initialized only when needed, using a promise-based approach to prevent race conditions.

3. **AsyncStorage Integration**: The initialization state is tracked in AsyncStorage to handle app restarts gracefully.

4. **Error Recovery**: The service includes mechanisms to recover from common database errors.

5. **Initialization Component**: The `DatabaseInitializer` React component ensures the database is ready before rendering the app.

### Initialization Flow

1. The `DatabaseInitializer` component is rendered at the root of the app
2. It calls `getDatabase()` which returns a promise that resolves when the database is initialized
3. The `DatabaseService` singleton is created if it doesn't exist
4. The `initialize()` method is called, which:
   - Checks if already initialized
   - Tracks initialization attempts to prevent infinite loops
   - Verifies AsyncStorage availability
   - Opens the SQLite database
   - Creates the database schema if needed
   - Updates the initialization state in AsyncStorage
5. The app only renders its children after successful initialization

## Error Handling

The database implementation includes comprehensive error handling:

1. **Initialization Retries**: The service tracks initialization attempts and limits retries to prevent infinite loops.

2. **AsyncStorage Fallbacks**: If AsyncStorage operations fail, the service continues with database operations.

3. **Critical Error Recovery**: For critical errors like "no such table" or "database is locked", the service attempts recovery by:
   - Clearing AsyncStorage flags
   - Closing and reopening the database connection
   - Reinitializing the database schema

4. **User Feedback**: The `DatabaseInitializer` component shows appropriate loading and error states to the user.

## Database Access Pattern

To ensure consistent database access throughout the app:

1. **Always use `getDatabase()`**: Instead of accessing the database singleton directly, always use the `getDatabase()` function which ensures proper initialization.

2. **Await Database Operations**: All database operations are asynchronous and should be properly awaited.

3. **Error Handling**: Wrap database operations in try/catch blocks to handle errors gracefully.

## Example Usage

```typescript
// Correct way to access the database
import { getDatabase } from '@/src/services/database';

async function someFunction() {
  try {
    const db = await getDatabase();
    const threads = await db.getAllThreads();
    // Use the threads data
  } catch (error) {
    console.error('Error accessing database:', error);
    // Handle the error appropriately
  }
}
```

## Troubleshooting

If you encounter database-related issues:

1. **Check Initialization Logs**: Look for "Database initialized successfully" or error messages in the console.

2. **Reset the Database**: Use the `resetDatabase()` method to clear all data and reinitialize the database.

3. **Check AsyncStorage**: Verify that AsyncStorage is working correctly on the device.

4. **Device-Specific Issues**: Some devices may have issues with SQLite. Test on multiple devices if possible.

## Future Improvements

Potential improvements for the database implementation:

1. **Migration System**: Add a version-based migration system for schema changes.

2. **Offline Sync**: Implement a mechanism to sync data when the device is back online.

3. **Performance Optimization**: Add indexes for frequently queried columns.

4. **Data Encryption**: Implement encryption for sensitive data stored in the database. 