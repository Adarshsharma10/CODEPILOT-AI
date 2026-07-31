# CodePilot AI

CodePilot AI is a full-stack AI-powered chat application that allows users to interact with an AI assistant, manage conversations, and securely access their chat history.

The application includes user authentication, persistent chat storage, AI response streaming, and a responsive React-based interface.

## Live Demo

**Frontend:**  
https://codepilot-ai-lemon.vercel.app

**Backend API:**  
https://codepilot-ai-backend-qtg1.onrender.com

---

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Create and manage AI chats
- Real-time AI response streaming
- Persistent conversation history
- User profile management
- Delete user account and associated data
- MongoDB cloud database integration
- Responsive frontend interface
- Production deployment

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- CORS

### AI

- Google Gemini API

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```text
CODEPILOT-AI/
│
├── BACKEND/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── FRONTEND/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend

Create a `.env` file inside the `BACKEND` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend

Create a `.env` file inside the `FRONTEND` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, configure `VITE_API_URL` with the deployed backend API URL.

> Never commit `.env` files or secret API keys to GitHub.

---

## Run Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd CODEPILOT-AI
```

### 2. Install backend dependencies

```bash
cd BACKEND
npm install
```

Create the backend `.env` file and then start the server:

```bash
npm start
```

The backend runs by default on:

```text
http://localhost:3000
```

### 3. Install frontend dependencies

Open another terminal:

```bash
cd FRONTEND
npm install
npm run dev
```

Open the URL displayed by Vite in your browser.

---

## API Overview

The backend provides API routes for:

```text
/api/users
/api/chats
/api/messages
```

Protected routes require a JWT access token.

---

## How It Works

1. A user registers or logs in.
2. The backend authenticates the user and issues a JWT.
3. The user creates or opens a chat.
4. Messages are sent to the backend.
5. The backend communicates with the Gemini API.
6. AI output is streamed back to the frontend.
7. Conversations are stored in MongoDB.
8. Previous conversations can be retrieved after login.

---

## Security

The application implements:

- Password hashing with bcrypt
- JWT authentication
- Protected backend routes
- Environment-based secret management
- CORS configuration
- User-specific chat authorization

Sensitive credentials are stored using environment variables and are not committed to the repository.

---

## Deployment

The application is deployed using:

- **Vercel** for the React frontend
- **Render** for the Node.js/Express backend
- **MongoDB Atlas** for the cloud database

---

## Future Improvements

Possible future improvements include:

- Markdown rendering for AI responses
- Code syntax highlighting
- Improved mobile responsiveness
- Chat search
- Chat export
- Better error handling and loading states

---

## Author

**Adarsh Sharma**

GitHub: `Adarshsharma10`

---

## License

This project is intended for educational and portfolio purposes.