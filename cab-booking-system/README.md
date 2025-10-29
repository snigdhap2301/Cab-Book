# RideSync

A full-stack cab booking application built with Spring Boot (backend) and  HTML/CSS/JavaScript (frontend).

## Features

- **Modern UI Design**: Clean, responsive interface with uniform color scheme and smooth animations
- **User Registration & Authentication**: JWT-based authentication with user type selection (Passenger/Driver)
- **Tabbed Navigation**: Organized dashboards with separate tabs for different functionalities
- **Enhanced Ride Booking**: Beautiful fare calculation display with distance and cost breakdown
- **Payment Modal**: Interactive payment method selection with UPI, Credit/Debit cards, and Cash options
- **Driver Dashboard**: Comprehensive view with ride requests, active rides, and earnings summary
- **Earnings Tracking**: Detailed earnings analytics for drivers with completed ride history
- **Payment History**: Complete payment transaction history for passengers
- **Real-time Status Updates**: Live ride status tracking from request to completion
- **Google Maps Integration**: Accurate distance calculation using Google Distance Matrix API

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.1.0
- Spring Security (JWT Authentication)
- Spring Data JPA
- MySQL Database
- Google Maps Distance Matrix API

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Responsive design

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cab-booking-system
```

### 2. Database Setup
1. Install MySQL Server from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)

2. Create the database using the provided script:
```bash
# Option 1: Using MySQL Command Line
mysql -u root -p < setup-mysql.sql

# Option 2: Using MySQL Workbench
# Open setup-mysql.sql and execute it
```

3. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cab_booking_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 3. Google Maps API Setup
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Distance Matrix API
3. Update the API key in `backend/src/main/resources/application.properties`:
```properties
google.maps.api.key=YOUR_GOOGLE_MAPS_API_KEY
```

### 4. Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies and run the application:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 5. Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Serve the files using a simple HTTP server:
   
   **Option 1: Using Python**
   ```bash
   python -m http.server 3000
   ```
   
   **Option 2: Using Node.js (http-server)**
   ```bash
   npm install -g http-server
   http-server -p 3000
   ```
   
   **Option 3: Using Live Server extension in VS Code**

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Rides
- `POST /api/ride/calculate-fare` - Calculate ride fare
- `POST /api/ride/book` - Book a ride
- `GET /api/ride/requests` - Get available ride requests (for drivers)
- `GET /api/ride/my-rides` - Get user's rides (for passengers)
- `GET /api/ride/my-driver-rides` - Get driver's rides
- `POST /api/ride/accept/{rideId}` - Accept a ride (for drivers)
- `POST /api/ride/start/{rideId}` - Start a ride (for drivers)
- `POST /api/ride/complete/{rideId}` - Complete a ride (for drivers)

### Payment & Rating
- `POST /api/payment` - Process payment
- `POST /api/rate` - Submit ride rating

## Usage

### For Passengers:
1. Register as a Passenger
2. Login to access the dashboard
3. Enter pickup and drop locations
4. Calculate fare and book ride
5. Wait for driver acceptance
6. Track ride status
7. Pay after ride completion
8. Rate the driver

### For Drivers:
1. Register as a Driver (with vehicle and license details)
2. Login to access the dashboard
3. View available ride requests
4. Accept rides
5. Start and complete rides
6. Track earnings

## Database Schema

The application creates the following tables:
- `users` - User information
- `drivers` - Driver-specific information
- `rides` - Ride details and status
- `payments` - Payment information
- `ratings` - Ride ratings

## Configuration

### JWT Configuration
- Secret key is configured in `application.properties`


### CORS Configuration
- Configured to allow requests from any origin (development setup)
- Should be restricted in production

## Security Features

- JWT-based authentication
- Password encryption using BCrypt
- Protected API endpoints
- CORS enabled for frontend-backend communication

## Development Notes

- The Google Distance Matrix API has usage limits and may require billing setup for production use
- Payment processing is simulated - integrate with actual payment gateways for production
- The system includes basic error handling and validation
- Frontend uses localStorage for token management

## Production Considerations

1. **Security**: 
   - Restrict CORS origins
   - Use HTTPS
   - Implement rate limiting
   - Add input validation and sanitization

2. **Database**:
   - Use connection pooling
   - Implement database migrations
   - Add indexes for performance

3. **API**:
   - Implement proper error handling
   - Add API documentation (Swagger)
   - Add logging and monitoring

4. **Frontend**:
   - Implement proper state management
   - Add loading states and better UX
   - Optimize for mobile devices

## Troubleshooting

1. **Backend won't start**: Check MySQL connection and Java version
2. **CORS errors**: Ensure CORS is properly configured in Spring Boot
3. **Google API errors**: Verify API key and billing account
4. **JWT errors**: Check token expiration and secret key configuration
