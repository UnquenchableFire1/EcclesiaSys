package com.example.test;

import com.example.db.DBConnection;
import java.sql.*;

public class FindBranchReferences {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection()) {
            if (conn == null) {
                System.err.println("Failed to connect to database");
                return;
            }
            DatabaseMetaData metaData = conn.getMetaData();
            
            System.out.println("Searching for all foreign keys referencing 'branches' table...");
            
            // Get all tables
            ResultSet tables = metaData.getTables(null, null, "%", new String[]{"TABLE"});
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                
                // Get foreign keys for each table
                ResultSet fks = metaData.getImportedKeys(null, null, tableName);
                while (fks.next()) {
                    String pkTableName = fks.getString("PKTABLE_NAME");
                    if ("branches".equalsIgnoreCase(pkTableName)) {
                        String pkColumnName = fks.getString("PKCOLUMN_NAME");
                        String fkColumnName = fks.getString("FKCOLUMN_NAME");
                        String fkName = fks.getString("FK_NAME");
                        System.out.println("FOUND: Table [" + tableName + "] column [" + fkColumnName + "] references [" + pkTableName + "(" + pkColumnName + ")] FK_NAME: " + fkName);
                    }
                }
            }
            System.out.println("Search completed.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
