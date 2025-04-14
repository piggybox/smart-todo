# Smart Todo App

A fullstack todo application inspired by Microsoft Todo, built with React, FastAPI, and Supabase.

## Features

- User authentication via Supabase
- Multiple todo lists
- Folder organization for todo lists
- Modern and responsive UI

## Tech Stack

### Frontend
- React
- React Router
- Supabase Client
- TailwindCSS for styling

### Backend
- FastAPI
- Supabase for data storage and auth
- Python 3.9+

## Project Structure

```
./
├── frontend/         # React frontend application
└── backend/          # FastAPI backend application
```

## Development

1. Set up and run the backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

2. Set up and run the frontend:
```bash
cd frontend
npm install
npm run dev
```