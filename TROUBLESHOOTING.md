# NoteMind API Connection Troubleshooting

This document provides solutions for common connection issues between the NoteMind frontend and backend API.

## Current Network Configuration

- Backend API server: Running on port 5000 (http://localhost:5000)
- Frontend development server: Running on port 5173, 5174, or 5175 (http://localhost:517X)

## Enhanced Error Handling

The application now includes:

1. **Multiple connection attempts** - The frontend tries both localhost and 127.0.0.1
2. **Detailed error logging** - Console logs provide insight into connection issues
3. **Fallback summarization** - When the backend is unreachable, a local summarization runs

## Common Issues and Solutions

### "Failed to generate summary" Error

This error occurs when the frontend cannot connect to the backend API. Possible solutions:

1. **Check if the backend server is running**
   ```powershell
   # Navigate to the backend directory
   cd backend
   # Start the backend server
   npm start
   ```

2. **Verify the API key**
   - Ensure your OpenAI API key is correctly set in the `.env` file
   - Format: `OPENAI_API_KEY=sk-...` (no quotes or additional text)

3. **Test the API connection directly**
   ```powershell
   Invoke-RestMethod -Uri 'http://localhost:5000/api' -Method 'GET'
   ```

4. **Check for port conflicts**
   ```powershell
   netstat -ano | findstr :5000
   ```

5. **Disable firewall or add an exception**
   - Windows Defender may block the connection between frontend and backend

## Advanced Configuration

### Using the Local Summarizer

If you prefer to use the local summarizer instead of the OpenAI API:

1. Open the application settings
2. Enable the "Use fallback summarization" option

### Changing API Endpoints

If you need to modify the API endpoints, edit:

1. Frontend: `frontend/src/services/aiService.js`
2. Backend: `backend/server.js`

## Support

If you continue experiencing connection issues, please provide:

1. The exact error message
2. Console logs from both frontend and backend
3. Your network configuration (firewall settings, VPN usage, etc.)
