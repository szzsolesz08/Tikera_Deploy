# Tikera Cinema Application

A web application for managing and browsing movie screenings at a cinema.

## Overview

Tikera is a React-based front-end application that allows users to browse movies by week and day, view movie details, and manage screenings. The application interacts with a backend API to fetch and manage movie data, screenings, and user authentication.

## Features

- **User Authentication**
  - Login/Register functionality
  - Token-based authentication
  - Protected routes for authenticated users

- **Movie Browsing**
  - Browse movies by week and day
  - Filter movies by day of the week
  - View detailed movie information
  - See movie screenings for selected days

- **Admin Functionality**
  - Create and manage movies
  - Schedule and update screenings
  - Manage cinema rooms

- **Multi-language Support**
  - Hungarian day names with English API communication

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend API server (Laravel-based)

### Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Tikera_Deploy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://127.0.0.1:8000/
   ```
   Replace the API URL with your backend server URL.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Movie Browsing

- Use the week selector to navigate between different weeks (1-52)
- Select a day of the week to filter movies screening on that day
- Click on a movie card to view detailed information and available screenings

### Authentication

- Register a new account or login with existing credentials
- Authentication token is stored in local storage for persistent sessions
- Protected routes require authentication

## Project Structure

- `src/`
  - `components/` - Reusable UI components
  - `services/` - API service functions
  - `Movies.jsx` - Main movie browsing component
  - `MovieDetails.jsx` - Detailed view for selected movies

## API Integration

The application communicates with a RESTful API using the following endpoints:

- `api/login` - User authentication
- `api/register` - User registration
- `api/logout` - User logout
- `api/movies` - Get all movies
- `api/movies/{id}` - Get specific movie details
- `api/movies/week?week_number={week}` - Get movies for specific week
- `api/screenings` - Get all screenings
- `api/screenings/{id}` - Get specific screening details

## Technologies Used

- React.js - Frontend framework
- Vite - Build tool and development server
- Material-UI - UI component library
- Fetch API - HTTP requests
- Local Storage - Client-side data persistence

## License

[License information]

## Acknowledgements

[Any acknowledgements or credits]