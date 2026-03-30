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
                "profile_picture_url VARCHAR(500), " +
                "gender VARCHAR(20), " +
                "bio TEXT, " +
                "branch_id INT, " +
                "joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")";

        String[] columnsToAdd = {
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS gender VARCHAR(20)",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS bio TEXT",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS branch_id INT",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'",
            "ALTER TABLE members ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE"
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
                        System.err.println("Member migration error: " + e.getMessage());
                    }
                }
            }
            System.out.println("✓ Members table schema check completed");
        } catch (SQLException e) {
            System.err.println("Failed to connect for member migration: " + e.getMessage());
        }
    }

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
        
        Timestamp jd = rs.getTimestamp("joined_date");
        if (jd != null) member.setJoinedDate(jd.toLocalDateTime());
        
        Timestamp ua = rs.getTimestamp("updated_at");
        if (ua != null) member.setUpdatedAt(ua.toLocalDateTime());
        
        return member;
    }
}
