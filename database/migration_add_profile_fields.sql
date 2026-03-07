-- Migration script to add profile fields to members table and set proper defaults
-- Run this if you're updating an existing database that doesn't have these columns

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- If the column already exists but doesn't have a default, run this:
ALTER TABLE members 
MODIFY is_profile_public BOOLEAN NOT NULL DEFAULT TRUE;

-- Verify the table structure
DESCRIBE members;
