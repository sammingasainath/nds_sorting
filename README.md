# NDS Sorting Application

A web application for sorting and comparing colleges based on various parameters.

## Project Structure

The project consists of two main parts:

- **Frontend**: A React application built with TypeScript, Vite, and Tailwind CSS
- **Backend**: A FastAPI server that provides college data and search functionality

## Features

- Recursive sorting of colleges based on multiple parameters
- Comparison of colleges
- Sorting history tracking
- Search functionality for college information

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Installation

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables (optional for search functionality):
   ```
   GOOGLE_SEARCH_API_KEY=your_google_api_key
   GOOGLE_SEARCH_CX=your_google_cx_id
   ```

4. Start the backend server:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Coolify Deployment

This application is configured for deployment on Coolify. Follow these steps:

1. Connect your Coolify instance to this GitHub repository
2. Create two services:
   - Backend service (Python/FastAPI)
   - Frontend service (Node.js/Vite)
3. Configure the environment variables for both services
4. Deploy the services

## License

This project is licensed under the MIT License - see the LICENSE file for details. 