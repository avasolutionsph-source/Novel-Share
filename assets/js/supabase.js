// Supabase Configuration for NovelShare
// This file handles all Supabase authentication and database operations

const SUPABASE_URL = 'https://apkodnlwvcwtiyhrrsni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwa29kbmx3dmN3dGl5aHJyc25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3ODk2MDAsImV4cCI6MjA0ODM2NTYwMH0.sb_publishable_uf6dv8xfnR3LCboaA934Mg_CmAuVde3';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// Authentication Functions
// ============================================

const SupabaseAuth = {
  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Sign up with email and password
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username
        }
      }
    });

    if (error) throw error;

    // Create user profile in profiles table
    if (data.user) {
      await SupabaseDB.createProfile(data.user.id, username, email);
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/pages/home.html'
      }
    });

    if (error) throw error;
    return data;
  },

  // Send password reset email
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/pages/reset-password.html'
    });

    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Check if user is logged in
  async isLoggedIn() {
    const session = await this.getSession();
    return !!session;
  }
};

// ============================================
// Database Functions
// ============================================

const SupabaseDB = {
  // --- Profiles ---
  async createProfile(userId, username, email) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        email: email,
        bio: 'New NovelShare member',
        created_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') throw error; // Ignore duplicate key error
    return data;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    return data;
  },

  // --- Novels ---
  async getNovels(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getNovelById(novelId) {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .eq('id', novelId)
      .single();

    if (error) throw error;
    return data;
  },

  async searchNovels(query) {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  },

  async getNovelsByGenre(genre) {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .contains('genres', [genre])
      .limit(20);

    if (error) throw error;
    return data;
  },

  // --- Chapters ---
  async getChapters(novelId) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .order('chapter_number', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getChapter(novelId, chapterNumber) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .eq('chapter_number', chapterNumber)
      .single();

    if (error) throw error;
    return data;
  },

  // --- User Library ---
  async getUserLibrary(userId) {
    const { data, error } = await supabase
      .from('user_library')
      .select(`
        *,
        novels (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToLibrary(userId, novelId) {
    const { data, error } = await supabase
      .from('user_library')
      .insert({
        user_id: userId,
        novel_id: novelId,
        current_chapter: 0,
        added_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async removeFromLibrary(userId, novelId) {
    const { data, error } = await supabase
      .from('user_library')
      .delete()
      .eq('user_id', userId)
      .eq('novel_id', novelId);

    if (error) throw error;
    return data;
  },

  async updateReadingProgress(userId, novelId, currentChapter) {
    const { data, error } = await supabase
      .from('user_library')
      .update({
        current_chapter: currentChapter,
        last_read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('novel_id', novelId);

    if (error) throw error;
    return data;
  },

  async isInLibrary(userId, novelId) {
    const { data, error } = await supabase
      .from('user_library')
      .select('id')
      .eq('user_id', userId)
      .eq('novel_id', novelId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // --- Reading History ---
  async addToHistory(userId, novelId, chapterId, chapterTitle) {
    const { data, error } = await supabase
      .from('reading_history')
      .upsert({
        user_id: userId,
        novel_id: novelId,
        chapter_id: chapterId,
        chapter_title: chapterTitle,
        read_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,novel_id'
      });

    if (error) throw error;
    return data;
  },

  async getReadingHistory(userId, limit = 20) {
    const { data, error } = await supabase
      .from('reading_history')
      .select(`
        *,
        novels (*)
      `)
      .eq('user_id', userId)
      .order('read_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async clearHistory(userId) {
    const { data, error } = await supabase
      .from('reading_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // --- Bookmarks ---
  async addBookmark(userId, novelId, chapterId, note = '') {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        novel_id: novelId,
        chapter_id: chapterId,
        note: note,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return data;
  },

  async getBookmarks(userId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        novels (*),
        chapters (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async removeBookmark(bookmarkId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);

    if (error) throw error;
    return data;
  },

  async removeBookmarkByChapter(userId, novelId, chapterId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('novel_id', novelId)
      .eq('chapter_id', chapterId);

    if (error) throw error;
    return data;
  },

  // --- Ratings ---
  async rateNovel(userId, novelId, rating) {
    const { data, error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        novel_id: novelId,
        rating: rating,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,novel_id'
      });

    if (error) throw error;
    return data;
  },

  async getUserRating(userId, novelId) {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', userId)
      .eq('novel_id', novelId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.rating || null;
  },

  async getNovelAverageRating(novelId) {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('novel_id', novelId);

    if (error) throw error;

    if (!data || data.length === 0) return null;

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return (sum / data.length).toFixed(1);
  },

  async getUserRatings(userId) {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        novels (id, title, author, cover_image)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // --- Following Authors ---
  async followAuthor(userId, authorId) {
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: userId,
        following_id: authorId,
        created_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') throw error;
    return data;
  },

  async unfollowAuthor(userId, authorId) {
    const { data, error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', authorId);

    if (error) throw error;
    return data;
  },

  async isFollowing(userId, authorId) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', authorId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        profiles!follows_following_id_fkey (*)
      `)
      .eq('follower_id', userId);

    if (error) throw error;
    return data;
  },

  // --- Author/Novel CRUD Operations ---

  // Get novels by author
  async getAuthorNovels(authorId) {
    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a new novel
  async createNovel(novelData) {
    const { data, error } = await supabase
      .from('novels')
      .insert({
        title: novelData.title,
        author_id: novelData.authorId,
        author: novelData.authorName,
        description: novelData.description || '',
        cover_image: novelData.coverImage || null,
        genres: novelData.genres || [],
        tags: novelData.tags || [],
        status: novelData.status || 'ongoing',
        total_chapters: 0,
        view_count: 0,
        rating_avg: 0,
        rating_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a novel
  async updateNovel(novelId, updates) {
    const { data, error } = await supabase
      .from('novels')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', novelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a novel (and its chapters via cascade)
  async deleteNovel(novelId) {
    const { data, error } = await supabase
      .from('novels')
      .delete()
      .eq('id', novelId);

    if (error) throw error;
    return data;
  },

  // Create a new chapter
  async createChapter(chapterData) {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        novel_id: chapterData.novelId,
        chapter_number: chapterData.chapterNumber,
        title: chapterData.title,
        content: chapterData.content,
        word_count: chapterData.wordCount || chapterData.content.split(/\s+/).length,
        is_premium: chapterData.isPremium || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a chapter
  async updateChapter(chapterId, updates) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Recalculate word count if content changed
    if (updates.content) {
      updateData.word_count = updates.content.split(/\s+/).length;
    }

    const { data, error } = await supabase
      .from('chapters')
      .update(updateData)
      .eq('id', chapterId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a chapter
  async deleteChapter(chapterId) {
    const { data, error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);

    if (error) throw error;
    return data;
  },

  // Get chapter by ID
  async getChapterById(chapterId) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get next chapter number for a novel
  async getNextChapterNumber(novelId) {
    const { data, error } = await supabase
      .from('chapters')
      .select('chapter_number')
      .eq('novel_id', novelId)
      .order('chapter_number', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0].chapter_number + 1 : 1;
  },

  // --- Comments ---
  async getComments(chapterId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (username, display_name)
      `)
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addComment(userId, chapterId, novelId, content) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        novel_id: novelId,
        content: content,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        profiles (username, display_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComment(commentId, userId) {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getCommentCount(chapterId) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('chapter_id', chapterId);

    if (error) throw error;
    return count || 0;
  },

  // --- User Preferences ---
  async getPreferences(userId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async savePreferences(userId, preferences) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        reader_font_size: preferences.fontSize || 'medium',
        reader_theme: preferences.theme || 'light',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return data;
  },

  // --- Increment View Count ---
  async incrementViewCount(novelId) {
    const { data, error } = await supabase.rpc('increment_view_count', {
      novel_id_input: novelId
    });

    // If RPC doesn't exist, fall back to regular update
    if (error) {
      const { data: novel } = await supabase
        .from('novels')
        .select('view_count')
        .eq('id', novelId)
        .single();

      if (novel) {
        await supabase
          .from('novels')
          .update({ view_count: (novel.view_count || 0) + 1 })
          .eq('id', novelId);
      }
    }
    return data;
  }
};

// ============================================
// Helper function to sync with existing localStorage system
// ============================================

const SupabaseSync = {
  // Sync local library with Supabase
  async syncLibrary() {
    const user = await SupabaseAuth.getCurrentUser();
    if (!user) return;

    try {
      const cloudLibrary = await SupabaseDB.getUserLibrary(user.id);

      // Convert to local format
      const localFormat = cloudLibrary.map(item => ({
        novelId: item.novel_id,
        title: item.novels?.title || 'Unknown',
        author: item.novels?.author || 'Unknown',
        coverImage: item.novels?.cover_image || null,
        totalChapters: item.novels?.total_chapters || 0,
        currentChapter: item.current_chapter,
        addedAt: new Date(item.added_at).getTime()
      }));

      // Update localStorage
      localStorage.setItem('novelshare_library', JSON.stringify(localFormat));

      return localFormat;
    } catch (error) {
      console.error('Failed to sync library:', error);
      return null;
    }
  },

  // Sync reading history
  async syncHistory() {
    const user = await SupabaseAuth.getCurrentUser();
    if (!user) return;

    try {
      const cloudHistory = await SupabaseDB.getReadingHistory(user.id);

      const localFormat = cloudHistory.map(item => ({
        novelId: item.novel_id,
        chapterId: item.chapter_id,
        novelTitle: item.novels?.title || 'Unknown',
        chapterTitle: item.chapter_title,
        coverImage: item.novels?.cover_image || null,
        timestamp: new Date(item.read_at).getTime()
      }));

      localStorage.setItem('novelshare_history', JSON.stringify(localFormat));

      return localFormat;
    } catch (error) {
      console.error('Failed to sync history:', error);
      return null;
    }
  },

  // Full sync on login
  async fullSync() {
    await Promise.all([
      this.syncLibrary(),
      this.syncHistory()
    ]);
  }
};

// Export for use in other files
window.SupabaseAuth = SupabaseAuth;
window.SupabaseDB = SupabaseDB;
window.SupabaseSync = SupabaseSync;
window.supabaseClient = supabase;

console.log('Supabase initialized successfully');
