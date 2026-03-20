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
        String query = "INSERT INTO members (first_name, last_name, phone_number, email, password, status, is_profile_public, profile_picture_url, gender, bio, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
        String query = "UPDATE members SET first_name = ?, last_name = ?, phone_number = ?, email = ?, password = ?, profile_picture_url = ?, is_profile_public = ?, gender = ?, bio = ?, status = ?, branch_id = ? WHERE id = ?";
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
            stmt.setInt(12, member.getId());
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
            
            // Delete related chat messages
            try (PreparedStatement stmt = conn.prepareStatement("DELETE FROM chat_messages WHERE (sender_id = ? AND sender_type = 'member') OR (receiver_id = ? AND receiver_type = 'member')")) {
                stmt.setInt(1, id);
                stmt.setInt(2, id);
                stmt.executeUpdate();
            }
            
            // Delete the member
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
        
        Timestamp jd = rs.getTimestamp("joined_date");
        if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
        
        Timestamp ua = rs.getTimestamp("updated_at");
        if (ua != null) member.setUpdatedAt(ua.toLocalDateTime());
        
        return member;
    }
}
