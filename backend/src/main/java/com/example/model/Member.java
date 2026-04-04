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
    
    @Column(name = "branch_id")
    @JsonView(Views.Admin.class)
    private Integer branchId;

    @Column(name = "is_verified", nullable = false)
    @JsonView(Views.Admin.class)
    private Boolean isVerified = false;

    // Personal Details
    @Column(name = "title", length = 20)
    @JsonView(Views.Member.class)
    private String title;

    @Column(name = "date_of_birth")
    @JsonView(Views.Member.class)
    private String dateOfBirth;

    @Column(name = "place_of_birth", length = 100)
    @JsonView(Views.Member.class)
    private String placeOfBirth;

    @Column(name = "membership_type", length = 30)
    @JsonView(Views.Member.class)
    private String membershipType;

    @Column(name = "marital_status", length = 20)
    @JsonView(Views.Member.class)
    private String maritalStatus;

    @Column(name = "address_line_1", length = 255)
    @JsonView(Views.Member.class)
    private String addressLine1;

    @Column(name = "gps_address", length = 100)
    @JsonView(Views.Member.class)
    private String gpsAddress;

    @Column(name = "hometown", length = 100)
    @JsonView(Views.Member.class)
    private String hometown;

    @Column(name = "street_name", length = 100)
    @JsonView(Views.Member.class)
    private String streetName;

    @Column(name = "city", length = 100)
    @JsonView(Views.Member.class)
    private String city;

    @Column(name = "postal_code", length = 20)
    @JsonView(Views.Member.class)
    private String postalCode;

    @Column(name = "nationality", length = 50)
    @JsonView(Views.Member.class)
    private String nationality;

    @Column(name = "country_of_birth", length = 50)
    @JsonView(Views.Member.class)
    private String countryOfBirth;

    @Column(name = "family_member_name", length = 100)
    @JsonView(Views.Member.class)
    private String familyMemberName;

    @Column(name = "relationship", length = 50)
    @JsonView(Views.Member.class)
    private String relationship;

    @Column(name = "residential_address", length = 255)
    @JsonView(Views.Member.class)
    private String residentialAddress;

    @Column(name = "locality", length = 100)
    @JsonView(Views.Member.class)
    private String locality;

    @Column(name = "landmark", length = 100)
    @JsonView(Views.Member.class)
    private String landmark;

    // Church Details
    @Column(name = "holy_ghost_baptism", length = 10)
    @JsonView(Views.Member.class)
    private String holyGhostBaptism;

    @Column(name = "date_of_holy_spirit_baptism")
    @JsonView(Views.Member.class)
    private String dateOfHolySpiritBaptism;

    @Column(name = "water_baptism", length = 10)
    @JsonView(Views.Member.class)
    private String waterBaptism;

    @Column(name = "date_of_water_baptism")
    @JsonView(Views.Member.class)
    private String dateOfWaterBaptism;

    @Column(name = "date_of_conversion")
    @JsonView(Views.Member.class)
    private String dateOfConversion;

    @Column(name = "former_church", length = 100)
    @JsonView(Views.Member.class)
    private String formerChurch;

    @Column(name = "date_of_joining")
    @JsonView(Views.Member.class)
    private String dateOfJoining;

    @Column(name = "place_of_baptism", length = 100)
    @JsonView(Views.Member.class)
    private String placeOfBaptism;

    @Column(name = "officiating_minister_at_baptism", length = 100)
    @JsonView(Views.Member.class)
    private String officiatingMinisterAtBaptism;

    @Column(name = "officiating_minister_district", length = 100)
    @JsonView(Views.Member.class)
    private String officiatingMinisterDistrict;

    @Column(name = "communicant", length = 10)
    @JsonView(Views.Member.class)
    private String communicant;

    @Column(name = "position_in_church", length = 100)
    @JsonView(Views.Member.class)
    private String positionInChurch;

    @Column(name = "other_appointments", columnDefinition = "TEXT")
    @JsonView(Views.Member.class)
    private String otherAppointments;

    @Column(name = "ministry", length = 100)
    @JsonView(Views.Member.class)
    private String ministry;

    @Column(name = "zone", length = 50)
    @JsonView(Views.Member.class)
    private String zone;

    @Column(name = "occupation", length = 100)
    @JsonView(Views.Member.class)
    private String occupation;

    @Column(name = "hum_status", length = 50)
    @JsonView(Views.Member.class)
    private String humStatus;

    @Column(name = "level_of_education", length = 50)
    @JsonView(Views.Member.class)
    private String levelOfEducation;

    @Column(name = "school_name", length = 100)
    @JsonView(Views.Member.class)
    private String schoolName;

    @Column(name = "school_location", length = 100)
    @JsonView(Views.Member.class)
    private String schoolLocation;

    @Column(name = "is_entrepreneur", length = 10)
    @JsonView(Views.Member.class)
    private String isEntrepreneur;

    @Column(name = "is_retired", length = 10)
    @JsonView(Views.Member.class)
    private String isRetired;

    @Column(name = "date_of_retirement")
    @JsonView(Views.Member.class)
    private String dateOfRetirement;

    @Column(name = "has_disability", length = 10)
    @JsonView(Views.Member.class)
    private String hasDisability;

    @Column(name = "nature_of_disability", length = 255)
    @JsonView(Views.Member.class)
    private String natureOfDisability;

    @Column(name = "assistive_device", length = 100)
    @JsonView(Views.Member.class)
    private String assistiveDevice;

    @Column(name = "royal_status", length = 10)
    @JsonView(Views.Member.class)
    private String royalStatus;

    @Column(name = "traditional_area", length = 100)
    @JsonView(Views.Member.class)
    private String traditionalArea;

    @Column(name = "year_appointed", length = 20)
    @JsonView(Views.Member.class)
    private String yearAppointed;

    @Column(name = "parent_guardian_name", length = 100)
    @JsonView(Views.Member.class)
    private String parentGuardianName;

    @Column(name = "parent_guardian_contact", length = 50)
    @JsonView(Views.Member.class)
    private String parentGuardianContact;

    @Column(name = "is_dedicated", length = 10)
    @JsonView(Views.Member.class)
    private String isDedicated;

    @Column(name = "dedication_date")
    @JsonView(Views.Member.class)
    private String dedicationDate;

    @Column(name = "officiating_minister_at_dedication", length = 100)
    @JsonView(Views.Member.class)
    private String officiatingMinisterAtDedication;

    @Column(name = "dedication_church", length = 100)
    @JsonView(Views.Member.class)
    private String dedicationChurch;

    
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

    @JsonView(Views.Public.class)
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

    public Integer getBranchId() { return branchId; }
    public void setBranchId(Integer branchId) { this.branchId = branchId; }

    public Boolean getIsVerified() { return isVerified != null ? isVerified : false; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPlaceOfBirth() { return placeOfBirth; }
    public void setPlaceOfBirth(String placeOfBirth) { this.placeOfBirth = placeOfBirth; }

    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getGpsAddress() { return gpsAddress; }
    public void setGpsAddress(String gpsAddress) { this.gpsAddress = gpsAddress; }

    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }

    public String getStreetName() { return streetName; }
    public void setStreetName(String streetName) { this.streetName = streetName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getCountryOfBirth() { return countryOfBirth; }
    public void setCountryOfBirth(String countryOfBirth) { this.countryOfBirth = countryOfBirth; }

    public String getFamilyMemberName() { return familyMemberName; }
    public void setFamilyMemberName(String familyMemberName) { this.familyMemberName = familyMemberName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getResidentialAddress() { return residentialAddress; }
    public void setResidentialAddress(String residentialAddress) { this.residentialAddress = residentialAddress; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getHolyGhostBaptism() { return holyGhostBaptism; }
    public void setHolyGhostBaptism(String holyGhostBaptism) { this.holyGhostBaptism = holyGhostBaptism; }

    public String getDateOfHolySpiritBaptism() { return dateOfHolySpiritBaptism; }
    public void setDateOfHolySpiritBaptism(String dateOfHolySpiritBaptism) { this.dateOfHolySpiritBaptism = dateOfHolySpiritBaptism; }

    public String getWaterBaptism() { return waterBaptism; }
    public void setWaterBaptism(String waterBaptism) { this.waterBaptism = waterBaptism; }

    public String getDateOfWaterBaptism() { return dateOfWaterBaptism; }
    public void setDateOfWaterBaptism(String dateOfWaterBaptism) { this.dateOfWaterBaptism = dateOfWaterBaptism; }

    public String getDateOfConversion() { return dateOfConversion; }
    public void setDateOfConversion(String dateOfConversion) { this.dateOfConversion = dateOfConversion; }

    public String getFormerChurch() { return formerChurch; }
    public void setFormerChurch(String formerChurch) { this.formerChurch = formerChurch; }

    public String getDateOfJoining() { return dateOfJoining; }
    public void setDateOfJoining(String dateOfJoining) { this.dateOfJoining = dateOfJoining; }

    public String getPlaceOfBaptism() { return placeOfBaptism; }
    public void setPlaceOfBaptism(String placeOfBaptism) { this.placeOfBaptism = placeOfBaptism; }

    public String getOfficiatingMinisterAtBaptism() { return officiatingMinisterAtBaptism; }
    public void setOfficiatingMinisterAtBaptism(String officiatingMinisterAtBaptism) { this.officiatingMinisterAtBaptism = officiatingMinisterAtBaptism; }

    public String getOfficiatingMinisterDistrict() { return officiatingMinisterDistrict; }
    public void setOfficiatingMinisterDistrict(String officiatingMinisterDistrict) { this.officiatingMinisterDistrict = officiatingMinisterDistrict; }

    public String getCommunicant() { return communicant; }
    public void setCommunicant(String communicant) { this.communicant = communicant; }

    public String getPositionInChurch() { return positionInChurch; }
    public void setPositionInChurch(String positionInChurch) { this.positionInChurch = positionInChurch; }

    public String getOtherAppointments() { return otherAppointments; }
    public void setOtherAppointments(String otherAppointments) { this.otherAppointments = otherAppointments; }

    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getHumStatus() { return humStatus; }
    public void setHumStatus(String humStatus) { this.humStatus = humStatus; }

    public String getLevelOfEducation() { return levelOfEducation; }
    public void setLevelOfEducation(String levelOfEducation) { this.levelOfEducation = levelOfEducation; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getSchoolLocation() { return schoolLocation; }
    public void setSchoolLocation(String schoolLocation) { this.schoolLocation = schoolLocation; }

    public String getIsEntrepreneur() { return isEntrepreneur; }
    public void setIsEntrepreneur(String isEntrepreneur) { this.isEntrepreneur = isEntrepreneur; }

    public String getIsRetired() { return isRetired; }
    public void setIsRetired(String isRetired) { this.isRetired = isRetired; }

    public String getDateOfRetirement() { return dateOfRetirement; }
    public void setDateOfRetirement(String dateOfRetirement) { this.dateOfRetirement = dateOfRetirement; }

    public String getHasDisability() { return hasDisability; }
    public void setHasDisability(String hasDisability) { this.hasDisability = hasDisability; }

    public String getNatureOfDisability() { return natureOfDisability; }
    public void setNatureOfDisability(String natureOfDisability) { this.natureOfDisability = natureOfDisability; }

    public String getAssistiveDevice() { return assistiveDevice; }
    public void setAssistiveDevice(String assistiveDevice) { this.assistiveDevice = assistiveDevice; }

    public String getRoyalStatus() { return royalStatus; }
    public void setRoyalStatus(String royalStatus) { this.royalStatus = royalStatus; }

    public String getTraditionalArea() { return traditionalArea; }
    public void setTraditionalArea(String traditionalArea) { this.traditionalArea = traditionalArea; }

    public String getYearAppointed() { return yearAppointed; }
    public void setYearAppointed(String yearAppointed) { this.yearAppointed = yearAppointed; }

    public String getParentGuardianName() { return parentGuardianName; }
    public void setParentGuardianName(String parentGuardianName) { this.parentGuardianName = parentGuardianName; }

    public String getParentGuardianContact() { return parentGuardianContact; }
    public void setParentGuardianContact(String parentGuardianContact) { this.parentGuardianContact = parentGuardianContact; }

    public String getIsDedicated() { return isDedicated; }
    public void setIsDedicated(String isDedicated) { this.isDedicated = isDedicated; }

    public String getDedicationDate() { return dedicationDate; }
    public void setDedicationDate(String dedicationDate) { this.dedicationDate = dedicationDate; }

    public String getOfficiatingMinisterAtDedication() { return officiatingMinisterAtDedication; }
    public void setOfficiatingMinisterAtDedication(String officiatingMinisterAtDedication) { this.officiatingMinisterAtDedication = officiatingMinisterAtDedication; }

    public String getDedicationChurch() { return dedicationChurch; }
    public void setDedicationChurch(String dedicationChurch) { this.dedicationChurch = dedicationChurch; }
}
