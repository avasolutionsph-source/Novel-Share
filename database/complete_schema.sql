-- Complete Database Schema for NovelShare
-- Run this in your Supabase SQL Editor
-- This includes all tables with Row Level Security policies

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    display_name VARCHAR(100),
    bio TEXT DEFAULT 'New NovelShare member',
    avatar_url TEXT,
    is_author BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- NOVELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS novels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT,
    cover_image TEXT,
    genres TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'ongoing',
    total_chapters INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_novels_author_id ON novels(author_id);
CREATE INDEX IF NOT EXISTS idx_novels_status ON novels(status);
CREATE INDEX IF NOT EXISTS idx_novels_genres ON novels USING GIN(genres);

ALTER TABLE novels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Novels are viewable by everyone" ON novels
    FOR SELECT USING (true);

CREATE POLICY "Authors can insert novels" ON novels
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own novels" ON novels
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own novels" ON novels
    FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- CHAPTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    content TEXT,
    word_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(novel_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters are viewable by everyone" ON chapters
    FOR SELECT USING (true);

CREATE POLICY "Authors can manage chapters" ON chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM novels
            WHERE novels.id = chapters.novel_id
            AND novels.author_id = auth.uid()
        )
    );

-- ============================================
-- USER LIBRARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    current_chapter INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);

ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own library" ON user_library
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own library" ON user_library
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- READING HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reading_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    chapter_title VARCHAR(255),
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);

ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON reading_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own history" ON reading_history
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, novel_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_novel_id ON ratings(novel_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own ratings" ON ratings
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON follows
    FOR ALL USING (auth.uid() = follower_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_chapter_id ON comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reader_font_size VARCHAR(20) DEFAULT 'medium',
    reader_theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(novel_id_input UUID)
RETURNS void AS $$
BEGIN
    UPDATE novels
    SET view_count = view_count + 1
    WHERE id = novel_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update novel rating average
CREATE OR REPLACE FUNCTION update_novel_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE novels
    SET
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM ratings
            WHERE novel_id = COALESCE(NEW.novel_id, OLD.novel_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE novel_id = COALESCE(NEW.novel_id, OLD.novel_id)
        )
    WHERE id = COALESCE(NEW.novel_id, OLD.novel_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS on_rating_change ON ratings;
CREATE TRIGGER on_rating_change
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_novel_rating();

-- Function to update chapter count on novel
CREATE OR REPLACE FUNCTION update_chapter_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE novels
    SET total_chapters = (
        SELECT COUNT(*) FROM chapters WHERE novel_id = COALESCE(NEW.novel_id, OLD.novel_id)
    )
    WHERE id = COALESCE(NEW.novel_id, OLD.novel_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for chapter count
DROP TRIGGER IF EXISTS on_chapter_change ON chapters;
CREATE TRIGGER on_chapter_change
    AFTER INSERT OR DELETE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_chapter_count();

-- ============================================
-- GRANTS
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
