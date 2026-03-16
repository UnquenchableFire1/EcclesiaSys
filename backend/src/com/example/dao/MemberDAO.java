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
        String query = "INSERT INTO members (first_name, last_name, phone_number, email, actual_email, password, status, is_profile_public, profile_picture_url, gender, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
                stmt.setString(5, member.getActualEmail());
                stmt.setString(6, member.getPassword());
                stmt.setString(7, "active");
                stmt.setBoolean(8, true);
                stmt.setString(9, null);
                stmt.setString(10, member.getGender());
                stmt.setString(11, null);
                
                System.out.println("MemberDAO: Executing INSERT for email: " + member.getEmail());
                System.out.println("MemberDAO: firstName=" + member.getFirstName() + ", lastName=" + member.getLastName() + 
                                   ", phoneNumber=" + member.getPhoneNumber() + ", actualEmail=" + member.getActualEmail() + ", status=active");
                
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
                member.setActualEmail(rs.getString("actual_email"));
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
                member.setActualEmail(rs.getString("actual_email"));
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
                member.setActualEmail(rs.getString("actual_email"));
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
        String query = "SELECT COALESCE(actual_email, email) as contact_email FROM members WHERE status = 'active'";
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
                member.setActualEmail(rs.getString("actual_email"));
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
        String query = "UPDATE members SET first_name = ?, last_name = ?, phone_number = ?, email = ?, actual_email = ?, password = ?, profile_picture_url = ?, is_profile_public = ?, gender = ?, bio = ?, status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, member.getFirstName());
            stmt.setString(2, member.getLastName());
            stmt.setString(3, member.getPhoneNumber());
            stmt.setString(4, member.getEmail());
            stmt.setString(5, member.getActualEmail());
            stmt.setString(6, member.getPassword());
            stmt.setString(7, member.getProfilePictureUrl());
            stmt.setBoolean(8, member.getIsProfilePublic());
            stmt.setString(9, member.getGender());
            stmt.setString(10, member.getBio());
            stmt.setString(11, member.getStatus());
            stmt.setInt(12, member.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteMember(int id) {
        String query = "UPDATE members SET status = 'inactive' WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
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

    public boolean verifyMemberLogin(String email, String password) {
        String query = "SELECT * FROM members WHERE (email = ? OR actual_email = ?) AND password = ? AND status = 'active'";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, email);
            stmt.setString(2, email);
            stmt.setString(3, password);
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
}
