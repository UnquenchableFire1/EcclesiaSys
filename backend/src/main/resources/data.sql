-- Seed admin user (only if not exists)
-- NOTE: The admin password must be set via the admin dashboard or database after first run.
-- Do NOT store plain-text passwords here.
INSERT IGNORE INTO admins (id, name, email, password, created_by) VALUES
(1, 'Benjamin Buckman Junior', 'benjaminbuckmanjunior@gmail.com', '', NULL);

