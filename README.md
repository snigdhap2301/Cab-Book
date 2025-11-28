# Cab-Book 🚕

A simple, full-stack cab booking app I built to learn how ride-hailing systems work end-to-end. It uses Spring Boot on the backend (JWT auth) and a lightweight HTML/CSS/JavaScript frontend. 


## What this does

* Let passengers register, request rides (pickup -> drop), see fare estimates and payment history.
* Let drivers register, view/accept requests, start and complete rides, and track earnings.
* Shows real-time ride status changes and calculates distances using Google Distance Matrix.



## Tech stack

* **Backend:** Java 17, Spring Boot 3.1.0, Spring Security (JWT), Spring Data JPA, MySQL
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **APIs:** Google Distance Matrix API for distance/fare estimates. 



## Quick setup (run locally)

1. **Clone**

```bash
git clone https://github.com/snigdhap2301/Cab-Book.git
cd Cab-Book
```

2. **Database**

* Create the MySQL database using the provided `setup-mysql.sql` script:

```bash
mysql -u root -p < setup-mysql.sql
```

* Update credentials in `backend/src/main/resources/application.properties`. 

3. **Google API key**

* Enable Distance Matrix API in Google Cloud, then add `google.maps.api.key=YOUR_KEY` to `application.properties`. 

4. **Start backend**

```bash
cd backend
mvn clean install
mvn spring-boot:run
# backend runs at http://localhost:8080
```

5. **Serve frontend**

```bash
cd ../frontend
# Option A: Python
python -m http.server 3000
# Option B: Node http-server
http-server -p 3000
# frontend available at http://localhost:3000
```

(You can also use VS Code Live Server.) 

## API (important endpoints)

* `POST /api/register` - register (Passenger / Driver)
* `POST /api/login` - login (get JWT)
* `POST /api/ride/calculate-fare` - get fare estimate
* `POST /api/ride/book` - passenger books a ride
* `GET /api/ride/requests` - list available requests (driver)
* `GET /api/ride/my-rides` - passenger rides
* `GET /api/ride/my-driver-rides` - driver rides
* `POST /api/ride/accept/{rideId}`, `/start/{rideId}`, `/complete/{rideId}` - ride lifecycle
* `POST /api/payment` - simulated payment
* `POST /api/rate` - submit rating after ride

These reflect the routes implemented in the project.


## Notes & known limits

* Payments are simulated—no real gateway integrated.
* Frontend stores JWT in localStorage; tighten this before any production use.
* CORS is permissive for development; lock it down for deployment.
* Google Distance Matrix has usage/billing limits — plan accordingly. 

## If you want to try improvements

Ideas I keep in mind: real payment integration, better frontend UX/state management, Swagger docs, stronger validation and error handling, database migrations, and tightened security (CORS, HTTPS, token handling).


