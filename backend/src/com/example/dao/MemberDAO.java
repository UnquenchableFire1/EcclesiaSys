package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Member;
import com.example.db.DBConnection;
import org.springframework.stereotype.Repository;

@Repository
public class MemberDAO {
    
    public boolean addMember(Member member) {
        String query = "INSERT INTO members (first_name, last_name, phone_number, email, password, status, is_profile_public, profile_picture_url, gender, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            if (conn == null) {
                throw new RuntimeException("Failed to get database connection");
            }
            conn.setAutoCommit(true);
            
            try (PreparedStatement stmt = conn.prepareStatement(query)) {
                stmt.setString(1, member.getFirstName());
                stmt.setString(2, member.getLastName());
                stmt.setString(3, member.getPhoneNumber());
                stmt.setString(4, member.getEmail());
                stmt.setString(5, member.getPassword());
                stmt.setString(6, "active");
                stmt.setBoolean(7, true);
                stmt.setString(8, null);
                stmt.setString(9, member.getGender());
                stmt.setString(10, null);
                
                System.out.println("MemberDAO: Executing INSERT for email: " + member.getEmail());
                System.out.println("MemberDAO: firstName=" + member.getFirstName() + ", lastName=" + member.getLastName() + 
                                   ", phoneNumber=" + member.getPhoneNumber() + ", status=active");
                
                int result = stmt.executeUpdate();
                System.out.println("MemberDAO: Insert result = " + result + " rows affected for email: " + member.getEmail());
                return result > 0;
            }
        } catch (SQLException e) {
            System.err.println("MemberDAO SQL Error: " + e.getMessage());
            System.err.println("MemberDAO SQL State: " + e.getSQLState() + ", Error Code: " + e.getErrorCode());
            e.printStackTrace();
            throw new RuntimeException("Database error: " + e.getSQLState() + " - " + e.getMessage(), e);
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public Member getMemberById(int id) {
        String query = "SELECT * FROM members WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
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
                try {
                    Timestamp jd = rs.getTimestamp("joined_date");
                    if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
                } catch (SQLException ex) {
                    // ignore if column missing
                }
                try {
                    Timestamp ua = rs.getTimestamp("updated_at");
                    if (ua != null) member.setUpdatedAt(ua.toLocalDateTime());
                } catch (SQLException ex) {
                    // ignore
                }
                return member;
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
                try {
                    Timestamp jd = rs.getTimestamp("joined_date");
                    if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
                } catch (SQLException ex) {
                }
                try {
                    Timestamp ua = rs.getTimestamp("updated_at");
                    if (ua != null) member.setUpdatedAt(ua.toLocalDateTime());
                } catch (SQLException ex) {
                }
                return member;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Member> getAllMembers() {
        List<Member> members = new ArrayList<>();
        String query = "SELECT * FROM members WHERE status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
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
                try {
                    Timestamp jd = rs.getTimestamp("joined_date");
                    if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
                } catch (SQLException ex) {
                }
                try {
                    Timestamp ua = rs.getTimestamp("updated_at");
                    if (ua != null) member.setUpdatedAt(ua.toLocalDateTime());
                } catch (SQLException ex) {
                }
                members.add(member);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        for (Member m : members) { m.setPassword(null); }
        return members;
    }

    public List<String> getAllActiveMemberEmails() {
        List<String> emails = new ArrayList<>();
        String query = "SELECT email as contact_email FROM members WHERE status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                emails.add(rs.getString("contact_email"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return emails;
    }

    public List<Member> getPublicMembers() {
        List<Member> members = new ArrayList<>();
        String query = "SELECT * FROM members WHERE status = 'active' AND is_profile_public = true";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                Member member = new Member();
                member.setId(rs.getInt("id"));
                member.setFirstName(rs.getString("first_name"));
                member.setLastName(rs.getString("last_name"));
                member.setPhoneNumber(rs.getString("phone_number"));
                member.setEmail(rs.getString("email"));
                member.setProfilePictureUrl(rs.getString("profile_picture_url"));
                member.setGender(rs.getString("gender"));
                member.setBio(rs.getString("bio"));
                try {
                    Timestamp jd = rs.getTimestamp("joined_date");
                    if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
                } catch (SQLException ex) {}
                members.add(member);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return members;
    }


    public boolean updateMember(Member member) {
        String query = "UPDATE members SET first_name = ?, last_name = ?, phone_number = ?, email = ?, password = ?, profile_picture_url = ?, is_profile_public = ?, gender = ?, bio = ?, status = ? WHERE id = ?";
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
            stmt.setInt(11, member.getId());
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
            conn.setAutoCommit(false); // Start transaction
            
            // 1. Get member email to clean up associated records
            String email = null;
            try (PreparedStatement stmt = conn.prepareStatement("SELECT email FROM members WHERE id = ?")) {
                stmt.setInt(1, id);
                ResultSet rs = stmt.executeQuery();
                if (rs.next()) {
                    email = rs.getString("email");
                }
            }
            
            if (email != null) {
                // 2. Delete related password resets
                try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM password_resets WHERE email = ?")) {
                    stmt.setString(1, email);
                    stmt.executeUpdate();
                }
            }
            
            // 3. Delete the member
            String deleteQuery = "DELETE FROM members WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(deleteQuery)) {
                stmt.setInt(1, id);
                int result = stmt.executeUpdate();
                conn.commit(); // Commit transaction
                return result > 0;
            }
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            e.printStackTrace();
        } finally {
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
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

    public boolean verifyMemberLogin(String email, String password) {
        String query = "SELECT * FROM members WHERE email = ? AND password = ? AND status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public int countMembersWithFirstName(String firstName) {
        String query = "SELECT COUNT(*) as count FROM members WHERE LOWER(first_name) = ? AND status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, firstName.toLowerCase());
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("count");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
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
}
