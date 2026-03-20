-- Seed admin user (only if not exists)
INSERT IGNORE INTO admins (id, name, email, password, created_by) VALUES
(1, 'Benjamin Buckman Junior', 'benjaminbuckmanjunior@gmail.com', 'fire@123', NULL);
