# NovelShare - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Integration](#backend-integration)
8. [Authentication](#authentication)
9. [API Reference](#api-reference)
10. [Deployment](#deployment)

---

## Project Overview

**NovelShare** is a full-featured web-based novel reading and sharing platform that allows users to discover, read, and interact with web novels. Authors can publish their work, while readers can build personal libraries, track reading progress, and engage with the community.

### Key Highlights
- Modern, responsive UI with dark/light/sepia themes
- Real-time cloud sync for authenticated users
- Offline reading support
- Social features (following, ratings, comments)
- Author dashboard for content management

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Styling with CSS Variables (design tokens) |
| **Vanilla JavaScript** | Client-side logic and interactivity |
| **No Framework** | Lightweight, fast-loading pages |

### Backend (BaaS)
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database (via Supabase) |
| **Supabase Auth** | Authentication (Email, OAuth) |
| **Row Level Security** | Data isolation per user |

### Deployment
| Platform | Purpose |
|----------|---------|
| **Netlify** | Frontend hosting and CI/CD |
| **Supabase Cloud** | Database and auth hosting |

---

## Features

### Reader Features
| Feature | Description |
|---------|-------------|
| **Novel Browsing** | Search, filter by genre, sort by popularity/date |
| **Chapter Reader** | Clean reading interface with customization |
| **Reading Themes** | Light, Dark, and Sepia modes |
| **Font Controls** | Adjustable font size (small/medium/large) |
| **Personal Library** | Save novels to read later |
| **Progress Tracking** | Automatic chapter progress sync |
| **Reading History** | Track recently read chapters |
| **Bookmarks** | Save specific chapters with notes |
| **Offline Reading** | Download chapters for offline access |
| **Ratings & Reviews** | Rate novels (1-5 stars) |

### Author Features
| Feature | Description |
|---------|-------------|
| **Author Dashboard** | Manage all published novels |
| **Novel Creation** | Add new novels with cover, description, genres |
| **Chapter Editor** | Rich text editor for chapter content |
| **Analytics** | View count and rating statistics |

### Social Features
| Feature | Description |
|---------|-------------|
| **Follow Authors** | Get updates from favorite authors |
| **Comments** | Discuss chapters with other readers |
| **User Profiles** | Public profile pages with stats |

### Authentication
| Feature | Description |
|---------|-------------|
| **Email/Password** | Traditional login method |
| **Google OAuth** | One-click Google sign-in |
| **Password Reset** | Email-based password recovery |
| **Email Verification** | Confirm email addresses |
| **Guest Mode** | Browse without account (limited features) |

---

## Project Structure

```
test/
├── assets/
│   ├── css/
│   │   ├── common.css          # Shared styles, components, design tokens
│   │   └── auth-common.css     # Authentication page styles
│   ├── js/
│   │   ├── common.js           # UI utilities, local storage systems
│   │   └── supabase.js         # Supabase client, auth, database operations
│   └── images/
│       ├── logo.svg            # Application logo
│       ├── icons/              # UI icons (bell, search, profile, etc.)
│       └── covers/             # Placeholder cover images
├── database/
│   ├── schema.sql              # Main database schema
│   ├── complete_schema.sql     # Full schema reference
│   ├── user_preferences.sql    # User preferences table
│   └── add_missing_tables.sql  # Migration scripts
├── pages/
│   ├── index.html              # Root redirect
│   ├── home.html               # Homepage with featured content
│   ├── browse.html             # Novel browsing with filters
│   ├── search.html             # Search results page
│   ├── novel.html              # Novel detail page
│   ├── reader.html             # Chapter reader
│   ├── library.html            # User's library
│   ├── profile.html            # User profile
│   ├── author-dashboard.html   # Author management
│   ├── add-novel.html          # Create novel form
│   ├── edit-novel.html         # Edit novel form
│   ├── add-chapter.html        # Create chapter editor
│   ├── edit-chapter.html       # Edit chapter editor
│   ├── login.html              # Login page
│   ├── signup.html             # Registration page
│   ├── forgot-password.html    # Password reset request
│   ├── reset-password.html     # Password reset form
│   ├── reset-success.html      # Reset confirmation
│   └── verify.html             # Email verification
└── netlify.toml                # Deployment configuration
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   profiles  │     │   novels    │     │  chapters   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ author_id   │     │ id (PK)     │
│ username    │     │ id (PK)     │◄────│ novel_id    │
│ email       │     │ title       │     │ chapter_num │
│ display_name│     │ description │     │ title       │
│ bio         │     │ cover_image │     │ content     │
│ avatar_url  │     │ genres[]    │     │ word_count  │
│ is_author   │     │ status      │     │ is_premium  │
└─────────────┘     │ view_count  │     └─────────────┘
       │            │ rating_avg  │            │
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│user_library │     │   ratings   │     │  bookmarks  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ user_id(FK) │     │ user_id(FK) │     │ user_id(FK) │
│ novel_id(FK)│     │ novel_id(FK)│     │ novel_id(FK)│
│ curr_chapter│     │ rating(1-5) │     │ chapter_id  │
│ last_read_at│     └─────────────┘     │ note        │
└─────────────┘                         └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│read_history │     │   follows   │     │  comments   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ user_id(FK) │     │ follower_id │     │ user_id(FK) │
│ novel_id(FK)│     │ following_id│     │ chapter_id  │
│ chapter_id  │     └─────────────┘     │ content     │
│ read_at     │                         │ parent_id   │
└─────────────┘                         └─────────────┘

┌──────────────────┐
│ user_preferences │
├──────────────────┤
│ user_id (FK)     │
│ reader_font_size │
│ reader_theme     │
└──────────────────┘
```

### Tables Overview

| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `profiles` | User profile data | Public read, owner write |
| `novels` | Novel metadata | Public read, author write |
| `chapters` | Chapter content | Public read, author write |
| `user_library` | User's saved novels | Owner only |
| `reading_history` | Recently read tracking | Owner only |
| `bookmarks` | Chapter bookmarks | Owner only |
| `ratings` | Novel ratings | Public read, owner write |
| `follows` | Author following | Public read, owner write |
| `comments` | Chapter comments | Public read, owner write |
| `user_preferences` | Reader settings | Owner only |

### Database Functions & Triggers

```sql
-- Auto-update rating average when ratings change
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_novel_rating();

-- Auto-update chapter count when chapters added/removed
CREATE TRIGGER on_chapter_change
  AFTER INSERT OR DELETE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_chapter_count();

-- Increment view count (RPC function)
SELECT increment_view_count('novel-uuid-here');
```

---

## Frontend Architecture

### CSS Design System

#### Design Tokens (CSS Variables)
```css
:root {
  /* Colors */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --secondary: #64748b;
  --background: #ffffff;
  --surface: #f8fafc;
  --text: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### JavaScript Architecture

#### Core Systems (common.js)

```javascript
// UI Components
initSearch(inputSelector, itemsSelector)
initFilterPills(pillsSelector, itemsSelector)
initPagination({ containerSelector, itemsSelector, itemsPerPage })
initTabs(tabsSelector, contentSelector)

// Notifications
showToast(message, type, duration)
showSuccess(message)
showError(message)
showWarning(message)

// Loading States
LoadingState.show(container, message)
LoadingState.hide(overlay)
LoadingState.setButtonLoading(button, text)
LoadingState.showSkeleton(container, config)

// Data Systems
LibrarySystem.addToLibrary(novelId, novelData)
ReadingHistory.addToHistory(novelId, chapterId, novelData)
BookmarkSystem.addBookmark(novelId, chapterId, note)
RatingSystem.saveRating(novelId, rating)
FollowingSystem.follow(authorId, authorData)

// Error Handling
handleSupabaseError(error, fallbackMessage)
```

---

## Backend Integration

### Supabase Configuration

```javascript
// supabase.js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Data Flow

```
User Action
    ↓
Page JavaScript
    ↓
SupabaseDB / SupabaseAuth (supabase.js)
    ↓
Supabase Client SDK
    ↓
Supabase Backend (PostgreSQL + Auth)
    ↓
Response
    ↓
Update UI + LocalStorage Cache
```

### Sync Strategy

1. **Authenticated Users**: Data stored in Supabase, synced on login
2. **Guest Users**: Data stored in localStorage only
3. **Offline**: Read from localStorage cache
4. **Conflict Resolution**: Server data takes priority

---

## Authentication

### Auth Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Login Page │────▶│ Supabase    │────▶│  Dashboard  │
│             │     │ Auth        │     │  /Home      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │ Create      │
       │            │ Profile     │
       │            └─────────────┘
       │
       ▼
┌─────────────┐
│ Guest Mode  │
│ (Limited)   │
└─────────────┘
```

### Supported Auth Methods

| Method | Implementation |
|--------|---------------|
| Email/Password | `SupabaseAuth.signIn(email, password)` |
| Google OAuth | `SupabaseAuth.signInWithGoogle()` |
| Password Reset | `SupabaseAuth.resetPassword(email)` |
| Sign Out | `SupabaseAuth.signOut()` |

### Session Management

```javascript
// Check current user
const user = await SupabaseAuth.getCurrentUser();

// Listen for auth changes
SupabaseAuth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Sync user data
    SupabaseSync.fullSync();
  }
});
```

---

## API Reference

### SupabaseDB Methods

#### Novels
```javascript
// Get all novels with pagination
await SupabaseDB.getNovels({ limit: 20, offset: 0 });

