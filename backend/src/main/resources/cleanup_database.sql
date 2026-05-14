-- ============================================================
-- COP Ayikai Doblo District Database Cleanup Script
-- Keeps:
--   Admin:  benjaminbuckmanjunior@gmail.com  (SUPER_ADMIN)
--   Member: bbuckmanjunior@gmail.com          (member account)
-- Removes everything else.
-- Run in MySQL Workbench, phpMyAdmin, or Render DB shell.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Wipe all notifications
DELETE FROM notifications;

-- 2. Wipe all password reset tokens
DELETE FROM password_resets;

-- 3. Wipe all chat messages
DELETE FROM chat_messages;

-- 4. Remove all members EXCEPT bbuckmanjunior@gmail.com
DELETE FROM members
WHERE email != 'bbuckmanjunior@gmail.com';

-- 5. Remove all admins EXCEPT the super admin
DELETE FROM admins
WHERE email != 'benjaminbuckmanjunior@gmail.com';

SET FOREIGN_KEY_CHECKS = 1;

-- 6. Ensure the super admin has SUPER_ADMIN role
UPDATE admins SET role = 'SUPER_ADMIN', branch_id = NULL
WHERE email = 'benjaminbuckmanjunior@gmail.com';

-- Verify results
SELECT 'Members remaining:' AS info, COUNT(*) AS count FROM members
UNION ALL
SELECT 'Admins remaining:' AS info, COUNT(*) AS count FROM admins
UNION ALL
SELECT 'Notifications remaining:' AS info, COUNT(*) AS count FROM notifications
UNION ALL
SELECT 'Chat messages remaining:' AS info, COUNT(*) AS count FROM chat_messages
UNION ALL
SELECT 'Password resets remaining:' AS info, COUNT(*) AS count FROM password_resets;
