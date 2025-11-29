-- NovelShare - Add Missing Tables & Functions
-- Only run this if you already have the base schema set up
-- This adds: user_preferences table, increment_view_count function

-- ============================================
-- USER PREFERENCES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reader_font_size VARCHAR(20) DEFAULT 'medium',
    reader_theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index if not exists
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- Create policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INCREMENT VIEW COUNT FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION increment_view_count(novel_id_input UUID)
RETURNS void AS $$
BEGIN
    UPDATE novels
    SET view_count = view_count + 1
    WHERE id = novel_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;

-- ============================================
-- VERIFY
-- ============================================
SELECT 'user_preferences table created/exists' AS status;
SELECT 'increment_view_count function created' AS status;
