-- Migration script to add profile fields to admins table and create history table
-- March 19, 2026

-- 1. Add profile fields to admins table
ALTER TABLE admins 
ADD COLUMN profile_picture_url VARCHAR(500),
ADD COLUMN gender VARCHAR(20) DEFAULT 'unspecified',
ADD COLUMN bio TEXT,
ADD COLUMN phone_number VARCHAR(20);

-- 2. Create history table for profile pictures
CREATE TABLE IF NOT EXISTS user_profile_pictures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- 'member' or 'admin'
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (user_id, user_type)
);

-- 3. Update existing members table if needed (adding gender if missing)
-- Note: Member model already has gender, but let's ensure the table does too.
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'unspecified';

-- 4. Verify tables
DESCRIBE admins;
DESCRIBE user_profile_pictures;
