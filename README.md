# Z Energy App

A full-stack web application for Z Energy customers to find nearby fuel stations, compare fuel prices across locations, and interact with an AI-powered assistant. Built collaboratively following UX design specifications with high-fidelity mockups and a comprehensive UI kit. Features robust backend testing suite ensuring reliability and code quality.

![Team Project](https://img.shields.io/badge/Type-Team%20Project-orange)
![UX Driven](https://img.shields.io/badge/Design-UX%20Driven-purple)

---

## Project Overview

This application provides Z Energy customers with a comprehensive platform to locate stations, compare fuel prices with distance calculations, and receive AI-powered assistance for fuel-related queries. The project was developed in close collaboration with a UX team, following detailed design specifications, high-fidelity mockups, and a structured UI kit to ensure consistent branding and user experience.

**Key Achievement:** Integrated real-time price comparison with geolocation-based distance calculations, enabling users to find the most cost-effective fuel options based on their location. Implemented comprehensive testing suite to ensure reliability and maintainability.

---

## My Contributions

### Gas Buddy - Price Comparison Page
Designed and implemented the complete fuel price comparison feature from concept to deployment:

**Frontend Development:**
- Built responsive Gas Buddy page with mobile-first design approach
- Created ControlBar component for fuel type selection and view toggling
- Developed PriceDistanceFilter with dual-slider controls for price and distance filtering
- Implemented ResultsTable with sortable columns (station name, address, price, distance)
- Built ResultsList with card-based mobile view for optimal small-screen experience
- Integrated MapView with Leaflet for visual station location display
- Designed GasBuddyHero section with clear call-to-action messaging

**Distance Calculation Algorithm:**
- Implemented Haversine formula for accurate distance calculations between user location and stations
- Calculated distances in kilometers with 2 decimal precision
- Integrated geolocation API for automatic user positioning
- Built fallback mechanisms for users who deny location access

**Filtering & Sorting Logic:**
- Created dual-range filtering system (price per litre + distance in km)
- Implemented real-time filtering with instant UI updates
- Built multi-column sorting functionality (ascending/descending)
- Optimized performance for large datasets (200+ stations)

**Responsive Design:**
- Desktop: Full-width table with all columns visible
- Tablet: Adjusted column widths with horizontal scroll
- Mobile: Card-based layout with essential information prioritized

### Backend API Routes & Database Integration
Architected and implemented backend infrastructure for station and fuel price data:

**API Endpoints:**
- `GET /api/stations` - Retrieve all stations with attached fuel prices
- `GET /api/stations/:id` - Fetch individual station details with prices
- `GET /api/stations/cheapest/:fuelType` - Find cheapest price for specific fuel type
- Implemented proper error handling with appropriate HTTP status codes
- Used MongoDB aggregation to join stations with fuel prices efficiently

**Database Architecture:**
- Designed MongoDB schemas for Stations and FuelPrices collections
- Implemented ObjectId references for relational data structure
- Created indexes on frequently queried fields for performance optimization
- Used Mongoose ODM for schema validation and data modeling

**Data Seeding:**
- Built comprehensive seed script (`seedStationInfo.js`) with 200+ Z Energy stations across New Zealand
- Implemented region-based price adjustments (Auckland, Wellington, Christchurch, Rural, etc.)
- Created realistic price ranges for Regular Unleaded (91), Premium (95/98), and Diesel
- Developed upsert logic to prevent duplicate entries during re-seeding
- Automated fuel price generation with regional variance algorithms

**MongoDB Setup:**
- Configured MongoDB connection with environment variable management
- Set up local development database and production-ready connection strings
- Implemented connection lifecycle management (connect/disconnect)
- Created database backup and restore procedures for team collaboration

### Testing & Quality Assurance
Implemented comprehensive testing strategy for backend reliability:

**Test Suite Development:**
- Wrote unit tests for utility functions and data validation
- Created integration tests for API endpoints with database interactions
- Implemented test fixtures and mock data for consistent testing
- Used MongoDB Memory Server for isolated test environments
- Configured Jest with proper ES6 module support

**Test Coverage:**
- API endpoint validation (GET /stations, GET /stations/:id, GET /cheapest/:fuelType)
- Database query operations and error handling
- Edge cases and boundary conditions
- Error response formatting and HTTP status codes
- Data seeding and upsert logic verification

**Testing Tools:**
- Jest for test framework and assertions
- Supertest for HTTP endpoint testing
- MongoDB Memory Server for in-memory database testing
- Test coverage reporting for code quality metrics

### Shared Hamburger Menu Component
Developed mobile navigation component used across all pages:

**Features:**
- Slide-in animation from right side with smooth transitions
- Overlay backdrop with click-to-close functionality
- Responsive breakpoints (hidden on desktop, visible on mobile/tablet)
- Navigation links to all major pages (Home, Find a Station, Gas Buddy, Get Directions)
- Consistent styling with Z Energy brand colors
- Accessible keyboard navigation and ARIA labels

**Technical Implementation:**
- Built with React hooks (useState for open/close state)
- CSS Modules for scoped styling and no conflicts
- Portal rendering for proper z-index layering
- Touch-friendly tap targets (minimum 44x44px)

### UX Collaboration & Design Implementation
Worked closely with UX team throughout development lifecycle:

**Design Process:**
- Participated in weekly design review meetings
- Received high-fidelity mockups in Figma with detailed specifications
- Followed comprehensive UI kit with:
  - Color palette (Z Energy brand colors: #00A3E0, #FFFFFF, #1A1A1A)
  - Typography system (font families, sizes, weights, line heights)
  - Spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
  - Component library (buttons, cards, inputs, modals)
  - Iconography guidelines
  - Responsive breakpoints (mobile: 320px, tablet: 768px, desktop: 1024px+)

**Implementation Fidelity:**
- Pixel-perfect implementation of Gas Buddy page design
- Maintained consistent spacing and typography across all components
- Ensured brand color usage matched specifications
- Implemented responsive behavior as defined in design flow
- Conducted design QA sessions with UX team for approval

**Design Feedback Loop:**
- Provided technical feasibility feedback during design phase
- Suggested UX improvements based on performance considerations
- Collaborated on mobile-first design decisions
- Iterated on component designs based on user testing feedback

---

## Team Collaboration

| Team Member | Primary Responsibilities |
|-------------|-------------------------|
| **Adrian** | Gas Buddy page, Backend routes & database, Hamburger menu, MongoDB seeding, Backend testing suite |
| Katrina | Find a Station page, Header component, Button component |
| Eleanor | Get Directions page, Footer components |
| Zeus    | Home page, AI Chatbot component |

---

## Technologies Used

### Frontend
- **React 19** - UI library with hooks
- **React Router 7** - Client-side routing
- **React Leaflet / Leaflet** - Interactive maps for station visualization
- **Vite 8** - Build tool and dev server
- **CSS Modules** - Scoped component styling
- **Axios** - HTTP client for API requests

### Backend
- **Node.js & Express 5** - REST API server
- **MongoDB & Mongoose** - NoSQL database and ODM
- **Google Gemini API** - AI chatbot responses
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

### Testing & Development
- **Jest** - Unit and integration testing
- **Supertest** - API endpoint testing
- **MongoDB Memory Server** - In-memory DB for isolated tests
- **nodemon** - Auto-restart on file changes

### Design & UX
- **Figma** - High-fidelity mockups and UI kit
- **Design System** - Comprehensive component library
- **Responsive Design** - Mobile-first approach

---

## Project Structure

```
Z-Energy-Station-Locator/
├── Backend/
│   ├── db/
│   │   ├── db.js                   # MongoDB connection
│   │   └── seedStationInfo.js      # Database seed script (200+ stations)
│   ├── services/
│   │   └── genai.js                # Google Gemini AI integration
│   ├── tests/
│   │   ├── integration/            # API + DB integration tests
│   │   └── unit/                   # Unit tests
│   ├── api.js                      # API route definitions
│   ├── server.js                   # Express server entry point
│   └── package.json
│
└── frontend/
    └── src/
        ├── common/                 # Shared components
        │   ├── HamburgerMenu.jsx   # Mobile navigation (Adrian)
        │   ├── Header.jsx          # App header (Katrina)
        │   ├── Button.jsx          # Reusable button (Katrina)
        │   ├── AIChatbot.jsx       # AI assistant (Zeus)
        │   └── MainFooter.jsx      # Footer (Eleanor)
        ├── pages/
        │   ├── gasBuddy/           # Price comparison page (Adrian)
        │   │   ├── components/
        │   │   │   ├── ControlBar.jsx
        │   │   │   ├── PriceDistanceFilter.jsx
        │   │   │   ├── ResultsTable.jsx
        │   │   │   ├── ResultsList.jsx
        │   │   │   ├── ResultCard.jsx
        │   │   │   └── MapView.jsx
        │   │   └── GasBuddy.jsx
        │   ├── findAStation/       # Station search (Katrina)
        │   ├── getDirections/      # Directions (Eleanor)
        │   └── home/               # Landing page (Zeus)
        ├── services/
        │   └── api.js              # Frontend API service layer
        └── router.jsx              # App routing
```

---

## Key Features

### Find a Station
Search and filter Z Energy stations by service, station type, and fuel type with interactive map and list views.

### Gas Buddy (My Primary Feature)
- **Price Comparison** - Compare fuel prices across all stations
- **Distance Calculation** - Haversine formula for accurate km measurements
- **Dual Filtering** - Filter by price range and distance simultaneously
- **Sortable Table** - Click column headers to sort (name, address, price, distance)
- **Map Integration** - Visual representation of station locations
- **Responsive Views** - Table for desktop, cards for mobile

###  Get Directions
Navigate to chosen station with Google Maps integration and turn-by-turn directions.

### Zeus AI Chatbot
Ask fuel-related questions and receive intelligent responses powered by Google Gemini.

### Responsive Design
Fully optimized for mobile, tablet, and desktop with breakpoint-specific layouts.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or MongoDB Atlas URI)
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Z-Energy-app-Price-Comparison-page-calculating-distance-with-price
```

### 2. Backend Setup
```bash
cd Backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add:
# MONGO_URI=your_mongodb_connection_string
# PORT=5000
# FRONTEND_URL=http://localhost:5173
# GEMINI_API_KEY=your_gemini_api_key
```

**Seed the database:**
```bash
node db/seedStationInfo.js
```

**Start the backend server:**
```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## API Endpoints

### Stations

#### GET /api/stations
Retrieve all stations with fuel prices attached.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Z Energy Quay Street",
    "location": {
      "address": "169 Quay Street, Auckland CBD 1010",
      "city": "Auckland",
      "region": "Auckland",
      "coordinates": { "lat": -36.8436, "lng": 174.7705 }
    },
    "amenities": ["Shop", "Toilets", "Air Stop"],
    "fuelPrices": {
      "Regular Unleaded (91)": 3.15,
      "Premium Unleaded (95/98)": 3.35,
      "Diesel": 2.85
    }
  }
]
```

#### GET /api/stations/:id
Fetch individual station details with all fuel prices.

#### GET /api/stations/cheapest/:fuelType
Find the station with the cheapest price for a specific fuel type.

**Example:**
```
GET /api/stations/cheapest/Diesel
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Z Energy Huntly",
  "location": { ... },
  "fuelPrices": {
    "Diesel": 2.70
  }
}
```

---

## Running Tests

```bash
cd Backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- ✅ Unit tests - Individual functions, error handling, edge cases
- ✅ Integration tests - API endpoint behavior and database interactions

