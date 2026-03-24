import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        port=1532,
        user="root",
        password="fire@1532",
        database="bbj"
    )
    cursor = conn.cursor()
    
    print("Checking constraints for 'branches' table...")
    cursor.execute("""
        SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'branches';
    """)
    
    rows = cursor.fetchall()
    if not rows:
        print("No foreign keys pointing to branches found!")
    else:
        for r in rows:
            print(f"Table {r[0]}, Column {r[1]} points to {r[3]}.{r[4]} (Constraint {r[2]})")
            
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
