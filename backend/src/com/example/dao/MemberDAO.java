package com.example.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import com.example.model.Member;
import com.example.db.DBConnection;

public class MemberDAO {
    
    public boolean addMember(Member member) {
        String query = "INSERT INTO members (first_name, last_name, phone_number, email, password) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, member.getFirstName());
            stmt.setString(2, member.getLastName());
            stmt.setString(3, member.getPhoneNumber());
            stmt.setString(4, member.getEmail());
            stmt.setString(5, member.getPassword());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
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
                member.setStatus(rs.getString("status"));
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
                member.setStatus(rs.getString("status"));
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
                member.setStatus(rs.getString("status"));
                members.add(member);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return members;
    }

    public boolean updateMember(Member member) {
        String query = "UPDATE members SET first_name = ?, last_name = ?, phone_number = ?, email = ?, password = ?, status = ? WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, member.getFirstName());
            stmt.setString(2, member.getLastName());
            stmt.setString(3, member.getPhoneNumber());
            stmt.setString(4, member.getEmail());
            stmt.setString(5, member.getPassword());
            stmt.setString(6, member.getStatus());
            stmt.setInt(7, member.getId());
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
}
