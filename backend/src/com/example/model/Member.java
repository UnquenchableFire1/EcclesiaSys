package com.example.model;

import com.example.views.Views;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "members")
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonView(Views.Public.class)
    private int id;
    
    @Column(name = "first_name", nullable = false, length = 50)
    @JsonView(Views.Public.class)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 50)
    @JsonView(Views.Public.class)
    private String lastName;
    
    @Column(name = "phone_number", length = 20)
    @JsonView(Views.Member.class)
    private String phoneNumber;
    
    @Column(name = "email", nullable = false, length = 100, unique = true)
    @JsonView(Views.Member.class)
    private String email;
    
    @Column(name = "password", nullable = false, length = 255)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Column(name = "profile_picture_url", length = 500)
    @JsonView(Views.Public.class)
    private String profilePictureUrl;
    
    @Column(name = "is_profile_public", nullable = false)
    @JsonView(Views.Member.class)
    private Boolean isProfilePublic = true;
    
    @Column(name = "gender", length = 20)
    @JsonView(Views.Member.class)
    private String gender;
    
    @Column(name = "bio", columnDefinition = "TEXT")
    @JsonView(Views.Public.class)
    private String bio;
    
    @Column(name = "status", nullable = false, length = 10)
    @JsonView(Views.Admin.class)
    private String status;
    
    @CreationTimestamp
    @Column(name = "joined_date", nullable = false, updatable = false)
    @JsonView(Views.Public.class)
    private LocalDateTime joinedDate;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @JsonView(Views.Admin.class)
    private LocalDateTime updatedAt;

    public Member() {}

    public Member(String firstName, String lastName, String phoneNumber, String email, String password, String gender) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.password = password;
        this.gender = gender;
        this.status = "active";
        this.joinedDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Legacy constructor for backward compatibility
    public Member(String name, String email, String password) {
        String[] parts = name.split(" ", 2);
        this.firstName = parts[0];
        this.lastName = parts.length > 1 ? parts[1] : "";
        this.phoneNumber = "";
        this.email = email;
        this.password = password;
        this.status = "active";
        this.joinedDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : ""); }
    public void setName(String name) { 
        if (name != null) {
            String[] parts = name.split(" ", 2);
            this.firstName = parts[0];
            this.lastName = parts.length > 1 ? parts[1] : "";
        }
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDateTime joinedDate) { this.joinedDate = joinedDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public Boolean getIsProfilePublic() { return isProfilePublic != null ? isProfilePublic : true; }
    public void setIsProfilePublic(Boolean isProfilePublic) { this.isProfilePublic = isProfilePublic; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
