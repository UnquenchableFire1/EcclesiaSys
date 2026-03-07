-- Migration script to add profile fields to members table and set proper defaults
-- Run this if you're updating an existing database

-- 1. Fix joined_date column (add default if missing)
ALTER TABLE members 
MODIFY joined_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Add profile fields if they don't exist
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Fix existing columns that might not have defaults
ALTER TABLE members 
MODIFY is_profile_public BOOLEAN NOT NULL DEFAULT TRUE;

-- 4. Verify the table structure
DESCRIBE members;
