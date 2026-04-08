# ⚡ Z Energy Station Locator — Mission 5 Phase 2

A full-stack web application built for Z Energy that allows users to find nearby fuel stations, compare fuel prices, and get directions — powered by an AI assistant named Zeus.

Built by Team 2: Adrian, Katrina, Eleanor & Zeus 🤖

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)

---

## Overview

This application was developed as part of Mission 5 Phase 2. It provides Z Energy customers with an easy way to locate stations, view real-time fuel prices, compare costs across locations, and interact with an AI-powered chatbot assistant (Zeus) for fuel-related queries.

---

## ✨ Features

- 🗺️ **Find a Station** — Search and filter Z Energy stations by service, station type, and fuel type, displayed on an interactive map and list view
- ⛽ **Gas Buddy** — Compare fuel prices across stations with filtering by address, price and distance
- 📍 **Get Directions** — Navigate to your chosen station and get directions via Google Maps
- 🤖 **Zeus AI Chatbot** — Ask fuel-related questions and get intelligent responses powered by Google Gemini
- 📱 **Responsive Design** — Fully optimised for mobile, tablet and desktop

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router 7 | Client-side routing |
| React Leaflet / Leaflet | Interactive maps |
| Vite 8 | Build tool and dev server |
| CSS Modules | Scoped component styling |
| Axios | HTTP requests |

### Backend
| Technology | Purpose |
|---|---|
| Node.js / Express 5 | REST API server |
| MongoDB / Mongoose | Database and ODM |
| Google Gemini API | AI chatbot responses |
| dotenv | Environment variable management |
| Jest | Unit and integration testing |
| Supertest | API integration testing |
| MongoDB Memory Server | In-memory DB for testing |

---

## 📁 Project Structure

```
mission-5-phase-2/
├── Backend/
│   ├── api.js                  # API route definitions
│   ├── server.js               # Express server entry point
│   ├── db/
│   │   ├── db.js               # MongoDB connection
│   │   └── seedStationInfo.js  # Database seed script
│   ├── services/
│   │   └── genai.js            # Google Gemini AI integration
│   └── tests/
│       ├── integration/        # Integration tests
│       └── unit/               # Unit tests
│
└── frontend/
    └── src/
        ├── common/             # Shared components (Header, Footer, Chatbot, Button...)
        ├── pages/
        │   ├── findAStation/   # Station search and map page
        │   ├── gasBuddy/       # Fuel price comparison page
        │   ├── getDirections/  # Directions page
        │   └── home/           # Landing page
        ├── services/
        │   └── api.js          # Frontend API service layer
        └── router.jsx          # App routing
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local instance or MongoDB Atlas URI)
- A Google Gemini API key

### 1. Clone the repository

```bash
git clone <repository-url>
cd mission-5-phase-2-t2-adrian-katrina-eleanor-zeus
```

### 2. Set up the Backend

```bash
cd Backend
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Seed the database:

```bash
node db/seedStationInfo.js
```

Start the backend server:

```bash
npm run dev
```

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

## 🔐 Environment Variables

### Backend — `Backend/.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Port for the Express server |
| `FRONTEND_URL` | Frontend URL (for CORS) |
| `GEMINI_API_KEY` | Google Gemini API key for the AI chatbot |

### Frontend — `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL for the backend API (e.g. `http://localhost:5000/api`) |

---

## 🧪 Running Tests

Tests are located in `Backend/tests/` and cover unit and integration scenarios.

```bash
cd Backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test coverage includes:
- **Unit tests** — individual functions, error handling, edge cases, performance, and usability
- **Integration tests** — API endpoint behaviour and database interactions

## Button Component Usage

Import the Button component:
import Button from '../../common/Button'

Available variants: 'primary', 'dark', 'outline'
Available sizes: 'small', 'large'
Available icons: 'arrow', 'contact', 'getDirections', 'seeHow'

Examples:
<Button variant='primary' size='large' text='Click me' icon='arrow' />


# Backend Testing Documentation

## 🧪 Running Tests

Tests are located in `Backend/tests/` and cover unit and integration scenarios.
```bash
cd Backend
npm test
```

### Test coverage includes:
- **Integration tests** — API endpoint behaviour and database interactions
- **Unit tests** — individual functions, error handling, edge cases, and data validation

---

## 👥 Authors

Built with ❤️ by Team 2 as part of Mission 5 Phase 2 at Mission Ready HQ.

| Name | Role |
|---|---|
| Adrian | Gas Buddy page, Backend Database setup, Shared Hamburger Menu component |
| Katrina | Find a Station page, Shared Header and Button components |
| Eleanor | Get Directions page, Shared Footer components |
| Zeus 🤖 | Home Page, Shared AI Chatbot component |