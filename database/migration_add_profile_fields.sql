-- Migration script to add profile fields to members table and set proper defaults
-- Run this if you're updating an existing database from an older schema

-- 1. Add actual_email column if it doesn't exist
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS actual_email VARCHAR(100);

-- 2. Add profile fields if they don't exist
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Fix joined_date column (ensure it has proper default and NOT NULL constraint)
ALTER TABLE members 
MODIFY joined_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 4. Ensure is_profile_public has correct default
ALTER TABLE members 
MODIFY is_profile_public BOOLEAN NOT NULL DEFAULT TRUE;

-- 5. Verify the table structure
DESCRIBE members;
