-- Admin Activity Logs Table
-- This table stores all admin user activities for audit purposes

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_name VARCHAR(255) NOT NULL,
  action VARCHAR(500) NOT NULL,
  ip_address VARCHAR(45),
  device VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admin users can view activity logs
CREATE POLICY "Admin users can view activity logs"
  ON admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated admin users can insert activity logs
CREATE POLICY "Admin users can insert activity logs"
  ON admin_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only super admins can delete activity logs (optional cleanup)
CREATE POLICY "Super admins can delete activity logs"
  ON admin_activity_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'super_admin'
    )
  );