// Get single novel
await SupabaseDB.getNovelById(novelId);

// Search novels
await SupabaseDB.searchNovels(query);

// Filter by genre
await SupabaseDB.getNovelsByGenre(genre);
```

#### User Library
```javascript
// Add to library
await SupabaseDB.addToLibrary(userId, novelId);

// Get user's library
await SupabaseDB.getUserLibrary(userId);

// Update reading progress
await SupabaseDB.updateReadingProgress(userId, novelId, chapterNumber);

// Remove from library
await SupabaseDB.removeFromLibrary(userId, novelId);
```

#### Chapters
```javascript
// Get chapters for novel
await SupabaseDB.getChapters(novelId);

// Get single chapter
await SupabaseDB.getChapter(novelId, chapterNumber);

// Create chapter (authors only)
await SupabaseDB.createChapter(novelId, chapterData);
```

#### Social
```javascript
// Rate novel
await SupabaseDB.rateNovel(userId, novelId, rating);

// Follow author
await SupabaseDB.followAuthor(userId, authorId);

// Add comment
await SupabaseDB.addComment(userId, novelId, chapterId, content);
```

#### User Preferences
```javascript
// Get preferences
await SupabaseDB.getPreferences(userId);

// Save preferences
await SupabaseDB.savePreferences(userId, {
  fontSize: 'medium',
  theme: 'dark'
});
```

---

## Deployment

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables

Set these in Netlify dashboard:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Deployment Steps

1. Push code to GitHub repository
2. Connect repository to Netlify
3. Configure build settings
4. Set environment variables
5. Deploy

### Supabase Setup

1. Create new Supabase project
2. Run SQL schema in SQL Editor
3. Enable Row Level Security
4. Configure Auth providers (Email, Google)
5. Set up email templates for verification/reset

---

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Public data (novels, profiles) readable by all
- Write operations restricted to owners

### Client-Side Security
- Supabase anon key is public (safe by design)
- RLS policies enforce server-side security
- No sensitive data in localStorage
- Password hashing handled by Supabase Auth

### Best Practices Implemented
- Input validation on forms
- XSS prevention (content sanitization)
- HTTPS enforced
- Secure session management

---

## Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Lazy Loading** | Images load on scroll |
| **Debouncing** | Search input debounced |
| **Caching** | localStorage for offline data |
| **Skeleton Loading** | Placeholder UI during fetch |
| **Pagination** | Limited data per request |
| **Indexes** | Database indexes on key columns |

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |
| Mobile Safari | iOS 13+ |
| Chrome Mobile | Android 80+ |

---

## Future Enhancements

- [ ] Push notifications for new chapters
- [ ] Advanced search filters
- [ ] Reading lists/collections
- [ ] Social sharing
- [ ] Premium/paid chapters
- [ ] Author revenue system
- [ ] Mobile app (PWA)
- [ ] Multi-language support

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

## Contact

For questions or support, please contact the development team.

---

*Documentation last updated: November 2025*