---

## Skills Demonstrated

### Technical Skills
✅ **Full-Stack Development** - React frontend + Express backend + MongoDB  
✅ **Database Design** - MongoDB schema design, indexing, relationships  
✅ **RESTful API Architecture** - Proper HTTP methods, status codes, error handling  
✅ **Testing & Quality Assurance** - Jest, Supertest, integration tests, unit tests  
✅ **Geolocation & Algorithms** - Haversine formula, distance calculations  
✅ **Data Seeding** - Automated database population with realistic data  
✅ **Responsive Design** - Mobile-first approach, breakpoint management  
✅ **Component Architecture** - Reusable, modular React components  
✅ **State Management** - React hooks, prop drilling, context  
✅ **Performance Optimization** - Efficient filtering, sorting, rendering  

### Collaboration & Process
✅ **UX Collaboration** - Worked with design team, implemented high-fidelity mockups  
✅ **Design System Implementation** - Followed UI kit specifications precisely  
✅ **Team Coordination** - Shared components, consistent code style  
✅ **Version Control** - Git workflow, branching, pull requests  
✅ **Agile Methodology** - Sprint planning, daily standups, retrospectives  

---

## Environment Variables

### Backend — `Backend/.env`
```env
MONGO_URI=mongodb://localhost:27017/z_energy_db
PORT=5000
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend — `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Future Enhancements

- **Docker Containerization** - Containerize frontend, backend, and MongoDB for consistent deployment across environments
- **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions or GitLab CI
- **Kubernetes Orchestration** - Scale application with container orchestration for high availability
- **User Accounts** - Save favorite stations and price alerts
- **Price History** - Track fuel price trends over time
- **Route Optimization** - Calculate most cost-effective route with multiple stops
- **Push Notifications** - Alert users when prices drop at nearby stations
- **Loyalty Integration** - Z Card rewards and discounts
- **Real-Time Updates** - WebSocket integration for live price changes
- **Advanced Filtering** - Filter by amenities (car wash, EV charging, etc.)

---

## Design Credits

This project was developed in collaboration with a dedicated UX team who provided:
- High-fidelity mockups in Figma
- Comprehensive UI kit with design tokens
- Responsive design specifications
- User flow diagrams
- Accessibility guidelines

---

## License

This project was developed as part of the Mission Ready Full Stack Diploma program.

---

## Developer

**Adrian**  
Full Stack Developer specializing in React, Node.js, MongoDB, and UX-driven development.

Portfolio project demonstrating collaborative development, UX implementation, database architecture, and geolocation-based features.
