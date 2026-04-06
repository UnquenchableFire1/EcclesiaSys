package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Member;
import com.example.db.DBConnection;
import org.springframework.stereotype.Repository;

@Repository
public class MemberDAO {
    
    public MemberDAO() {
        ensureMembersTableSchema();
    }

    private void ensureMembersTableSchema() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS members (" +
                "id INT AUTO_INCREMENT PRIMARY KEY, " +
                "first_name VARCHAR(100) NOT NULL, " +
                "last_name VARCHAR(100) NOT NULL, " +
                "email VARCHAR(150) NOT NULL UNIQUE, " +
                "phone_number VARCHAR(20), " +
                "password VARCHAR(255) NOT NULL, " +
                "status VARCHAR(20) DEFAULT 'active', " +
                "is_profile_public BOOLEAN DEFAULT TRUE, " +
                "profile_picture_url VARCHAR(1000), " +
                "gender VARCHAR(20), " +
                "bio TEXT, " +
                "branch_id INT, " +
                "is_verified BOOLEAN DEFAULT FALSE, " +
                "joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";

        String[] columnsToAdd = {
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(1000)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS bio TEXT",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS branch_id INT",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS title VARCHAR(20)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS membership_type VARCHAR(30)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS gps_address VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS hometown VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS street_name VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS nationality VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS country_of_birth VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS family_member_name VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS relationship VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS residential_address VARCHAR(255)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS locality VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS landmark VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS holy_ghost_baptism VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_holy_spirit_baptism VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS water_baptism VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_water_baptism VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_conversion VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS former_church VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_joining VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS place_of_baptism VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS officiating_minister_at_baptism VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS officiating_minister_district VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS communicant VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS position_in_church VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS other_appointments TEXT",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS ministry VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS zone VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS occupation VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS hum_status VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS level_of_education VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS school_name VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS school_location VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS is_entrepreneur VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS is_retired VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_retirement VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS has_disability VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS nature_of_disability VARCHAR(255)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS assistive_device VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS royal_status VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS traditional_area VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS year_appointed VARCHAR(20)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS parent_guardian_name VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS parent_guardian_contact VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS is_dedicated VARCHAR(10)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS dedication_date VARCHAR(50)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS officiating_minister_at_dedication VARCHAR(100)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS dedication_church VARCHAR(100)"
        };
        
        String[] columnsToModify = {
            "ALTER TABLE members MODIFY COLUMN profile_picture_url VARCHAR(1000)"
        };
        
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            // 1. Ensure table exists
            stmt.execute(createTableSql);

            // 2. Ensure all columns exist (for migration)
            for (String sql : columnsToAdd) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    if (!"42S21".equals(e.getSQLState())) {
                        System.err.println("Member migration error (add): " + e.getMessage());
                    }
                }
            }

            // 3. Force modify column sizes
            for (String sql : columnsToModify) {
                try {
                    stmt.execute(sql);
                } catch (SQLException e) {
                    System.err.println("Member migration error (modify): " + e.getMessage());
                }
            }
            
            System.out.println("✓ Members table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to connect for member migration: " + e.getMessage());
        }
    }

    public boolean addMember(Member member) {
        String query = "INSERT INTO members (first_name, last_name, phone_number, email, password, status, is_profile_public, profile_picture_url, gender, bio, branch_id, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, member.getFirstName());
            stmt.setString(2, member.getLastName());
            stmt.setString(3, member.getPhoneNumber());
            stmt.setString(4, member.getEmail());
            stmt.setString(5, member.getPassword());
            stmt.setString(6, "active");
            stmt.setBoolean(7, true);
            stmt.setString(8, member.getProfilePictureUrl());
            stmt.setString(9, member.getGender());
            stmt.setString(10, member.getBio());
            if (member.getBranchId() != null) stmt.setInt(11, member.getBranchId()); else stmt.setNull(11, Types.INTEGER);
            stmt.setBoolean(12, true); // is_verified (set to true by default)
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public Member getMemberById(int id) {
        String query = "SELECT * FROM members WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToMember(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Member getMemberByEmail(String email) {
        String query = "SELECT * FROM members WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapResultSetToMember(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Member> getAllMembers(Integer branchId) {
        List<Member> members = new ArrayList<>();
        String query = branchId == null ? "SELECT * FROM members" : "SELECT * FROM members WHERE branch_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                members.add(mapResultSetToMember(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        for (Member m : members) { m.setPassword(null); }
        return members;
    }

    public List<Member> getPublicMembers(Integer branchId) {
        List<Member> members = new ArrayList<>();
        String query = branchId == null ? 
            "SELECT * FROM members WHERE status = 'active' AND is_profile_public = true" :
            "SELECT * FROM members WHERE status = 'active' AND is_profile_public = true AND branch_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                members.add(mapResultSetToMember(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        for (Member m : members) { m.setPassword(null); }
        return members;
    }

    public boolean updateMember(Member member) {
        String query = "UPDATE members SET first_name = ?, last_name = ?, phone_number = ?, email = ?, password = ?, profile_picture_url = ?, is_profile_public = ?, gender = ?, bio = ?, status = ?, branch_id = ?, " +
                "title = ?, date_of_birth = ?, place_of_birth = ?, membership_type = ?, marital_status = ?, address_line_1 = ?, gps_address = ?, hometown = ?, street_name = ?, city = ?, postal_code = ?, nationality = ?, country_of_birth = ?, " +
                "family_member_name = ?, relationship = ?, residential_address = ?, locality = ?, landmark = ?, holy_ghost_baptism = ?, date_of_holy_spirit_baptism = ?, water_baptism = ?, date_of_water_baptism = ?, date_of_conversion = ?, " +
                "former_church = ?, date_of_joining = ?, place_of_baptism = ?, officiating_minister_at_baptism = ?, officiating_minister_district = ?, communicant = ?, position_in_church = ?, other_appointments = ?, ministry = ?, zone = ?, " +
                "occupation = ?, hum_status = ?, level_of_education = ?, school_name = ?, school_location = ?, is_entrepreneur = ?, is_retired = ?, date_of_retirement = ?, has_disability = ?, nature_of_disability = ?, assistive_device = ?, " +
                "royal_status = ?, traditional_area = ?, year_appointed = ?, parent_guardian_name = ?, parent_guardian_contact = ?, is_dedicated = ?, dedication_date = ?, officiating_minister_at_dedication = ?, dedication_church = ? " +
                "WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, member.getFirstName());
            stmt.setString(2, member.getLastName());
            stmt.setString(3, member.getPhoneNumber());
            stmt.setString(4, member.getEmail());
            stmt.setString(5, member.getPassword());
            stmt.setString(6, member.getProfilePictureUrl());
            stmt.setBoolean(7, member.getIsProfilePublic());
            stmt.setString(8, member.getGender());
            stmt.setString(9, member.getBio());
            stmt.setString(10, member.getStatus());
            if (member.getBranchId() != null) stmt.setInt(11, member.getBranchId()); else stmt.setNull(11, Types.INTEGER);
            
            // Personal Details
            stmt.setString(12, member.getTitle());
            stmt.setString(13, member.getDateOfBirth());
            stmt.setString(14, member.getPlaceOfBirth());
            stmt.setString(15, member.getMembershipType());
            stmt.setString(16, member.getMaritalStatus());
            stmt.setString(17, member.getAddressLine1());
            stmt.setString(18, member.getGpsAddress());
            stmt.setString(19, member.getHometown());
            stmt.setString(20, member.getStreetName());
            stmt.setString(21, member.getCity());
            stmt.setString(22, member.getPostalCode());
            stmt.setString(23, member.getNationality());
            stmt.setString(24, member.getCountryOfBirth());
            stmt.setString(25, member.getFamilyMemberName());
            stmt.setString(26, member.getRelationship());
            stmt.setString(27, member.getResidentialAddress());
            stmt.setString(28, member.getLocality());
            stmt.setString(29, member.getLandmark());
            
            // Church Details
            stmt.setString(30, member.getHolyGhostBaptism());
            stmt.setString(31, member.getDateOfHolySpiritBaptism());
            stmt.setString(32, member.getWaterBaptism());
            stmt.setString(33, member.getDateOfWaterBaptism());
            stmt.setString(34, member.getDateOfConversion());
            stmt.setString(35, member.getFormerChurch());
            stmt.setString(36, member.getDateOfJoining());
            stmt.setString(37, member.getPlaceOfBaptism());
            stmt.setString(38, member.getOfficiatingMinisterAtBaptism());
            stmt.setString(39, member.getOfficiatingMinisterDistrict());
            stmt.setString(40, member.getCommunicant());
            stmt.setString(41, member.getPositionInChurch());
            stmt.setString(42, member.getOtherAppointments());
            stmt.setString(43, member.getMinistry());
            stmt.setString(44, member.getZone());
            stmt.setString(45, member.getOccupation());
            stmt.setString(46, member.getHumStatus());
            stmt.setString(47, member.getLevelOfEducation());
            stmt.setString(48, member.getSchoolName());
            stmt.setString(49, member.getSchoolLocation());
            stmt.setString(50, member.getIsEntrepreneur());
            stmt.setString(51, member.getIsRetired());
            stmt.setString(52, member.getDateOfRetirement());
            stmt.setString(53, member.getHasDisability());
            stmt.setString(54, member.getNatureOfDisability());
            stmt.setString(55, member.getAssistiveDevice());
            stmt.setString(56, member.getRoyalStatus());
            stmt.setString(57, member.getTraditionalArea());
            stmt.setString(58, member.getYearAppointed());
            stmt.setString(59, member.getParentGuardianName());
            stmt.setString(60, member.getParentGuardianContact());
            stmt.setString(61, member.getIsDedicated());
            stmt.setString(62, member.getDedicationDate());
            stmt.setString(63, member.getOfficiatingMinisterAtDedication());
            stmt.setString(64, member.getDedicationChurch());
            
            stmt.setInt(65, member.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteMember(int id) {
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Remove any password reset tokens for this member's email
            try (PreparedStatement stmt = conn.prepareStatement(
                    "DELETE pr FROM password_resets pr JOIN members m ON pr.email = m.email WHERE m.id = ?")) {
                stmt.setInt(1, id);
                stmt.executeUpdate();
            } catch (SQLException e) {
                // Table may not exist or have a different name - ignore silently
            }

            // 2. Remove notifications sent to this member
            try (PreparedStatement stmt = conn.prepareStatement(
                    "DELETE FROM notifications WHERE member_id = ?")) {
                stmt.setInt(1, id);
                stmt.executeUpdate();
            } catch (SQLException e) {
                // Ignore if table doesn't exist
            }

            // 3. Remove all chat messages involving this member
            try (PreparedStatement stmt = conn.prepareStatement(
                    "DELETE FROM chat_messages WHERE (sender_id = ? AND sender_type = 'member') OR (receiver_id = ? AND receiver_type = 'member')")) {
                stmt.setInt(1, id);
                stmt.setInt(2, id);
                stmt.executeUpdate();
            }

            // 4. Remove any admin record created from this member (promotion case)
            // We identify by matching email
            try (PreparedStatement stmt = conn.prepareStatement(
                    "DELETE a FROM admins a JOIN members m ON a.email = m.email WHERE m.id = ? AND a.role != 'SUPER_ADMIN'")) {
                stmt.setInt(1, id);
                stmt.executeUpdate();
            } catch (SQLException e) {
                // Ignore
            }

            // 5. Finally delete the member
            try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM members WHERE id = ?")) {
                stmt.setInt(1, id);
                int result = stmt.executeUpdate();
                conn.commit();
                return result > 0;
            }
        } catch (SQLException e) {
            if (conn != null) { try { conn.rollback(); } catch (SQLException ex) {} }
            e.printStackTrace();
        } finally {
            if (conn != null) { try { conn.close(); } catch (SQLException e) {} }
        }
        return false;
    }

    public boolean verifyMemberLogin(String email, String password) {
        String query = "SELECT id, password FROM members WHERE email = ? AND status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                int id = rs.getInt("id");
                String storedHash = rs.getString("password");
                try {
                    return org.mindrot.jbcrypt.BCrypt.checkpw(password, storedHash);
                } catch (IllegalArgumentException e) {
                    // Legacy plain-text fallback & automatic upgrade
                    if (password.equals(storedHash)) {
                        String newHash = org.mindrot.jbcrypt.BCrypt.hashpw(password, org.mindrot.jbcrypt.BCrypt.gensalt());
                        updateMemberPassword(id, newHash);
                        return true;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public void migrateEmails() {
        String sql = "UPDATE members SET email = actual_email WHERE actual_email IS NOT NULL AND actual_email != ''";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            int rowsAffected = pstmt.executeUpdate();
            System.out.println("Migrated " + rowsAffected + " member emails.");
        } catch (SQLException e) {
            System.err.println("Email migration failed: " + e.getMessage());
        }
    }

    public List<String> getAllActiveMemberEmails() {
        List<String> emails = new ArrayList<>();
        String query = "SELECT email FROM members WHERE status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                emails.add(rs.getString("email"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return emails;
    }

    public List<Integer> getAllActiveMemberIds() {
        List<Integer> ids = new ArrayList<>();
        String query = "SELECT id FROM members WHERE status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                ids.add(rs.getInt("id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ids;
    }

    public List<String> getActiveMemberEmailsByBranch(int branchId) {
        List<String> emails = new ArrayList<>();
        String query = "SELECT email FROM members WHERE status = 'active' AND branch_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, branchId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    emails.add(rs.getString("email"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return emails;
    }

    public List<Integer> getActiveMemberIdsByBranch(int branchId) {
        List<Integer> ids = new ArrayList<>();
        String query = "SELECT id FROM members WHERE status = 'active' AND branch_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, branchId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ids.add(rs.getInt("id"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ids;
    }

    public boolean updateMemberPassword(int id, String newPassword) {
        String query = "UPDATE members SET password = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, newPassword);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateIsVerified(String email, boolean verified) {
        String query = "UPDATE members SET is_verified = ? WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setBoolean(1, verified);
            stmt.setString(2, email);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean toggleMemberStatus(int id) {
        String query = "UPDATE members SET status = CASE WHEN status = 'active' THEN 'disabled' ELSE 'active' END WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean assignBranch(int id, Integer branchId) {
        String query = "UPDATE members SET branch_id = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            if (branchId != null) stmt.setInt(1, branchId); else stmt.setNull(1, Types.INTEGER);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Member mapResultSetToMember(ResultSet rs) throws SQLException {
        Member member = new Member();
        member.setId(rs.getInt("id"));
        member.setFirstName(rs.getString("first_name"));
        member.setLastName(rs.getString("last_name"));
        member.setPhoneNumber(rs.getString("phone_number"));
        member.setEmail(rs.getString("email"));
        member.setPassword(rs.getString("password"));
        member.setProfilePictureUrl(rs.getString("profile_picture_url"));
        member.setIsProfilePublic(rs.getBoolean("is_profile_public"));
        member.setGender(rs.getString("gender"));
        member.setBio(rs.getString("bio"));
        member.setStatus(rs.getString("status"));
        int bId = rs.getInt("branch_id");
        member.setBranchId(rs.wasNull() ? null : bId);
        member.setIsVerified(rs.getBoolean("is_verified"));

        // Personal Details
        member.setTitle(rs.getString("title"));
        member.setDateOfBirth(rs.getString("date_of_birth"));
        member.setPlaceOfBirth(rs.getString("place_of_birth"));
        member.setMembershipType(rs.getString("membership_type"));
        member.setMaritalStatus(rs.getString("marital_status"));
        member.setAddressLine1(rs.getString("address_line_1"));
        member.setGpsAddress(rs.getString("gps_address"));
        member.setHometown(rs.getString("hometown"));
        member.setStreetName(rs.getString("street_name"));
        member.setCity(rs.getString("city"));
        member.setPostalCode(rs.getString("postal_code"));
        member.setNationality(rs.getString("nationality"));
        member.setCountryOfBirth(rs.getString("country_of_birth"));
        member.setFamilyMemberName(rs.getString("family_member_name"));
        member.setRelationship(rs.getString("relationship"));
        member.setResidentialAddress(rs.getString("residential_address"));
        member.setLocality(rs.getString("locality"));
        member.setLandmark(rs.getString("landmark"));

        // Church Details
        member.setHolyGhostBaptism(rs.getString("holy_ghost_baptism"));
        member.setDateOfHolySpiritBaptism(rs.getString("date_of_holy_spirit_baptism"));
        member.setWaterBaptism(rs.getString("water_baptism"));
        member.setDateOfWaterBaptism(rs.getString("date_of_water_baptism"));
        member.setDateOfConversion(rs.getString("date_of_conversion"));
        member.setFormerChurch(rs.getString("former_church"));
        member.setDateOfJoining(rs.getString("date_of_joining"));
        member.setPlaceOfBaptism(rs.getString("place_of_baptism"));
        member.setOfficiatingMinisterAtBaptism(rs.getString("officiating_minister_at_baptism"));
        member.setOfficiatingMinisterDistrict(rs.getString("officiating_minister_district"));
        member.setCommunicant(rs.getString("communicant"));
        member.setPositionInChurch(rs.getString("position_in_church"));
        member.setOtherAppointments(rs.getString("other_appointments"));
        member.setMinistry(rs.getString("ministry"));
        member.setZone(rs.getString("zone"));
        member.setOccupation(rs.getString("occupation"));
        member.setHumStatus(rs.getString("hum_status"));
        member.setLevelOfEducation(rs.getString("level_of_education"));
        member.setSchoolName(rs.getString("school_name"));
        member.setSchoolLocation(rs.getString("school_location"));
        member.setIsEntrepreneur(rs.getString("is_entrepreneur"));
        member.setIsRetired(rs.getString("is_retired"));
        member.setDateOfRetirement(rs.getString("date_of_retirement"));
        member.setHasDisability(rs.getString("has_disability"));
        member.setNatureOfDisability(rs.getString("nature_of_disability"));
        member.setAssistiveDevice(rs.getString("assistive_device"));
        member.setRoyalStatus(rs.getString("royal_status"));
        member.setTraditionalArea(rs.getString("traditional_area"));
        member.setYearAppointed(rs.getString("year_appointed"));
        member.setParentGuardianName(rs.getString("parent_guardian_name"));
        member.setParentGuardianContact(rs.getString("parent_guardian_contact"));
        member.setIsDedicated(rs.getString("is_dedicated"));
        member.setDedicationDate(rs.getString("dedication_date"));
        member.setOfficiatingMinisterAtDedication(rs.getString("officiating_minister_at_dedication"));
        member.setDedicationChurch(rs.getString("dedication_church"));
        
        Timestamp jd = rs.getTimestamp("joined_date");
        if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
        
        Timestamp ua = rs.getTimestamp("updated_at");
        if (ua != null) member.setUpdatedAt(ua.toLocalDateTime());
        
        return member;
    }
}
