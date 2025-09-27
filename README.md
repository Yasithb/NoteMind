# NoteMind

NoteMind is an AI-powered note-taking application that helps you organize and summarize your thoughts.

## Features

- User authentication (sign up, login, password reset)
- Personal note management
- AI-powered note summarization using Google's Gemini API
- Tag-based organization
- Full-text search
- Responsive design

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Authentication with JWT
- Google Gemini AI API for summarization

### Frontend
- React with Vite
- React Router for navigation
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/notemind.git
   cd notemind
   ```

2. Backend setup
   ```
   cd backend
   npm install
   cp .env.example .env   # Create and configure your .env file
   npm run dev
   ```

3. Frontend setup
   ```
   cd ../frontend
   npm install
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password

### Notes
- `GET /api/notes` - Get all notes for current user
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/notes/:id/summarize` - Request note summarization

### AI Features
- `GET /api/test-connection` - Test AI API connection
- `POST /api/summarize` - Summarize text using AI

## Environment Variables

See the `.env.example` file in the backend directory for required environment variables.

## License

This project is licensed under the MIT License.
