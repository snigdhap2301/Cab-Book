

-- Create database
CREATE DATABASE IF NOT EXISTS cab_booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE cab_booking_db;

-- Note: Spring Boot will automatically create tables when you run the application
-- This is just to ensure the database exists

-- Verify database creation
SHOW DATABASES LIKE 'cab_booking_db';
