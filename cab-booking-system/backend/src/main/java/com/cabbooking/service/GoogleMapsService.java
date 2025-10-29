package com.cabbooking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.maps.DistanceMatrixApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DistanceMatrix;
import com.google.maps.model.DistanceMatrixElement;
import com.google.maps.model.DistanceMatrixRow;
import com.google.maps.model.TravelMode;

@Service
public class GoogleMapsService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    public double calculateDistance(String origin, String destination) {
        try {
            GeoApiContext context = new GeoApiContext.Builder()
                    .apiKey(apiKey)
                    .build();

            DistanceMatrix matrix = DistanceMatrixApi.newRequest(context)
                    .origins(origin)
                    .destinations(destination)
                    .mode(TravelMode.DRIVING)
                    .await();

            if (matrix.rows.length > 0) {
                DistanceMatrixRow row = matrix.rows[0];
                if (row.elements.length > 0) {
                    DistanceMatrixElement element = row.elements[0];
                    if (element.distance != null) {
                        // Convert meters to kilometers
                        return element.distance.inMeters / 1000.0;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback: return a default distance if API fails
            return 5.0;
        }
        
        // Default distance if no result
        return 5.0;
    }

    public double calculateFare(double distanceKm) {
        double fare = distanceKm * 11.0; // ₹11 per km
        return Math.round(fare * 100.0) / 100.0; // Round to 2 decimal places
    }
}
