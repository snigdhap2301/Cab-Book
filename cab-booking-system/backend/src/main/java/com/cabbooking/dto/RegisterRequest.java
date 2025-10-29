package com.cabbooking.dto;

import com.cabbooking.entity.User;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private User.UserType userType;
    private String vehicleNumber;
    private String licenseNumber;
    
    // Constructors
    public RegisterRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public User.UserType getUserType() { return userType; }
    public void setUserType(User.UserType userType) { this.userType = userType; }
    
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
}
