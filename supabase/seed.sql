-- Seed data for development (run after schema.sql)
-- Note: Create users via Supabase Auth first, then update profiles

-- Example: After creating users, you can manually set roles in Supabase Dashboard
-- Or use the Auth signup with metadata: { "role": "admin", "name": "Admin User" }

-- Insert sample patients (requires valid created_by UUID from your profiles)
-- INSERT INTO public.patients (name, age, gender, contact, email, created_by)
-- VALUES 
--   ('John Doe', 35, 'male', '+1234567890', 'john@example.com', 'your-admin-uuid'),
--   ('Jane Smith', 28, 'female', '+0987654321', 'jane@example.com', 'your-admin-uuid');
