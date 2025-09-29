# Sol-Mail

Sol-Mail is a self-hosted file and message submission portal. It provides a simple and secure way for users to send files and messages to a central administrator, making it an ideal solution for scenarios like collecting assignments, receiving project files, or any situation where secure, one-way submission is needed.

## Key Features

- **Self-Hosted**: Your data, your server. Full control over your information.
- **Simple Submission Interface**: A clean and intuitive UI for users to submit files and messages.
- **Centralized Reception**: All submissions are sent to a single admin account for easy management.
- **Secure**: Uses modern, token-based authentication for user access.
- **Lightweight**: Built with Bun, ensuring fast performance and a minimal footprint.

---

## 🚀 Getting Started

Follow these steps to get your own Sol-Mail instance up and running in minutes.

### Prerequisites

- You must have **[Bun](https://bun.sh/docs/installation)** installed on your system.
- A `bash`-compatible shell for running utility scripts.

### 1. Clone the Repository

First, get the source code onto your local machine.

```bash
git clone https://github.com/wxn0brP/sol-mail.git
cd sol-mail
```

### 2. Set Up Environment Variables

Copy the example environment file. This file may contain default settings or placeholders for required variables.

```bash
cp .env.example .env
```

### 3. Run the Automated Setup

We've created a single command to handle all the necessary setup steps, from installing dependencies to building the frontend.

```bash
bun run setup:bun
```

This command performs the following actions for you:
- Installs the required backend dependencies.
- Installs the required frontend dependencies.
- Builds the frontend application and places it in the correct directory to be served.

### 4. Start the Server

Now, you can start the application server.

```bash
bun run bun
```

This will launch the backend server, which handles the API and serves the web interface. By default, it should be running at `http://localhost:19851`.

### 5. Create Your First User

To log in, you first need to create a user account.

#### Option A: Use the Helper Script

We've included a simple script for this. **Open a new terminal window** (while the server is still running) and run:

```bash
bash create_user.sh
```

Follow the prompts to set your username and password.

#### Option B: Use cURL

Alternatively, you can send an HTTP POST request directly to the registration endpoint.

```bash
curl -X POST \
  http://localhost:19851/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name": "your_username", "pass": "your_password"}'
```

After creating the user with either method, you can use these credentials to log into the web interface.

---

## For Developers

### Technology Stack

- **Backend**: TypeScript, Bun, `@wxn0brp/falcon-frame` (Web Framework), `@wxn0brp/db` (DB), `jose` (JWT)
- **Frontend**: TypeScript, SCSS, esbuild, `@wxn0brp/flanker-ui` (UI)

### Contributing

You are welcome to contribute to the project.

### License

This project is released under the [MIT License](LICENSE).