# Sol Mail - Project Documentation

## Philosophy

Sol Mail is a self-hosted file and message submission portal designed with the following core philosophies:

1. **Self-Hosting First**: The project prioritizes user control and privacy by allowing users to host their own instances. This ensures that data remains under the user's control without relying on third-party services.

2. **Simplicity**: The interface and usage are intentionally kept simple and intuitive, making it easy for users to submit files and messages without complexity.

3. **Security**: Implements modern token-based authentication (JWT) to ensure secure access and transmission of files and messages.

4. **Lightweight Architecture**: Built using Bun for fast performance and minimal resource footprint, making it suitable for deployment on resource-constrained systems.

5. **Centralized Management**: All submissions are collected in a central location for easy management by administrators, ideal for scenarios like collecting assignments, project files, etc.

## Base Concepts and Architecture

### Overall Architecture
- **Backend**: Built with TypeScript and Bun using the `@wxn0brp/falcon-frame` web framework
- **Frontend**: TypeScript and SCSS, with assets built using esbuild
- **Database**: Uses `@wxn0brp/db` (Valthera database) for data persistence
- **Authentication**: JWT-based authentication system with token management

### Core Components

1. **File Upload System**:
   - Accepts multiple files via multipart form data using Busboy for parsing
   - Enforces file size limits (configurable via `MAX_FILE_SIZE` env var)
   - Limits number of files per upload (configurable via `MAX_FILES_COUNT` env var)
   - Sanitizes file and directory names to prevent path traversal attacks

2. **Authentication System**:
   - User registration with password hashing using SHA-256
   - JWT token-based authentication with configurable lifetime
   - Token management with automatic cleanup of expired tokens
   - Session management with single session per user

3. **User Roles**:
   - Regular Users: Can submit files and messages
   - Admin Users: Have additional privileges to manage users and view all submissions

4. **Data Organization**:
   - Files are stored in a hierarchical structure: `data/files/{username}/{mailname}/{filename}`
   - Public submissions are stored under the "public" user directory
   - Separate database instances for user management and mail data

5. **API Endpoints**:
   - `/api/files`: For file uploads and retrieval
   - `/api/admin`: Admin-specific operations
   - `/auth`: Authentication endpoints (login, register, refresh, logout)

### Security Features
- File name sanitization to prevent path traversal
- File size and count limits
- JWT-based authentication with token expiration
- Session management with automatic cleanup
- Input validation and sanitization

## Data Structures

The application defines several key data structures that form the backbone of the system:

### User Structure
```typescript
interface User {
    _id: string;       // Unique identifier for the user
    name: string;      // Username
    pass: string;      // SHA-256 hashed password
    admin?: true;      // Optional flag indicating admin privileges
}
```

### Token Structure
```typescript
interface Token {
    _id: string;       // JWT token string
    name: string;      // Associated username
    exp: number;       // Expiration timestamp (milliseconds since epoch)
}
```

### Mail Structure
When a user submits files and messages through the portal, they are stored with the following structure:
```typescript
// Internal representation (after processing):
{
    name: string;      // Name of the mail/submission
    files: string[];   // Array of uploaded filenames
    txt?: string;      // Optional text content associated with the submission
}
```

### Database Structure
The application uses two separate databases:
1. **Master Database** (`data/master`):
   - Collections: "users", "token"
   - Stores user accounts and active session tokens

2. **Mail Database** (`data/mail`):
   - Each user gets their own collection named after their sanitized username
   - Stores mail submissions with the structure described above

### Configuration
Environment variables that influence the data and operations:
- `TOKEN_LIFETIME`: How long authentication tokens remain valid (default: "1h")
- `JWT_SECRET`: Secret key for signing JWT tokens
- `MAX_FILE_SIZE`: Maximum size per file in MB (default: 20)
- `MAX_FILES_COUNT`: Maximum number of files per upload (default: 10)

### File Storage Structure
Files are stored in the filesystem with the following hierarchy:
```
data/
 └── files/
     ├── {sanitized_username}/
     │   └── {sanitized_mailname}/
     │       ├── file1.ext
     │       ├── file2.ext
     │       └── ...
     └── public/
         └── {mail_for_public_submission}/
             └── ...
```

All user-provided names (both usernames and mail names) are sanitized by replacing dangerous characters (`/`, `?`, `%`, `*`, `:`, `"`, `|`, `<`, `>`, `^`) with underscores to prevent path traversal vulnerabilities.

The application implements a clean separation between user data storage and metadata, with file contents stored on the filesystem while metadata (filenames, associated text, etc.) is stored in the database.