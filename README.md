# WELD CRM

A full-stack CRM application for a small welding shop.

## Tech Stack

- Frontend: React with Tailwind CSS
- Backend: Node.js with Express
- Database: MongoDB

## Features

- Authentication (single admin user)
- Dashboard with key metrics
- Customer management
- Job/work management
- Quotation system
- Income & expense tracking
- Reports
- Search & filters
- Mobile-friendly UI

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=mongodb://localhost:27017/weldcrm
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

5. (Optional) Seed sample data:
   ```
   npm run seed
   ```

6. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React app:
   ```
   npm start
   ```

### Usage

- Open http://localhost:3000 in your browser.
- Login with email: admin@weldshop.com, password: admin123
- Navigate through the sidebar to manage customers, jobs, etc.

### Sample Data

The app starts empty. Add customers, jobs, etc., through the UI.

### Notes

- This is a beginner-friendly implementation with clean code and comments.
- For production, secure the authentication and use environment variables properly.
- Mobile-friendly design using Tailwind CSS.